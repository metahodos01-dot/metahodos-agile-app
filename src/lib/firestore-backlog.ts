/**
 * Firestore service for Product Backlog Management
 * Handles CRUD operations for Epics and Stories
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
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Epic, Story, EpicStatus, StoryStatus, MoscowPriority } from './types';

// ========================================
// EPIC OPERATIONS
// ========================================

export interface CreateEpicData {
  title: string;
  description: string;
  businessValue: number;
  effort: number;
  priority: Epic['priority'];
  color?: string;
}

export interface UpdateEpicData {
  title?: string;
  description?: string;
  businessValue?: number;
  effort?: number;
  priority?: Epic['priority'];
  status?: EpicStatus;
  color?: string;
}

/**
 * Create a new Epic
 */
export async function createEpic(
  projectId: string,
  epicData: CreateEpicData,
  userId: string
): Promise<Epic> {
  try {
    const epicsRef = collection(db, 'epics');

    const newEpic = {
      projectId,
      ...epicData,
      status: 'backlog' as EpicStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(epicsRef, newEpic);

    return {
      id: docRef.id,
      ...epicData,
      projectId,
      status: 'backlog',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating epic:', error);
    throw new Error('Impossibile creare l\'epic');
  }
}

/**
 * Update an Epic
 */
export async function updateEpic(
  epicId: string,
  updates: UpdateEpicData
): Promise<void> {
  try {
    const epicRef = doc(db, 'epics', epicId);

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // If status is being changed to 'done', add completedAt timestamp
    if (updates.status === 'done') {
      updateData.completedAt = serverTimestamp();
    }

    await updateDoc(epicRef, updateData);
  } catch (error) {
    console.error('Error updating epic:', error);
    throw new Error('Impossibile aggiornare l\'epic');
  }
}

/**
 * Delete an Epic (and optionally its stories)
 */
export async function deleteEpic(
  epicId: string,
  deleteStories: boolean = false
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete the epic
    const epicRef = doc(db, 'epics', epicId);
    batch.delete(epicRef);

    if (deleteStories) {
      // Get all stories belonging to this epic
      const storiesQuery = query(
        collection(db, 'stories'),
        where('epicId', '==', epicId)
      );
      const storiesSnapshot = await getDocs(storiesQuery);

      // Add each story deletion to the batch
      storiesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
    } else {
      // Just unlink stories from the epic
      const storiesQuery = query(
        collection(db, 'stories'),
        where('epicId', '==', epicId)
      );
      const storiesSnapshot = await getDocs(storiesQuery);

      storiesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { epicId: null });
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error deleting epic:', error);
    throw new Error('Impossibile eliminare l\'epic');
  }
}

/**
 * Get all Epics for a project
 */
export async function getEpicsByProject(projectId: string): Promise<Epic[]> {
  try {
    console.log('[Firestore] Fetching epics for project:', projectId);

    // Temporarily remove orderBy to avoid index requirement
    const epicsQuery = query(
      collection(db, 'epics'),
      where('projectId', '==', projectId)
      // orderBy('createdAt', 'desc') // Commented out - requires composite index
    );

    const snapshot = await getDocs(epicsQuery);
    console.log('[Firestore] Epics fetched:', snapshot.size, 'documents');

    const epics = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
      } as Epic;
    });

    // Sort in memory instead
    epics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return epics;
  } catch (error: any) {
    console.error('[Firestore] Error fetching epics:', error);
    console.error('[Firestore] Error code:', error?.code);
    console.error('[Firestore] Error message:', error?.message);
    throw error; // Re-throw original error for better debugging
  }
}

/**
 * Get a single Epic by ID
 */
export async function getEpicById(epicId: string): Promise<Epic | null> {
  try {
    const epicRef = doc(db, 'epics', epicId);
    const epicDoc = await getDoc(epicRef);

    if (!epicDoc.exists()) {
      return null;
    }

    const data = epicDoc.data();
    return {
      id: epicDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
    } as Epic;
  } catch (error) {
    console.error('Error fetching epic:', error);
    throw new Error('Impossibile recuperare l\'epic');
  }
}

/**
 * Subscribe to Epics in real-time
 */
