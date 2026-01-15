/**
 * Firestore service for Project Management
 * Handles CRUD operations for Projects
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from './types';

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: Project['status'];
}

/**
 * Create a new Project
 */
export async function createProject(
  projectData: CreateProjectData,
  userId: string
): Promise<Project> {
  try {
    const projectsRef = collection(db, 'projects');

    const newProject = {
      ...projectData,
      status: 'active' as const,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(projectsRef, newProject);

    return {
      id: docRef.id,
      ...projectData,
      status: 'active',
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Impossibile creare il progetto');
  }
}

/**
 * Update a Project
 */
export async function updateProject(
  projectId: string,
  updates: UpdateProjectData
): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);

    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Impossibile aggiornare il progetto');
  }
}

/**
 * Delete a Project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Impossibile eliminare il progetto');
  }
}

/**
 * Get a single Project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return null;
    }

    const data = projectSnap.data();
    return {
      id: projectSnap.id,
      name: data.name,
      description: data.description,
      status: data.status,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting project:', error);
    throw new Error('Impossibile recuperare il progetto');
  }
}

/**
 * Get all Projects for a user
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    console.log('getUserProjects called for userId:', userId);
    const projectsRef = collection(db, 'projects');

    // Simple query - no orderBy to avoid composite index requirement
    const q = query(
      projectsRef,
      where('createdBy', '==', userId)
    );

    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query returned', querySnapshot.docs.length, 'documents');

    const projects = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          status: data.status,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      })
      .filter((project) => project.status !== 'archived') // Filter archived in code
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); // Sort in memory

    console.log('Filtered to', projects.length, 'active projects');
    return projects;
  } catch (error) {
    console.error('Error getting user projects:', error);
    console.error('Error details:', error);
    throw new Error('Impossibile recuperare i progetti');
  }
}

/**
 * Archive a Project (soft delete)
 */
export async function archiveProject(projectId: string): Promise<void> {
  try {
    await updateProject(projectId, { status: 'archived' });
  } catch (error) {
    console.error('Error archiving project:', error);
    throw new Error('Impossibile archiviare il progetto');
  }
}

/**
 * Restore an archived Project
 */
export async function restoreProject(projectId: string): Promise<void> {
  try {
    await updateProject(projectId, { status: 'active' });
  } catch (error) {
    console.error('Error restoring project:', error);
    throw new Error('Impossibile ripristinare il progetto');
  }
}
