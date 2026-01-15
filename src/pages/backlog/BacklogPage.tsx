import React, { useState, useEffect } from 'react';

import {
  MetahodosButton,
  MetahodosCard,
  MetahodosBadge,
  MetahodosSelect,
  type SelectOption,
} from '../../components/ui';
import {
  PlusIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  getStoriesByProject,
  getEpicsByProject,
  deleteStory,
  type StoryFilters,
} from '../../lib/firestore-backlog';
import type { Story, Epic, StoryStatus, MoscowPriority } from '../../lib/types';
import { StoryFormModal } from '../../components/backlog/StoryFormModal';
import { StoryDetailSidebar } from '../../components/backlog/StoryDetailSidebar';
import toast from 'react-hot-toast';

// Temporary hardcoded projectId
const DEFAULT_PROJECT_ID = 'default-project';

export const BacklogPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState<StoryFilters>({});

  // Load epics and stories - using simple fetch to avoid subscription issues
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading backlog data for project:', DEFAULT_PROJECT_ID);

        // Load epics and stories in parallel
        const [epicsList, storiesList] = await Promise.all([
          getEpicsByProject(DEFAULT_PROJECT_ID),
          getStoriesByProject(DEFAULT_PROJECT_ID, filters)
        ]);

        console.log('Backlog loaded - Epics:', epicsList.length, 'Stories:', storiesList.length);
        setEpics(epicsList);
        setStories(storiesList);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading backlog data:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
        toast.error('Errore nel caricamento del backlog. Controlla la console per dettagli.');
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Handle delete story
  const handleDelete = async (story: Story) => {
    if (!confirm(`Sei sicuro di voler eliminare "${story.title}"?`)) {
      return;
    }

    try {
      await deleteStory(story.id);
      toast.success('Story eliminata con successo!');
      if (selectedStory?.id === story.id) {
        setSelectedStory(null);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Errore durante l\'eliminazione della story');
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: StoryStatus) => {
    switch (status) {
      case 'backlog':
        return 'default';
      case 'ready':
        return 'info';
      case 'in_sprint':
        return 'warning';
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

  // Get MoSCoW badge variant
  const getMoscowBadgeVariant = (priority?: MoscowPriority) => {
    switch (priority) {
      case 'must_have':
        return 'error';
      case 'should_have':
        return 'warning';
      case 'could_have':
        return 'info';
      case 'wont_have':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get epic name by ID
  const getEpicName = (epicId?: string): string => {
    if (!epicId) return '-';
    const epic = epics.find((e) => e.id === epicId);
    return epic ? epic.title : 'Epic non trovato';
  };

  // Status options for filter
  const statusOptions: SelectOption[] = [
    { value: '', label: 'Tutti gli status' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'ready', label: 'Pronto' },
    { value: 'in_sprint', label: 'In Sprint' },
    { value: 'in_progress', label: 'In Corso' },
    { value: 'review', label: 'In Revisione' },
    { value: 'done', label: 'Completato' },
  ];

  // MoSCoW options for filter
  const moscowOptions: SelectOption[] = [
    { value: '', label: 'Tutte le priorità' },
    { value: 'must_have', label: 'Must Have' },
    { value: 'should_have', label: 'Should Have' },
    { value: 'could_have', label: 'Could Have' },
    { value: 'wont_have', label: 'Won\'t Have' },
  ];

  // Epic options for filter
  const epicOptions: SelectOption[] = [
    { value: '', label: 'Tutti gli epic' },
    ...epics.map((epic) => ({
      value: epic.id,
      label: epic.title,
    })),
  ];

  // Stats
  const totalStoryPoints = stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
  const readyStories = stories.filter((s) => s.status === 'ready').length;
  const mustHaveStories = stories.filter((s) => s.moscowPriority === 'must_have').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento backlog...</p>
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
              <h1 className="text-3xl font-bold text-metahodos-navy">Product Backlog</h1>
              <p className="text-metahodos-text-secondary mt-1">
                Gestisci e prioritizza le user story del progetto
              </p>
            </div>
            <div className="flex space-x-3">
              <MetahodosButton
                variant="outline"
                leftIcon={<FunnelIcon className="h-5 w-5" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtri
              </MetahodosButton>
              <MetahodosButton
                variant="primary"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setShowCreateModal(true)}
              >
                Nuova Story
              </MetahodosButton>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Totale Stories</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">{stories.length}</div>
            </div>
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Story Points</div>
              <div className="text-2xl font-bold text-metahodos-orange mt-1">
                {totalStoryPoints}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">Pronte per Sprint</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{readyStories}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-700">Must Have</div>
              <div className="text-2xl font-bold text-red-900 mt-1">{mustHaveStories}</div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-metahodos-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetahodosSelect
                  label="Status"
                  options={statusOptions}
                  value={filters.status || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value ? (e.target.value as StoryStatus) : undefined,
                    })
                  }
                />
                <MetahodosSelect
                  label="Priorità MoSCoW"
                  options={moscowOptions}
                  value={filters.moscowPriority || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      moscowPriority: e.target.value
                        ? (e.target.value as MoscowPriority)
                        : undefined,
                    })
                  }
                />
                <MetahodosSelect
                  label="Epic"
                  options={epicOptions}
                  value={filters.epicId || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      epicId: e.target.value || undefined,
                    })
                  }
                />
              </div>
              <div className="mt-4 flex justify-end">
                <MetahodosButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({})}
                >
                  Reset filtri
                </MetahodosButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {stories.length === 0 ? (
          <MetahodosCard>
            <div className="text-center py-12">
              <Bars3Icon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                Nessuna story nel backlog
              </h3>
              <p className="text-metahodos-text-secondary mb-6">
                Inizia creando la tua prima user story
              </p>
              <MetahodosButton
                variant="primary"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setShowCreateModal(true)}
              >
                Crea la tua prima Story
              </MetahodosButton>
            </div>
          </MetahodosCard>
        ) : (
          <MetahodosCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-metahodos-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Priorità
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Titolo
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Epic
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      MoSCoW
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Story Points
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Tags
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-metahodos-navy">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story, index) => (
                    <tr
                      key={story.id}
                      className={`border-b border-metahodos-gray-100 hover:bg-metahodos-gray-50 cursor-pointer transition-colors ${
                        selectedStory?.id === story.id ? 'bg-metahodos-orange/5' : ''
                      }`}
                      onClick={() => setSelectedStory(story)}
                    >
                      {/* Priority */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Bars3Icon className="h-4 w-4 text-metahodos-text-muted cursor-move" />
                          <span className="text-sm font-medium text-metahodos-text-primary">
                            {index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-metahodos-navy">{story.title}</div>
                        {story.description && (
                          <div className="text-sm text-metahodos-text-secondary line-clamp-1 mt-1">
                            {story.description}
                          </div>
                        )}
                      </td>

                      {/* Epic */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-metahodos-text-secondary">
                          {getEpicName(story.epicId)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <MetahodosBadge variant={getStatusBadgeVariant(story.status)} size="sm">
                          {story.status === 'backlog'
                            ? 'Backlog'
                            : story.status === 'ready'
                            ? 'Pronto'
                            : story.status === 'in_sprint'
                            ? 'In Sprint'
                            : story.status === 'in_progress'
                            ? 'In Corso'
                            : story.status === 'review'
                            ? 'Revisione'
                            : 'Fatto'}
                        </MetahodosBadge>
                      </td>

                      {/* MoSCoW */}
                      <td className="py-3 px-4">
                        {story.moscowPriority ? (
                          <MetahodosBadge
                            variant={getMoscowBadgeVariant(story.moscowPriority)}
                            size="sm"
                          >
                            {story.moscowPriority === 'must_have'
                              ? 'Must'
                              : story.moscowPriority === 'should_have'
                              ? 'Should'
                              : story.moscowPriority === 'could_have'
                              ? 'Could'
                              : 'Won\'t'}
                          </MetahodosBadge>
                        ) : (
                          <span className="text-sm text-metahodos-text-muted">-</span>
                        )}
                      </td>

                      {/* Story Points */}
                      <td className="py-3 px-4 text-center">
                        {story.storyPoints ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-metahodos-orange text-white text-sm font-semibold">
                            {story.storyPoints}
                          </span>
                        ) : (
                          <span className="text-sm text-metahodos-text-muted">-</span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="py-3 px-4">
                        {story.tags && story.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {story.tags.slice(0, 2).map((tag) => (
                              <MetahodosBadge key={tag} variant="default" size="sm">
                                {tag}
                              </MetahodosBadge>
                            ))}
                            {story.tags.length > 2 && (
                              <MetahodosBadge variant="default" size="sm">
                                +{story.tags.length - 2}
                              </MetahodosBadge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-metahodos-text-muted">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStory(story);
                              setShowCreateModal(true);
                            }}
                            className="p-2 text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
                            title="Modifica"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(story);
                            }}
                            className="p-2 text-metahodos-text-secondary hover:text-error transition-colors"
                            title="Elimina"
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
          </MetahodosCard>
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
