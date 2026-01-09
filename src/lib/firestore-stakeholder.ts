/**
 * Stakeholder Management Service - CRUD operations for stakeholders and meetings
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type {
  Stakeholder,
  StakeholderMeeting,
  StakeholderAnalysis,
  StakeholderCategory,
  EngagementStrategy,
  StakeholderSentiment,
  PowerLevel,
  InterestLevel,
} from './types';

const DEFAULT_PROJECT_ID = 'default-project';

/**
 * Helper: Convert Firestore Timestamp to Date
 */
function convertTimestamp(data: any): any {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
}

/**
 * Calculate engagement strategy based on power and interest levels
 */
export function calculateEngagementStrategy(
  powerLevel: PowerLevel,
  interestLevel: InterestLevel
): EngagementStrategy {
  if (powerLevel === 'high' && interestLevel === 'high') {
    return 'manage_closely';
  } else if (powerLevel === 'high' && interestLevel !== 'high') {
    return 'keep_satisfied';
  } else if (powerLevel !== 'high' && interestLevel === 'high') {
    return 'keep_informed';
  } else {
    return 'monitor';
  }
}

// =====================
// STAKEHOLDER CRUD
// =====================

/**
 * Create a new stakeholder
 */
export async function createStakeholder(
  projectId: string,
  stakeholderData: Omit<Stakeholder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>,
  userId: string
): Promise<Stakeholder> {
  try {
    const stakeholdersRef = collection(db, 'stakeholders');

    const stakeholderDoc = {
      ...stakeholderData,
      projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(stakeholdersRef, stakeholderDoc);

    // Fetch the created document
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      throw new Error('Failed to create stakeholder');
    }

    return {
      id: docSnapshot.id,
      ...convertTimestamp(docSnapshot.data()),
    } as Stakeholder;
  } catch (error) {
    console.error('Error creating stakeholder:', error);
    throw error;
  }
}

/**
 * Get all stakeholders for a project
 */
