/**
 * Firestore service for Sprint Management
 * Handles CRUD operations for Sprints, Daily Scrum Notes, and Retrospectives
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Sprint, Story, DailyScrumNote, SprintRetrospective, SprintStatus } from './types';

// ========================================
// SPRINT OPERATIONS
// ========================================

export interface CreateSprintData {
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  status?: SprintStatus;
}

export interface UpdateSprintData {
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  status?: SprintStatus;
  velocity?: number;
}

/**
 * Create a new Sprint
 */
export async function createSprint(
  projectId: string,
  sprintData: CreateSprintData,
  userId: string
): Promise<Sprint> {
  try {
    console.log('[Firestore] Creating sprint for project:', projectId);

    const sprintsRef = collection(db, 'sprints');

    const newSprint = {
      projectId,
      name: sprintData.name,
      goal: sprintData.goal,
      startDate: Timestamp.fromDate(sprintData.startDate),
      endDate: Timestamp.fromDate(sprintData.endDate),
      capacity: sprintData.capacity,
      status: sprintData.status || ('planning' as SprintStatus),
      velocity: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(sprintsRef, newSprint);
    console.log('[Firestore] Sprint created with ID:', docRef.id);

    return {
      id: docRef.id,
      projectId,
      name: sprintData.name,
      goal: sprintData.goal,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      capacity: sprintData.capacity,
      status: sprintData.status || 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('[Firestore] Error creating sprint:', error);
    throw new Error('Impossibile creare lo sprint');
  }
}

/**
 * Update a Sprint
 */
export async function updateSprint(
  sprintId: string,
  updates: UpdateSprintData
): Promise<void> {
  try {
    console.log('[Firestore] Updating sprint:', sprintId);

    const sprintRef = doc(db, 'sprints', sprintId);

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Convert Date objects to Timestamps
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }

    await updateDoc(sprintRef, updateData);
    console.log('[Firestore] Sprint updated successfully');
  } catch (error) {
    console.error('[Firestore] Error updating sprint:', error);
    throw new Error('Impossibile aggiornare lo sprint');
  }
}

/**
 * Delete a Sprint
 * @param sprintId - Sprint ID to delete
 * @param removeStoriesFromSprint - If true, unlinks stories from sprint (sets sprintId to null and status to 'ready')
 */
export async function deleteSprint(
  sprintId: string,
  removeStoriesFromSprint: boolean = true
): Promise<void> {
  try {
    console.log('[Firestore] Deleting sprint:', sprintId);

    const batch = writeBatch(db);

    // Delete the sprint
    const sprintRef = doc(db, 'sprints', sprintId);
    batch.delete(sprintRef);

    if (removeStoriesFromSprint) {
      // Get all stories in this sprint
      const storiesQuery = query(
        collection(db, 'stories'),
        where('sprintId', '==', sprintId)
      );
      const storiesSnapshot = await getDocs(storiesQuery);

      console.log('[Firestore] Found', storiesSnapshot.size, 'stories to unlink');

      // Unlink stories from sprint
      storiesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          sprintId: null,
          status: 'ready', // Return to backlog
          updatedAt: serverTimestamp(),
        });
      });
    }

    // Delete associated daily scrum notes
    const notesQuery = query(
      collection(db, 'dailyScrumNotes'),
      where('sprintId', '==', sprintId)
    );
    const notesSnapshot = await getDocs(notesQuery);
    notesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete associated retrospective
    const retroQuery = query(
      collection(db, 'sprintRetrospectives'),
      where('sprintId', '==', sprintId)
    );
    const retroSnapshot = await getDocs(retroQuery);
    retroSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('[Firestore] Sprint deleted successfully');
  } catch (error) {
    console.error('[Firestore] Error deleting sprint:', error);
    throw new Error('Impossibile eliminare lo sprint');
  }
}

/**
 * Get all Sprints for a project
 */
export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
  try {
    console.log('[Firestore] Fetching sprints for project:', projectId);

    const sprintsQuery = query(
      collection(db, 'sprints'),
      where('projectId', '==', projectId)
      // No orderBy to avoid composite index requirement
    );

    const snapshot = await getDocs(sprintsQuery);
    console.log('[Firestore] Sprints fetched:', snapshot.size, 'documents');

    const sprints = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: data.projectId,
        name: data.name,
        goal: data.goal,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        status: data.status,
        capacity: data.capacity,
        velocity: data.velocity,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      } as Sprint;
    });

    // Sort in memory: active first, then by start date descending
    sprints.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return b.startDate.getTime() - a.startDate.getTime();
    });

    return sprints;
  } catch (error: any) {
    console.error('[Firestore] Error fetching sprints:', error);
    console.error('[Firestore] Error code:', error?.code);
    console.error('[Firestore] Error message:', error?.message);
    throw error;
  }
}

/**
 * Get a single Sprint by ID
 */
