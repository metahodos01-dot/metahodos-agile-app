/**
 * AI Analysis Functions
 *
 * Provides AI-powered analysis for sprints, backlogs, and retrospectives.
 * Uses configured AI provider to generate insights and recommendations.
 */

import {
  getAISettings,
  checkRateLimit,
  incrementUsageCounter,
  logAIUsage,
  getCachedResponse,
  cacheResponse,
} from './firestore-ai';
import { createAIService } from './ai-service';
import type {
  Sprint,
  Story,
  AISprintAnalysis,
  AIBacklogAnalysis,
  AIRetrospectiveGeneration,
  SprintMetrics,
} from './types';

// ============================================
// Sprint Analysis
// ============================================

export async function analyzeSprintWithAI(
  userId: string,
  sprint: Sprint,
  stories: Story[],
  metrics: SprintMetrics
): Promise<AISprintAnalysis> {
  // Check rate limit
  const rateLimit = await checkRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new Error('Daily request limit reached. Please try again tomorrow.');
  }

  // Get AI settings
  const settings = await getAISettings(userId);

  if (!settings || !settings.apiKey) {
    throw new Error('Please configure your AI settings first');
  }

  if (!settings.enabledFeatures.includes('sprint_analysis')) {
    throw new Error('Sprint analysis feature is disabled in your settings');
  }

  const startTime = Date.now();

  // Build prompt
  const prompt = buildSprintAnalysisPrompt(sprint, stories, metrics);

  // Check cache
  const cached = await getCachedResponse(prompt, settings.provider, settings.model);

  let responseText: string;
  let usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  let estimatedCost: number;

  if (cached) {
    console.log('Using cached sprint analysis');
    responseText = cached.response;
    usage = { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokens };
    estimatedCost = 0;
  } else {
    // Call AI service
    const aiService = createAIService(settings);

    const systemPrompt = `You are an expert Agile coach analyzing sprint performance. Provide actionable insights in JSON format.

Return ONLY a valid JSON object with this structure:
{
  "healthScore": <number 0-100>,
  "summary": "<brief overall assessment>",
  "strengths": ["strength 1", "strength 2", ...],
  "concerns": ["concern 1", "concern 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "predictedVelocity": <number>,
  "completionProbability": <number 0-100>,
  "riskLevel": "<low|medium|high>",
  "velocityTrend": "<increasing|stable|decreasing>"
}`;

    const result = await aiService.chat(
      [
        {
          id: '1',
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        },
      ],
      {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2000,
      }
    );

    responseText = result.response;
    usage = result.usage;
    estimatedCost = result.estimatedCost;

    // Cache for 6 hours (sprint data changes frequently)
    await cacheResponse(prompt, settings.provider, settings.model, responseText, usage.totalTokens, 6);
  }

  const latency = Date.now() - startTime;

  // Parse response
  const analysis = parseSprintAnalysisResponse(responseText, sprint.id);

  // Increment usage and log
  await incrementUsageCounter(userId);
  await logAIUsage({
    userId,
    provider: settings.provider,
    model: settings.model,
    featureType: 'sprint_analysis',
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCost,
    latencyMs: latency,
    success: true,
  });

  return analysis;
}

