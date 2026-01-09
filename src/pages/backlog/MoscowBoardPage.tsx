import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosBadge,
} from '../../components/ui';
import { PlusIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import {
  getEpicsByProject,
  getStoriesByProject,
  subscribeToStories,
  updateStory,
} from '../../lib/firestore-backlog';
import type { Story, Epic, MoscowPriority } from '../../lib/types';
import { StoryFormModal } from '../../components/backlog/StoryFormModal';
import { StoryDetailSidebar } from '../../components/backlog/StoryDetailSidebar';
import toast from 'react-hot-toast';

// Temporary hardcoded projectId
const DEFAULT_PROJECT_ID = 'default-project';

interface MoscowColumn {
  priority: MoscowPriority;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const MOSCOW_COLUMNS: MoscowColumn[] = [
  {
    priority: 'must_have',
    title: 'Must Have',
    description: 'Requisiti essenziali per il successo del progetto',
    color: '#cf2e2e',
    bgColor: 'bg-red-50',
  },
  {
    priority: 'should_have',
    title: 'Should Have',
    description: 'Importanti ma non critici, possono essere rimandati se necessario',
    color: '#fcb900',
    bgColor: 'bg-yellow-50',
  },
  {
    priority: 'could_have',
    title: 'Could Have',
    description: 'Desiderabili ma non necessari, da includere se ci sono risorse',
    color: '#0693e3',
    bgColor: 'bg-blue-50',
  },
  {
    priority: 'wont_have',
    title: 'Won\'t Have',
    description: 'Fuori scope per questa release, da considerare in futuro',
    color: '#9ca3af',
    bgColor: 'bg-gray-50',
  },
];

export const MoscowBoardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedStory, setDraggedStory] = useState<Story | null>(null);

  // Load epics and stories - using simple fetch to avoid subscription issues
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading MoSCoW board data for project:', DEFAULT_PROJECT_ID);

        // Load epics and all stories in parallel
        const [epicsList, allStories] = await Promise.all([
          getEpicsByProject(DEFAULT_PROJECT_ID),
          getStoriesByProject(DEFAULT_PROJECT_ID)
        ]);

        // Filter only backlog and ready stories for prioritization
        const prioritizableStories = allStories.filter(
          (s) => s.status === 'backlog' || s.status === 'ready'
        );

        console.log('MoSCoW board loaded - Epics:', epicsList.length, 'Stories:', prioritizableStories.length);
        setEpics(epicsList);
        setStories(prioritizableStories);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading MoSCoW board data:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
        toast.error('Errore nel caricamento della board MoSCoW. Controlla la console per dettagli.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get stories by MoSCoW priority
  const getStoriesByPriority = (priority: MoscowPriority | null): Story[] => {
    if (priority === null) {
      return stories.filter((s) => !s.moscowPriority);
    }
    return stories.filter((s) => s.moscowPriority === priority);
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
  const handleDrop = async (e: React.DragEvent, targetPriority: MoscowPriority | null) => {
    e.preventDefault();

    if (!draggedStory) return;

    try {
      await updateStory(draggedStory.id, {
        moscowPriority: targetPriority || undefined,
      });
      toast.success('Priorità aggiornata!');
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Errore durante l\'aggiornamento della priorità');
    } finally {
      setDraggedStory(null);
    }
  };

  // Stats
  const mustHaveCount = getStoriesByPriority('must_have').length;
  const shouldHaveCount = getStoriesByPriority('should_have').length;
  const couldHaveCount = getStoriesByPriority('could_have').length;
  const wontHaveCount = getStoriesByPriority('wont_have').length;
  const unassignedCount = getStoriesByPriority(null).length;

  const totalStoryPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const mustHavePoints = getStoriesByPriority('must_have').reduce(
    (sum, s) => sum + (s.storyPoints || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento board MoSCoW...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-metahodos-navy">Prioritizzazione MoSCoW</h1>
              <p className="text-metahodos-text-secondary mt-1">
                Organizza le story usando il metodo MoSCoW (Must, Should, Could, Won't Have)
              </p>
            </div>
            <MetahodosButton
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setShowCreateModal(true)}
            >
              Nuova Story
            </MetahodosButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Totale Stories</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">{stories.length}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-700">Must Have</div>
              <div className="text-2xl font-bold text-red-900 mt-1">{mustHaveCount}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-700">Should Have</div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">{shouldHaveCount}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700">Could Have</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{couldHaveCount}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-metahodos-gray-200">
              <div className="text-sm text-metahodos-text-secondary">Won't Have</div>
              <div className="text-2xl font-bold text-metahodos-text-primary mt-1">
                {wontHaveCount}
              </div>
            </div>
            <div className="bg-metahodos-orange/10 rounded-lg p-4">
              <div className="text-sm text-metahodos-orange-dark">Non Assegnate</div>
              <div className="text-2xl font-bold text-metahodos-orange mt-1">{unassignedCount}</div>
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-700 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <strong>Come usare questa board:</strong> Trascina le story nelle colonne per assegnare
              la priorità MoSCoW. Inizia con Must Have (essenziale), poi Should Have (importante),
              Could Have (desiderabile) e Won't Have (futuro).
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* MoSCoW Columns */}
          {MOSCOW_COLUMNS.map((column) => (
            <MoscowColumn
              key={column.priority}
              column={column}
              stories={getStoriesByPriority(column.priority)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.priority)}
              onStoryClick={setSelectedStory}
              getEpicName={getEpicName}
            />
          ))}
        </div>

        {/* Unassigned Stories Column */}
        {unassignedCount > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-metahodos-navy mb-4">
              Stories Non Assegnate ({unassignedCount})
            </h3>
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null)}
              className="bg-white rounded-lg border-2 border-dashed border-metahodos-gray-300 p-4 min-h-[200px]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {getStoriesByPriority(null).map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onDragStart={handleDragStart}
                    onClick={() => setSelectedStory(story)}
                    getEpicName={getEpicName}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Story Create/Edit Modal */}
      <StoryFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingStory(null);
        }}
        projectId={DEFAULT_PROJECT_ID}
        epics={epics}
        story={editingStory}
        onSuccess={() => {
          setEditingStory(null);
        }}
      />

      {/* Story Detail Sidebar */}
      {selectedStory && (
        <StoryDetailSidebar
          story={selectedStory}
          epic={epics.find((e) => e.id === selectedStory.epicId)}
          onClose={() => setSelectedStory(null)}
          onEdit={() => {
            setEditingStory(selectedStory);
            setShowCreateModal(true);
            setSelectedStory(null);
          }}
        />
      )}
    </div>
  );
};