export async function getStakeholdersByProject(
  projectId: string = DEFAULT_PROJECT_ID
): Promise<Stakeholder[]> {
  try {
    const stakeholdersRef = collection(db, 'stakeholders');
    const q = query(stakeholdersRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const stakeholders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as Stakeholder[];

    // Sort by name
    stakeholders.sort((a, b) => a.name.localeCompare(b.name));

    return stakeholders;
  } catch (error) {
    console.error('Error fetching stakeholders:', error);
    throw error;
  }
}

/**
 * Get a single stakeholder by ID
 */
export async function getStakeholderById(stakeholderId: string): Promise<Stakeholder | null> {
  try {
    const stakeholderRef = doc(db, 'stakeholders', stakeholderId);
    const stakeholderSnapshot = await getDoc(stakeholderRef);

    if (!stakeholderSnapshot.exists()) {
      return null;
    }

    return {
      id: stakeholderSnapshot.id,
      ...convertTimestamp(stakeholderSnapshot.data()),
    } as Stakeholder;
  } catch (error) {
    console.error('Error fetching stakeholder:', error);
    throw error;
  }
}

/**
 * Update a stakeholder
 */
export async function updateStakeholder(
  stakeholderId: string,
  updates: Partial<Omit<Stakeholder, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  try {
    const stakeholderRef = doc(db, 'stakeholders', stakeholderId);

    await updateDoc(stakeholderRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating stakeholder:', error);
    throw error;
  }
}

/**
 * Delete a stakeholder
 */
export async function deleteStakeholder(stakeholderId: string): Promise<void> {
  try {
    const stakeholderRef = doc(db, 'stakeholders', stakeholderId);
    await deleteDoc(stakeholderRef);

    // Also delete associated meetings
    const meetingsRef = collection(db, 'stakeholderMeetings');
    const q = query(meetingsRef, where('stakeholderId', '==', stakeholderId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting stakeholder:', error);
    throw error;
  }
}

// =====================
// STAKEHOLDER MEETINGS
// =====================

/**
 * Create a stakeholder meeting/interaction
 */
export async function createMeeting(
  projectId: string,
  stakeholderId: string,
  meetingData: Omit<StakeholderMeeting, 'id' | 'createdAt' | 'projectId' | 'stakeholderId'>,
  userId: string
): Promise<StakeholderMeeting> {
  try {
    const meetingsRef = collection(db, 'stakeholderMeetings');

    const meetingDoc = {
      ...meetingData,
      projectId,
      stakeholderId,
      createdAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(meetingsRef, meetingDoc);

    // Fetch the created document
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      throw new Error('Failed to create meeting');
    }

    return {
      id: docSnapshot.id,
      ...convertTimestamp(docSnapshot.data()),
    } as StakeholderMeeting;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

/**
 * Get all meetings for a stakeholder
 */
export async function getMeetingsByStakeholder(stakeholderId: string): Promise<StakeholderMeeting[]> {
  try {
    const meetingsRef = collection(db, 'stakeholderMeetings');
    const q = query(meetingsRef, where('stakeholderId', '==', stakeholderId));
    const querySnapshot = await getDocs(q);

    const meetings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as StakeholderMeeting[];

    // Sort by date (most recent first)
    meetings.sort((a, b) => b.date.getTime() - a.date.getTime());

    return meetings;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
}

/**
 * Get all meetings for a project
 */
export async function getMeetingsByProject(
  projectId: string = DEFAULT_PROJECT_ID
): Promise<StakeholderMeeting[]> {
  try {
    const meetingsRef = collection(db, 'stakeholderMeetings');
    const q = query(meetingsRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const meetings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as StakeholderMeeting[];

    // Sort by date (most recent first)
    meetings.sort((a, b) => b.date.getTime() - a.date.getTime());

    return meetings;
  } catch (error) {
    console.error('Error fetching project meetings:', error);
    throw error;
  }
}

/**
 * Update a meeting
 */
export async function updateMeeting(
  meetingId: string,
  updates: Partial<Omit<StakeholderMeeting, 'id' | 'createdAt' | 'createdBy' | 'projectId' | 'stakeholderId'>>
): Promise<void> {
  try {
    const meetingRef = doc(db, 'stakeholderMeetings', meetingId);
    await updateDoc(meetingRef, updates);
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    const meetingRef = doc(db, 'stakeholderMeetings', meetingId);
    await deleteDoc(meetingRef);
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
}

// =====================
// ANALYTICS & INSIGHTS
// =====================

/**
 * Get stakeholder analysis for a project
 */
export async function getStakeholderAnalysis(
  projectId: string = DEFAULT_PROJECT_ID
): Promise<StakeholderAnalysis> {
  try {
    const stakeholders = await getStakeholdersByProject(projectId);

    // Count by category
    const categoryMap = new Map<StakeholderCategory, number>();
    stakeholders.forEach(s => {
      categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1);
    });
    const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    // Count by engagement strategy
    const strategyMap = new Map<EngagementStrategy, number>();
    stakeholders.forEach(s => {
      strategyMap.set(s.engagementStrategy, (strategyMap.get(s.engagementStrategy) || 0) + 1);
    });
    const byStrategy = Array.from(strategyMap.entries()).map(([strategy, count]) => ({
      strategy,
      count,
    }));

    // Count by sentiment
    const sentimentMap = new Map<StakeholderSentiment, number>();
    stakeholders.forEach(s => {
      sentimentMap.set(s.sentiment, (sentimentMap.get(s.sentiment) || 0) + 1);
    });
    const bySentiment = Array.from(sentimentMap.entries()).map(([sentiment, count]) => ({
      sentiment,
      count,
    }));

    // Power/Interest Matrix distribution
    let highPowerHighInterest = 0;
    let highPowerLowInterest = 0;
    let lowPowerHighInterest = 0;
    let lowPowerLowInterest = 0;

    stakeholders.forEach(s => {
      const isHighPower = s.powerLevel === 'high';
      const isHighInterest = s.interestLevel === 'high';

      if (isHighPower && isHighInterest) {
        highPowerHighInterest++;
      } else if (isHighPower && !isHighInterest) {
        highPowerLowInterest++;
      } else if (!isHighPower && isHighInterest) {
        lowPowerHighInterest++;
      } else {
        lowPowerLowInterest++;
      }
    });

    return {
      projectId,
      totalStakeholders: stakeholders.length,
      byCategory,
      byStrategy,
      bySentiment,
      matrix: {
        highPowerHighInterest,
        highPowerLowInterest,
        lowPowerHighInterest,
        lowPowerLowInterest,
      },
    };
  } catch (error) {
    console.error('Error getting stakeholder analysis:', error);
    throw error;
  }
}

/**
 * Get stakeholders by engagement strategy
 */
export async function getStakeholdersByStrategy(
  projectId: string = DEFAULT_PROJECT_ID,
  strategy: EngagementStrategy
): Promise<Stakeholder[]> {
  try {
    const stakeholders = await getStakeholdersByProject(projectId);
    return stakeholders.filter(s => s.engagementStrategy === strategy);
  } catch (error) {
    console.error('Error filtering stakeholders by strategy:', error);
    throw error;
  }
}

/**
 * Get stakeholders by category
 */
export async function getStakeholdersByCategory(
  projectId: string = DEFAULT_PROJECT_ID,
  category: StakeholderCategory
): Promise<Stakeholder[]> {
  try {
    const stakeholders = await getStakeholdersByProject(projectId);
    return stakeholders.filter(s => s.category === category);
  } catch (error) {
    console.error('Error filtering stakeholders by category:', error);
    throw error;
  }
}
