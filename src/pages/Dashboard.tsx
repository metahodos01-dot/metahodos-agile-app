/**
 * Dashboard - Main operational dashboard
 *
 * Displays real-time project metrics, active sprint, recent activities,
 * and quick actions for the user.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { MetahodosButton } from '../components/ui/MetahodosButton';
import { MetahodosCard } from '../components/ui/MetahodosCard';
import { MetahodosBadge } from '../components/ui/MetahodosBadge';
import {
  ChartBarIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
  ListBulletIcon,
  SparklesIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { getEpicsByProject } from '../lib/firestore-backlog';
import { getStoriesByProject } from '../lib/firestore-backlog';
import { getActiveSprint } from '../lib/firestore-sprint';
import type { Epic, Story, Sprint } from '../lib/types';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { currentUser } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data state
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);

  useEffect(() => {
    if (currentProject) {
      loadDashboardData();
    }
  }, [currentProject]);

  async function loadDashboardData() {
    if (!currentProject) return;

    try {
      setLoading(true);

      const [epicsData, storiesData, activeSprintData] = await Promise.all([
        getEpicsByProject(currentProject.id),
        getStoriesByProject(currentProject.id),
        getActiveSprint(currentProject.id),
      ]);

      setEpics(epicsData);
      setStories(storiesData);
      setActiveSprint(activeSprintData);

      // Get recent stories (last 5, sorted by createdAt)
      const sortedStories = [...storiesData]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
      setRecentStories(sortedStories);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  // Calculate statistics
  const stats = {
    totalEpics: epics.length,
    activeEpics: epics.filter(e => e.status === 'in_progress').length,
    totalStories: stories.length,
    completedStories: stories.filter(s => s.status === 'done').length,
    inProgressStories: stories.filter(s => s.status === 'in_progress').length,
    readyStories: stories.filter(s => s.status === 'ready').length,
    totalStoryPoints: stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0),
    completedPoints: stories
      .filter(s => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0),
  };

  const statsCards = [
    {
      title: 'Total Epics',
      value: stats.totalEpics.toString(),
      subtitle: `${stats.activeEpics} in progress`,
      icon: RocketLaunchIcon,
      color: 'text-metahodos-red',
      bgColor: 'bg-metahodos-red/10',
      onClick: () => navigate('/epics'),
    },
    {
      title: 'Active Sprint',
      value: activeSprint?.name || 'None',
      subtitle: activeSprint ? `${Math.ceil((activeSprint.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left` : 'No active sprint',
      icon: CalendarIcon,
      color: 'text-metahodos-orange',
      bgColor: 'bg-metahodos-orange/10',
      onClick: () => activeSprint ? navigate(`/sprint/${activeSprint.id}`) : navigate('/sprints'),
    },
    {
      title: 'Stories Completed',
      value: `${stats.completedStories}/${stats.totalStories}`,
      subtitle: `${stats.completedPoints} story points`,
      icon: CheckCircleIcon,
      color: 'text-metahodos-green',
      bgColor: 'bg-metahodos-green/10',
      onClick: () => navigate('/backlog'),
    },
    {
      title: 'In Progress',
      value: stats.inProgressStories.toString(),
      subtitle: `${stats.readyStories} ready to start`,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/backlog'),
    },
  ];

  const quickActions = [
    {
      label: 'New Story',
      icon: PlusIcon,
      color: 'primary' as const,
      onClick: () => navigate('/backlog'),
    },
    {
      label: 'View Backlog',
      icon: ListBulletIcon,
      color: 'secondary' as const,
      onClick: () => navigate('/backlog'),
    },
    {
      label: 'Sprint Board',
      icon: ChartBarIcon,
      color: 'outline' as const,
      onClick: () => activeSprint ? navigate(`/sprint/${activeSprint.id}/board`) : toast.error('No active sprint'),
    },
    {
      label: 'AI Assistant',
      icon: SparklesIcon,
      color: 'outline' as const,
      onClick: () => navigate('/ai-settings'),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-metahodos-orange mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <MetahodosCard className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-metahodos-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-metahodos-gray uppercase tracking-tight mb-2">
            Nessun Progetto Selezionato
          </h2>
          <p className="text-metahodos-text-secondary mb-6">
            Seleziona un progetto o creane uno nuovo per iniziare
          </p>
          <MetahodosButton
            variant="primary"
            onClick={() => navigate('/projects')}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Gestisci Progetti
          </MetahodosButton>
        </MetahodosCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-metahodos-gray mb-2">
                Welcome back, {currentUser?.displayName || 'User'}!
              </h1>
              <p className="text-metahodos-text-secondary">
                Here's what's happening with {currentProject.name}.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <MetahodosCard
                    key={index}
                    onClick={stat.onClick}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-black text-metahodos-gray mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm font-bold text-metahodos-text-primary mb-1">
                      {stat.title}
                    </p>
                    <p className="text-xs text-metahodos-text-secondary">
                      {stat.subtitle}
                    </p>
                  </MetahodosCard>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-metahodos-gray mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <MetahodosButton
                      key={index}
                      variant={action.color}
                      onClick={action.onClick}
                      className="justify-center"
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {action.label}
                    </MetahodosButton>
                  );
                })}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Sprint Section */}
              <MetahodosCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-metahodos-gray uppercase tracking-tight">Active Sprint</h2>
                  <MetahodosButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/sprints')}
                  >
                    View All
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </MetahodosButton>
                </div>

                {activeSprint ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-bold text-metahodos-gray mb-1">{activeSprint.name}</h3>
                      <p className="text-sm text-metahodos-text-secondary mb-3">{activeSprint.goal}</p>

                      <div className="flex items-center gap-4 text-sm text-metahodos-text-secondary mb-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {activeSprint.startDate.toLocaleDateString()} - {activeSprint.endDate.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-metahodos-text-secondary">Progress</span>
                          <span className="font-bold text-metahodos-gray">
                            {stats.completedPoints} / {stats.totalStoryPoints} points
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-metahodos-orange h-2 rounded-full transition-all"
                            style={{
                              width: `${stats.totalStoryPoints > 0 ? (stats.completedPoints / stats.totalStoryPoints) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <MetahodosButton
                      variant="primary"
                      onClick={() => navigate(`/sprint/${activeSprint.id}/board`)}
                      className="w-full"
                    >
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                      Go to Sprint Board
                    </MetahodosButton>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-metahodos-text-secondary mx-auto mb-3" />
                    <p className="text-metahodos-text-secondary mb-4">No active sprint</p>
                    <MetahodosButton
                      variant="primary"
                      onClick={() => navigate('/sprints')}
                    >
                      Create Sprint
                    </MetahodosButton>
                  </div>
                )}
              </MetahodosCard>

              {/* Recent Stories */}
              <MetahodosCard>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-metahodos-gray">Recent Stories</h2>
                  <MetahodosButton
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/backlog')}
                  >
                    View All
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </MetahodosButton>
                </div>

                {recentStories.length > 0 ? (
                  <div className="space-y-3">
                    {recentStories.map((story) => (
                      <div
                        key={story.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate('/backlog')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-metahodos-gray text-sm line-clamp-1">
                            {story.title}
                          </h4>
                          {story.storyPoints && (
                            <span className="text-xs font-bold text-metahodos-text-secondary ml-2 flex-shrink-0">
                              {story.storyPoints} pts
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MetahodosBadge
                            variant={
                              story.status === 'done'
                                ? 'success'
                                : story.status === 'in_progress'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {story.status.replace('_', ' ')}
                          </MetahodosBadge>
                          {story.tags && story.tags.length > 0 && (
                            <span className="text-xs text-metahodos-text-secondary">
                              {story.tags[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ListBulletIcon className="h-12 w-12 text-metahodos-text-secondary mx-auto mb-3" />
                    <p className="text-metahodos-text-secondary mb-4">No stories yet</p>
                    <MetahodosButton
                      variant="primary"
                      onClick={() => navigate('/backlog')}
                    >
                      Create Story
                    </MetahodosButton>
                  </div>
                )}
              </MetahodosCard>
            </div>

            {/* Active Epics Section */}
            {stats.activeEpics > 0 && (
              <div className="mt-8">
                <MetahodosCard>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-metahodos-gray">Active Epics</h2>
                    <MetahodosButton
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/epics')}
                    >
                      View All
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </MetahodosButton>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {epics
                      .filter(epic => epic.status === 'in_progress')
                      .slice(0, 3)
                      .map((epic) => {
                        const epicStories = stories.filter(s => s.epicId === epic.id);
                        const completedStories = epicStories.filter(s => s.status === 'done');
                        const progress = epicStories.length > 0
                          ? (completedStories.length / epicStories.length) * 100
                          : 0;

                        return (
                          <div
                            key={epic.id}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-metahodos-orange cursor-pointer transition-colors"
                            onClick={() => navigate('/epics')}
                          >
                            <h3 className="font-bold text-metahodos-gray mb-2 line-clamp-1">
                              {epic.title}
                            </h3>
                            <p className="text-sm text-metahodos-text-secondary mb-3 line-clamp-2">
                              {epic.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-metahodos-text-secondary mb-2">
                              <span>{completedStories.length}/{epicStories.length} stories</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-metahodos-green h-1.5 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </MetahodosCard>
              </div>
            )}
    </div>
  );
}
