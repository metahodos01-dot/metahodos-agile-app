/**
 * Team Management Service - CRUD operations for team members, leaves, and capacity
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
  TeamMember,
  Leave,
  TimeEntry,
  SprintCapacity,
  TeamAnalytics,
  WorkloadItem,
  TeamRole,
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

// =====================
// TEAM MEMBER CRUD
// =====================

/**
 * Create a new team member
 */
export async function createTeamMember(
  projectId: string,
  memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>,
  userId: string
): Promise<TeamMember> {
  try {
    const membersRef = collection(db, 'teamMembers');

    const memberDoc = {
      ...memberData,
      projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(membersRef, memberDoc);

    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      throw new Error('Failed to create team member');
    }

    return {
      id: docSnapshot.id,
      ...convertTimestamp(docSnapshot.data()),
    } as TeamMember;
  } catch (error) {
    console.error('Error creating team member:', error);
    throw error;
  }
}

/**
 * Get all team members for a project
 */
export async function getTeamMembersByProject(
  projectId: string = DEFAULT_PROJECT_ID
): Promise<TeamMember[]> {
  try {
    const membersRef = collection(db, 'teamMembers');
    const q = query(membersRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    const members = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as TeamMember[];

    // Sort by name
    members.sort((a, b) => a.name.localeCompare(b.name));

    return members;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

/**
 * Get a single team member by ID
 */
export async function getTeamMemberById(memberId: string): Promise<TeamMember | null> {
  try {
    const memberRef = doc(db, 'teamMembers', memberId);
    const memberSnapshot = await getDoc(memberRef);

    if (!memberSnapshot.exists()) {
      return null;
    }

    return {
      id: memberSnapshot.id,
      ...convertTimestamp(memberSnapshot.data()),
    } as TeamMember;
  } catch (error) {
    console.error('Error fetching team member:', error);
    throw error;
  }
}

/**
 * Update a team member
 */
export async function updateTeamMember(
  memberId: string,
  updates: Partial<Omit<TeamMember, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  try {
    const memberRef = doc(db, 'teamMembers', memberId);

    await updateDoc(memberRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(memberId: string): Promise<void> {
  try {
    const memberRef = doc(db, 'teamMembers', memberId);
    await deleteDoc(memberRef);

    // Also delete associated leaves and time entries
    const [leavesSnapshot, timeEntriesSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'leaves'), where('teamMemberId', '==', memberId))),
      getDocs(query(collection(db, 'timeEntries'), where('teamMemberId', '==', memberId))),
    ]);

    const deletePromises = [
      ...leavesSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...timeEntriesSnapshot.docs.map(doc => deleteDoc(doc.ref)),
    ];

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
}

// =====================
// LEAVE MANAGEMENT
// =====================

/**
 * Create a leave record
 */
export async function createLeave(
  projectId: string,
  teamMemberId: string,
  leaveData: Omit<Leave, 'id' | 'createdAt' | 'projectId' | 'teamMemberId'>,
  userId: string
): Promise<Leave> {
  try {
    const leavesRef = collection(db, 'leaves');

    const leaveDoc = {
      ...leaveData,
      projectId,
      teamMemberId,
      createdAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(leavesRef, leaveDoc);

    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      throw new Error('Failed to create leave');
    }

    return {
      id: docSnapshot.id,
      ...convertTimestamp(docSnapshot.data()),
    } as Leave;
  } catch (error) {
    console.error('Error creating leave:', error);
    throw error;
  }
}

/**
 * Get leaves for a team member
 */
export async function getLeavesByTeamMember(teamMemberId: string): Promise<Leave[]> {
  try {
    const leavesRef = collection(db, 'leaves');
    const q = query(leavesRef, where('teamMemberId', '==', teamMemberId));
    const querySnapshot = await getDocs(q);

    const leaves = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as Leave[];

    // Sort by start date (most recent first)
    leaves.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    return leaves;
  } catch (error) {
    console.error('Error fetching leaves:', error);
    throw error;
  }
}

/**
 * Delete a leave record
 */
export async function deleteLeave(leaveId: string): Promise<void> {
  try {
    const leaveRef = doc(db, 'leaves', leaveId);
    await deleteDoc(leaveRef);
  } catch (error) {
    console.error('Error deleting leave:', error);
    throw error;
  }
}

// =====================
// TIME TRACKING
// =====================

/**
 * Create a time entry
 */
export async function createTimeEntry(
  projectId: string,
  teamMemberId: string,
  timeData: Omit<TimeEntry, 'id' | 'createdAt' | 'projectId' | 'teamMemberId'>,
  userId: string
): Promise<TimeEntry> {
  try {
    const timeEntriesRef = collection(db, 'timeEntries');

    const timeDoc = {
      ...timeData,
      projectId,
      teamMemberId,
      createdAt: serverTimestamp(),
      createdBy: userId,
    };

    const docRef = await addDoc(timeEntriesRef, timeDoc);

    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
      throw new Error('Failed to create time entry');
    }

    return {
      id: docSnapshot.id,
      ...convertTimestamp(docSnapshot.data()),
    } as TimeEntry;
  } catch (error) {
    console.error('Error creating time entry:', error);
    throw error;
  }
}

/**
 * Get time entries for a team member
 */
export async function getTimeEntriesByTeamMember(
  teamMemberId: string,
  sprintId?: string
): Promise<TimeEntry[]> {
  try {
    const timeEntriesRef = collection(db, 'timeEntries');
    let q = query(timeEntriesRef, where('teamMemberId', '==', teamMemberId));

    if (sprintId) {
      q = query(timeEntriesRef, where('teamMemberId', '==', teamMemberId), where('sprintId', '==', sprintId));
    }

    const querySnapshot = await getDocs(q);

    const timeEntries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamp(doc.data()),
    })) as TimeEntry[];

    // Sort by date (most recent first)
    timeEntries.sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeEntries;
  } catch (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }
}