function buildSprintAnalysisPrompt(sprint: Sprint, stories: Story[], metrics: SprintMetrics): string {
  let prompt = `Analyze this sprint and provide insights:\n\n`;

  prompt += `Sprint: ${sprint.name}\n`;
  prompt += `Goal: ${sprint.goal}\n`;
  prompt += `Status: ${sprint.status}\n`;
  prompt += `Duration: ${Math.ceil((sprint.endDate.getTime() - sprint.startDate.getTime()) / (1000 * 60 * 60 * 24))} days\n\n`;

  prompt += `Metrics:\n`;
  prompt += `- Capacity: ${metrics.capacity} points\n`;
  prompt += `- Planned: ${metrics.planned} points\n`;
  prompt += `- Completed: ${metrics.completed} points\n`;
  prompt += `- Completion Rate: ${metrics.completionRate.toFixed(1)}%\n`;
  prompt += `- Total Stories: ${metrics.totalStories}\n`;
  prompt += `- Completed Stories: ${metrics.completedStories}\n\n`;

  if (sprint.velocity) {
    prompt += `Previous Velocity: ${sprint.velocity} points\n\n`;
  }

  prompt += `Stories:\n`;
  stories.forEach((story) => {
    prompt += `- [${story.status}] ${story.title} (${story.storyPoints || 0} points)\n`;
  });

  prompt += `\nProvide:
1. Overall health score (0-100)
2. Brief summary of sprint status
3. Key strengths (what's going well)
4. Concerns (what needs attention)
5. Actionable recommendations
6. Predicted final velocity
7. Probability of completing all stories (0-100%)
8. Risk level assessment
9. Velocity trend analysis`;

  return prompt;
}

function parseSprintAnalysisResponse(response: string, sprintId: string): AISprintAnalysis {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      sprintId,
      healthScore: parsed.healthScore || 50,
      summary: parsed.summary || 'Sprint analysis completed',
      strengths: parsed.strengths || [],
      concerns: parsed.concerns || [],
      recommendations: parsed.recommendations || [],
      predictedVelocity: parsed.predictedVelocity || 0,
      completionProbability: parsed.completionProbability || 50,
      riskLevel: parsed.riskLevel || 'medium',
      velocityTrend: parsed.velocityTrend || 'stable',
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error parsing sprint analysis:', error);
    // Return fallback analysis
    return {
      sprintId,
      healthScore: 50,
      summary: 'Unable to parse AI analysis',
      strengths: [],
      concerns: ['AI analysis parsing failed'],
      recommendations: ['Please try again'],
      predictedVelocity: 0,
      completionProbability: 50,
      riskLevel: 'medium',
      velocityTrend: 'stable',
      generatedAt: new Date(),
    };
  }
}

// ============================================
// Backlog Analysis
// ============================================

export async function analyzeBacklogWithAI(
  userId: string,
  projectId: string,
  stories: Story[]
): Promise<AIBacklogAnalysis> {
  // Check rate limit
  const rateLimit = await checkRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new Error('Daily request limit reached. Please try again tomorrow.');
  }

  // Get AI settings
  const settings = await getAISettings(userId);

  if (!settings || !settings.apiKey) {
    throw new Error('Please configure your AI settings first');
  }

  if (!settings.enabledFeatures.includes('sprint_analysis')) {
    throw new Error('Sprint analysis feature is disabled in your settings');
  }

  const startTime = Date.now();

  // Build prompt
  const prompt = buildBacklogAnalysisPrompt(stories);

  // Check cache
  const cached = await getCachedResponse(prompt, settings.provider, settings.model);

  let responseText: string;
  let usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  let estimatedCost: number;

  if (cached) {
    console.log('Using cached backlog analysis');
    responseText = cached.response;
    usage = { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokens };
    estimatedCost = 0;
  } else {
    // Call AI service
    const aiService = createAIService(settings);

    const systemPrompt = `You are an expert Product Owner analyzing product backlogs. Provide actionable insights in JSON format.

Return ONLY a valid JSON object with this structure:
{
  "backlogHealth": <number 0-100>,
  "summary": "<brief assessment>",
  "prioritizationQuality": "<assessment of prioritization>",
  "estimationAccuracy": "<assessment of estimates>",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "issues": [
    {
      "type": "<missing_acceptance_criteria|unclear_story|oversized_story|duplicate|dependency>",
      "storyId": "<story id>",
      "description": "<issue description>",
      "severity": "<low|medium|high>"
    }
  ],
  "quickWins": ["<story id 1>", "<story id 2>", ...]
}`;

    const result = await aiService.chat(
      [
        {
          id: '1',
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        },
      ],
      {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2500,
      }
    );

    responseText = result.response;
    usage = result.usage;
    estimatedCost = result.estimatedCost;

    // Cache for 12 hours
    await cacheResponse(prompt, settings.provider, settings.model, responseText, usage.totalTokens, 12);
  }

  const latency = Date.now() - startTime;

  // Parse response
  const analysis = parseBacklogAnalysisResponse(responseText, projectId);

  // Increment usage and log
  await incrementUsageCounter(userId);
  await logAIUsage({
    userId,
    projectId,
    provider: settings.provider,
    model: settings.model,
    featureType: 'sprint_analysis',
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCost,
    latencyMs: latency,
    success: true,
  });

  return analysis;
}

