import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { createProject } from '../lib/firestore-projects';

/**
 * User data from Firestore
 */
export interface UserData {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  organizationId?: string;
  role?: 'admin' | 'product_owner' | 'scrum_master' | 'team_member' | 'stakeholder';
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * Auth context value
 */
interface AuthContextValue {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * useAuth hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * AuthProvider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Create user document in Firestore
   */
  async function createUserDocument(user: User, additionalData?: Partial<UserData>) {
    if (!user.email) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: Omit<UserData, 'id'> = {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        avatar: user.photoURL || undefined,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        ...additionalData,
      };

      await setDoc(userRef, userData);

      // Create default project for new user
      try {
        await createProject(
          {
            name: 'Progetto Iniziale',
            description: 'Il tuo primo progetto su Metahodos Agile App',
          },
          user.uid
        );
      } catch (error) {
        console.error('Error creating default project:', error);
        // Don't throw - user creation should succeed even if project creation fails
      }

      return { id: user.uid, ...userData };
    } else {
      // Update last login
      await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
      return { id: user.uid, ...userSnap.data() } as UserData;
    }
  }

  /**
   * Fetch user data from Firestore
   */
  async function fetchUserData(uid: string): Promise<UserData | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          id: uid,
          email: data.email,
          displayName: data.displayName,
          avatar: data.avatar,
          organizationId: data.organizationId,
          role: data.role,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Sign up with email and password
   */
  async function signup(email: string, password: string, displayName: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await createUserDocument(user, { displayName });

    // Send verification email
    await sendEmailVerification(user);

    return user;
  }

  /**
   * Login with email and password
   */
  async function login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  /**
   * Login with Google
   */
  async function loginWithGoogle(): Promise<User> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Create/update user document in Firestore
    await createUserDocument(user);

    return user;
  }

  /**
   * Logout
   */
  async function logout(): Promise<void> {
    await signOut(auth);
    setUserData(null);
  }

  /**
   * Reset password
   */
  async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Update user profile
   */
  async function updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
    if (!currentUser) throw new Error('No user logged in');

    await updateProfile(currentUser, { displayName, photoURL });

    // Update Firestore
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(
      userRef,
      {
        displayName,
        ...(photoURL && { avatar: photoURL }),
      },
      { merge: true }
    );

    // Refresh user data
    const updatedUserData = await fetchUserData(currentUser.uid);
    setUserData(updatedUserData);
  }

  /**
   * Send email verification
   */
  async function sendVerificationEmail(): Promise<void> {
    if (!currentUser) throw new Error('No user logged in');
    await sendEmailVerification(currentUser);
  }

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch user data from Firestore
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