// =====================
// CAPACITY PLANNING
// =====================

/**
 * Calculate sprint capacity for a team member
 */
export async function calculateSprintCapacity(
  sprintId: string,
  teamMemberId: string
): Promise<SprintCapacity | null> {
  try {
    // Get team member
    const member = await getTeamMemberById(teamMemberId);
    if (!member) return null;

    // Get sprint to calculate duration
    const sprintRef = doc(db, 'sprints', sprintId);
    const sprintSnapshot = await getDoc(sprintRef);
    if (!sprintSnapshot.exists()) return null;

    const sprintData = sprintSnapshot.data();
    const startDate = sprintData.startDate.toDate();
    const endDate = sprintData.endDate.toDate();
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const workingDays = Math.ceil(durationDays * (5 / 7)); // Assume 5-day work week

    // Calculate available hours considering allocation
    const hoursPerDay = member.weeklyHoursCapacity / 5; // Daily capacity
    const totalAvailableHours = workingDays * hoursPerDay * (member.currentAllocation / 100);

    // Check for leaves during sprint
    const leaves = await getLeavesByTeamMember(teamMemberId);
    const leaveDays = leaves.reduce((total, leave) => {
      const leaveStart = leave.startDate > startDate ? leave.startDate : startDate;
      const leaveEnd = leave.endDate < endDate ? leave.endDate : endDate;

      if (leaveStart <= endDate && leaveEnd >= startDate) {
        const overlapDays = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24));
        return total + overlapDays;
      }
      return total;
    }, 0);

    const availableHours = Math.max(0, totalAvailableHours - (leaveDays * hoursPerDay));

    // Get allocated hours from time entries (if any)
    const timeEntries = await getTimeEntriesByTeamMember(teamMemberId, sprintId);
    const allocatedHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return {
      id: `${sprintId}-${teamMemberId}`,
      sprintId,
      teamMemberId,
      availableHours,
      allocatedHours,
      remainingHours: availableHours - allocatedHours,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error calculating sprint capacity:', error);
    throw error;
  }
}

/**
 * Get sprint capacity for all team members
 */
export async function getSprintCapacityForTeam(
  projectId: string,
  sprintId: string
): Promise<SprintCapacity[]> {
  try {
    const members = await getTeamMembersByProject(projectId);
    const activeMembers = members.filter(m => m.status === 'active');

    const capacities = await Promise.all(
      activeMembers.map(member => calculateSprintCapacity(sprintId, member.id))
    );

    return capacities.filter((c): c is SprintCapacity => c !== null);
  } catch (error) {
    console.error('Error getting sprint capacity for team:', error);
    throw error;
  }
}

// =====================
// ANALYTICS & INSIGHTS
// =====================

/**
 * Get team analytics
 */
