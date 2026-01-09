/**
 * AI Settings Page
 *
 * Allows users to configure their AI provider, model, API key, and preferences.
 * Displays usage statistics and rate limiting information.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { MetahodosButton } from '../../components/ui/MetahodosButton';
import { MetahodosCard } from '../../components/ui/MetahodosCard';
import { MetahodosInput } from '../../components/ui/MetahodosInput';
import {
  getAISettings,
  saveAISettings,
  getUsageStats,
  checkRateLimit,
} from '../../lib/firestore-ai';
import {
  validateAPIKey,
  getAvailableModels,
  getRecommendedModel,
  formatModelName,
} from '../../lib/ai-service';
import type { AIProvider, AIModel, AIFeatureType } from '../../lib/types';

export function AISettingsPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [model, setModel] = useState<AIModel>('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(100);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [enabledFeatures, setEnabledFeatures] = useState<AIFeatureType[]>([
    'copilot',
    'story_suggestions',
    'sprint_analysis',
    'report_generation',
  ]);

  // Stats State
  const [usageStats, setUsageStats] = useState({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    successRate: 0,
    averageLatency: 0,
  });
  const [rateLimit, setRateLimit] = useState({
    allowed: true,
    remaining: 100,
    limit: 100,
  });

  useEffect(() => {
    loadSettings();
  }, [currentUser]);

  async function loadSettings() {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load AI settings
      const settings = await getAISettings(currentUser.uid);

      if (settings) {
        setProvider(settings.provider);
        setModel(settings.model);
        setApiKey(settings.apiKey);
        setDailyLimit(settings.dailyRequestLimit);
        setTemperature(settings.temperature || 0.7);
        setMaxTokens(settings.maxTokens || 2000);
        setEnabledFeatures(settings.enabledFeatures);
      }

      // Load usage stats
      const stats = await getUsageStats(currentUser.uid);
      setUsageStats(stats);

      // Load rate limit info
      const rateLimitInfo = await checkRateLimit(currentUser.uid);
      setRateLimit(rateLimitInfo);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!currentUser) return;

    // Validate API key
    if (apiKey && !validateAPIKey(provider, apiKey)) {
      toast.error(`Invalid API key format for ${provider.toUpperCase()}`);
      return;
    }

    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      setSaving(true);

      await saveAISettings({
        userId: currentUser.uid,
        provider,
        model,
        apiKey,
        enabledFeatures,
        dailyRequestLimit: dailyLimit,
        temperature,
        maxTokens,
      });

      toast.success('AI settings saved successfully');
      await loadSettings(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save AI settings');
    } finally {
      setSaving(false);
    }
  }

  function handleProviderChange(newProvider: AIProvider) {
    setProvider(newProvider);
    setModel(getRecommendedModel(newProvider));
    setApiKey(''); // Clear API key when changing provider
  }

  function toggleFeature(feature: AIFeatureType) {
    setEnabledFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  }

  const availableModels = getAvailableModels(provider);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading AI settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
            <SparklesIcon className="h-10 w-10 text-orange-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-navy-900">AI Settings</h1>
              <p className="mt-1 text-gray-600">
                Configure your AI provider and manage usage preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Configuration */}
            <MetahodosCard>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <CogIcon className="h-6 w-6 text-navy-900 mr-2" />
                  <h2 className="text-xl font-semibold text-navy-900">Provider Configuration</h2>
                </div>

                <div className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['openai', 'anthropic', 'gemini'] as AIProvider[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleProviderChange(p)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all ${
                            provider === p
                              ? 'border-orange-600 bg-orange-50 text-orange-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-semibold">
                            {p === 'openai' && 'OpenAI'}
                            {p === 'anthropic' && 'Anthropic'}
                            {p === 'gemini' && 'Gemini'}
                          </div>
                          <div className="text-xs mt-1">
                            {p === 'openai' && 'GPT Models'}
                            {p === 'anthropic' && 'Claude Models'}
                            {p === 'gemini' && 'Google AI'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value as AIModel)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {formatModelName(m)}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Choose the AI model for your requests
                    </p>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <MetahodosInput
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`Enter your ${provider.toUpperCase()} API key`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>

                  {/* API Key Help Links */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Don't have an API key?
                    </p>
                    <div className="space-y-1">
                      {provider === 'openai' && (
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 block"
                        >
                          Get an OpenAI API key →
                        </a>
                      )}
                      {provider === 'anthropic' && (
                        <a
                          href="https://console.anthropic.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 block"
                        >
                          Get an Anthropic API key →
                        </a>
                      )}
                      {provider === 'gemini' && (
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 block"
                        >
                          Get a Gemini API key →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </MetahodosCard>

            {/* Advanced Settings */}
            <MetahodosCard>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <ShieldCheckIcon className="h-6 w-6 text-navy-900 mr-2" />
                  <h2 className="text-xl font-semibold text-navy-900">Advanced Settings</h2>
                </div>

                <div className="space-y-4">
                  {/* Daily Request Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Request Limit
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum AI requests per day (resets every 24 hours)
                    </p>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature: {temperature.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="8000"
                      step="100"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum response length (higher = longer responses, more cost)
                    </p>
                  </div>
                </div>
              </div>
            </MetahodosCard>

            {/* Enabled Features */}
            <MetahodosCard>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <SparklesIcon className="h-6 w-6 text-navy-900 mr-2" />
                  <h2 className="text-xl font-semibold text-navy-900">Enabled Features</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'copilot', label: 'AI Copilot', desc: 'Chat assistant for help and guidance' },
                    { id: 'story_suggestions', label: 'Story Suggestions', desc: 'AI-powered user story enhancements' },
                    { id: 'sprint_analysis', label: 'Sprint Analysis', desc: 'Automated sprint and backlog insights' },
                    { id: 'report_generation', label: 'Report Generation', desc: 'Auto-generate reports and summaries' },
                  ].map((feature) => (
                    <label
                      key={feature.id}
                      className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={enabledFeatures.includes(feature.id as AIFeatureType)}
                        onChange={() => toggleFeature(feature.id as AIFeatureType)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-navy-900">{feature.label}</div>
                        <div className="text-sm text-gray-600">{feature.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </MetahodosCard>

            {/* Save Button */}
            <div className="flex justify-end">
              <MetahodosButton onClick={handleSave} isLoading={saving} size="lg">
                Save Settings
              </MetahodosButton>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Rate Limit Card */}
            <MetahodosCard>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <ChartBarIcon className="h-5 w-5 text-navy-900 mr-2" />
                  <h3 className="font-semibold text-navy-900">Rate Limit</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Remaining Today</span>
                      <span className="font-semibold text-navy-900">
                        {rateLimit.remaining} / {rateLimit.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(rateLimit.remaining / rateLimit.limit) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {!rateLimit.allowed && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        Daily limit reached. Resets in 24 hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </MetahodosCard>

            {/* Usage Stats Card */}
            <MetahodosCard>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <ChartBarIcon className="h-5 w-5 text-navy-900 mr-2" />
                  <h3 className="font-semibold text-navy-900">Usage Statistics</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                    <div className="text-2xl font-bold text-navy-900">
                      {usageStats.totalRequests}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Total Tokens</div>
                    <div className="text-2xl font-bold text-navy-900">
                      {usageStats.totalTokens.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Estimated Cost</div>
                    <div className="text-2xl font-bold text-navy-900">
                      ${usageStats.totalCost.toFixed(4)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {usageStats.successRate.toFixed(1)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Avg Latency</div>
                    <div className="text-2xl font-bold text-navy-900">
                      {usageStats.averageLatency.toFixed(0)}ms
                    </div>
                  </div>
                </div>
              </div>
            </MetahodosCard>

            {/* Info Card */}
            <MetahodosCard>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Secure Storage</div>
                      <div className="text-xs text-gray-600">
                        API keys are encrypted before storage
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Cost Tracking</div>
                      <div className="text-xs text-gray-600">
                        Monitor your AI usage and costs
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <SparklesIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Smart Caching</div>
                      <div className="text-xs text-gray-600">
                        Reduce costs with response caching
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MetahodosCard>
          </div>
        </div>
      </div>
    </div>
  );
}
