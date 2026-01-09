import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosInput,
  MetahodosTextarea,
  MetahodosModal,
  MetahodosBadge,
} from '../../components/ui';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import {
  getEpicsByProject,
  createEpic,
  updateEpic,
  deleteEpic,
  subscribeToEpics,
  type CreateEpicData,
  type UpdateEpicData,
} from '../../lib/firestore-backlog';
import type { Epic, EpicStatus } from '../../lib/types';
import toast from 'react-hot-toast';

// Temporary hardcoded projectId - will be replaced with actual project selection in Phase 3
const DEFAULT_PROJECT_ID = 'default-project';

export const EpicsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateEpicData>({
    title: '',
    description: '',
    businessValue: 50,
    effort: 50,
    priority: 'medium',
    color: '#ff6b35',
  });

  // Load epics - using simple fetch to avoid index issues
  useEffect(() => {
    const loadEpics = async () => {
      try {
        console.log('Loading epics for project:', DEFAULT_PROJECT_ID);
        const epicsList = await getEpicsByProject(DEFAULT_PROJECT_ID);
        console.log('Epics loaded:', epicsList.length);
        setEpics(epicsList);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading epics:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
        toast.error('Errore nel caricamento degli epic. Controlla la console per dettagli.');
        setLoading(false);
      }
    };

    loadEpics();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      businessValue: 50,
      effort: 50,
      priority: 'medium',
      color: '#ff6b35',
    });
    setEditingEpic(null);
  };

  // Open create modal
  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (epic: Epic) => {
    setFormData({
      title: epic.title,
      description: epic.description,
      businessValue: epic.businessValue,
      effort: epic.effort,
      priority: epic.priority,
      color: epic.color || '#ff6b35',
    });
    setEditingEpic(epic);
    setShowCreateModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Devi essere autenticato');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Il titolo è obbligatorio');
      return;
    }

    try {
      if (editingEpic) {
        // Update existing epic
        const updates: UpdateEpicData = {
          title: formData.title,
          description: formData.description,
          businessValue: formData.businessValue,
          effort: formData.effort,
          priority: formData.priority,
          color: formData.color,
        };
        await updateEpic(editingEpic.id, updates);
        toast.success('Epic aggiornato con successo!');
      } else {
        // Create new epic
        await createEpic(DEFAULT_PROJECT_ID, formData, currentUser.uid);
        toast.success('Epic creato con successo!');
      }

      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving epic:', error);
      toast.error('Errore durante il salvataggio dell\'epic');
    }
  };

  // Handle delete
  const handleDelete = async (epic: Epic) => {
    if (!confirm(`Sei sicuro di voler eliminare "${epic.title}"?`)) {
      return;
    }

    try {
      await deleteEpic(epic.id, false); // Don't delete stories, just unlink them
      toast.success('Epic eliminato con successo!');
    } catch (error) {
      console.error('Error deleting epic:', error);
      toast.error('Errore durante l\'eliminazione dell\'epic');
    }
  };

  // Handle status change
  const handleStatusChange = async (epic: Epic, newStatus: EpicStatus) => {
    try {
      await updateEpic(epic.id, { status: newStatus });
      toast.success('Status aggiornato!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Errore durante l\'aggiornamento dello status');
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: EpicStatus) => {
    switch (status) {
      case 'backlog':
        return 'default';
      case 'in_progress':
        return 'info';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: EpicStatus) => {
    switch (status) {
      case 'backlog':
        return <ClockIcon className="h-4 w-4" />;
      case 'in_progress':
        return <RocketLaunchIcon className="h-4 w-4" />;
      case 'done':
        return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: Epic['priority']) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  // Calculate WSJF score (Business Value / Effort)
  const calculateWSJF = (epic: Epic): number => {
    if (epic.effort === 0) return 0;
    return Math.round((epic.businessValue / epic.effort) * 10) / 10;
  };

  // Filter epics by status
  const backlogEpics = epics.filter((e) => e.status === 'backlog');
  const inProgressEpics = epics.filter((e) => e.status === 'in_progress');
  const doneEpics = epics.filter((e) => e.status === 'done');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento epics...</p>
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
              <h1 className="text-3xl font-bold text-metahodos-navy">Epics</h1>
              <p className="text-metahodos-text-secondary mt-1">
                Gestisci gli epic del progetto e monitora il loro progresso
              </p>
            </div>
            <MetahodosButton
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={handleOpenCreate}
            >
              Nuovo Epic
            </MetahodosButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Totale Epics</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">{epics.length}</div>
            </div>
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Backlog</div>
              <div className="text-2xl font-bold text-metahodos-text-primary mt-1">
                {backlogEpics.length}
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700">In Progresso</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{inProgressEpics.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">Completati</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{doneEpics.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {epics.length === 0 ? (
          <MetahodosCard>
            <div className="text-center py-12">
              <RocketLaunchIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                Nessun epic ancora
              </h3>
              <p className="text-metahodos-text-secondary mb-6">
                Inizia creando il tuo primo epic per organizzare il backlog
              </p>
              <MetahodosButton
                variant="primary"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={handleOpenCreate}
              >
                Crea il tuo primo Epic
              </MetahodosButton>
            </div>
          </MetahodosCard>
        ) : (
          <div className="space-y-6">
            {/* Backlog Epics */}
            {backlogEpics.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
                  <ClockIcon className="h-6 w-6 inline mr-2" />
                  Backlog ({backlogEpics.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {backlogEpics.map((epic) => (
                    <EpicCard
                      key={epic.id}
                      epic={epic}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getPriorityBadgeVariant={getPriorityBadgeVariant}
                      calculateWSJF={calculateWSJF}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Epics */}
            {inProgressEpics.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
                  <RocketLaunchIcon className="h-6 w-6 inline mr-2" />
                  In Progresso ({inProgressEpics.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressEpics.map((epic) => (
                    <EpicCard
                      key={epic.id}
                      epic={epic}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getPriorityBadgeVariant={getPriorityBadgeVariant}
                      calculateWSJF={calculateWSJF}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Done Epics */}
            {doneEpics.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
                  <CheckCircleIcon className="h-6 w-6 inline mr-2" />
                  Completati ({doneEpics.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doneEpics.map((epic) => (
                    <EpicCard
                      key={epic.id}
                      epic={epic}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getPriorityBadgeVariant={getPriorityBadgeVariant}
                      calculateWSJF={calculateWSJF}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <MetahodosModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title={editingEpic ? 'Modifica Epic' : 'Nuovo Epic'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <MetahodosInput
            label="Titolo *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Es: Gestione utenti"
            required
          />

          {/* Description */}
          <MetahodosTextarea
            label="Descrizione"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrizione dettagliata dell'epic..."
            rows={4}
          />

          {/* Business Value */}
          <div>
            <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
              Business Value: {formData.businessValue}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.businessValue}
              onChange={(e) =>
                setFormData({ ...formData, businessValue: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-metahodos-gray-200 rounded-lg appearance-none cursor-pointer accent-metahodos-orange"
            />
            <div className="flex justify-between text-xs text-metahodos-text-muted mt-1">
              <span>Basso</span>
              <span>Alto</span>
            </div>
          </div>

          {/* Effort */}
          <div>
            <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
              Effort (complessità): {formData.effort}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={formData.effort}
              onChange={(e) => setFormData({ ...formData, effort: parseInt(e.target.value) })}
              className="w-full h-2 bg-metahodos-gray-200 rounded-lg appearance-none cursor-pointer accent-metahodos-orange"
            />
            <div className="flex justify-between text-xs text-metahodos-text-muted mt-1">
              <span>Facile</span>
              <span>Complesso</span>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
              Priorità
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['critical', 'high', 'medium', 'low'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.priority === priority
                      ? 'bg-metahodos-orange text-white'
                      : 'bg-metahodos-gray-100 text-metahodos-text-primary hover:bg-metahodos-gray-200'
                  }`}
                >
                  {priority === 'critical'
                    ? 'Critica'
                    : priority === 'high'
                    ? 'Alta'
                    : priority === 'medium'
                    ? 'Media'
                    : 'Bassa'}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
              Colore
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20 rounded border border-metahodos-gray-300 cursor-pointer"
              />
              <span className="text-sm text-metahodos-text-secondary">{formData.color}</span>
            </div>
          </div>

          {/* WSJF Preview */}
          <div className="bg-metahodos-gray-50 rounded-lg p-4">
            <div className="text-sm text-metahodos-text-secondary mb-1">WSJF Score</div>
            <div className="text-2xl font-bold text-metahodos-navy">
              {formData.effort === 0
                ? '0'
                : Math.round((formData.businessValue / formData.effort) * 10) / 10}
            </div>
            <div className="text-xs text-metahodos-text-muted mt-1">
              Business Value ({formData.businessValue}) / Effort ({formData.effort})
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <MetahodosButton type="submit" variant="primary" fullWidth>
              {editingEpic ? 'Salva modifiche' : 'Crea Epic'}
            </MetahodosButton>
            <MetahodosButton
              type="button"
              variant="outline"
              fullWidth
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Annulla
            </MetahodosButton>
          </div>
        </form>
      </MetahodosModal>
    </div>
  );
};

// Epic Card Component
interface EpicCardProps {
  epic: Epic;
  onEdit: (epic: Epic) => void;
  onDelete: (epic: Epic) => void;
  onStatusChange: (epic: Epic, status: EpicStatus) => void;
  getStatusBadgeVariant: (status: EpicStatus) => any;
  getPriorityBadgeVariant: (priority: Epic['priority']) => any;
  calculateWSJF: (epic: Epic) => number;
}

const EpicCard: React.FC<EpicCardProps> = ({
  epic,
  onEdit,
  onDelete,
  onStatusChange,
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
  calculateWSJF,
}) => {
  return (
    <MetahodosCard className="hover:shadow-deep transition-shadow">
      {/* Color bar */}
      <div
        className="h-2 -mx-6 -mt-6 mb-4 rounded-t-lg"
        style={{ backgroundColor: epic.color || '#ff6b35' }}
      />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-metahodos-navy flex-1">{epic.title}</h3>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={() => onEdit(epic)}
              className="p-1 text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              title="Modifica"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(epic)}
              className="p-1 text-metahodos-text-secondary hover:text-error transition-colors"
              title="Elimina"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {epic.description && (
          <p className="text-sm text-metahodos-text-secondary line-clamp-2">
            {epic.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <MetahodosBadge variant={getStatusBadgeVariant(epic.status)} size="sm">
            {epic.status === 'backlog'
              ? 'Backlog'
              : epic.status === 'in_progress'
              ? 'In Progresso'
              : 'Completato'}
          </MetahodosBadge>
          <MetahodosBadge variant={getPriorityBadgeVariant(epic.priority)} size="sm">
            {epic.priority === 'critical'
              ? 'Critica'
              : epic.priority === 'high'
              ? 'Alta'
              : epic.priority === 'medium'
              ? 'Media'
              : 'Bassa'}
          </MetahodosBadge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-metahodos-gray-200">
          <div>
            <div className="text-xs text-metahodos-text-muted">Value</div>
            <div className="text-sm font-semibold text-metahodos-navy">{epic.businessValue}</div>
          </div>
          <div>
            <div className="text-xs text-metahodos-text-muted">Effort</div>
            <div className="text-sm font-semibold text-metahodos-navy">{epic.effort}</div>
          </div>
          <div>
            <div className="text-xs text-metahodos-text-muted">WSJF</div>
            <div className="text-sm font-semibold text-metahodos-orange">
              {calculateWSJF(epic)}
            </div>
          </div>
        </div>

        {/* Status actions */}
        {epic.status !== 'done' && (
          <div className="pt-2">
            <MetahodosButton
              variant="outline"
              size="sm"
              fullWidth
              onClick={() =>
                onStatusChange(epic, epic.status === 'backlog' ? 'in_progress' : 'done')
              }
            >
              {epic.status === 'backlog' ? 'Avvia' : 'Completa'}
            </MetahodosButton>
          </div>
        )}
      </div>
    </MetahodosCard>
  );
};
