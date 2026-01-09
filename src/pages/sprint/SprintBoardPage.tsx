import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosBadge,
} from '../../components/ui';
import {
  ArrowLeftIcon,
  PlusIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  getSprintById,
  getStoriesBySprint,
  getSprintStats,
} from '../../lib/firestore-sprint';
import { getEpicsByProject, updateStory } from '../../lib/firestore-backlog';
import type { Sprint, Story, Epic, StoryStatus } from '../../lib/types';
import { StoryDetailSidebar } from '../../components/backlog/StoryDetailSidebar';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_PROJECT_ID = 'default-project';

interface KanbanColumn {
  status: StoryStatus;
  title: string;
  color: string;
  bgColor: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    status: 'in_sprint',
    title: 'To Do',
    color: '#6b7280',
    bgColor: 'bg-gray-50',
  },
  {
    status: 'in_progress',
    title: 'In Progress',
    color: '#fcb900',
    bgColor: 'bg-yellow-50',
  },
  {
    status: 'review',
    title: 'Review',
    color: '#0693e3',
    bgColor: 'bg-blue-50',
  },
  {
    status: 'done',
    title: 'Done',
    color: '#16a34a',
    bgColor: 'bg-green-50',
  },
];

export const SprintBoardPage: React.FC = () => {
  const { sprintId } = useParams<{ sprintId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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
  const [draggedStory, setDraggedStory] = useState<Story | null>(null);

  // Load sprint data
  useEffect(() => {
    const loadData = async () => {
      if (!sprintId) return;

      try {
        console.log('Loading sprint board data for:', sprintId);

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

        console.log('Sprint board loaded:', sprintData);
        console.log('Stories loaded:', storiesData.length);

        setSprint(sprintData);
        setStories(storiesData);
        setEpics(epicsData);
        setStats(statsData);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading sprint board data:', error);
        toast.error('Errore nel caricamento del board');
        setLoading(false);
      }
    };

    loadData();
  }, [sprintId, navigate]);

  // Get stories by status
  const getStoriesByStatus = (status: StoryStatus): Story[] => {
    return stories.filter((s) => s.status === status);
  };

  // Get epic name
  const getEpicName = (epicId?: string): string => {
    if (!epicId) return '';
    const epic = epics.find((e) => e.id === epicId);
    return epic ? epic.title : '';
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, story: Story) => {
    setDraggedStory(story);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, targetStatus: StoryStatus) => {
    e.preventDefault();

    if (!draggedStory) return;

    // Don't allow moving back from done
    if (draggedStory.status === 'done' && targetStatus !== 'done') {
      toast.error('Non puoi spostare indietro una story completata');
      setDraggedStory(null);
      return;
    }

    try {
      await updateStory(draggedStory.id, {
        status: targetStatus,
      });
      toast.success('Status aggiornato!');

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
      console.error('Error updating status:', error);
      toast.error('Errore durante l\'aggiornamento dello status');
    } finally {
      setDraggedStory(null);
    }
  };

  // Navigate back to sprint detail
  const handleBackToSprint = () => {
    navigate(`/sprint/${sprintId}`);
  };

  // Handle daily scrum
  const handleDailyScrum = () => {
    toast.info('Daily Scrum - funzionalità in arrivo');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento board...</p>
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

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back button */}
          <MetahodosButton
            variant="ghost"
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={handleBackToSprint}
            className="mb-4"
            size="sm"
          >
            Torna allo Sprint
          </MetahodosButton>

          {/* Title */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-metahodos-navy">{sprint.name} - Kanban Board</h1>
              <p className="text-metahodos-text-secondary mt-1">
                {format(sprint.startDate, 'dd MMM', { locale: it })} -{' '}
                {format(sprint.endDate, 'dd MMM yyyy', { locale: it })}
                {sprint.status === 'active' && (
                  <span className={`ml-2 ${daysRemaining <= 2 ? 'text-error font-medium' : ''}`}>
                    • {daysRemaining} giorni rimanenti
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className={KANBAN_COLUMNS[0].bgColor + ' rounded-lg p-4'}>
              <div className="text-sm" style={{ color: KANBAN_COLUMNS[0].color }}>
                To Do
              </div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">
                {getStoriesByStatus('in_sprint').length}
              </div>
            </div>
            <div className={KANBAN_COLUMNS[1].bgColor + ' rounded-lg p-4'}>
              <div className="text-sm" style={{ color: KANBAN_COLUMNS[1].color }}>
                In Progress
              </div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">
                {getStoriesByStatus('in_progress').length}
              </div>
            </div>
            <div className={KANBAN_COLUMNS[2].bgColor + ' rounded-lg p-4'}>
              <div className="text-sm" style={{ color: KANBAN_COLUMNS[2].color }}>
                Review
              </div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">
                {getStoriesByStatus('review').length}
              </div>
            </div>
            <div className={KANBAN_COLUMNS[3].bgColor + ' rounded-lg p-4'}>
              <div className="text-sm" style={{ color: KANBAN_COLUMNS[3].color }}>
                Done
              </div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">
                {getStoriesByStatus('done').length}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <MetahodosButton
              variant="outline"
              leftIcon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5" />}
              onClick={handleDailyScrum}
            >
              Daily Scrum
            </MetahodosButton>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnStories = getStoriesByStatus(column.status);

            return (
              <div key={column.status} className="flex flex-col">
                {/* Column Header */}
                <div
                  className="rounded-t-lg px-4 py-3"
                  style={{ backgroundColor: column.color }}
                >
                  <h3 className="font-semibold text-white">
                    {column.title} ({columnStories.length})
                  </h3>
                </div>

                {/* Column Content */}
                <div
                  className={`${column.bgColor} rounded-b-lg p-4 min-h-[500px] flex-1`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.status)}
                >
                  <div className="space-y-3">
                    {columnStories.length === 0 ? (
                      <div className="text-center py-8 text-metahodos-text-muted text-sm">
                        Nessuna story
                      </div>
                    ) : (
                      columnStories.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          epicName={getEpicName(story.epicId)}
                          onDragStart={handleDragStart}
                          onClick={() => setSelectedStory(story)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <MetahodosCard className="mt-8">
          <div className="flex items-start space-x-2">
            <ClockIcon className="h-5 w-5 text-metahodos-orange mt-0.5" />
            <div>
              <h4 className="font-semibold text-metahodos-navy">Come usare il board</h4>
              <p className="text-sm text-metahodos-text-secondary mt-1">
                Trascina le story tra le colonne per aggiornare il loro stato. Le story completate
                non possono essere spostate indietro.
              </p>
            </div>
          </div>
        </MetahodosCard>
      </div>

      {/* Story Detail Sidebar */}
      {selectedStory && (
        <StoryDetailSidebar
          story={selectedStory}
          epics={epics}
          onClose={() => setSelectedStory(null)}
          onDelete={() => {
            // Reload stories after delete
            if (sprintId) {
              getStoriesBySprint(sprintId).then(setStories);
            }
            setSelectedStory(null);
          }}
        />
      )}
    </div>
  );
};

// Story Card Component
interface StoryCardProps {
  story: Story;
  epicName: string;
  onDragStart: (e: React.DragEvent, story: Story) => void;
  onClick: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, epicName, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, story)}
      onClick={onClick}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move border border-metahodos-gray-200"
    >
      {/* Title */}
      <h4 className="font-medium text-metahodos-navy text-sm mb-2 line-clamp-2">
        {story.title}
      </h4>

      {/* Epic and Points */}
      <div className="flex items-center justify-between">
        {epicName && (
          <div className="text-xs text-metahodos-text-muted truncate flex-1 mr-2">
            {epicName}
          </div>
        )}
        {story.storyPoints && (
          <MetahodosBadge variant="info" size="sm">
            {story.storyPoints} pts
          </MetahodosBadge>
        )}
      </div>

      {/* Tags */}
      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {story.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 text-xs rounded bg-metahodos-gray-100 text-metahodos-text-secondary"
            >
              {tag}
            </span>
          ))}
          {story.tags.length > 2 && (
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-metahodos-gray-100 text-metahodos-text-secondary">
              +{story.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
