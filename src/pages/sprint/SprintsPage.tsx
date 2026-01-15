import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CalendarIcon,
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  getSprintsByProject,
  createSprint,
  updateSprint,
  deleteSprint,
  type CreateSprintData,
  type UpdateSprintData,
} from '../../lib/firestore-sprint';
import type { Sprint, SprintStatus } from '../../lib/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Temporary hardcoded projectId - will be replaced with actual project selection later
const DEFAULT_PROJECT_ID = 'default-project';

export const SprintsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSprintData>({
    name: '',
    goal: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    capacity: 20,
    status: 'planning',
  });

  // Load sprints
  useEffect(() => {
    const loadSprints = async () => {
      try {
        console.log('Loading sprints for project:', DEFAULT_PROJECT_ID);
        const sprintsList = await getSprintsByProject(DEFAULT_PROJECT_ID);
        console.log('Sprints loaded:', sprintsList.length);
        setSprints(sprintsList);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading sprints:', error);
        toast.error('Errore nel caricamento degli sprint. Controlla la console per dettagli.');
        setLoading(false);
      }
    };

    loadSprints();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      goal: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      capacity: 20,
      status: 'planning',
    });
    setEditingSprint(null);
  };

  // Open create modal
  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (sprint: Sprint) => {
    setFormData({
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      capacity: sprint.capacity,
      status: sprint.status,
    });
    setEditingSprint(sprint);
    setShowCreateModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Devi essere autenticato');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Il nome dello sprint è obbligatorio');
      return;
    }

    if (!formData.goal.trim()) {
      toast.error('L\'obiettivo dello sprint è obbligatorio');
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error('La data di fine deve essere successiva alla data di inizio');
      return;
    }

    if (formData.capacity <= 0) {
      toast.error('La capacità deve essere maggiore di zero');
      return;
    }

    // Check if trying to set status to 'active' and there's already an active sprint
    if (formData.status === 'active') {
      const activeSprint = sprints.find((s) => s.status === 'active' && s.id !== editingSprint?.id);
      if (activeSprint) {
        toast.error(
          `Esiste già uno sprint attivo: "${activeSprint.name}". Completa o annulla quello prima di attivarne un altro.`
        );
        return;
      }
    }

    try {
      if (editingSprint) {
        // Update existing sprint
        const updates: UpdateSprintData = {
          name: formData.name,
          goal: formData.goal,
          startDate: formData.startDate,
          endDate: formData.endDate,
          capacity: formData.capacity,
          status: formData.status,
        };
        await updateSprint(editingSprint.id, updates);
        toast.success('Sprint aggiornato con successo!');

        // Reload sprints to get updated data
        const sprintsList = await getSprintsByProject(DEFAULT_PROJECT_ID);
        setSprints(sprintsList);
      } else {
        // Create new sprint
        await createSprint(DEFAULT_PROJECT_ID, formData, currentUser.uid);
        toast.success('Sprint creato con successo!');

        // Reload sprints
        const sprintsList = await getSprintsByProject(DEFAULT_PROJECT_ID);
        setSprints(sprintsList);
      }

      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving sprint:', error);
      toast.error('Errore durante il salvataggio dello sprint');
    }
  };

  // Handle delete
  const handleDelete = async (sprint: Sprint) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare "${sprint.name}"? Le story verranno rimosse dallo sprint e riportate al backlog.`
      )
    ) {
      return;
    }

    try {
      await deleteSprint(sprint.id, true); // Remove stories from sprint
      toast.success('Sprint eliminato con successo!');

      // Reload sprints
      const sprintsList = await getSprintsByProject(DEFAULT_PROJECT_ID);
      setSprints(sprintsList);
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast.error('Errore durante l\'eliminazione dello sprint');
    }
  };

  // Navigate to sprint detail
  const handleSprintClick = (sprint: Sprint) => {
    navigate(`/sprint/${sprint.id}`);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: SprintStatus) => {
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


  // Get status label
  const getStatusLabel = (status: SprintStatus) => {
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

  // Calculate sprint statistics
  const activeSprints = sprints.filter((s) => s.status === 'active');
  const planningSprints = sprints.filter((s) => s.status === 'planning');
  const completedSprints = sprints.filter((s) => s.status === 'completed');
  const averageVelocity =
    completedSprints.length > 0
      ? Math.round(
          completedSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / completedSprints.length
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento sprints...</p>
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
              <h1 className="text-3xl font-bold text-metahodos-navy">Sprints</h1>
              <p className="text-metahodos-text-secondary mt-1">
                Gestisci gli sprint del progetto e monitora il loro progresso
              </p>
            </div>
            <MetahodosButton
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={handleOpenCreate}
            >
              Nuovo Sprint
            </MetahodosButton>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Totale Sprints</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">{sprints.length}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-700">Sprint Attivo</div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">
                {activeSprints.length > 0 ? '1' : '0'}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">Completati</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{completedSprints.length}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700">Velocity Media</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {averageVelocity} <span className="text-base font-normal">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {sprints.length === 0 ? (
          <MetahodosCard>
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                Nessuno sprint ancora
              </h3>
              <p className="text-metahodos-text-secondary mb-6">
                Inizia creando il tuo primo sprint per organizzare il lavoro del team
              </p>
              <MetahodosButton
                variant="primary"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={handleOpenCreate}
              >
                Crea il tuo primo Sprint
              </MetahodosButton>
            </div>
          </MetahodosCard>
        ) : (
          <div className="space-y-6">
            {/* Active Sprint (highlighted) */}
            {activeSprints.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
                  <BoltIcon className="h-6 w-6 inline mr-2 text-yellow-600" />
                  Sprint Attivo
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {activeSprints.map((sprint) => (
                    <SprintCard
                      key={sprint.id}
                      sprint={sprint}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onClick={handleSprintClick}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getStatusLabel={getStatusLabel}
                      highlighted
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Planning Sprints */}
            {planningSprints.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
                  <ClockIcon className="h-6 w-6 inline mr-2" />
                  In Pianificazione ({planningSprints.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planningSprints.map((sprint) => (
                    <SprintCard
                      key={sprint.id}
                      sprint={sprint}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onClick={handleSprintClick}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getStatusLabel={getStatusLabel}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Sprints */}
            {completedSprints.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
                  <CheckCircleIcon className="h-6 w-6 inline mr-2" />
                  Completati ({completedSprints.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedSprints.map((sprint) => (
                    <SprintCard
                      key={sprint.id}
                      sprint={sprint}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                      onClick={handleSprintClick}
                      getStatusBadgeVariant={getStatusBadgeVariant}
                      getStatusLabel={getStatusLabel}
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
        title={editingSprint ? 'Modifica Sprint' : 'Nuovo Sprint'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <MetahodosInput
            label="Nome Sprint *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Es: Sprint 1, Sprint Gennaio 2024"
            required
          />

          {/* Goal */}
          <MetahodosTextarea
            label="Obiettivo Sprint *"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            placeholder="Descrivi l'obiettivo principale dello sprint..."
            rows={3}
            required
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
                Data Inizio *
              </label>
              <input
                type="date"
                value={format(formData.startDate, 'yyyy-MM-dd')}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: new Date(e.target.value) })
                }
                className="w-full px-3 py-2 border border-metahodos-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metahodos-orange focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
                Data Fine *
              </label>
              <input
                type="date"
                value={format(formData.endDate, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-metahodos-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metahodos-orange focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
              Capacità (Story Points): {formData.capacity}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full h-2 bg-metahodos-gray-200 rounded-lg appearance-none cursor-pointer accent-metahodos-orange"
            />
            <div className="flex justify-between text-xs text-metahodos-text-muted mt-1">
              <span>5 pts</span>
              <span>100 pts</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
              Stato Sprint
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['planning', 'active'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.status === status
                      ? 'bg-metahodos-orange text-white'
                      : 'bg-metahodos-gray-100 text-metahodos-text-primary hover:bg-metahodos-gray-200'
                  }`}
                >
                  {status === 'planning' ? 'In Pianificazione' : 'Attivo'}
                </button>
              ))}
            </div>
            <p className="text-xs text-metahodos-text-muted mt-2">
              Nota: Solo uno sprint può essere attivo alla volta
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <MetahodosButton type="submit" variant="primary" fullWidth>
              {editingSprint ? 'Salva modifiche' : 'Crea Sprint'}
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

