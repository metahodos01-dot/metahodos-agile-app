/**
 * Firestore service for Discovery & Process Improvement Tools
 * Handles CRUD operations for BMC, VPC, VSM, and Gap Analysis
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  BusinessModelCanvas,
  ValuePropositionCanvas,
  ValueStreamMap,
  ProcessStep,
  GapAnalysis,
  GapItem,
  ActionItem,
} from './types';

// ========================================
// BUSINESS MODEL CANVAS OPERATIONS
// ========================================

export interface CreateBMCData {
  title: string;
  customerSegments?: string;
  valuePropositions?: string;
  channels?: string;
  customerRelationships?: string;
  revenueStreams?: string;
  keyResources?: string;
  keyActivities?: string;
  keyPartnerships?: string;
  costStructure?: string;
}

export interface UpdateBMCData {
  title?: string;
  customerSegments?: string;
  valuePropositions?: string;
  channels?: string;
  customerRelationships?: string;
  revenueStreams?: string;
  keyResources?: string;
  keyActivities?: string;
  keyPartnerships?: string;
  costStructure?: string;
}

/**
 * Create or Update Business Model Canvas
 * Uses projectId as document ID (one canvas per project)
 */
export async function saveBMC(
  projectId: string,
  bmcData: CreateBMCData,
  userId: string
): Promise<BusinessModelCanvas> {
  try {
    console.log('[Firestore] Saving BMC for project:', projectId);

    const bmcRef = doc(db, 'businessModelCanvas', projectId);

    // Check if exists
    const existing = await getDoc(bmcRef);
    const isUpdate = existing.exists();

    const bmcDocument = {
      projectId,
      title: bmcData.title,
      customerSegments: bmcData.customerSegments || '',
      valuePropositions: bmcData.valuePropositions || '',
      channels: bmcData.channels || '',
      customerRelationships: bmcData.customerRelationships || '',
      revenueStreams: bmcData.revenueStreams || '',
      keyResources: bmcData.keyResources || '',
      keyActivities: bmcData.keyActivities || '',
      keyPartnerships: bmcData.keyPartnerships || '',
      costStructure: bmcData.costStructure || '',
      lastUpdated: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isUpdate ? {} : {
        createdAt: serverTimestamp(),
        createdBy: userId,
      }),
    };

    await setDoc(bmcRef, bmcDocument, { merge: true });
    console.log('[Firestore] BMC saved successfully');

    return {
      id: projectId,
      projectId,
      title: bmcData.title,
      customerSegments: bmcData.customerSegments || '',
      valuePropositions: bmcData.valuePropositions || '',
      channels: bmcData.channels || '',
      customerRelationships: bmcData.customerRelationships || '',
      revenueStreams: bmcData.revenueStreams || '',
      keyResources: bmcData.keyResources || '',
      keyActivities: bmcData.keyActivities || '',
      keyPartnerships: bmcData.keyPartnerships || '',
      costStructure: bmcData.costStructure || '',
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('[Firestore] Error saving BMC:', error);
    throw new Error('Impossibile salvare il Business Model Canvas');
  }
}

/**
 * Get Business Model Canvas by Project
 */