export async function getSprintById(sprintId: string): Promise<Sprint | null> {
  try {
    console.log('[Firestore] Fetching sprint:', sprintId);

    const sprintRef = doc(db, 'sprints', sprintId);
    const sprintDoc = await getDoc(sprintRef);

    if (!sprintDoc.exists()) {
      console.log('[Firestore] Sprint not found');
      return null;
    }

    const data = sprintDoc.data();
    return {
      id: sprintDoc.id,
      projectId: data.projectId,
      name: data.name,
      goal: data.goal,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      status: data.status,
      capacity: data.capacity,
      velocity: data.velocity,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as Sprint;
  } catch (error) {
    console.error('[Firestore] Error fetching sprint:', error);
    throw new Error('Impossibile recuperare lo sprint');
  }
}

/**
 * Get the active Sprint for a project (if any)
 */
export async function getActiveSprint(projectId: string): Promise<Sprint | null> {
  try {
    console.log('[Firestore] Fetching active sprint for project:', projectId);

    const sprintsQuery = query(
      collection(db, 'sprints'),
      where('projectId', '==', projectId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(sprintsQuery);

    if (snapshot.empty) {
      console.log('[Firestore] No active sprint found');
      return null;
    }

    const doc = snapshot.docs[0]; // Should only be one active sprint
    const data = doc.data();

    return {
      id: doc.id,
      projectId: data.projectId,
      name: data.name,
      goal: data.goal,
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate() || new Date(),
      status: data.status,
      capacity: data.capacity,
      velocity: data.velocity,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as Sprint;
  } catch (error) {
    console.error('[Firestore] Error fetching active sprint:', error);
    throw new Error('Impossibile recuperare lo sprint attivo');
  }
}

// ========================================
// SPRINT STORY MANAGEMENT
// ========================================

/**
 * Add a Story to a Sprint
 */
export async function addStoryToSprint(storyId: string, sprintId: string): Promise<void> {
  try {
    console.log('[Firestore] Adding story', storyId, 'to sprint', sprintId);

    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      sprintId: sprintId,
      status: 'in_sprint',
      updatedAt: serverTimestamp(),
    });

    console.log('[Firestore] Story added to sprint successfully');
  } catch (error) {
    console.error('[Firestore] Error adding story to sprint:', error);
    throw new Error('Impossibile aggiungere la story allo sprint');
  }
}

/**
 * Add multiple Stories to a Sprint (batch operation)
 */
export async function addStoriesToSprint(storyIds: string[], sprintId: string): Promise<void> {
  try {
    console.log('[Firestore] Adding', storyIds.length, 'stories to sprint', sprintId);

    const batch = writeBatch(db);

    storyIds.forEach((storyId) => {
      const storyRef = doc(db, 'stories', storyId);
      batch.update(storyRef, {
        sprintId: sprintId,
        status: 'in_sprint',
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    console.log('[Firestore] Stories added to sprint successfully');
  } catch (error) {
    console.error('[Firestore] Error adding stories to sprint:', error);
    throw new Error('Impossibile aggiungere le story allo sprint');
  }
}

/**
 * Remove a Story from a Sprint
 */
export async function removeStoryFromSprint(storyId: string): Promise<void> {
  try {
    console.log('[Firestore] Removing story', storyId, 'from sprint');

    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      sprintId: null,
      status: 'ready', // Return to backlog
      updatedAt: serverTimestamp(),
    });

    console.log('[Firestore] Story removed from sprint successfully');
  } catch (error) {
    console.error('[Firestore] Error removing story from sprint:', error);
    throw new Error('Impossibile rimuovere la story dallo sprint');
  }
}

/**
 * Get all Stories in a Sprint
 */
export async function getStoriesBySprint(sprintId: string): Promise<Story[]> {
  try {
    console.log('[Firestore] Fetching stories for sprint:', sprintId);

    const storiesQuery = query(
      collection(db, 'stories'),
      where('sprintId', '==', sprintId)
      // No orderBy to avoid composite index requirement
    );

    const snapshot = await getDocs(storiesQuery);
    console.log('[Firestore] Stories fetched:', snapshot.size, 'documents');

    const stories = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: data.projectId,
        epicId: data.epicId,
        title: data.title,
        description: data.description,
        acceptanceCriteria: data.acceptanceCriteria || [],
        storyPoints: data.storyPoints,
        priority: data.priority,
        moscowPriority: data.moscowPriority,
        status: data.status,
        assigneeId: data.assigneeId,
        sprintId: data.sprintId,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      } as Story;
    });

    // Sort in memory by priority descending
    stories.sort((a, b) => b.priority - a.priority);

    return stories;
  } catch (error) {
    console.error('[Firestore] Error fetching sprint stories:', error);
    throw new Error('Impossibile recuperare le story dello sprint');
  }
}

// ========================================
// DAILY SCRUM NOTES
// ========================================

export interface CreateDailyScrumNoteData {
  notes: string;
  blockers: string[];
}

/**
 * Create a Daily Scrum Note
 */
export async function createDailyScrumNote(
  sprintId: string,
  noteData: CreateDailyScrumNoteData,
  userId: string
): Promise<DailyScrumNote> {
  try {
    console.log('[Firestore] Creating daily scrum note for sprint:', sprintId);

    const notesRef = collection(db, 'dailyScrumNotes');

    const newNote = {
      sprintId,
      date: serverTimestamp(),
      notes: noteData.notes,
      blockers: noteData.blockers,
      createdBy: userId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(notesRef, newNote);
    console.log('[Firestore] Daily scrum note created with ID:', docRef.id);

    return {
      id: docRef.id,
      sprintId,
      date: new Date(),
      notes: noteData.notes,
      blockers: noteData.blockers,
      createdBy: userId,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('[Firestore] Error creating daily scrum note:', error);
    throw new Error('Impossibile creare la nota del daily scrum');
  }
}

/**
 * Get all Daily Scrum Notes for a Sprint
 */
export async function getDailyScrumNotes(sprintId: string): Promise<DailyScrumNote[]> {
  try {
    console.log('[Firestore] Fetching daily scrum notes for sprint:', sprintId);

    const notesQuery = query(
      collection(db, 'dailyScrumNotes'),
      where('sprintId', '==', sprintId)
    );

    const snapshot = await getDocs(notesQuery);
    console.log('[Firestore] Daily scrum notes fetched:', snapshot.size, 'documents');

    const notes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        sprintId: data.sprintId,
        date: data.date?.toDate() || new Date(),
        notes: data.notes,
        blockers: data.blockers || [],
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as DailyScrumNote;
    });

    // Sort by date descending (most recent first)
    notes.sort((a, b) => b.date.getTime() - a.date.getTime());

    return notes;
  } catch (error) {
    console.error('[Firestore] Error fetching daily scrum notes:', error);
    throw new Error('Impossibile recuperare le note del daily scrum');
  }
}

// ========================================
// SPRINT RETROSPECTIVE
// ========================================

export interface CreateRetrospectiveData {
  wentWell: string[];
  toImprove: string[];
  actionItems: string[];
}

/**
 * Create a Sprint Retrospective
 */
export async function createRetrospective(
  sprintId: string,
  retroData: CreateRetrospectiveData,
  userId: string
): Promise<SprintRetrospective> {
  try {
    console.log('[Firestore] Creating retrospective for sprint:', sprintId);

    const retrosRef = collection(db, 'sprintRetrospectives');

    const newRetro = {
      sprintId,
      wentWell: retroData.wentWell,
      toImprove: retroData.toImprove,
      actionItems: retroData.actionItems,
      createdAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(retrosRef, newRetro);
    console.log('[Firestore] Retrospective created with ID:', docRef.id);

    return {
      id: docRef.id,
      sprintId,
      wentWell: retroData.wentWell,
      toImprove: retroData.toImprove,
      actionItems: retroData.actionItems,
      createdAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('[Firestore] Error creating retrospective:', error);
    throw new Error('Impossibile creare la retrospettiva');
  }
}

/**
 * Get Retrospective for a Sprint
 */
export async function getRetrospective(sprintId: string): Promise<SprintRetrospective | null> {
  try {
    console.log('[Firestore] Fetching retrospective for sprint:', sprintId);

    const retroQuery = query(
      collection(db, 'sprintRetrospectives'),
      where('sprintId', '==', sprintId)
    );

    const snapshot = await getDocs(retroQuery);

    if (snapshot.empty) {
      console.log('[Firestore] No retrospective found');
      return null;
    }

    const doc = snapshot.docs[0]; // Should only be one retro per sprint
    const data = doc.data();

    return {
      id: doc.id,
      sprintId: data.sprintId,
      wentWell: data.wentWell || [],
      toImprove: data.toImprove || [],
      actionItems: data.actionItems || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as SprintRetrospective;
  } catch (error) {
    console.error('[Firestore] Error fetching retrospective:', error);
    throw new Error('Impossibile recuperare la retrospettiva');
  }
}

// ========================================
// SPRINT STATISTICS
// ========================================

export interface SprintStats {
  totalPoints: number;
  completedPoints: number;
  totalStories: number;
  completedStories: number;
  velocity: number;
  burndownData: { date: Date; remainingPoints: number }[];
}

/**
 * Get Sprint Statistics
 */
export async function getSprintStats(sprintId: string): Promise<SprintStats> {
  try {
    console.log('[Firestore] Calculating sprint stats for:', sprintId);

    const stories = await getStoriesBySprint(sprintId);

    const totalStories = stories.length;
    const completedStories = stories.filter((s) => s.status === 'done').length;

    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedPoints = stories
      .filter((s) => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

    const velocity = completedPoints; // Velocity is the sum of completed story points

    // TODO: Implement burndown data calculation based on story completion dates
    // For now, return empty array
    const burndownData: { date: Date; remainingPoints: number }[] = [];

    return {
      totalPoints,
      completedPoints,
      totalStories,
      completedStories,
      velocity,
      burndownData,
    };
  } catch (error) {
    console.error('[Firestore] Error calculating sprint stats:', error);
    throw new Error('Impossibile calcolare le statistiche dello sprint');
  }
}