export async function getTeamAnalytics(
  projectId: string = DEFAULT_PROJECT_ID
): Promise<TeamAnalytics> {
  try {
    const members = await getTeamMembersByProject(projectId);

    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const onLeaveMembers = members.filter(m => m.status === 'on_leave').length;

    // Calculate capacity
    const totalWeeklyCapacity = members
      .filter(m => m.status === 'active')
      .reduce((sum, m) => sum + (m.weeklyHoursCapacity * (m.currentAllocation / 100)), 0);

    const averageAllocation = members.length > 0
      ? members.reduce((sum, m) => sum + m.currentAllocation, 0) / members.length
      : 0;

    // Calculate performance
    const teamVelocity = members
      .filter(m => m.personalVelocity)
      .reduce((sum, m) => sum + (m.personalVelocity || 0), 0);

    const totalStoriesCompleted = members.reduce((sum, m) => sum + (m.completedStories || 0), 0);
    const totalPointsCompleted = members.reduce((sum, m) => sum + (m.completedPoints || 0), 0);

    // By role distribution
    const roleMap = new Map<TeamRole, { count: number; totalCapacity: number }>();
    members.forEach(m => {
      const current = roleMap.get(m.role) || { count: 0, totalCapacity: 0 };
      roleMap.set(m.role, {
        count: current.count + 1,
        totalCapacity: current.totalCapacity + (m.weeklyHoursCapacity * (m.currentAllocation / 100)),
      });
    });

    const byRole = Array.from(roleMap.entries()).map(([role, data]) => ({
      role,
      count: data.count,
      totalCapacity: data.totalCapacity,
    }));

    // Skills coverage
    const skillsMap = new Map<string, { count: number; totalLevel: number }>();
    members.forEach(member => {
      member.skills.forEach(skill => {
        const current = skillsMap.get(skill.name) || { count: 0, totalLevel: 0 };
        const levelValue = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[skill.level];
        skillsMap.set(skill.name, {
          count: current.count + 1,
          totalLevel: current.totalLevel + levelValue,
        });
      });
    });

    const skillsCoverage = Array.from(skillsMap.entries()).map(([skillName, data]) => ({
      skillName,
      memberCount: data.count,
      averageLevel: data.totalLevel / data.count,
    }));

    return {
      projectId,
      totalMembers,
      activeMembers,
      onLeaveMembers,
      totalWeeklyCapacity,
      averageAllocation,
      teamVelocity,
      totalStoriesCompleted,
      totalPointsCompleted,
      byRole,
      skillsCoverage,
    };
  } catch (error) {
    console.error('Error getting team analytics:', error);
    throw error;
  }
}

/**
 * Get workload for current sprint
 */
export async function getCurrentSprintWorkload(
  projectId: string,
  sprintId: string
): Promise<WorkloadItem[]> {
  try {
    const members = await getTeamMembersByProject(projectId);
    const activeMembers = members.filter(m => m.status === 'active');

    // Get stories for sprint
    const storiesRef = collection(db, 'stories');
    const storiesQuery = query(storiesRef, where('sprintId', '==', sprintId));
    const storiesSnapshot = await getDocs(storiesQuery);

    const workload: WorkloadItem[] = await Promise.all(
      activeMembers.map(async member => {
        // Get assigned stories
        const assignedStories = storiesSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((story: any) => story.assignedTo === member.id);

        const assignedPoints = assignedStories.reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0);

        // Get capacity
        const capacity = await calculateSprintCapacity(sprintId, member.id);
        const availableCapacity = capacity?.availableHours || 0;

        // Calculate utilization (assuming 1 point = 1 hour for simplicity)
        const utilization = availableCapacity > 0 ? (assignedPoints / availableCapacity) * 100 : 0;

        return {
          teamMemberId: member.id,
          teamMemberName: member.name,
          role: member.role,
          assignedStories: assignedStories.length,
          assignedPoints,
          availableCapacity,
          utilization,
          isOverloaded: utilization > 100,
          isUnderutilized: utilization < 70,
        };
      })
    );

    // Sort by utilization (highest first)
    workload.sort((a, b) => b.utilization - a.utilization);

    return workload;
  } catch (error) {
    console.error('Error getting sprint workload:', error);
    throw error;
  }
}

/**
 * Get team members by role
 */
export async function getTeamMembersByRole(
  projectId: string = DEFAULT_PROJECT_ID,
  role: TeamRole
): Promise<TeamMember[]> {
  try {
    const members = await getTeamMembersByProject(projectId);
    return members.filter(m => m.role === role);
  } catch (error) {
    console.error('Error filtering team members by role:', error);
    throw error;
  }
}

/**
 * Calculate personal velocity for a team member
 */
export async function calculatePersonalVelocity(memberId: string): Promise<number> {
  try {
    // Get all completed stories assigned to this member
    const storiesRef = collection(db, 'stories');
    const q = query(
      storiesRef,
      where('assignedTo', '==', memberId),
      where('status', '==', 'done')
    );
    const querySnapshot = await getDocs(q);

    const completedPoints = querySnapshot.docs.reduce((sum, doc) => {
      const story = doc.data();
      return sum + (story.storyPoints || 0);
    }, 0);

    // Get number of sprints participated
    const sprintIds = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const story = doc.data();
      if (story.sprintId) {
        sprintIds.add(story.sprintId);
      }
    });

    const sprintCount = sprintIds.size;
    return sprintCount > 0 ? completedPoints / sprintCount : 0;
  } catch (error) {
    console.error('Error calculating personal velocity:', error);
    return 0;
  }
}
