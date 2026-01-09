import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosModal,
  MetahodosButton,
  MetahodosInput,
  MetahodosTextarea,
  MetahodosSelect,
  type SelectOption,
} from '../ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  createStory,
  updateStory,
  type CreateStoryData,
  type UpdateStoryData,
} from '../../lib/firestore-backlog';
import type { Story, Epic, MoscowPriority, StoryStatus } from '../../lib/types';
import toast from 'react-hot-toast';

interface StoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  epics: Epic[];
  story?: Story | null; // If provided, we're editing
  onSuccess?: () => void;
}

export const StoryFormModal: React.FC<StoryFormModalProps> = ({
  isOpen,
  onClose,
  projectId,
  epics,
  story,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acceptanceCriteria: [''],
    epicId: '',
    storyPoints: '',
    moscowPriority: '' as MoscowPriority | '',
    status: 'backlog' as StoryStatus,
    tags: [] as string[],
    tagInput: '',
  });

  // Load story data when editing
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        description: story.description,
        acceptanceCriteria:
          story.acceptanceCriteria.length > 0 ? story.acceptanceCriteria : [''],
        epicId: story.epicId || '',
        storyPoints: story.storyPoints?.toString() || '',
        moscowPriority: story.moscowPriority || '',
        status: story.status,
        tags: story.tags || [],
        tagInput: '',
      });
    } else {
      resetForm();
    }
  }, [story]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      acceptanceCriteria: [''],
      epicId: '',
      storyPoints: '',
      moscowPriority: '',
      status: 'backlog',
      tags: [],
      tagInput: '',
    });
  };

  // Handle acceptance criteria
  const addAcceptanceCriterion = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [...formData.acceptanceCriteria, ''],
    });
  };

  const removeAcceptanceCriterion = (index: number) => {
    const newCriteria = formData.acceptanceCriteria.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      acceptanceCriteria: newCriteria.length > 0 ? newCriteria : [''],
    });
  };

  const updateAcceptanceCriterion = (index: number, value: string) => {
    const newCriteria = [...formData.acceptanceCriteria];
    newCriteria[index] = value;
    setFormData({
      ...formData,
      acceptanceCriteria: newCriteria,
    });
  };

  // Handle tags
  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
        tagInput: '',
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Handle submit
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

    // Filter out empty acceptance criteria
    const validCriteria = formData.acceptanceCriteria.filter((c) => c.trim() !== '');

    setLoading(true);
    try {
      if (story) {
        // Update existing story
        const updates: UpdateStoryData = {
          title: formData.title,
          description: formData.description,
          acceptanceCriteria: validCriteria,
          epicId: formData.epicId || null,
          storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : undefined,
          moscowPriority: formData.moscowPriority || undefined,
          status: formData.status,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        };
        await updateStory(story.id, updates);
        toast.success('Story aggiornata con successo!');
      } else {
        // Create new story
        const storyData: CreateStoryData = {
          title: formData.title,
          description: formData.description,
          acceptanceCriteria: validCriteria,
          epicId: formData.epicId || undefined,
          storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : undefined,
          moscowPriority: formData.moscowPriority || undefined,
          tags: formData.tags.length > 0 ? formData.tags : undefined,
        };
        await createStory(projectId, storyData, currentUser.uid);
        toast.success('Story creata con successo!');
      }

      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Errore durante il salvataggio della story');
    } finally {
      setLoading(false);
    }
  };

  // Select options
  const epicOptions: SelectOption[] = [
    { value: '', label: 'Nessun epic' },
    ...epics.map((epic) => ({
      value: epic.id,
      label: epic.title,
    })),
  ];

  const moscowOptions: SelectOption[] = [
    { value: '', label: 'Non assegnata' },
    { value: 'must_have', label: 'Must Have - Essenziale' },
    { value: 'should_have', label: 'Should Have - Importante' },
    { value: 'could_have', label: 'Could Have - Desiderabile' },
    { value: 'wont_have', label: 'Won\'t Have - Futuro' },
  ];

  const storyPointsOptions: SelectOption[] = [
    { value: '', label: 'Non stimata' },
    { value: '1', label: '1 - Molto semplice' },
    { value: '2', label: '2 - Semplice' },
    { value: '3', label: '3 - Media' },
    { value: '5', label: '5 - Complessa' },
    { value: '8', label: '8 - Molto complessa' },
    { value: '13', label: '13 - Estremamente complessa' },
    { value: '21', label: '21 - Da dividere' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'ready', label: 'Pronta' },
    { value: 'in_sprint', label: 'In Sprint' },
    { value: 'in_progress', label: 'In Corso' },
    { value: 'review', label: 'In Revisione' },
    { value: 'done', label: 'Completata' },
  ];

  return (
    <MetahodosModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        if (!story) resetForm();
      }}
      title={story ? 'Modifica Story' : 'Nuova Story'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <MetahodosInput
          label="Titolo *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Es: Come utente, voglio poter..."
          required
          disabled={loading}
        />

        {/* Description (User Story format) */}
        <MetahodosTextarea
          label="Descrizione (User Story)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={`Come [tipo di utente]
Voglio [obiettivo/desiderio]
In modo da [beneficio/valore]

Esempio:
Come Product Owner
Voglio poter visualizzare le metriche di sprint
In modo da valutare il progresso del team`}
          rows={6}
          helperText="Utilizza il formato: Come... Voglio... In modo da..."
          disabled={loading}
        />

        {/* Acceptance Criteria */}
        <div>
          <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
            Criteri di Accettazione
          </label>
          <div className="space-y-2">
            {formData.acceptanceCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-1">
                  <MetahodosInput
                    value={criterion}
                    onChange={(e) => updateAcceptanceCriterion(index, e.target.value)}
                    placeholder={`Criterio ${index + 1}`}
                    disabled={loading}
                  />
                </div>
                {formData.acceptanceCriteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAcceptanceCriterion(index)}
                    className="mt-2 p-2 text-error hover:bg-red-50 rounded transition-colors"
                    disabled={loading}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <MetahodosButton
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={addAcceptanceCriterion}
            className="mt-2"
            disabled={loading}
          >
            Aggiungi criterio
          </MetahodosButton>
        </div>

        {/* Epic and Status row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetahodosSelect
            label="Epic"
            options={epicOptions}
            value={formData.epicId}
            onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
            disabled={loading}
          />
          {story && (
            <MetahodosSelect
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as StoryStatus })
              }
              disabled={loading}
            />
          )}
        </div>

        {/* Story Points and MoSCoW row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetahodosSelect
            label="Story Points (Fibonacci)"
            options={storyPointsOptions}
            value={formData.storyPoints}
            onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
            helperText="Stima della complessità (1, 2, 3, 5, 8, 13, 21)"
            disabled={loading}
          />
          <MetahodosSelect
            label="Priorità MoSCoW"
            options={moscowOptions}
            value={formData.moscowPriority}
            onChange={(e) =>
              setFormData({
                ...formData,
                moscowPriority: e.target.value as MoscowPriority | '',
              })
            }
            helperText="Must, Should, Could, Won't Have"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-metahodos-text-primary mb-2">
            Tags
          </label>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-metahodos-orange/10 text-metahodos-orange"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-metahodos-orange-dark"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex space-x-2">
            <div className="flex-1">
              <MetahodosInput
                value={formData.tagInput}
                onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Aggiungi tag (premi Enter)"
                disabled={loading}
              />
            </div>
            <MetahodosButton
              type="button"
              variant="outline"
              onClick={addTag}
              disabled={loading || !formData.tagInput.trim()}
            >
              Aggiungi
            </MetahodosButton>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-metahodos-gray-200">
          <MetahodosButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            {story ? 'Salva modifiche' : 'Crea Story'}
          </MetahodosButton>
          <MetahodosButton
            type="button"
            variant="outline"
            fullWidth
            onClick={() => {
              onClose();
              if (!story) resetForm();
            }}
            disabled={loading}
          >
            Annulla
          </MetahodosButton>
        </div>
      </form>
    </MetahodosModal>
  );
};
