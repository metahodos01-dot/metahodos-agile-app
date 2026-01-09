/**
 * Core type definitions for Metahodos Agile App
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';

export type UserRole = 'admin' | 'product_owner' | 'scrum_master' | 'team_member' | 'stakeholder';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  organizationId?: string;
  role?: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  createdAt: Date;
  subscription: 'free' | 'pro' | 'enterprise';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'completed';
  createdBy: string; // User ID who created the project
  createdAt: Date;
  updatedAt: Date;
}

// Epic and Story types for Product Backlog

export type EpicStatus = 'backlog' | 'in_progress' | 'done';
export type StoryStatus = 'backlog' | 'ready' | 'in_sprint' | 'in_progress' | 'review' | 'done';
export type StoryPriority = 'critical' | 'high' | 'medium' | 'low';
export type MoscowPriority = 'must_have' | 'should_have' | 'could_have' | 'wont_have';

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  description: string;
  businessValue: number; // 1-100
  effort: number; // story points estimate
  priority: StoryPriority;
  status: EpicStatus;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Story {
  id: string;
  projectId: string;
  epicId?: string;
  title: string;
  description: string; // "As a... I want... So that..."
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: number; // for ordering (higher = more priority)
  moscowPriority?: MoscowPriority;
  status: StoryStatus;
  assigneeId?: string;
  sprintId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Sprint Management types (Phase 3)

export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Sprint {
  id: string;
  projectId: string;
  name: string; // e.g., "Sprint 1", "November Sprint"
  goal: string; // Sprint goal/objective
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  capacity: number; // Total story points capacity
  velocity?: number; // Actual velocity (calculated on completion)
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DailyScrumNote {
  id: string;
  sprintId: string;
  date: Date;
  notes: string;
  blockers: string[];
  createdBy: string;
  createdAt: Date;
}

export interface SprintRetrospective {
  id: string;
  sprintId: string;
  wentWell: string[];
  toImprove: string[];
  actionItems: string[];
  createdAt: Date;
  createdBy: string;
}

// Discovery & Process Improvement types (Phase 4)

// Business Model Canvas (9 sections)
export interface BusinessModelCanvas {
  id: string;
  projectId: string;
  title: string;
  lastUpdated: Date;

  // 9 BMC sections
  customerSegments: string;      // Who are our customers?
  valuePropositions: string;     // What value do we deliver?
  channels: string;              // How do we reach customers?
  customerRelationships: string; // How do we interact?
  revenueStreams: string;        // How do we earn revenue?
  keyResources: string;          // What resources do we need?
  keyActivities: string;         // What do we do?
  keyPartnerships: string;       // Who helps us?
  costStructure: string;         // What are our costs?

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Value Proposition Canvas (6 sections with lists)
export interface ValuePropositionCanvas {
  id: string;
  projectId: string;
  title: string;
  lastUpdated: Date;

  // Customer Profile (3 sections)
  customerJobs: string[];        // What customers try to accomplish
  customerPains: string[];       // Bad outcomes, risks, obstacles
  customerGains: string[];       // Benefits, desires, success criteria

  // Value Map (3 sections)
  products: string[];            // Products and services we offer
  painRelievers: string[];       // How we alleviate pains
  gainCreators: string[];        // How we create gains

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Value Stream Mapping - Process Step
export type ProcessStepType = 'value_add' | 'non_value_add' | 'necessary_waste';

export interface ProcessStep {
  id: string;
  name: string;
  type: ProcessStepType;
  processingTime: number;        // Minutes
  leadTime: number;              // Minutes (includes waiting)
  percentAccurate: number;       // % (0-100)
  order: number;                 // For ordering steps
}

// Value Stream Mapping (Current + Future state)
export interface ValueStreamMap {
  id: string;
  projectId: string;
  title: string;
  description: string;

  // Current State
  currentSteps: ProcessStep[];
  currentTotalLeadTime: number;  // Auto-calculated
  currentTotalProcessTime: number; // Auto-calculated

  // Future State
  futureSteps: ProcessStep[];
  futureTotalLeadTime: number;   // Auto-calculated
  futureTotalProcessTime: number; // Auto-calculated

  // Metrics
  efficiencyGain: number;        // % improvement
  timeReduction: number;         // Minutes saved

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Gap Analysis - Gap Item
export type GapImpact = 'high' | 'medium' | 'low';

export interface GapItem {
  id: string;
  category: string;              // Process, Technology, People, etc.
  description: string;
  impact: GapImpact;
}

// Gap Analysis - Action Item
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'planned' | 'in_progress' | 'completed';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  owner?: string;
  dueDate?: Date;
  relatedGapId?: string;         // Links to gap
}

// Gap Analysis
export interface GapAnalysis {
  id: string;
  projectId: string;
  title: string;
  description: string;

  // State descriptions
  currentState: string;          // Where we are now
  futureState: string;           // Where we want to be

  // Gap identification
  gaps: GapItem[];

  // Actions to close gaps
  actions: ActionItem[];

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ============================================
// Analytics & Reporting Types
// ============================================

// Velocity Data Point
export interface VelocityDataPoint {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  date: Date;
}

// Burndown Data Point
export interface BurndownDataPoint {
  date: Date;
  day: number;
  ideal: number;
  actual: number;
  remaining: number;
}

// Sprint Metrics
export interface SprintMetrics {
  sprintId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  planned: number;
  completed: number;
  velocity: number;
  completionRate: number;
  totalStories: number;
  completedStories: number;
}

// Team Metrics
export interface TeamMetrics {
  totalSprints: number;
  averageVelocity: number;
  averageCompletionRate: number;
  totalStoryPoints: number;
  totalStoriesCompleted: number;
  sprintMetrics: SprintMetrics[];
}

// Epic Progress
export interface EpicProgress {
  epicId: string;
  epicName: string;
  totalPoints: number;
  completedPoints: number;
  progressPercentage: number;
  storiesCount: number;
  completedStoriesCount: number;
}

// =====================
// PHASE 6: STAKEHOLDER MANAGEMENT
// =====================

// Stakeholder Categories
export type StakeholderCategory =
  | 'sponsor'           // Project sponsor, executive
  | 'user'              // End user, customer
  | 'decision_maker'    // Key decision maker
  | 'influencer'        // Influencer, advisor
  | 'team_member'       // Internal team member
  | 'vendor'            // External vendor, supplier
  | 'other';            // Other category

// Power and Interest Levels (for Power/Interest Matrix)
export type PowerLevel = 'low' | 'medium' | 'high';
export type InterestLevel = 'low' | 'medium' | 'high';

// Engagement Strategy
export type EngagementStrategy =
  | 'manage_closely'    // High Power, High Interest → Manage Closely
  | 'keep_satisfied'    // High Power, Low Interest → Keep Satisfied
  | 'keep_informed'     // Low Power, High Interest → Keep Informed
  | 'monitor';          // Low Power, Low Interest → Monitor

// Communication Frequency
export type CommunicationFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed';

// Stakeholder Sentiment
export type StakeholderSentiment = 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';

// Stakeholder Interface
export interface Stakeholder {
  id: string;
  projectId: string;

  // Basic Info
  name: string;
  role: string;                          // Job title
  organization?: string;                 // Company/department
  category: StakeholderCategory;

  // Contact Info
  email?: string;
  phone?: string;

  // Power/Interest Matrix
  powerLevel: PowerLevel;
  interestLevel: InterestLevel;
  engagementStrategy: EngagementStrategy;

  // Engagement Details
  sentiment: StakeholderSentiment;
  communicationFrequency: CommunicationFrequency;
  preferredChannel?: string;             // Email, Slack, Phone, etc.

  // Additional Context
  needs?: string;                        // What they need from the project
  concerns?: string;                     // Their concerns/risks
  influence?: string;                    // How they influence the project
  notes?: string;                        // General notes

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Stakeholder Meeting/Interaction
export interface StakeholderMeeting {
  id: string;
  projectId: string;
  stakeholderId: string;

  // Meeting Details
  date: Date;
  type: 'meeting' | 'email' | 'call' | 'presentation' | 'workshop' | 'other';
  subject: string;
  summary: string;

  // Attendees (multiple stakeholders can attend)
  attendeeIds: string[];

  // Outcomes
  actionItems?: string[];
  decisions?: string[];
  nextSteps?: string;

  // Metadata
  createdAt: Date;
  createdBy: string;
}

// Stakeholder Analysis Summary (calculated)
export interface StakeholderAnalysis {
  projectId: string;
  totalStakeholders: number;

  // By Category
  byCategory: {
    category: StakeholderCategory;
    count: number;
  }[];

  // By Engagement Strategy
  byStrategy: {
    strategy: EngagementStrategy;
    count: number;
  }[];

  // By Sentiment
  bySentiment: {
    sentiment: StakeholderSentiment;
    count: number;
  }[];

  // Power/Interest Matrix Distribution
  matrix: {
    highPowerHighInterest: number;
    highPowerLowInterest: number;
    lowPowerHighInterest: number;
    lowPowerLowInterest: number;
  };
}

// =====================
// PHASE 7: TEAM & RESOURCE MANAGEMENT
// =====================

// Team Member Role
export type TeamRole =
  | 'product_owner'
  | 'scrum_master'
  | 'developer'
  | 'designer'
  | 'qa_tester'
  | 'devops'
  | 'architect'
  | 'other';

// Team Member Status
export type TeamMemberStatus = 'active' | 'inactive' | 'on_leave';

// Skill Level
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Leave Type
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'training' | 'other';

// Skill Interface
export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

// Team Member Interface
export interface TeamMember {
  id: string;
  projectId: string;

  // Basic Info
  name: string;
  email: string;
  role: TeamRole;
  title?: string;                        // Job title (es. Senior Developer)
  status: TeamMemberStatus;

  // Availability & Capacity
  weeklyHoursCapacity: number;           // Ore disponibili a settimana (es. 40)
  currentAllocation: number;             // % allocazione al progetto (0-100)

  // Skills
  skills: Skill[];

  // Contact & Details
  phone?: string;
  avatar?: string;                       // URL avatar
  location?: string;                     // Sede/località
  timezone?: string;                     // Fuso orario

  // Performance Metrics (calculated)
  personalVelocity?: number;             // Velocity media personale
  completedStories?: number;             // Story completate totali
  completedPoints?: number;              // Punti completati totali

  // Metadata
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Leave/Absence Record
export interface Leave {
  id: string;
  teamMemberId: string;
  projectId: string;

  // Leave Details
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;

  // Impact
  impactedSprints?: string[];            // Sprint IDs impattati

  // Metadata
  createdAt: Date;
  createdBy: string;
}

// Time Entry (for time tracking)
export interface TimeEntry {
  id: string;
  teamMemberId: string;
  projectId: string;

  // Related Items
  storyId?: string;
  sprintId?: string;

  // Time Details
  date: Date;
  hours: number;
  description?: string;

  // Metadata
  createdAt: Date;
  createdBy: string;
}

// Sprint Capacity (per team member per sprint)
export interface SprintCapacity {
  id: string;
  sprintId: string;
  teamMemberId: string;

  // Capacity Planning
  availableHours: number;                // Ore disponibili nello sprint
  allocatedHours: number;                // Ore già allocate
  remainingHours: number;                // Ore rimanenti

  // Notes
  notes?: string;                        // Note sulla capacità (es. ferie pianificate)

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Team Analytics
export interface TeamAnalytics {
  projectId: string;

  // Team Overview
  totalMembers: number;
  activeMembers: number;
  onLeaveMembers: number;

  // Capacity
  totalWeeklyCapacity: number;           // Ore totali disponibili/settimana
  averageAllocation: number;             // % media allocazione

  // Performance
  teamVelocity: number;                  // Velocity media del team
  totalStoriesCompleted: number;
  totalPointsCompleted: number;

  // By Role Distribution
  byRole: {
    role: TeamRole;
    count: number;
    totalCapacity: number;
  }[];

  // Skills Coverage
  skillsCoverage: {
    skillName: string;
    memberCount: number;
    averageLevel: number;
  }[];
}

// Workload (for workload balancing view)
export interface WorkloadItem {
  teamMemberId: string;
  teamMemberName: string;
  role: TeamRole;

  // Current Sprint Workload
  assignedStories: number;
  assignedPoints: number;
  availableCapacity: number;
  utilization: number;                   // % utilizzo (0-100+)

  // Status
  isOverloaded: boolean;                 // utilization > 100%
  isUnderutilized: boolean;              // utilization < 70%
}

// =====================
// PHASE 8: AI ENHANCEMENT
// =====================

// AI Provider Types
export type AIProvider = 'openai' | 'anthropic' | 'gemini';

// AI Model Names
export type OpenAIModel =
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gpt-3.5-turbo';

export type AnthropicModel =
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  | 'claude-3-5-sonnet-20241022';

export type GeminiModel =
  | 'gemini-pro'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

export type AIModel = OpenAIModel | AnthropicModel | GeminiModel;

// AI Feature Types
export type AIFeatureType =
  | 'copilot'              // AI Copilot chat assistant
  | 'story_suggestions'    // Smart suggestions for user stories
  | 'sprint_analysis'      // Sprint and backlog analysis
  | 'report_generation';   // Automatic report generation

// AI Message Role
export type AIMessageRole = 'user' | 'assistant' | 'system';

// AI Message
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: Date;
  tokens?: number;
}

// AI Chat Conversation
export interface AIChatConversation {
  id: string;
  userId: string;
  projectId?: string;
  featureType: AIFeatureType;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Settings (per user)
export interface AISettings {
  id: string;
  userId: string;

  // Provider Configuration
  provider: AIProvider;
  model: AIModel;
  apiKey: string;                        // Encrypted API key

  // Feature Toggles
  enabledFeatures: AIFeatureType[];

  // Rate Limiting & Quotas
  dailyRequestLimit: number;             // Max requests per day
  currentDailyUsage: number;             // Current usage count
  lastResetDate: Date;                   // Last quota reset

  // Advanced Settings
  temperature?: number;                  // 0-1, controls randomness
  maxTokens?: number;                    // Max tokens per request

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// AI Usage Log (for tracking and analytics)
export interface AIUsageLog {
  id: string;
  userId: string;
  projectId?: string;

  // Request Details
  provider: AIProvider;
  model: AIModel;
  featureType: AIFeatureType;

  // Token Usage
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;

  // Cost Estimation (if available)
  estimatedCost?: number;

  // Performance
  latencyMs: number;

  // Status
  success: boolean;
  errorMessage?: string;

  // Metadata
  timestamp: Date;
}

// AI Cache Entry (for response caching)
export interface AICacheEntry {
  id: string;

  // Cache Key Components
  provider: AIProvider;
  model: AIModel;
  promptHash: string;                    // Hash of the prompt for lookup

  // Cached Data
  response: string;
  tokens: number;

  // Cache Metadata
  hitCount: number;                      // Number of times cache was used
  createdAt: Date;
  expiresAt: Date;                       // Cache expiration
  lastAccessedAt: Date;
}

// AI Suggestion for User Story
export interface AIStorySuggestion {
  // Suggested Acceptance Criteria
  acceptanceCriteria: string[];

  // Suggested Story Points (with reasoning)
  storyPoints: {
    estimate: number;
    reasoning: string;
  };

  // Suggested Tags
  tags: string[];

  // Potential Risks or Blockers
  risks: string[];

  // Related Stories (IDs)
  relatedStories: string[];

  // Technical Recommendations
  technicalNotes?: string;
}

// AI Sprint Analysis Result
export interface AISprintAnalysis {
  sprintId: string;

  // Overall Assessment
  healthScore: number;                   // 0-100
  summary: string;

  // Insights
  strengths: string[];
  concerns: string[];
  recommendations: string[];

  // Predictions
  predictedVelocity: number;
  completionProbability: number;         // 0-100%
  riskLevel: 'low' | 'medium' | 'high';

  // Velocity Trends
  velocityTrend: 'increasing' | 'stable' | 'decreasing';

  // Generated at
  generatedAt: Date;
}

// AI Backlog Analysis Result
export interface AIBacklogAnalysis {
  projectId: string;

  // Overall Assessment
  backlogHealth: number;                 // 0-100
  summary: string;

  // Insights
  prioritizationQuality: string;
  estimationAccuracy: string;
  recommendations: string[];

  // Identified Issues
  issues: {
    type: 'missing_acceptance_criteria' | 'unclear_story' | 'oversized_story' | 'duplicate' | 'dependency';
    storyId: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];

  // Quick Wins (easy stories with high value)
  quickWins: string[];                   // Story IDs

  // Generated at
  generatedAt: Date;
}

// AI Retrospective Generation
export interface AIRetrospectiveGeneration {
  sprintId: string;

  // Auto-generated sections
  wentWell: string[];
  toImprove: string[];
  actionItems: string[];

  // Insights from data
  dataInsights: string[];

  // Patterns identified
  patterns: {
    positive: string[];
    negative: string[];
  };

  // Generated at
  generatedAt: Date;
}

// AI Report Template
export type AIReportType =
  | 'sprint_summary'
  | 'velocity_report'
  | 'team_performance'
  | 'backlog_health'
  | 'stakeholder_update';

export interface AIGeneratedReport {
  id: string;
  projectId: string;
  type: AIReportType;

  // Report Content
  title: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    charts?: string[];                   // Chart data/config
  }[];

  // Key Metrics Highlighted
  keyMetrics: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];

  // Recommendations
  recommendations: string[];

  // Metadata
  generatedAt: Date;
  generatedBy: string;                   // User ID who requested
}

// AI Copilot Context (what the AI knows about current page/state)
export interface AICopilotContext {
  currentPage: string;                   // Current route/page
  projectId?: string;
  sprintId?: string;
  storyId?: string;
  epicId?: string;

  // Available Data Context
  availableContext: {
    recentSprints?: Sprint[];
    activeStories?: Story[];
    teamMetrics?: TeamMetrics;
    [key: string]: any;
  };
}

// More types will be added as needed in later phases
