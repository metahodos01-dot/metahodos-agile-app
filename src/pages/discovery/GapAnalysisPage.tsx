import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosInput,
  MetahodosTextarea,
  MetahodosSelect,
} from '../../components/ui';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { getGATByProject, saveGAT, deleteGAT } from '../../lib/firestore-discovery';
import type { GapAnalysis, GapItem, ActionItem } from '../../lib/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_PROJECT_ID = 'default-project';

const IMPACTS = [
  { value: 'critical', label: 'Critico', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Basso', color: 'bg-green-100 text-green-800' },
];

const PRIORITIES = [
  { value: 'critical', label: 'Critica', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Bassa', color: 'bg-green-100 text-green-800' },
];

const STATUSES = [
  { value: 'planned', label: 'Pianificata', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Corso', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completata', color: 'bg-green-100 text-green-800' },
];

export const GapAnalysisPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [gat, setGat] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Gap Analysis',
    description: '',
    currentState: '',
    futureState: '',
    gaps: [] as GapItem[],
    actions: [] as ActionItem[],
  });

  useEffect(() => {
    const loadGAT = async () => {
      try {
        const gatData = await getGATByProject(DEFAULT_PROJECT_ID);
        if (gatData) {
          setGat(gatData);
          setFormData({
            title: gatData.title,
            description: gatData.description,
            currentState: gatData.currentState,
            futureState: gatData.futureState,
            gaps: gatData.gaps.length > 0 ? gatData.gaps : [createEmptyGap()],
            actions: gatData.actions.length > 0 ? gatData.actions : [createEmptyAction()],
          });
        } else {
          setEditMode(true);
          setFormData({
            ...formData,
            gaps: [createEmptyGap()],
            actions: [createEmptyAction()],
          });
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading GAT:', error);
        toast.error('Errore nel caricamento della Gap Analysis');
        setLoading(false);
      }
    };
    loadGAT();
  }, []);

  const createEmptyGap = (): GapItem => ({
    id: `gap-${Date.now()}`,
    category: '',
    description: '',
    impact: 'medium',
  });

  const createEmptyAction = (): ActionItem => ({
    id: `action-${Date.now()}`,
    title: '',
    description: '',
    priority: 'medium',
    status: 'planned',
    owner: '',
  });

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Devi essere autenticato');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Il titolo è obbligatorio');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        title: formData.title,
        description: formData.description,
        currentState: formData.currentState,
        futureState: formData.futureState,
        gaps: formData.gaps.filter(g => g.description.trim() !== ''),
        actions: formData.actions.filter(a => a.description.trim() !== ''),
      };

      const savedGAT = await saveGAT(DEFAULT_PROJECT_ID, dataToSave, currentUser.uid);
      setGat(savedGAT);
      setEditMode(false);
      toast.success('Gap Analysis salvata con successo!');
    } catch (error) {
      console.error('Error saving GAT:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare la Gap Analysis?')) return;
    try {
      await deleteGAT(DEFAULT_PROJECT_ID);
      toast.success('Gap Analysis eliminata');
      navigate('/discovery');
    } catch (error) {
      console.error('Error deleting GAT:', error);
      toast.error("Errore durante l'eliminazione");
    }
  };

  const handleCancel = () => {
    if (gat) {
      setFormData({
        title: gat.title,
        description: gat.description,
        currentState: gat.currentState,
        futureState: gat.futureState,
        gaps: gat.gaps.length > 0 ? gat.gaps : [createEmptyGap()],
        actions: gat.actions.length > 0 ? gat.actions : [createEmptyAction()],
      });
      setEditMode(false);
    } else {
      navigate('/discovery');
    }
  };

  const updateGap = (index: number, field: keyof GapItem, value: any) => {
    const gaps = [...formData.gaps];
    gaps[index] = { ...gaps[index], [field]: value };
    setFormData({ ...formData, gaps });
  };

  const addGap = () => {
    setFormData({ ...formData, gaps: [...formData.gaps, createEmptyGap()] });
  };

  const removeGap = (index: number) => {
    if (formData.gaps.length > 1) {
      setFormData({ ...formData, gaps: formData.gaps.filter((_, i) => i !== index) });
    }
  };

  const updateAction = (index: number, field: keyof ActionItem, value: any) => {
    const actions = [...formData.actions];
    actions[index] = { ...actions[index], [field]: value };
    setFormData({ ...formData, actions });
  };

  const addAction = () => {
    setFormData({ ...formData, actions: [...formData.actions, createEmptyAction()] });
  };

  const removeAction = (index: number) => {
    if (formData.actions.length > 1) {
      setFormData({ ...formData, actions: formData.actions.filter((_, i) => i !== index) });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento Gap Analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <MetahodosButton
            variant="ghost"
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => navigate('/discovery')}
            className="mb-4"
            size="sm"
          >
            Torna a Discovery
          </MetahodosButton>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-2">
                  <MetahodosInput
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <MetahodosTextarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrizione dell'analisi"
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-metahodos-navy">{gat?.title || formData.title}</h1>
                  {gat?.description && <p className="text-metahodos-text-secondary mt-1">{gat.description}</p>}
                  {gat && !editMode && (
                    <p className="text-sm text-metahodos-text-secondary mt-1">
                      Ultimo aggiornamento: {format(gat.updatedAt, 'dd MMM yyyy', { locale: it })}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              {editMode ? (
                <>
                  <MetahodosButton variant="primary" leftIcon={<CheckIcon className="h-5 w-5" />} onClick={handleSave} disabled={saving}>
                    {saving ? 'Salvataggio...' : 'Salva'}
                  </MetahodosButton>
                  <MetahodosButton variant="outline" leftIcon={<XMarkIcon className="h-5 w-5" />} onClick={handleCancel} disabled={saving}>
                    Annulla
                  </MetahodosButton>
                </>
              ) : (
                <>
                  <MetahodosButton variant="primary" leftIcon={<PencilIcon className="h-5 w-5" />} onClick={() => setEditMode(true)}>
                    Modifica
                  </MetahodosButton>
                  {gat && (
                    <MetahodosButton variant="outline" leftIcon={<TrashIcon className="h-5 w-5" />} onClick={handleDelete}>
                      Elimina
                    </MetahodosButton>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          {gat && !editMode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Gap Identificati</p>
                <p className="text-2xl font-bold text-metahodos-navy">{gat.gaps.length}</p>
              </MetahodosCard>
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Azioni Totali</p>
                <p className="text-2xl font-bold text-metahodos-navy">{gat.actions.length}</p>
              </MetahodosCard>
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Azioni Completate</p>
                <p className="text-2xl font-bold text-green-600">
                  {gat.actions.filter(a => a.status === 'completed').length}
                </p>
              </MetahodosCard>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Current vs Future State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetahodosCard>
            <h2 className="text-xl font-bold text-metahodos-navy mb-3">Stato Attuale</h2>
            {editMode ? (
              <MetahodosTextarea
                value={formData.currentState}
                onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
                placeholder="Descrivi lo stato attuale del processo/sistema"
                rows={6}
              />
            ) : (
              <p className="text-metahodos-text-secondary whitespace-pre-wrap">
                {gat?.currentState || <span className="text-metahodos-text-muted italic">Nessun contenuto</span>}
              </p>
            )}
          </MetahodosCard>

          <MetahodosCard>
            <h2 className="text-xl font-bold text-metahodos-navy mb-3">Stato Futuro Desiderato</h2>
            {editMode ? (
              <MetahodosTextarea
                value={formData.futureState}
                onChange={(e) => setFormData({ ...formData, futureState: e.target.value })}
                placeholder="Descrivi lo stato futuro desiderato"
                rows={6}
              />
            ) : (
              <p className="text-metahodos-text-secondary whitespace-pre-wrap">
                {gat?.futureState || <span className="text-metahodos-text-muted italic">Nessun contenuto</span>}
              </p>
            )}
          </MetahodosCard>
        </div>

        {/* Gaps Section */}
        <MetahodosCard>
          <h2 className="text-xl font-bold text-metahodos-navy mb-4">Gap Identificati</h2>
          <div className="space-y-3">
            {formData.gaps.map((gap, idx) => (
              <div key={gap.id} className="border border-metahodos-gray-200 rounded-lg p-4">
                {editMode ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <MetahodosInput
                          value={gap.category}
                          onChange={(e) => updateGap(idx, 'category', e.target.value)}
                          placeholder="Categoria (es: Processo, Tecnologia, Persone...)"
                        />
                        <MetahodosTextarea
                          value={gap.description}
                          onChange={(e) => updateGap(idx, 'description', e.target.value)}
                          placeholder="Descrizione del gap"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => removeGap(idx)}
                        className="text-error hover:text-red-700 transition-colors mt-2"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <MetahodosSelect
                      label="Impatto"
                      value={gap.impact}
                      onChange={(e) => updateGap(idx, 'impact', e.target.value)}
                      options={IMPACTS.map(i => ({ value: i.value, label: i.label }))}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {gap.category && (
                          <p className="text-xs text-metahodos-text-muted mb-1">{gap.category}</p>
                        )}
                        <p className="text-metahodos-navy font-medium">
                          {gap.description || <span className="text-metahodos-text-muted italic">-</span>}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        IMPACTS.find(i => i.value === gap.impact)?.color
                      }`}>
                        {IMPACTS.find(i => i.value === gap.impact)?.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {editMode && (
              <MetahodosButton
                variant="outline"
                size="sm"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={addGap}
                fullWidth
              >
                Aggiungi Gap
              </MetahodosButton>
            )}
          </div>
        </MetahodosCard>

        {/* Action Items Section */}
        <MetahodosCard>
          <h2 className="text-xl font-bold text-metahodos-navy mb-4">Piano d'Azione</h2>
          <div className="space-y-3">
            {formData.actions.map((action, idx) => (
              <div key={action.id} className="border border-metahodos-gray-200 rounded-lg p-4">
                {editMode ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <MetahodosInput
                          value={action.title}
                          onChange={(e) => updateAction(idx, 'title', e.target.value)}
                          placeholder="Titolo dell'azione"
                        />
                        <MetahodosTextarea
                          value={action.description}
                          onChange={(e) => updateAction(idx, 'description', e.target.value)}
                          placeholder="Descrizione dettagliata"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => removeAction(idx)}
                        className="text-error hover:text-red-700 transition-colors mt-2"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <MetahodosInput
                        label="Responsabile"
                        value={action.owner || ''}
                        onChange={(e) => updateAction(idx, 'owner', e.target.value)}
                        placeholder="Nome"
                      />
                      <MetahodosInput
                        label="Scadenza"
                        type="date"
                        value={action.dueDate ? format(action.dueDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => updateAction(idx, 'dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                      />
                      <MetahodosSelect
                        label="Priorità"
                        value={action.priority}
                        onChange={(e) => updateAction(idx, 'priority', e.target.value)}
                        options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
                      />
                      <MetahodosSelect
                        label="Stato"
                        value={action.status}
                        onChange={(e) => updateAction(idx, 'status', e.target.value)}
                        options={STATUSES.map(s => ({ value: s.value, label: s.label }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-metahodos-navy font-medium">
                          {action.title || <span className="text-metahodos-text-muted italic">-</span>}
                        </p>
                        {action.description && (
                          <p className="text-sm text-metahodos-text-secondary mt-1">{action.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          PRIORITIES.find(p => p.value === action.priority)?.color
                        }`}>
                          {PRIORITIES.find(p => p.value === action.priority)?.label}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          STATUSES.find(s => s.value === action.status)?.color
                        }`}>
                          {STATUSES.find(s => s.value === action.status)?.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-metahodos-text-secondary">
                      {action.owner && <span><span className="font-medium">Responsabile:</span> {action.owner}</span>}
                      {action.dueDate && <span><span className="font-medium">Scadenza:</span> {format(action.dueDate, 'dd MMM yyyy', { locale: it })}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {editMode && (
              <MetahodosButton
                variant="outline"
                size="sm"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                onClick={addAction}
                fullWidth
              >
                Aggiungi Azione
              </MetahodosButton>
            )}
          </div>
        </MetahodosCard>
      </div>
    </div>
  );
};