export async function getBMCByProject(projectId: string): Promise<BusinessModelCanvas | null> {
  try {
    console.log('[Firestore] Fetching BMC for project:', projectId);

    const bmcRef = doc(db, 'businessModelCanvas', projectId);
    const bmcDoc = await getDoc(bmcRef);

    if (!bmcDoc.exists()) {
      console.log('[Firestore] No BMC found');
      return null;
    }

    const data = bmcDoc.data();
    return {
      id: bmcDoc.id,
      projectId: data.projectId,
      title: data.title,
      customerSegments: data.customerSegments,
      valuePropositions: data.valuePropositions,
      channels: data.channels,
      customerRelationships: data.customerRelationships,
      revenueStreams: data.revenueStreams,
      keyResources: data.keyResources,
      keyActivities: data.keyActivities,
      keyPartnerships: data.keyPartnerships,
      costStructure: data.costStructure,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as BusinessModelCanvas;
  } catch (error) {
    console.error('[Firestore] Error fetching BMC:', error);
    throw new Error('Impossibile recuperare il Business Model Canvas');
  }
}

/**
 * Delete Business Model Canvas
 */
export async function deleteBMC(projectId: string): Promise<void> {
  try {
    console.log('[Firestore] Deleting BMC for project:', projectId);

    const bmcRef = doc(db, 'businessModelCanvas', projectId);
    await deleteDoc(bmcRef);

    console.log('[Firestore] BMC deleted successfully');
  } catch (error) {
    console.error('[Firestore] Error deleting BMC:', error);
    throw new Error('Impossibile eliminare il Business Model Canvas');
  }
}

// ========================================
// VALUE PROPOSITION CANVAS OPERATIONS
// ========================================

export interface CreateVPCData {
  title: string;
  customerJobs?: string[];
  customerPains?: string[];
  customerGains?: string[];
  products?: string[];
  painRelievers?: string[];
  gainCreators?: string[];
}

/**
 * Create or Update Value Proposition Canvas
 */
export async function saveVPC(
  projectId: string,
  vpcData: CreateVPCData,
  userId: string
): Promise<ValuePropositionCanvas> {
  try {
    console.log('[Firestore] Saving VPC for project:', projectId);

    const vpcRef = doc(db, 'valuePropositionCanvas', projectId);

    // Check if exists
    const existing = await getDoc(vpcRef);
    const isUpdate = existing.exists();

    const vpcDocument = {
      projectId,
      title: vpcData.title,
      customerJobs: vpcData.customerJobs || [],
      customerPains: vpcData.customerPains || [],
      customerGains: vpcData.customerGains || [],
      products: vpcData.products || [],
      painRelievers: vpcData.painRelievers || [],
      gainCreators: vpcData.gainCreators || [],
      lastUpdated: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isUpdate ? {} : {
        createdAt: serverTimestamp(),
        createdBy: userId,
      }),
    };

    await setDoc(vpcRef, vpcDocument, { merge: true });
    console.log('[Firestore] VPC saved successfully');

    return {
      id: projectId,
      projectId,
      title: vpcData.title,
      customerJobs: vpcData.customerJobs || [],
      customerPains: vpcData.customerPains || [],
      customerGains: vpcData.customerGains || [],
      products: vpcData.products || [],
      painRelievers: vpcData.painRelievers || [],
      gainCreators: vpcData.gainCreators || [],
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('[Firestore] Error saving VPC:', error);
    throw new Error('Impossibile salvare il Value Proposition Canvas');
  }
}

/**
 * Get Value Proposition Canvas by Project
 */
export async function getVPCByProject(projectId: string): Promise<ValuePropositionCanvas | null> {
  try {
    console.log('[Firestore] Fetching VPC for project:', projectId);

    const vpcRef = doc(db, 'valuePropositionCanvas', projectId);
    const vpcDoc = await getDoc(vpcRef);

    if (!vpcDoc.exists()) {
      console.log('[Firestore] No VPC found');
      return null;
    }

    const data = vpcDoc.data();
    return {
      id: vpcDoc.id,
      projectId: data.projectId,
      title: data.title,
      customerJobs: data.customerJobs || [],
      customerPains: data.customerPains || [],
      customerGains: data.customerGains || [],
      products: data.products || [],
      painRelievers: data.painRelievers || [],
      gainCreators: data.gainCreators || [],
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as ValuePropositionCanvas;
  } catch (error) {
    console.error('[Firestore] Error fetching VPC:', error);
    throw new Error('Impossibile recuperare il Value Proposition Canvas');
  }
}

/**
 * Delete Value Proposition Canvas
 */
export async function deleteVPC(projectId: string): Promise<void> {
  try {
    console.log('[Firestore] Deleting VPC for project:', projectId);

    const vpcRef = doc(db, 'valuePropositionCanvas', projectId);
    await deleteDoc(vpcRef);

    console.log('[Firestore] VPC deleted successfully');
  } catch (error) {
    console.error('[Firestore] Error deleting VPC:', error);
    throw new Error('Impossibile eliminare il Value Proposition Canvas');
  }
}

// ========================================
// VALUE STREAM MAPPING OPERATIONS
// ========================================

export interface CreateVSMData {
  title: string;
  description?: string;
  currentSteps?: ProcessStep[];
  futureSteps?: ProcessStep[];
}

/**
 * Calculate VSM metrics from process steps
 */
export function calculateVSMMetrics(steps: ProcessStep[]): {
  totalLeadTime: number;
  totalProcessTime: number;
  efficiency: number;
} {
  const totalLeadTime = steps.reduce((sum, step) => sum + step.leadTime, 0);
  const totalProcessTime = steps.reduce((sum, step) => sum + step.processingTime, 0);
  const efficiency = totalLeadTime > 0 ? (totalProcessTime / totalLeadTime) * 100 : 0;

  return {
    totalLeadTime,
    totalProcessTime,
    efficiency: Math.round(efficiency * 10) / 10,
  };
}

/**
 * Create or Update Value Stream Map
 */
export async function saveVSM(
  projectId: string,
  vsmData: CreateVSMData,
  userId: string
): Promise<ValueStreamMap> {
  try {
    console.log('[Firestore] Saving VSM for project:', projectId);

    const vsmRef = doc(db, 'valueStreamMaps', projectId);

    // Check if exists
    const existing = await getDoc(vsmRef);
    const isUpdate = existing.exists();

    // Calculate metrics
    const currentMetrics = calculateVSMMetrics(vsmData.currentSteps || []);
    const futureMetrics = calculateVSMMetrics(vsmData.futureSteps || []);
    const timeReduction = currentMetrics.totalLeadTime - futureMetrics.totalLeadTime;
    const efficiencyGain = futureMetrics.efficiency - currentMetrics.efficiency;

    const vsmDocument = {
      projectId,
      title: vsmData.title,
      description: vsmData.description || '',
      currentSteps: vsmData.currentSteps || [],
      futureSteps: vsmData.futureSteps || [],
      currentTotalLeadTime: currentMetrics.totalLeadTime,
      currentTotalProcessTime: currentMetrics.totalProcessTime,
      futureTotalLeadTime: futureMetrics.totalLeadTime,
      futureTotalProcessTime: futureMetrics.totalProcessTime,
      efficiencyGain: Math.round(efficiencyGain * 10) / 10,
      timeReduction,
      updatedAt: serverTimestamp(),
      ...(isUpdate ? {} : {
        createdAt: serverTimestamp(),
        createdBy: userId,
      }),
    };

    await setDoc(vsmRef, vsmDocument, { merge: true });
    console.log('[Firestore] VSM saved successfully');

    return {
      id: projectId,
      projectId,
      title: vsmData.title,
      description: vsmData.description || '',
      currentSteps: vsmData.currentSteps || [],
      futureSteps: vsmData.futureSteps || [],
      currentTotalLeadTime: currentMetrics.totalLeadTime,
      currentTotalProcessTime: currentMetrics.totalProcessTime,
      futureTotalLeadTime: futureMetrics.totalLeadTime,
      futureTotalProcessTime: futureMetrics.totalProcessTime,
      efficiencyGain: Math.round(efficiencyGain * 10) / 10,
      timeReduction,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('[Firestore] Error saving VSM:', error);
    throw new Error('Impossibile salvare la Value Stream Map');
  }
}

/**
 * Get Value Stream Map by Project
 */
export async function getVSMByProject(projectId: string): Promise<ValueStreamMap | null> {
  try {
    console.log('[Firestore] Fetching VSM for project:', projectId);

    const vsmRef = doc(db, 'valueStreamMaps', projectId);
    const vsmDoc = await getDoc(vsmRef);

    if (!vsmDoc.exists()) {
      console.log('[Firestore] No VSM found');
      return null;
    }

    const data = vsmDoc.data();
    return {
      id: vsmDoc.id,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      currentSteps: data.currentSteps || [],
      futureSteps: data.futureSteps || [],
      currentTotalLeadTime: data.currentTotalLeadTime,
      currentTotalProcessTime: data.currentTotalProcessTime,
      futureTotalLeadTime: data.futureTotalLeadTime,
      futureTotalProcessTime: data.futureTotalProcessTime,
      efficiencyGain: data.efficiencyGain,
      timeReduction: data.timeReduction,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as ValueStreamMap;
  } catch (error) {
    console.error('[Firestore] Error fetching VSM:', error);
    throw new Error('Impossibile recuperare la Value Stream Map');
  }
}

/**
 * Delete Value Stream Map
 */
export async function deleteVSM(projectId: string): Promise<void> {
  try {
    console.log('[Firestore] Deleting VSM for project:', projectId);

    const vsmRef = doc(db, 'valueStreamMaps', projectId);
    await deleteDoc(vsmRef);

    console.log('[Firestore] VSM deleted successfully');
  } catch (error) {
    console.error('[Firestore] Error deleting VSM:', error);
    throw new Error('Impossibile eliminare la Value Stream Map');
  }
}

// ========================================
// GAP ANALYSIS OPERATIONS
// ========================================

export interface CreateGATData {
  title: string;
  description?: string;
  currentState?: string;
  futureState?: string;
  gaps?: GapItem[];
  actions?: ActionItem[];
}

/**
 * Create or Update Gap Analysis
 */
export async function saveGAT(
  projectId: string,
  gatData: CreateGATData,
  userId: string
): Promise<GapAnalysis> {
  try {
    console.log('[Firestore] Saving GAT for project:', projectId);

    const gatRef = doc(db, 'gapAnalysis', projectId);

    // Check if exists
    const existing = await getDoc(gatRef);
    const isUpdate = existing.exists();

    const gatDocument = {
      projectId,
      title: gatData.title,
      description: gatData.description || '',
      currentState: gatData.currentState || '',
      futureState: gatData.futureState || '',
      gaps: gatData.gaps || [],
      actions: gatData.actions || [],
      updatedAt: serverTimestamp(),
      ...(isUpdate ? {} : {
        createdAt: serverTimestamp(),
        createdBy: userId,
      }),
    };

    await setDoc(gatRef, gatDocument, { merge: true });
    console.log('[Firestore] GAT saved successfully');

    return {
      id: projectId,
      projectId,
      title: gatData.title,
      description: gatData.description || '',
      currentState: gatData.currentState || '',
      futureState: gatData.futureState || '',
      gaps: gatData.gaps || [],
      actions: gatData.actions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
    };
  } catch (error) {
    console.error('[Firestore] Error saving GAT:', error);
    throw new Error('Impossibile salvare la Gap Analysis');
  }
}

/**
 * Get Gap Analysis by Project
 */
export async function getGATByProject(projectId: string): Promise<GapAnalysis | null> {
  try {
    console.log('[Firestore] Fetching GAT for project:', projectId);

    const gatRef = doc(db, 'gapAnalysis', projectId);
    const gatDoc = await getDoc(gatRef);

    if (!gatDoc.exists()) {
      console.log('[Firestore] No GAT found');
      return null;
    }

    const data = gatDoc.data();

    // Convert Firestore Timestamps in action items
    const actions = (data.actions || []).map((action: any) => ({
      ...action,
      dueDate: action.dueDate?.toDate(),
    }));

    return {
      id: gatDoc.id,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      currentState: data.currentState,
      futureState: data.futureState,
      gaps: data.gaps || [],
      actions,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    } as GapAnalysis;
  } catch (error) {
    console.error('[Firestore] Error fetching GAT:', error);
    throw new Error('Impossibile recuperare la Gap Analysis');
  }
}

/**
 * Delete Gap Analysis
 */
export async function deleteGAT(projectId: string): Promise<void> {
  try {
    console.log('[Firestore] Deleting GAT for project:', projectId);

    const gatRef = doc(db, 'gapAnalysis', projectId);
    await deleteDoc(gatRef);

    console.log('[Firestore] GAT deleted successfully');
  } catch (error) {
    console.error('[Firestore] Error deleting GAT:', error);
    throw new Error('Impossibile eliminare la Gap Analysis');
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if canvas exists for project
 */
export async function checkCanvasStatus(projectId: string): Promise<{
  bmcExists: boolean;
  vpcExists: boolean;
  vsmExists: boolean;
  gatExists: boolean;
}> {
  try {
    const [bmc, vpc, vsm, gat] = await Promise.all([
      getBMCByProject(projectId),
      getVPCByProject(projectId),
      getVSMByProject(projectId),
      getGATByProject(projectId),
    ]);

    return {
      bmcExists: bmc !== null,
      vpcExists: vpc !== null,
      vsmExists: vsm !== null,
      gatExists: gat !== null,
    };
  } catch (error) {
    console.error('[Firestore] Error checking canvas status:', error);
    return {
      bmcExists: false,
      vpcExists: false,
      vsmExists: false,
      gatExists: false,
    };
  }
}
