/**
 * AI Story Suggestions Component
 *
 * Provides AI-powered suggestions for user stories:
 * - Acceptance criteria generation
 * - Story point estimation with reasoning
 * - Suggested tags
 * - Risk identification
 * - Related stories detection
 */

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { MetahodosButton } from '../ui/MetahodosButton';
import { MetahodosBadge } from '../ui/MetahodosBadge';
import {
  getAISettings,
  checkRateLimit,
  incrementUsageCounter,
  logAIUsage,
  getCachedResponse,
  cacheResponse,
} from '../../lib/firestore-ai';
import { createAIService } from '../../lib/ai-service';
import type { Story, AIStorySuggestion } from '../../lib/types';

interface AIStorySuggestionsProps {
  story: Partial<Story>;
  onApplySuggestion: (suggestion: Partial<Story>) => void;
}

export function AIStorySuggestions({ story, onApplySuggestion }: AIStorySuggestionsProps) {
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIStorySuggestion | null>(null);

  async function generateSuggestions() {
    if (!currentUser || !story.title) {
      toast.error('Please provide a story title first');
      return;
    }

    setIsLoading(true);

    try {
      // Check rate limit
      const rateLimit = await checkRateLimit(currentUser.uid);
      if (!rateLimit.allowed) {
        toast.error('Daily request limit reached. Please try again tomorrow.');
        return;
      }

      // Get AI settings
      const settings = await getAISettings(currentUser.uid);

      if (!settings || !settings.apiKey) {
        toast.error('Please configure your AI settings first');
        return;
      }

      // Check if story_suggestions feature is enabled
      if (!settings.enabledFeatures.includes('story_suggestions')) {
        toast.error('Story suggestions feature is disabled in your settings');
        return;
      }

      const startTime = Date.now();

      // Build prompt
      const prompt = buildPrompt(story);

      // Check cache
      const cached = await getCachedResponse(prompt, settings.provider, settings.model);

      let responseText: string;
      let usage: { promptTokens: number; completionTokens: number; totalTokens: number };
      let estimatedCost: number;

      if (cached) {
        console.log('Using cached suggestions');
        responseText = cached.response;
        usage = { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokens };
        estimatedCost = 0;
      } else {
        // Call AI service
        const aiService = createAIService(settings);

        const systemPrompt = `You are an expert Agile coach helping to refine user stories. Provide practical, actionable suggestions in JSON format.

Return ONLY a valid JSON object with this exact structure:
{
  "acceptanceCriteria": ["criterion 1", "criterion 2", ...],
  "storyPoints": {
    "estimate": <number between 1-13>,
    "reasoning": "<explanation for estimate>"
  },
  "tags": ["tag1", "tag2", ...],
  "risks": ["risk 1", "risk 2", ...],
  "relatedStories": [],
  "technicalNotes": "<optional technical recommendations>"
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
            temperature: 0.3, // Lower temperature for more consistent JSON
            maxTokens: 1500,
          }
        );

        responseText = result.response;
        usage = result.usage;
        estimatedCost = result.estimatedCost;

        // Cache the response (24 hours)
        await cacheResponse(prompt, settings.provider, settings.model, responseText, usage.totalTokens, 24);
      }

      const latency = Date.now() - startTime;

      // Parse JSON response
      const parsedSuggestions = parseAIResponse(responseText);

      if (!parsedSuggestions) {
        throw new Error('Failed to parse AI suggestions');
      }

      setSuggestions(parsedSuggestions);

      // Increment usage counter
      await incrementUsageCounter(currentUser.uid);

      // Log usage
      await logAIUsage({
        userId: currentUser.uid,
        provider: settings.provider,
        model: settings.model,
        featureType: 'story_suggestions',
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        estimatedCost,
        latencyMs: latency,
        success: true,
      });

      toast.success('AI suggestions generated successfully');
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      toast.error(error.message || 'Failed to generate suggestions');

      // Log error
      const settings = await getAISettings(currentUser.uid);
      if (settings) {
        await logAIUsage({
          userId: currentUser.uid,
          provider: settings.provider,
          model: settings.model,
          featureType: 'story_suggestions',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          latencyMs: 0,
          success: false,
          errorMessage: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  function buildPrompt(storyData: Partial<Story>): string {
    let prompt = `Please analyze this user story and provide suggestions:\n\n`;
    prompt += `Title: ${storyData.title}\n`;

    if (storyData.description) {
      prompt += `Description: ${storyData.description}\n`;
    }

    if (storyData.acceptanceCriteria && storyData.acceptanceCriteria.length > 0) {
      prompt += `\nExisting Acceptance Criteria:\n`;
      storyData.acceptanceCriteria.forEach((ac, idx) => {
        prompt += `${idx + 1}. ${ac}\n`;
      });
    }

    prompt += `\nProvide:
1. Acceptance criteria (GIVEN/WHEN/THEN format if applicable)
2. Story point estimate (Fibonacci: 1, 2, 3, 5, 8, 13) with reasoning
3. Relevant tags for categorization
4. Potential risks or blockers
5. Technical recommendations if applicable`;

    return prompt;
  }

  function parseAIResponse(response: string): AIStorySuggestion | null {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('No JSON found in response:', response);
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        acceptanceCriteria: parsed.acceptanceCriteria || [],
        storyPoints: {
          estimate: parsed.storyPoints?.estimate || 3,
          reasoning: parsed.storyPoints?.reasoning || 'Standard complexity',
        },
        tags: parsed.tags || [],
        risks: parsed.risks || [],
        relatedStories: parsed.relatedStories || [],
        technicalNotes: parsed.technicalNotes,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error, response);
      return null;
    }
  }

  function applySuggestion(type: 'acceptanceCriteria' | 'storyPoints' | 'tags' | 'all') {
    if (!suggestions) return;

    const updates: Partial<Story> = {};

    if (type === 'acceptanceCriteria' || type === 'all') {
      updates.acceptanceCriteria = suggestions.acceptanceCriteria;
    }

    if (type === 'storyPoints' || type === 'all') {
      updates.storyPoints = suggestions.storyPoints.estimate;
    }

    if (type === 'tags' || type === 'all') {
      updates.tags = suggestions.tags;
    }

    onApplySuggestion(updates);
    toast.success('Suggestions applied');
  }

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900">AI Story Suggestions</h3>
            <p className="text-sm text-gray-600">
              Get AI-powered suggestions to improve your user story
            </p>
          </div>
        </div>
        <MetahodosButton
          onClick={generateSuggestions}
          isLoading={isLoading}
          disabled={!story.title}
          variant="primary"
        >
          {suggestions ? 'Regenerate' : 'Generate'}
        </MetahodosButton>
      </div>

      {/* Suggestions Display */}
      {suggestions && (
        <div className="space-y-4">
          {/* Acceptance Criteria */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Acceptance Criteria</h4>
              </div>
              <button
                onClick={() => applySuggestion('acceptanceCriteria')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Apply
              </button>
            </div>
            <ul className="space-y-2">
              {suggestions.acceptanceCriteria.map((criterion, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700">{criterion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Story Points */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Story Point Estimate</h4>
              </div>
              <button
                onClick={() => applySuggestion('storyPoints')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Apply
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 text-orange-700 rounded-lg px-4 py-2 text-2xl font-bold">
                {suggestions.storyPoints.estimate}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{suggestions.storyPoints.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {suggestions.tags.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Suggested Tags</h4>
                </div>
                <button
                  onClick={() => applySuggestion('tags')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Apply
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.tags.map((tag, idx) => (
                  <MetahodosBadge key={idx} variant="info">
                    {tag}
                  </MetahodosBadge>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {suggestions.risks.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Potential Risks</h4>
              </div>
              <ul className="space-y-2">
                {suggestions.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Notes */}
          {suggestions.technicalNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Technical Recommendations</h4>
              <p className="text-sm text-blue-800">{suggestions.technicalNotes}</p>
            </div>
          )}

          {/* Apply All Button */}
          <div className="flex justify-end">
            <MetahodosButton onClick={() => applySuggestion('all')} variant="primary" size="lg">
              Apply All Suggestions
            </MetahodosButton>
          </div>
        </div>
      )}
    </div>
  );
}
