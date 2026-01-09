/**
 * Firestore AI Service
 *
 * Manages AI settings, usage logs, cache, and conversations in Firestore.
 * Handles encryption/decryption of API keys and implements rate limiting.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Timestamp,
  addDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  AISettings,
  AIUsageLog,
  AIChatConversation,
  AIMessage,
  AIProvider,
  AIModel,
  AIFeatureType,
} from './types';

// ============================================
// Simple Encryption for API Keys
// ============================================

/**
 * Simple XOR encryption (in production, use proper encryption)
 */
function encryptAPIKey(apiKey: string): string {
  const key = 'METAHODOS_AI_ENCRYPTION_KEY_2026'; // In production, use env variable
  let encrypted = '';

  for (let i = 0; i < apiKey.length; i++) {
    const charCode = apiKey.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }

  return btoa(encrypted); // Base64 encode
}

/**
 * Decrypt API key
 */
function decryptAPIKey(encryptedKey: string): string {
  const key = 'METAHODOS_AI_ENCRYPTION_KEY_2026';

  try {
    const encrypted = atob(encryptedKey); // Base64 decode
    let decrypted = '';

    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

// ============================================
// AI Settings Management
// ============================================

/**
 * Get AI settings for a user
 */
export async function getAISettings(userId: string): Promise<AISettings | null> {
  try {
    const settingsDoc = await getDoc(doc(db, 'aiSettings', userId));

    if (!settingsDoc.exists()) {
      return null;
    }

    const data = settingsDoc.data();

    return {
      id: settingsDoc.id,
      userId: data.userId,
      provider: data.provider,
      model: data.model,
      apiKey: decryptAPIKey(data.apiKey), // Decrypt before returning
      enabledFeatures: data.enabledFeatures || [],
      dailyRequestLimit: data.dailyRequestLimit || 100,
      currentDailyUsage: data.currentDailyUsage || 0,
      lastResetDate: data.lastResetDate?.toDate() || new Date(),
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting AI settings:', error);
    throw error;
  }
}

/**
 * Create or update AI settings for a user
 */
export async function saveAISettings(settings: Partial<AISettings> & { userId: string }): Promise<void> {
  try {
    const settingsRef = doc(db, 'aiSettings', settings.userId);
    const existingSettings = await getDoc(settingsRef);

    const data: any = {
      userId: settings.userId,
      updatedAt: Timestamp.now(),
    };

    if (settings.provider) data.provider = settings.provider;
    if (settings.model) data.model = settings.model;
    if (settings.apiKey) data.apiKey = encryptAPIKey(settings.apiKey); // Encrypt before saving
    if (settings.enabledFeatures) data.enabledFeatures = settings.enabledFeatures;
    if (settings.dailyRequestLimit !== undefined) data.dailyRequestLimit = settings.dailyRequestLimit;
    if (settings.temperature !== undefined) data.temperature = settings.temperature;
    if (settings.maxTokens !== undefined) data.maxTokens = settings.maxTokens;

    if (!existingSettings.exists()) {
      data.createdAt = Timestamp.now();
      data.currentDailyUsage = 0;
      data.lastResetDate = Timestamp.now();
    }

    await setDoc(settingsRef, data, { merge: true });
  } catch (error) {
    console.error('Error saving AI settings:', error);
    throw error;
  }
}

/**
 * Delete AI settings for a user
 */
export async function deleteAISettings(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'aiSettings', userId));
  } catch (error) {
    console.error('Error deleting AI settings:', error);
    throw error;
  }
}

// ============================================
// Rate Limiting
// ============================================

/**
 * Check if user can make a request (rate limiting)
 */
export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  try {
    const settings = await getAISettings(userId);

    if (!settings) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    // Check if we need to reset the daily counter
    const now = new Date();
    const lastReset = settings.lastResetDate;
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    // Reset counter if more than 24 hours have passed
    if (hoursSinceReset >= 24) {
      await setDoc(
        doc(db, 'aiSettings', userId),
        {
          currentDailyUsage: 0,
          lastResetDate: Timestamp.now(),
        },
        { merge: true }
      );

      return {
        allowed: true,
        remaining: settings.dailyRequestLimit,
        limit: settings.dailyRequestLimit,
      };
    }

    const remaining = Math.max(0, settings.dailyRequestLimit - settings.currentDailyUsage);
    const allowed = remaining > 0;

    return { allowed, remaining, limit: settings.dailyRequestLimit };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    throw error;
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsageCounter(userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'aiSettings', userId), {
      currentDailyUsage: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing usage counter:', error);
    throw error;
  }
}

// ============================================
// Usage Logging
// ============================================

/**
 * Log AI usage
 */
export async function logAIUsage(log: Omit<AIUsageLog, 'id' | 'timestamp'>): Promise<string> {
  try {
    const logData = {
      ...log,
      timestamp: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'aiUsageLogs'), logData);
    return docRef.id;
  } catch (error) {
    console.error('Error logging AI usage:', error);
    throw error;
  }
}