// MoSCoW Column Component
interface MoscowColumnProps {
  column: MoscowColumn;
  stories: Story[];
  onDragStart: (e: React.DragEvent, story: Story) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onStoryClick: (story: Story) => void;
  getEpicName: (epicId?: string) => string;
}

const MoscowColumn: React.FC<MoscowColumnProps> = ({
  column,
  stories,
  onDragStart,
  onDragOver,
  onDrop,
  onStoryClick,
  getEpicName,
}) => {
  const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${column.bgColor} rounded-t-lg p-4 border-b-4`} style={{ borderColor: column.color }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold" style={{ color: column.color }}>
            {column.title}
          </h3>
          <MetahodosBadge
            variant={
              column.priority === 'must_have'
                ? 'error'
                : column.priority === 'should_have'
                ? 'warning'
                : column.priority === 'could_have'
                ? 'info'
                : 'default'
            }
          >
            {stories.length}
          </MetahodosBadge>
        </div>
        <p className="text-sm text-metahodos-text-secondary">{column.description}</p>
        {totalPoints > 0 && (
          <div className="mt-2 text-xs text-metahodos-text-muted">
            <strong>{totalPoints}</strong> story points totali
          </div>
        )}
      </div>

      {/* Column Body */}
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="flex-1 bg-white rounded-b-lg border-2 border-t-0 border-metahodos-gray-200 p-3 min-h-[400px] space-y-3"
      >
        {stories.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-center">
            <p className="text-sm text-metahodos-text-muted">
              Trascina qui le story per assegnare questa priorità
            </p>
          </div>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onDragStart={onDragStart}
              onClick={() => onStoryClick(story)}
              getEpicName={getEpicName}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Story Card Component
interface StoryCardProps {
  story: Story;
  onDragStart: (e: React.DragEvent, story: Story) => void;
  onClick: () => void;
  getEpicName: (epicId?: string) => string;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onDragStart, onClick, getEpicName }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, story)}
      onClick={onClick}
      className="bg-white border border-metahodos-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-metahodos-navy flex-1 line-clamp-2">
          {story.title}
        </h4>
        {story.storyPoints && (
          <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-metahodos-orange text-white text-xs font-semibold flex-shrink-0">
            {story.storyPoints}
          </span>
        )}
      </div>

      {story.epicId && (
        <div className="text-xs text-metahodos-text-secondary mb-2">{getEpicName(story.epicId)}</div>
      )}

      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {story.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 rounded text-xs bg-metahodos-gray-100 text-metahodos-text-muted"
            >
              {tag}
            </span>
          ))}
          {story.tags.length > 2 && (
            <span className="inline-block px-2 py-0.5 rounded text-xs bg-metahodos-gray-100 text-metahodos-text-muted">
              +{story.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