function buildBacklogAnalysisPrompt(stories: Story[]): string {
  let prompt = `Analyze this product backlog and provide insights:\n\n`;

  prompt += `Total Stories: ${stories.length}\n\n`;

  const byStatus = stories.reduce((acc, story) => {
    acc[story.status] = (acc[story.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  prompt += `Status Distribution:\n`;
  Object.entries(byStatus).forEach(([status, count]) => {
    prompt += `- ${status}: ${count}\n`;
  });

  const withPoints = stories.filter((s) => s.storyPoints).length;
  const withAC = stories.filter((s) => s.acceptanceCriteria && s.acceptanceCriteria.length > 0).length;

  prompt += `\nQuality Metrics:\n`;
  prompt += `- Stories with estimates: ${withPoints}/${stories.length}\n`;
  prompt += `- Stories with acceptance criteria: ${withAC}/${stories.length}\n\n`;

  prompt += `Sample Stories:\n`;
  stories.slice(0, 10).forEach((story) => {
    prompt += `- [${story.priority}] ${story.title}`;
    if (story.storyPoints) prompt += ` (${story.storyPoints} pts)`;
    if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0) {
      prompt += ` [No AC]`;
    }
    prompt += `\n`;
  });

  prompt += `\nProvide:
1. Overall backlog health score (0-100)
2. Assessment of prioritization quality
3. Assessment of estimation accuracy
4. Actionable recommendations for improvement
5. Identify specific issues with stories (missing AC, unclear, too large, etc.)
6. Identify "quick wins" (high-value, low-effort stories)`;

  return prompt;
}

function parseBacklogAnalysisResponse(response: string, projectId: string): AIBacklogAnalysis {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      projectId,
      backlogHealth: parsed.backlogHealth || 50,
      summary: parsed.summary || 'Backlog analysis completed',
      prioritizationQuality: parsed.prioritizationQuality || 'Needs improvement',
      estimationAccuracy: parsed.estimationAccuracy || 'Moderate',
      recommendations: parsed.recommendations || [],
      issues: parsed.issues || [],
      quickWins: parsed.quickWins || [],
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error parsing backlog analysis:', error);
    return {
      projectId,
      backlogHealth: 50,
      summary: 'Unable to parse AI analysis',
      prioritizationQuality: 'Unknown',
      estimationAccuracy: 'Unknown',
      recommendations: ['Please try again'],
      issues: [],
      quickWins: [],
      generatedAt: new Date(),
    };
  }
}

// ============================================
// Retrospective Generation
// ============================================

export async function generateRetrospectiveWithAI(
  userId: string,
  sprint: Sprint,
  stories: Story[],
  metrics: SprintMetrics
): Promise<AIRetrospectiveGeneration> {
  // Check rate limit
  const rateLimit = await checkRateLimit(userId);
  if (!rateLimit.allowed) {
    throw new Error('Daily request limit reached. Please try again tomorrow.');
  }

  // Get AI settings
  const settings = await getAISettings(userId);

  if (!settings || !settings.apiKey) {
    throw new Error('Please configure your AI settings first');
  }

  if (!settings.enabledFeatures.includes('report_generation')) {
    throw new Error('Report generation feature is disabled in your settings');
  }

  const startTime = Date.now();

  // Build prompt
  const prompt = buildRetrospectivePrompt(sprint, stories, metrics);

  // Check cache
  const cached = await getCachedResponse(prompt, settings.provider, settings.model);

  let responseText: string;
  let usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  let estimatedCost: number;

  if (cached) {
    console.log('Using cached retrospective');
    responseText = cached.response;
    usage = { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokens };
    estimatedCost = 0;
  } else {
    // Call AI service
    const aiService = createAIService(settings);

    const systemPrompt = `You are an expert Scrum Master facilitating sprint retrospectives. Generate data-driven retrospective insights in JSON format.

Return ONLY a valid JSON object with this structure:
{
  "wentWell": ["positive point 1", "positive point 2", ...],
  "toImprove": ["improvement area 1", "improvement area 2", ...],
  "actionItems": ["action 1", "action 2", ...],
  "dataInsights": ["insight 1", "insight 2", ...],
  "patterns": {
    "positive": ["positive pattern 1", ...],
    "negative": ["negative pattern 1", ...]
  }
}`;

    const result = await aiService.chat(
      [
        {
          id: '1',
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        },
      ],
      {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 2000,
      }
    );

    responseText = result.response;
    usage = result.usage;
    estimatedCost = result.estimatedCost;

    // Cache for 24 hours (retrospectives don't change)
    await cacheResponse(prompt, settings.provider, settings.model, responseText, usage.totalTokens, 24);
  }

  const latency = Date.now() - startTime;

  // Parse response
  const retrospective = parseRetrospectiveResponse(responseText, sprint.id);

  // Increment usage and log
  await incrementUsageCounter(userId);
  await logAIUsage({
    userId,
    provider: settings.provider,
    model: settings.model,
    featureType: 'report_generation',
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCost,
    latencyMs: latency,
    success: true,
  });

  return retrospective;
}

function buildRetrospectivePrompt(sprint: Sprint, stories: Story[], metrics: SprintMetrics): string {
  let prompt = `Generate a sprint retrospective based on this data:\n\n`;

  prompt += `Sprint: ${sprint.name}\n`;
  prompt += `Goal: ${sprint.goal}\n\n`;

  prompt += `Metrics:\n`;
  prompt += `- Planned: ${metrics.planned} points\n`;
  prompt += `- Completed: ${metrics.completed} points\n`;
  prompt += `- Completion Rate: ${metrics.completionRate.toFixed(1)}%\n`;
  prompt += `- Velocity: ${metrics.velocity}\n`;
  prompt += `- Stories Completed: ${metrics.completedStories}/${metrics.totalStories}\n\n`;

  const completedStories = stories.filter((s) => s.status === 'done');
  const incompleteStories = stories.filter((s) => s.status !== 'done');

  prompt += `Completed Stories (${completedStories.length}):\n`;
  completedStories.slice(0, 10).forEach((story) => {
    prompt += `- ${story.title} (${story.storyPoints || 0} pts)\n`;
  });

  if (incompleteStories.length > 0) {
    prompt += `\nIncomplete Stories (${incompleteStories.length}):\n`;
    incompleteStories.slice(0, 5).forEach((story) => {
      prompt += `- ${story.title} (${story.storyPoints || 0} pts)\n`;
    });
  }

  prompt += `\nGenerate:
1. What went well (based on completion rate and velocity)
2. What to improve (based on incomplete stories and metrics)
3. Actionable items for next sprint
4. Data-driven insights
5. Patterns identified (positive and negative)`;

  return prompt;
}

function parseRetrospectiveResponse(
  response: string,
  sprintId: string
): AIRetrospectiveGeneration {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      sprintId,
      wentWell: parsed.wentWell || [],
      toImprove: parsed.toImprove || [],
      actionItems: parsed.actionItems || [],
      dataInsights: parsed.dataInsights || [],
      patterns: {
        positive: parsed.patterns?.positive || [],
        negative: parsed.patterns?.negative || [],
      },
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error parsing retrospective:', error);
    return {
      sprintId,
      wentWell: ['Sprint completed'],
      toImprove: ['AI analysis parsing failed'],
      actionItems: ['Please try generating again'],
      dataInsights: [],
      patterns: {
        positive: [],
        negative: [],
      },
      generatedAt: new Date(),
    };
  }
}