// Sprint Card Component
interface SprintCardProps {
  sprint: Sprint;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprint: Sprint) => void;
  onClick: (sprint: Sprint) => void;
  getStatusBadgeVariant: (status: SprintStatus) => any;
  getStatusLabel: (status: SprintStatus) => string;
  highlighted?: boolean;
}

const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  onEdit,
  onDelete,
  onClick,
  getStatusBadgeVariant,
  getStatusLabel,
  highlighted = false,
}) => {
  const daysRemaining = Math.ceil(
    (sprint.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isActive = sprint.status === 'active';

  return (
    <MetahodosCard
      className={`hover:shadow-deep transition-shadow cursor-pointer ${
        highlighted ? 'ring-2 ring-yellow-400 shadow-lg' : ''
      }`}
      onClick={() => onClick(sprint)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-metahodos-navy">{sprint.name}</h3>
            {highlighted && (
              <p className="text-xs text-yellow-600 font-medium mt-1">Sprint Corrente</p>
            )}
          </div>
          <div className="flex space-x-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(sprint);
              }}
              className="p-1 text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              title="Modifica"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sprint);
              }}
              className="p-1 text-metahodos-text-secondary hover:text-error transition-colors"
              title="Elimina"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Goal */}
        <p className="text-sm text-metahodos-text-secondary line-clamp-2">{sprint.goal}</p>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          <MetahodosBadge variant={getStatusBadgeVariant(sprint.status)} size="sm">
            {getStatusLabel(sprint.status)}
          </MetahodosBadge>
          {sprint.status === 'completed' && sprint.velocity && (
            <MetahodosBadge variant="info" size="sm">
              Velocity: {sprint.velocity} pts
            </MetahodosBadge>
          )}
        </div>

        {/* Dates and Days Remaining */}
        <div className="text-sm text-metahodos-text-secondary space-y-1">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              {format(sprint.startDate, 'dd MMM yyyy', { locale: it })} -{' '}
              {format(sprint.endDate, 'dd MMM yyyy', { locale: it })}
            </span>
          </div>
          {isActive && (
            <div
              className={`flex items-center ${
                daysRemaining <= 2 ? 'text-error font-medium' : ''
              }`}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>
                {daysRemaining > 0
                  ? `${daysRemaining} giorni rimanenti`
                  : daysRemaining === 0
                  ? 'Ultimo giorno!'
                  : 'Sprint scaduto'}
              </span>
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="pt-2 border-t border-metahodos-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-metahodos-text-muted">Capacità</span>
            <span className="text-sm font-semibold text-metahodos-navy">
              {sprint.capacity} <span className="font-normal">pts</span>
            </span>
          </div>
        </div>
      </div>
    </MetahodosCard>
  );
};
