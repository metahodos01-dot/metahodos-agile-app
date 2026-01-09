/**
 * Analytics Service - Calculate metrics from sprint and story data
 */

import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type {
  Sprint,
  Story,
  VelocityDataPoint,
  BurndownDataPoint,
  SprintMetrics,
  TeamMetrics,
  EpicProgress,
} from './types';

const DEFAULT_PROJECT_ID = 'default-project';

/**
 * Calculate sprint metrics (velocity, completion rate, etc.)
 */
export async function calculateSprintMetrics(sprintId: string): Promise<SprintMetrics | null> {
  try {
    // Get sprint data
    const sprintsRef = collection(db, 'sprints');
    const sprintQuery = query(sprintsRef, where('__name__', '==', sprintId));
    const sprintSnapshot = await getDocs(sprintQuery);

    if (sprintSnapshot.empty) {
      return null;
    }

    const sprintDoc = sprintSnapshot.docs[0];
    const sprint = { id: sprintDoc.id, ...sprintDoc.data() } as Sprint;

    // Get stories for this sprint
    const storiesRef = collection(db, 'stories');
    const storiesQuery = query(storiesRef, where('sprintId', '==', sprintId));
    const storiesSnapshot = await getDocs(storiesQuery);

    const stories = storiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Story[];

    // Calculate metrics
    const planned = stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
    const completed = stories
      .filter(story => story.status === 'done')
      .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

    const totalStories = stories.length;
    const completedStories = stories.filter(story => story.status === 'done').length;
    const completionRate = totalStories > 0 ? (completedStories / totalStories) * 100 : 0;

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      capacity: sprint.capacity,
      planned,
      completed,
      velocity: completed,
      completionRate,
      totalStories,
      completedStories,
    };
  } catch (error) {
    console.error('Error calculating sprint metrics:', error);
    throw error;
  }
}

/**
 * Get velocity data for all completed sprints
 */
export async function getVelocityData(projectId: string = DEFAULT_PROJECT_ID): Promise<VelocityDataPoint[]> {
  try {
    // Get all completed sprints
    const sprintsRef = collection(db, 'sprints');
    const sprintsQuery = query(
      sprintsRef,
      where('projectId', '==', projectId),
      where('status', '==', 'completed')
    );
    const sprintsSnapshot = await getDocs(sprintsQuery);

    const sprints = sprintsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Sprint[];

    // Sort by start date
    sprints.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Calculate velocity for each sprint
    const velocityData: VelocityDataPoint[] = [];

    for (const sprint of sprints) {
      const metrics = await calculateSprintMetrics(sprint.id);
      if (metrics) {
        velocityData.push({
          sprintId: sprint.id,
          sprintName: sprint.name,
          planned: metrics.planned,
          completed: metrics.completed,
          date: sprint.endDate,
        });
      }
    }

    return velocityData;
  } catch (error) {
    console.error('Error getting velocity data:', error);
    throw error;
  }
}

/**
 * Calculate burndown data for a sprint
 */
export async function getBurndownData(sprintId: string): Promise<BurndownDataPoint[]> {
  try {
    // Get sprint
    const sprintsRef = collection(db, 'sprints');
    const sprintQuery = query(sprintsRef, where('__name__', '==', sprintId));
    const sprintSnapshot = await getDocs(sprintQuery);

    if (sprintSnapshot.empty) {
      return [];
    }

    const sprintDoc = sprintSnapshot.docs[0];
    const sprint = { id: sprintDoc.id, ...sprintDoc.data() } as Sprint;

    // Get stories
    const storiesRef = collection(db, 'stories');
    const storiesQuery = query(storiesRef, where('sprintId', '==', sprintId));
    const storiesSnapshot = await getDocs(storiesQuery);

    const stories = storiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Story[];

    const totalPoints = stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);

    // Calculate sprint duration in days
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Generate burndown data
    const burndownData: BurndownDataPoint[] = [];
    const today = new Date();

    for (let day = 0; day <= durationDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);

      // Ideal burndown (linear)
      const ideal = totalPoints - (totalPoints / durationDays) * day;

      // Actual (simplified - in real app, would track daily progress)
      // For now, assuming linear progress based on current completion
      const completedPoints = stories
        .filter(story => story.status === 'done')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      let actual: number;
      let remaining: number;

      if (currentDate > today) {
        // Future dates
        actual = totalPoints - completedPoints;
        remaining = totalPoints - completedPoints;
      } else if (currentDate.toDateString() === today.toDateString()) {
        // Today
        actual = totalPoints - completedPoints;
        remaining = totalPoints - completedPoints;
      } else {
        // Past dates (simplified linear assumption)
        const daysPassed = day;
        const progressRate = completedPoints / Math.min(durationDays, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        actual = totalPoints - (progressRate * daysPassed);
        remaining = Math.max(0, actual);
      }

      burndownData.push({
        date: currentDate,
        day,
        ideal: Math.max(0, ideal),
        actual: Math.max(0, actual),
        remaining: Math.max(0, remaining),
      });
    }

    return burndownData;
  } catch (error) {
    console.error('Error calculating burndown data:', error);
    throw error;
  }
}