export function subscribeToEpics(
  projectId: string,
  callback: (epics: Epic[]) => void
): () => void {
  const epicsQuery = query(
    collection(db, 'epics'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    epicsQuery,
    (snapshot) => {
      const epics = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        } as Epic;
      });
      callback(epics);
    },
    (error) => {
      console.error('Error in epics subscription:', error);
    }
  );
}

// ========================================
// STORY OPERATIONS
// ========================================

export interface CreateStoryData {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  epicId?: string;
  storyPoints?: number;
  moscowPriority?: MoscowPriority;
  tags?: string[];
}

export interface UpdateStoryData {
  title?: string;
  description?: string;
  acceptanceCriteria?: string[];
  epicId?: string | null;
  storyPoints?: number;
  priority?: number;
  moscowPriority?: MoscowPriority;
  status?: StoryStatus;
  assigneeId?: string | null;
  sprintId?: string | null;
  tags?: string[];
}

export interface StoryFilters {
  status?: StoryStatus;
  epicId?: string;
  assigneeId?: string;
  sprintId?: string;
  moscowPriority?: MoscowPriority;
}

/**
 * Create a new Story
 */
export async function createStory(
  projectId: string,
  storyData: CreateStoryData,
  userId: string
): Promise<Story> {
  try {
    const storiesRef = collection(db, 'stories');

    // Get the highest priority number to add this story at the bottom
    const storiesQuery = query(
      collection(db, 'stories'),
      where('projectId', '==', projectId),
      orderBy('priority', 'desc')
    );
    const snapshot = await getDocs(storiesQuery);
    const maxPriority = snapshot.empty ? 0 : snapshot.docs[0].data().priority || 0;

    const newStory = {
      projectId,
      ...storyData,
      priority: maxPriority + 1,
      status: 'backlog' as StoryStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(storiesRef, newStory);

    return {
      id: docRef.id,
      ...storyData,
      projectId,
      priority: maxPriority + 1,
      status: 'backlog',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('Error creating story:', error);
    throw new Error('Impossibile creare la story');
  }
}

/**
 * Update a Story
 */
export async function updateStory(
  storyId: string,
  updates: UpdateStoryData
): Promise<void> {
  try {
    const storyRef = doc(db, 'stories', storyId);

    await updateDoc(storyRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating story:', error);
    throw new Error('Impossibile aggiornare la story');
  }
}

/**
 * Delete a Story
 */
export async function deleteStory(storyId: string): Promise<void> {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await deleteDoc(storyRef);
  } catch (error) {
    console.error('Error deleting story:', error);
    throw new Error('Impossibile eliminare la story');
  }
}

/**
 * Get all Stories for a project with optional filters
 */
export async function getStoriesByProject(
  projectId: string,
  filters?: StoryFilters
): Promise<Story[]> {
  try {
    console.log('[Firestore] Fetching stories for project:', projectId, 'with filters:', filters);

    let storiesQuery = query(
      collection(db, 'stories'),
      where('projectId', '==', projectId)
    );

    // Apply filters
    if (filters?.status) {
      storiesQuery = query(storiesQuery, where('status', '==', filters.status));
    }
    if (filters?.epicId) {
      storiesQuery = query(storiesQuery, where('epicId', '==', filters.epicId));
    }
    if (filters?.assigneeId) {
      storiesQuery = query(storiesQuery, where('assigneeId', '==', filters.assigneeId));
    }
    if (filters?.sprintId) {
      storiesQuery = query(storiesQuery, where('sprintId', '==', filters.sprintId));
    }
    if (filters?.moscowPriority) {
      storiesQuery = query(storiesQuery, where('moscowPriority', '==', filters.moscowPriority));
    }

    // Temporarily remove orderBy to avoid index requirement
    // storiesQuery = query(storiesQuery, orderBy('priority', 'desc'));

    const snapshot = await getDocs(storiesQuery);
    console.log('[Firestore] Stories fetched:', snapshot.size, 'documents');

    const stories = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Story;
    });

    // Sort in memory by priority (higher number = higher priority)
    stories.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return stories;
  } catch (error: any) {
    console.error('[Firestore] Error fetching stories:', error);
    console.error('[Firestore] Error code:', error?.code);
    console.error('[Firestore] Error message:', error?.message);
    throw error; // Re-throw original error for better debugging
  }
}

/**
 * Get all Stories for a specific Epic
 */
