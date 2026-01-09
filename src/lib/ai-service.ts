/**
 * AI Service Layer
 *
 * Multi-provider AI service supporting OpenAI, Anthropic (Claude), and Google Gemini.
 * Handles API calls, response parsing, error handling, and provides a unified interface.
 */

import {
  AIProvider,
  AIModel,
  OpenAIModel,
  AnthropicModel,
  GeminiModel,
  AIMessage,
  AISettings,
} from './types';

// ============================================
// Configuration & Constants
// ============================================

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;

// API Endpoints
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Model pricing per 1M tokens (approximate, for cost estimation)
const MODEL_PRICING = {
  // OpenAI
  'gpt-4': { input: 30, output: 60 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4o': { input: 5, output: 15 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },

  // Anthropic
  'claude-3-opus-20240229': { input: 15, output: 75 },
  'claude-3-sonnet-20240229': { input: 3, output: 15 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },

  // Gemini
  'gemini-pro': { input: 0.5, output: 1.5 },
  'gemini-1.5-pro': { input: 3.5, output: 10.5 },
  'gemini-1.5-flash': { input: 0.35, output: 1.05 },
};

// ============================================
// Types for API Responses
// ============================================

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: {
    type: string;
    text: string;
  }[];
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// ============================================
// Main AI Service Class
// ============================================

export class AIService {
  private settings: AISettings;

  constructor(settings: AISettings) {
    this.settings = settings;
  }

  /**
   * Send a chat completion request
   */
  async chat(
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<{
    response: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    estimatedCost: number;
  }> {
    const startTime = Date.now();

    try {
      const temperature = options?.temperature ?? this.settings.temperature ?? DEFAULT_TEMPERATURE;
      const maxTokens = options?.maxTokens ?? this.settings.maxTokens ?? DEFAULT_MAX_TOKENS;

      let response: string;
      let usage: { promptTokens: number; completionTokens: number; totalTokens: number };
      let estimatedCost: number;

      switch (this.settings.provider) {
        case 'openai':
          ({ response, usage, estimatedCost } = await this.callOpenAI(
            messages,
            temperature,
            maxTokens,
            options?.systemPrompt
          ));
          break;

        case 'anthropic':
          ({ response, usage, estimatedCost } = await this.callAnthropic(
            messages,
            temperature,
            maxTokens,
            options?.systemPrompt
          ));
          break;

        case 'gemini':
          ({ response, usage, estimatedCost } = await this.callGemini(
            messages,
            temperature,
            maxTokens,
            options?.systemPrompt
          ));
          break;

        default:
          throw new Error(`Unsupported AI provider: ${this.settings.provider}`);
      }

      const latency = Date.now() - startTime;
      console.log(`AI request completed in ${latency}ms`);

      return { response, usage, estimatedCost };
    } catch (error) {
      console.error('AI service error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * OpenAI API Call
   */
  private async callOpenAI(
    messages: AIMessage[],
    temperature: number,
    maxTokens: number,
    systemPrompt?: string
  ): Promise<{
    response: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
    estimatedCost: number;
  }> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    if (systemPrompt) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    const requestBody = {
      model: this.settings.model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    };

    const apiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.settings.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data: OpenAIResponse = await apiResponse.json();

    const response = data.choices[0]?.message?.content || '';
    const usage = {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    };

    const pricing = MODEL_PRICING[this.settings.model as OpenAIModel];
    const estimatedCost =
      (usage.promptTokens * pricing.input + usage.completionTokens * pricing.output) / 1_000_000;

    return { response, usage, estimatedCost };
  }

  /**
   * Anthropic (Claude) API Call
   */
  private async callAnthropic(
    messages: AIMessage[],
    temperature: number,
    maxTokens: number,
    systemPrompt?: string
  ): Promise<{
    response: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
    estimatedCost: number;
  }> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    const requestBody: any = {
      model: this.settings.model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature,
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    const apiResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error?.message || 'Anthropic API request failed');
    }

    const data: AnthropicResponse = await apiResponse.json();

    const response = data.content[0]?.text || '';
    const usage = {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    };

    const pricing = MODEL_PRICING[this.settings.model as AnthropicModel];
    const estimatedCost =
      (usage.promptTokens * pricing.input + usage.completionTokens * pricing.output) / 1_000_000;

    return { response, usage, estimatedCost };
  }

  /**
   * Google Gemini API Call
   */
  private async callGemini(
    messages: AIMessage[],
    temperature: number,
    maxTokens: number,
    systemPrompt?: string
  ): Promise<{
    response: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
    estimatedCost: number;
  }> {
    // Gemini uses a different message format
    const contents = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add system prompt as first user message if provided
    if (systemPrompt) {
      contents.unshift({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    const model = this.settings.model as GeminiModel;
    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${this.settings.apiKey}`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const data: GeminiResponse = await apiResponse.json();

    const response = data.candidates[0]?.content?.parts[0]?.text || '';
    const usage = {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    };

    const pricing = MODEL_PRICING[this.settings.model as GeminiModel];
    const estimatedCost =
      (usage.promptTokens * pricing.input + usage.completionTokens * pricing.output) / 1_000_000;

    return { response, usage, estimatedCost };
  }

  /**
   * Error handling
   */
  private handleError(error: any): Error {
    if (error.message?.includes('API key')) {
      return new Error('Invalid API key. Please check your AI settings.');
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return new Error('API rate limit exceeded. Please try again later.');
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return new Error('Network error. Please check your internet connection.');
    }

    return new Error(error.message || 'An unexpected error occurred with the AI service.');
  }

  /**
   * Estimate cost for a prompt
   */
  estimateCost(promptLength: number, expectedResponseLength: number): number {
    const pricing = MODEL_PRICING[this.settings.model as AIModel];

    // Rough token estimation (1 token ≈ 4 characters)
    const promptTokens = Math.ceil(promptLength / 4);
    const responseTokens = Math.ceil(expectedResponseLength / 4);

    return (promptTokens * pricing.input + responseTokens * pricing.output) / 1_000_000;
  }

  /**
   * Get model information
   */
  getModelInfo(): {
    provider: AIProvider;
    model: AIModel;
    inputPricing: number;
    outputPricing: number;
  } {
    const pricing = MODEL_PRICING[this.settings.model as AIModel];
    return {
      provider: this.settings.provider,
      model: this.settings.model,
      inputPricing: pricing.input,
      outputPricing: pricing.output,
    };
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Create AI service instance from settings
 */
export function createAIService(settings: AISettings): AIService {
  return new AIService(settings);
}

/**
 * Validate API key format
 */
export function validateAPIKey(provider: AIProvider, apiKey: string): boolean {
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-');
    case 'anthropic':
      return apiKey.startsWith('sk-ant-');
    case 'gemini':
      return apiKey.length > 20; // Gemini keys are typically longer
    default:
      return false;
  }
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: AIProvider): AIModel[] {
  switch (provider) {
    case 'openai':
      return ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'];
    case 'anthropic':
      return [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-3-5-sonnet-20241022',
      ];
    case 'gemini':
      return ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    default:
      return [];
  }
}

/**
 * Get recommended model for a provider
 */
export function getRecommendedModel(provider: AIProvider): AIModel {
  switch (provider) {
    case 'openai':
      return 'gpt-4o';
    case 'anthropic':
      return 'claude-3-5-sonnet-20241022';
    case 'gemini':
      return 'gemini-1.5-pro';
    default:
      return 'gpt-4o';
  }
}

/**
 * Format model name for display
 */
export function formatModelName(model: AIModel): string {
  const modelNames: Record<string, string> = {
    'gpt-4': 'GPT-4',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4o': 'GPT-4o',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'gemini-pro': 'Gemini Pro',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
  };

  return modelNames[model] || model;
}