/**
 * Calculate team metrics across all sprints
 */
export async function getTeamMetrics(projectId: string = DEFAULT_PROJECT_ID): Promise<TeamMetrics> {
  try {
    // Get all completed sprints
    const sprintsRef = collection(db, 'sprints');
    const sprintsQuery = query(
      sprintsRef,
      where('projectId', '==', projectId),
      where('status', '==', 'completed')
    );
    const sprintsSnapshot = await getDocs(sprintsQuery);

    const sprints = sprintsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Sprint[];

    // Calculate metrics for each sprint
    const sprintMetrics: SprintMetrics[] = [];
    let totalVelocity = 0;
    let totalCompletionRate = 0;
    let totalStoryPoints = 0;
    let totalStoriesCompleted = 0;

    for (const sprint of sprints) {
      const metrics = await calculateSprintMetrics(sprint.id);
      if (metrics) {
        sprintMetrics.push(metrics);
        totalVelocity += metrics.velocity;
        totalCompletionRate += metrics.completionRate;
        totalStoryPoints += metrics.completed;
        totalStoriesCompleted += metrics.completedStories;
      }
    }

    const totalSprints = sprintMetrics.length;
    const averageVelocity = totalSprints > 0 ? totalVelocity / totalSprints : 0;
    const averageCompletionRate = totalSprints > 0 ? totalCompletionRate / totalSprints : 0;

    return {
      totalSprints,
      averageVelocity,
      averageCompletionRate,
      totalStoryPoints,
      totalStoriesCompleted,
      sprintMetrics,
    };
  } catch (error) {
    console.error('Error calculating team metrics:', error);
    throw error;
  }
}

/**
 * Get epic progress data
 */
export async function getEpicProgress(projectId: string = DEFAULT_PROJECT_ID): Promise<EpicProgress[]> {
  try {
    // Get all epics
    const epicsRef = collection(db, 'epics');
    const epicsQuery = query(epicsRef, where('projectId', '==', projectId));
    const epicsSnapshot = await getDocs(epicsQuery);

    const epicProgressData: EpicProgress[] = [];

    for (const epicDoc of epicsSnapshot.docs) {
      const epicData = epicDoc.data();
      const epic = { id: epicDoc.id, ...epicData };

      // Get stories for this epic
      const storiesRef = collection(db, 'stories');
      const storiesQuery = query(storiesRef, where('epicId', '==', epic.id));
      const storiesSnapshot = await getDocs(storiesQuery);

      const stories = storiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Story[];

      const totalPoints = stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
      const completedPoints = stories
        .filter(story => story.status === 'done')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      const storiesCount = stories.length;
      const completedStoriesCount = stories.filter(story => story.status === 'done').length;
      const progressPercentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

      epicProgressData.push({
        epicId: epic.id,
        epicName: (epicData.title as string) || 'Unnamed Epic',
        totalPoints,
        completedPoints,
        progressPercentage,
        storiesCount,
        completedStoriesCount,
      });
    }

    return epicProgressData;
  } catch (error) {
    console.error('Error getting epic progress:', error);
    throw error;
  }
}