export async function getStoriesByEpic(epicId: string): Promise<Story[]> {
  try {
    const storiesQuery = query(
      collection(db, 'stories'),
      where('epicId', '==', epicId),
      orderBy('priority', 'desc')
    );

    const snapshot = await getDocs(storiesQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Story;
    });
  } catch (error) {
    console.error('Error fetching stories by epic:', error);
    throw new Error('Impossibile recuperare le story dell\'epic');
  }
}

/**
 * Get a single Story by ID
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);

    if (!storyDoc.exists()) {
      return null;
    }

    const data = storyDoc.data();
    return {
      id: storyDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Story;
  } catch (error) {
    console.error('Error fetching story:', error);
    throw new Error('Impossibile recuperare la story');
  }
}

/**
 * Update Story priority (for drag-and-drop reordering)
 */
export async function updateStoryPriority(
  storyId: string,
  newPriority: number
): Promise<void> {
  try {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      priority: newPriority,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating story priority:', error);
    throw new Error('Impossibile aggiornare la priorità');
  }
}

/**
 * Batch update Story priorities (for efficient drag-and-drop reordering)
 */
export async function batchUpdateStoryPriorities(
  updates: { storyId: string; priority: number }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    updates.forEach(({ storyId, priority }) => {
      const storyRef = doc(db, 'stories', storyId);
      batch.update(storyRef, {
        priority,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error batch updating priorities:', error);
    throw new Error('Impossibile aggiornare le priorità');
  }
}

/**
 * Subscribe to Stories in real-time
 */
export function subscribeToStories(
  projectId: string,
  callback: (stories: Story[]) => void,
  filters?: StoryFilters
): () => void {
  let storiesQuery = query(
    collection(db, 'stories'),
    where('projectId', '==', projectId)
  );

  // Apply filters
  if (filters?.status) {
    storiesQuery = query(storiesQuery, where('status', '==', filters.status));
  }
  if (filters?.epicId) {
    storiesQuery = query(storiesQuery, where('epicId', '==', filters.epicId));
  }
  if (filters?.assigneeId) {
    storiesQuery = query(storiesQuery, where('assigneeId', '==', filters.assigneeId));
  }
  if (filters?.sprintId) {
    storiesQuery = query(storiesQuery, where('sprintId', '==', filters.sprintId));
  }
  if (filters?.moscowPriority) {
    storiesQuery = query(storiesQuery, where('moscowPriority', '==', filters.moscowPriority));
  }

  storiesQuery = query(storiesQuery, orderBy('priority', 'desc'));

  return onSnapshot(
    storiesQuery,
    (snapshot) => {
      const stories = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Story;
      });
      callback(stories);
    },
    (error) => {
      console.error('Error in stories subscription:', error);
    }
  );
}

/**
 * Get Backlog statistics for a project
 */
export interface BacklogStats {
  totalStories: number;
  totalStoryPoints: number;
  storiesByStatus: Record<StoryStatus, number>;
  storiesByPriority: Record<MoscowPriority, number>;
  totalEpics: number;
  epicsByStatus: Record<EpicStatus, number>;
}

export async function getBacklogStats(projectId: string): Promise<BacklogStats> {
  try {
    const [stories, epics] = await Promise.all([
      getStoriesByProject(projectId),
      getEpicsByProject(projectId),
    ]);

    const stats: BacklogStats = {
      totalStories: stories.length,
      totalStoryPoints: stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0),
      storiesByStatus: {
        backlog: 0,
        ready: 0,
        in_sprint: 0,
        in_progress: 0,
        review: 0,
        done: 0,
      },
      storiesByPriority: {
        must_have: 0,
        should_have: 0,
        could_have: 0,
        wont_have: 0,
      },
      totalEpics: epics.length,
      epicsByStatus: {
        backlog: 0,
        in_progress: 0,
        done: 0,
      },
    };

    // Count stories by status
    stories.forEach((story) => {
      stats.storiesByStatus[story.status]++;
      if (story.moscowPriority) {
        stats.storiesByPriority[story.moscowPriority]++;
      }
    });

    // Count epics by status
    epics.forEach((epic) => {
      stats.epicsByStatus[epic.status]++;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating backlog stats:', error);
    throw new Error('Impossibile calcolare le statistiche del backlog');
  }
}