/**
 * Get usage logs for a user
 */
export async function getUsageLogs(
  userId: string,
  limit: number = 50
): Promise<AIUsageLog[]> {
  try {
    const q = query(
      collection(db, 'aiUsageLogs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        projectId: data.projectId,
        provider: data.provider,
        model: data.model,
        featureType: data.featureType,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        estimatedCost: data.estimatedCost,
        latencyMs: data.latencyMs,
        success: data.success,
        errorMessage: data.errorMessage,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting usage logs:', error);
    throw error;
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUsageStats(userId: string): Promise<{
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  averageLatency: number;
}> {
  try {
    const logs = await getUsageLogs(userId, 1000);

    const totalRequests = logs.length;
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCost = logs.reduce((sum, log) => sum + (log.estimatedCost || 0), 0);
    const successfulRequests = logs.filter((log) => log.success).length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const averageLatency =
      totalRequests > 0 ? logs.reduce((sum, log) => sum + log.latencyMs, 0) / totalRequests : 0;

    return {
      totalRequests,
      totalTokens,
      totalCost,
      successRate,
      averageLatency,
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw error;
  }
}

// ============================================
// Caching
// ============================================

/**
 * Generate hash for caching
 */
function generatePromptHash(prompt: string, provider: AIProvider, model: AIModel): string {
  const combined = `${provider}-${model}-${prompt}`;
  let hash = 0;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

/**
 * Get cached response
 */
export async function getCachedResponse(
  prompt: string,
  provider: AIProvider,
  model: AIModel
): Promise<{ response: string; tokens: number } | null> {
  try {
    const promptHash = generatePromptHash(prompt, provider, model);

    const q = query(
      collection(db, 'aiCache'),
      where('promptHash', '==', promptHash),
      where('provider', '==', provider),
      where('model', '==', model),
      firestoreLimit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const cacheDoc = snapshot.docs[0];
    const data = cacheDoc.data();

    // Check if cache is expired
    const expiresAt = data.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      // Cache expired, delete it
      await deleteDoc(cacheDoc.ref);
      return null;
    }

    // Update cache metadata
    await updateDoc(cacheDoc.ref, {
      hitCount: increment(1),
      lastAccessedAt: Timestamp.now(),
    });

    return {
      response: data.response,
      tokens: data.tokens,
    };
  } catch (error) {
    console.error('Error getting cached response:', error);
    return null; // Don't throw, just return null on cache miss
  }
}

/**
 * Cache a response
 */
export async function cacheResponse(
  prompt: string,
  provider: AIProvider,
  model: AIModel,
  response: string,
  tokens: number,
  cacheDurationHours: number = 24
): Promise<void> {
  try {
    const promptHash = generatePromptHash(prompt, provider, model);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + cacheDurationHours * 60 * 60 * 1000);

    const cacheData: any = {
      provider,
      model,
      promptHash,
      response,
      tokens,
      hitCount: 0,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
      lastAccessedAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'aiCache'), cacheData);
  } catch (error) {
    console.error('Error caching response:', error);
    // Don't throw, caching is optional
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const now = Timestamp.now();

    const q = query(collection(db, 'aiCache'), where('expiresAt', '<', now));

    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return snapshot.size;
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return 0;
  }
}

// ============================================
// Conversation Management
// ============================================

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  projectId: string | undefined,
  featureType: AIFeatureType
): Promise<string> {
  try {
    const conversationData = {
      userId,
      projectId: projectId || null,
      featureType,
      messages: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'aiConversations'), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Add message to conversation
 */
export async function addMessageToConversation(
  conversationId: string,
  message: Omit<AIMessage, 'id'>
): Promise<void> {
  try {
    const conversationRef = doc(db, 'aiConversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const data = conversationDoc.data();
    const messages = data.messages || [];

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      timestamp: Timestamp.now(),
    };

    messages.push(newMessage);

    await updateDoc(conversationRef, {
      messages,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    throw error;
  }
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<AIChatConversation | null> {
  try {
    const conversationDoc = await getDoc(doc(db, 'aiConversations', conversationId));

    if (!conversationDoc.exists()) {
      return null;
    }

    const data = conversationDoc.data();

    return {
      id: conversationDoc.id,
      userId: data.userId,
      projectId: data.projectId,
      featureType: data.featureType,
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate() || new Date(),
      })),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

/**
 * Get user conversations
 */
export async function getUserConversations(
  userId: string,
  featureType?: AIFeatureType,
  limit: number = 20
): Promise<AIChatConversation[]> {
  try {
    let q = query(
      collection(db, 'aiConversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      firestoreLimit(limit)
    );

    if (featureType) {
      q = query(
        collection(db, 'aiConversations'),
        where('userId', '==', userId),
        where('featureType', '==', featureType),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limit)
      );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        projectId: data.projectId,
        featureType: data.featureType,
        messages: data.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date(),
        })),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'aiConversations', conversationId));
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}
