import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosBadge,
} from '../../components/ui';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  getSprintById,
  getStoriesBySprint,
  getSprintStats,
  updateSprint,
  removeStoryFromSprint,
} from '../../lib/firestore-sprint';
import { getEpicsByProject } from '../../lib/firestore-backlog';
import type { Sprint, Story, Epic, StoryStatus, SprintStatus } from '../../lib/types';
import { StoryDetailSidebar } from '../../components/backlog/StoryDetailSidebar';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_PROJECT_ID = 'default-project';

export const SprintDetailPage: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    completedPoints: 0,
    totalStories: 0,
    completedStories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Load sprint data
  useEffect(() => {
    const loadData = async () => {
      if (!sprintId) return;

      try {
        console.log('Loading sprint data for:', sprintId);

        // Load sprint, stories, epics, and stats in parallel
        const [sprintData, storiesData, epicsData, statsData] = await Promise.all([
          getSprintById(sprintId),
          getStoriesBySprint(sprintId),
          getEpicsByProject(DEFAULT_PROJECT_ID),
          getSprintStats(sprintId),
        ]);

        if (!sprintData) {
          toast.error('Sprint non trovato');
          navigate('/sprints');
          return;
        }

        console.log('Sprint loaded:', sprintData);
        console.log('Stories loaded:', storiesData.length);

        setSprint(sprintData);
        setStories(storiesData);
        setEpics(epicsData);
        setStats(statsData);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading sprint data:', error);
        toast.error('Errore nel caricamento dello sprint');
        setLoading(false);
      }
    };

    loadData();
  }, [sprintId, navigate]);

  // Handle remove story from sprint
  const handleRemoveFromSprint = async (story: Story) => {
    if (!confirm(`Rimuovere "${story.title}" dallo sprint?`)) {
      return;
    }

    try {
      await removeStoryFromSprint(story.id);
      toast.success('Story rimossa dallo sprint');

      // Reload data
      if (sprintId) {
        const [storiesData, statsData] = await Promise.all([
          getStoriesBySprint(sprintId),
          getSprintStats(sprintId),
        ]);
        setStories(storiesData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error removing story from sprint:', error);
      toast.error('Errore durante la rimozione della story');
    }
  };


  // Handle complete sprint
  const handleCompleteSprint = async () => {
    if (!sprint || !sprintId) return;

    if (
      !confirm(
        `Completare lo sprint "${sprint.name}"? La velocity sarà calcolata automaticamente.`
      )
    ) {
      return;
    }

    try {
      // Calculate velocity
      const velocity = stats.completedPoints;

      await updateSprint(sprintId, {
        status: 'completed',
        velocity,
      });

      toast.success(`Sprint completato! Velocity: ${velocity} punti`);

      // Reload sprint data
      const sprintData = await getSprintById(sprintId);
      setSprint(sprintData);
    } catch (error) {
      console.error('Error completing sprint:', error);
      toast.error('Errore durante il completamento dello sprint');
    }
  };

  // Navigate to board
  const handleGoToBoard = () => {
    navigate(`/sprint/${sprintId}/board`);
  };

  // Navigate to planning (story selector will be implemented later)
  const handleSprintPlanning = () => {
    toast('Sprint Planning - funzionalità in arrivo');
  };

  // Navigate to daily scrum
  const handleDailyScrum = () => {
    toast('Daily Scrum - funzionalità in arrivo');
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: StoryStatus) => {
    switch (status) {
      case 'in_sprint':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'review':
        return 'info';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: StoryStatus) => {
    switch (status) {
      case 'in_sprint':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  // Get sprint status badge variant
  const getSprintStatusBadgeVariant = (status: SprintStatus) => {
    switch (status) {
      case 'planning':
        return 'default';
      case 'active':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get sprint status label
  const getSprintStatusLabel = (status: SprintStatus) => {
    switch (status) {
      case 'planning':
        return 'In Pianificazione';
      case 'active':
        return 'Attivo';
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Annullato';
    }
  };

  // Get epic name by ID
  const getEpicName = (epicId?: string) => {
    if (!epicId) return '-';
    const epic = epics.find((e) => e.id === epicId);
    return epic?.title || 'Epic Sconosciuto';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento sprint...</p>
        </div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-metahodos-text-secondary">Sprint non trovato</p>
          <MetahodosButton
            variant="primary"
            onClick={() => navigate('/sprints')}
            className="mt-4"
          >
            Torna agli Sprints
          </MetahodosButton>
        </div>
      </div>
    );
  }

  const daysRemaining = differenceInDays(sprint.endDate, new Date());
  const progressPercentage =
    stats.totalPoints > 0 ? Math.round((stats.completedPoints / stats.totalPoints) * 100) : 0;

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back button */}
          <MetahodosButton
            variant="ghost"
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => navigate('/sprints')}
            className="mb-4"
            size="sm"
          >
            Torna agli Sprints
          </MetahodosButton>

          {/* Title and Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-metahodos-navy">{sprint.name}</h1>
                <MetahodosBadge variant={getSprintStatusBadgeVariant(sprint.status)}>
                  {getSprintStatusLabel(sprint.status)}
                </MetahodosBadge>
              </div>
              <p className="text-metahodos-text-secondary mt-2">{sprint.goal}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center space-x-6 text-sm text-metahodos-text-secondary mb-6">
            <div>
              <span className="font-medium">Inizio:</span>{' '}
              {format(sprint.startDate, 'dd MMM yyyy', { locale: it })}
            </div>
            <div>
              <span className="font-medium">Fine:</span>{' '}
              {format(sprint.endDate, 'dd MMM yyyy', { locale: it })}
            </div>
            {sprint.status === 'active' && (
              <div className={`${daysRemaining <= 2 ? 'text-error font-medium' : ''}`}>
                <span className="font-medium">Giorni rimanenti:</span> {daysRemaining}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Story Points Totali</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">{stats.totalPoints}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">Punti Completati</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{stats.completedPoints}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700">Progresso</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {progressPercentage}%
              </div>
            </div>
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Stories</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">
                {stats.completedStories}/{stats.totalStories}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <MetahodosButton
              variant="outline"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={handleSprintPlanning}
            >
              Sprint Planning
            </MetahodosButton>
            <MetahodosButton
              variant="outline"
              leftIcon={<ChartBarIcon className="h-5 w-5" />}
              onClick={handleGoToBoard}
            >
              Vai al Board
            </MetahodosButton>
            <MetahodosButton
              variant="outline"
              leftIcon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5" />}
              onClick={handleDailyScrum}
            >
              Daily Scrum
            </MetahodosButton>
            {sprint.status === 'active' && (
              <MetahodosButton
                variant="primary"
                leftIcon={<CheckCircleIcon className="h-5 w-5" />}
                onClick={handleCompleteSprint}
              >
                Completa Sprint
              </MetahodosButton>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MetahodosCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-metahodos-navy flex items-center">
              <ClipboardDocumentListIcon className="h-6 w-6 mr-2" />
              Sprint Backlog
            </h2>
            <div className="text-sm text-metahodos-text-secondary">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            </div>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                Nessuna story nello sprint
              </h3>
              <p className="text-metahodos-text-secondary mb-6">
                Aggiungi story allo sprint tramite Sprint Planning
              </p>
              <MetahodosButton variant="primary" onClick={handleSprintPlanning}>
                Vai a Sprint Planning
              </MetahodosButton>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-metahodos-gray-200">
                <thead className="bg-metahodos-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metahodos-text-secondary uppercase tracking-wider">
                      Titolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metahodos-text-secondary uppercase tracking-wider">
                      Epic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metahodos-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-metahodos-text-secondary uppercase tracking-wider">
                      Punti
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-metahodos-text-secondary uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-metahodos-gray-200">
                  {stories.map((story) => (
                    <tr
                      key={story.id}
                      className="hover:bg-metahodos-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedStory(story)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-metahodos-navy">
                          {story.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-metahodos-text-secondary">
                          {getEpicName(story.epicId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <MetahodosBadge variant={getStatusBadgeVariant(story.status)} size="sm">
                          {getStatusLabel(story.status)}
                        </MetahodosBadge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-metahodos-navy">
                          {story.storyPoints || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromSprint(story);
                            }}
                            className="text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
                            title="Rimuovi dallo sprint"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MetahodosCard>
      </div>

      {/* Story Detail Sidebar */}
      {selectedStory && (
        <StoryDetailSidebar
          story={selectedStory}
          epic={epics.find((e) => e.id === selectedStory.epicId)}
          onClose={() => setSelectedStory(null)}
          onEdit={() => {
            // Reload stories after edit
            if (sprintId) {
              Promise.all([
                getStoriesBySprint(sprintId),
                getSprintStats(sprintId),
              ]).then(([storiesData, statsData]) => {
                setStories(storiesData);
                setStats(statsData);
              });
            }
          }}
        />
      )}
    </div>
  );
};
