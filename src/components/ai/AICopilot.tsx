/**
 * AI Copilot Component
 *
 * Floating chat sidebar that provides AI-powered assistance contextually
 * based on the current page and user actions.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import {
  getAISettings,
  createConversation,
  addMessageToConversation,
  checkRateLimit,
  incrementUsageCounter,
  logAIUsage,
  getCachedResponse,
  cacheResponse,
} from '../../lib/firestore-ai';
import { createAIService } from '../../lib/ai-service';
import type { AIMessage, AICopilotContext } from '../../lib/types';

interface AICopilotProps {
  context?: AICopilotContext;
}

export function AICopilot({ context }: AICopilotProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasSettings, setHasSettings] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkIfSettingsExist();
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function checkIfSettingsExist() {
    if (!currentUser) return;

    try {
      const settings = await getAISettings(currentUser.uid);
      setHasSettings(!!settings && !!settings.apiKey);
    } catch (error) {
      console.error('Error checking AI settings:', error);
    }
  }

  async function initializeConversation() {
    if (!currentUser || conversationId) return;

    try {
      const newConversationId = await createConversation(
        currentUser.uid,
        context?.projectId,
        'copilot'
      );

      setConversationId(newConversationId);

      // Add welcome message
      const welcomeMessage: Omit<AIMessage, 'id'> = {
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
      };

      await addMessageToConversation(newConversationId, welcomeMessage);

      setMessages([
        {
          id: 'welcome',
          ...welcomeMessage,
        },
      ]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to start conversation');
    }
  }

  function getWelcomeMessage(): string {
    const page = context?.currentPage || location.pathname;

    if (page.includes('/backlog')) {
      return "Hi! I'm your AI Copilot. I can help you with backlog management, story creation, prioritization, and more. What would you like to know?";
    } else if (page.includes('/sprint')) {
      return "Hi! I'm your AI Copilot. I can help you with sprint planning, tracking, and analysis. How can I assist you today?";
    } else if (page.includes('/discovery')) {
      return "Hi! I'm your AI Copilot. I can help you with discovery tools like Business Model Canvas and Value Stream Mapping. What do you need help with?";
    } else {
      return "Hi! I'm your AI Copilot. I'm here to help you with your agile project management. Ask me anything!";
    }
  }

  async function handleSendMessage() {
    if (!inputValue.trim() || !currentUser || !conversationId || isLoading) return;

    const userMessage: Omit<AIMessage, 'id'> = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to UI
    const tempUserMessage: AIMessage = {
      id: `temp-${Date.now()}`,
      ...userMessage,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check rate limit
      const rateLimit = await checkRateLimit(currentUser.uid);
      if (!rateLimit.allowed) {
        toast.error('Daily request limit reached. Please try again tomorrow.');
        setIsLoading(false);
        return;
      }

      // Save user message
      await addMessageToConversation(conversationId, userMessage);

      // Get AI settings
      const settings = await getAISettings(currentUser.uid);

      if (!settings || !settings.apiKey) {
        toast.error('Please configure your AI settings first');
        setIsLoading(false);
        return;
      }

      const startTime = Date.now();

      // Check cache first
      const cached = await getCachedResponse(inputValue, settings.provider, settings.model);

      let responseText: string;
      let usage: { promptTokens: number; completionTokens: number; totalTokens: number };
      let estimatedCost: number;

      if (cached) {
        console.log('Using cached response');
        responseText = cached.response;
        usage = { promptTokens: 0, completionTokens: 0, totalTokens: cached.tokens };
        estimatedCost = 0;
      } else {
        // Call AI service
        const aiService = createAIService(settings);

        // Build system prompt with context
        const systemPrompt = buildSystemPrompt(context);

        const result = await aiService.chat(
          messages
            .filter((m) => m.id !== 'welcome')
            .concat([tempUserMessage])
            .map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp,
            })),
          { systemPrompt }
        );

        responseText = result.response;
        usage = result.usage;
        estimatedCost = result.estimatedCost;

        // Cache the response
        await cacheResponse(
          inputValue,
          settings.provider,
          settings.model,
          responseText,
          usage.totalTokens
        );
      }

      const latency = Date.now() - startTime;

      // Create assistant message
      const assistantMessage: Omit<AIMessage, 'id'> = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        tokens: usage.totalTokens,
      };

      // Save assistant message
      await addMessageToConversation(conversationId, assistantMessage);

      // Add to UI
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          ...assistantMessage,
        },
      ]);

      // Increment usage counter
      await incrementUsageCounter(currentUser.uid);

      // Log usage
      await logAIUsage({
        userId: currentUser.uid,
        projectId: context?.projectId,
        provider: settings.provider,
        model: settings.model,
        featureType: 'copilot',
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        estimatedCost,
        latencyMs: latency,
        success: true,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to get AI response');

      // Log error
      const settings = await getAISettings(currentUser.uid);
      if (settings) {
        await logAIUsage({
          userId: currentUser.uid,
          projectId: context?.projectId,
          provider: settings.provider,
          model: settings.model,
          featureType: 'copilot',
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

  function buildSystemPrompt(ctx?: AICopilotContext): string {
    let prompt = `You are an AI Copilot for Metahodos Agile Project Management App. You help users with agile methodologies, product backlog management, sprint planning, and process improvement.

Be concise, helpful, and actionable in your responses. Use bullet points when listing multiple items.`;

    if (ctx?.currentPage) {
      prompt += `\n\nCurrent page: ${ctx.currentPage}`;
    }

    if (ctx?.availableContext) {
      if (ctx.availableContext.recentSprints && ctx.availableContext.recentSprints.length > 0) {
        prompt += `\n\nRecent sprints: ${ctx.availableContext.recentSprints.map((s) => s.name).join(', ')}`;
      }

      if (ctx.availableContext.activeStories && ctx.availableContext.activeStories.length > 0) {
        prompt += `\n\nActive stories: ${ctx.availableContext.activeStories.length} stories`;
      }
    }

    return prompt;
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  if (!hasSettings) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => toast.error('Please configure AI settings first')}
          className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors flex items-center"
        >
          <SparklesIcon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-all hover:scale-110"
          aria-label="Open AI Copilot"
        >
          <SparklesIcon className="h-6 w-6" />
        </button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-96 h-[600px] bg-white shadow-2xl rounded-tl-2xl border-l border-t border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 rounded-tl-2xl flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 text-white mr-2" />
              <div>
                <h3 className="text-white font-semibold">AI Copilot</h3>
                <p className="text-orange-100 text-xs">Your agile assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-orange-700 rounded-lg p-1 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center mb-1">
                      <SparklesIcon className="h-4 w-4 text-orange-600 mr-1" />
                      <span className="text-xs font-medium text-gray-500">AI Copilot</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.tokens && (
                    <div className="text-xs text-gray-400 mt-1">
                      {message.tokens} tokens
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-end space-x-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={2}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
