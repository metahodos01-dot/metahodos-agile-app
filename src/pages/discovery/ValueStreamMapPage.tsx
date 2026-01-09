import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosInput,
  MetahodosSelect,
  MetahodosTextarea,
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
import { getVSMByProject, saveVSM, deleteVSM } from '../../lib/firestore-discovery';
import type { ValueStreamMap, ProcessStep, ProcessStepType } from '../../lib/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_PROJECT_ID = 'default-project';

const STEP_TYPES: { value: ProcessStepType; label: string; color: string }[] = [
  { value: 'value_add', label: 'Valore Aggiunto', color: 'text-green-600' },
  { value: 'non_value_add', label: 'Non Valore Aggiunto', color: 'text-red-600' },
  { value: 'necessary_waste', label: 'Spreco Necessario', color: 'text-yellow-600' },
];

export const ValueStreamMapPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [vsm, setVsm] = useState<ValueStreamMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');

  const [formData, setFormData] = useState({
    title: 'Value Stream Map',
    description: '',
    currentSteps: [] as ProcessStep[],
    futureSteps: [] as ProcessStep[],
  });

  useEffect(() => {
    const loadVSM = async () => {
      try {
        const vsmData = await getVSMByProject(DEFAULT_PROJECT_ID);
        if (vsmData) {
          setVsm(vsmData);
          setFormData({
            title: vsmData.title,
            description: vsmData.description,
            currentSteps: vsmData.currentSteps.length > 0 ? vsmData.currentSteps : [createEmptyStep(0)],
            futureSteps: vsmData.futureSteps.length > 0 ? vsmData.futureSteps : [createEmptyStep(0)],
          });
        } else {
          setEditMode(true);
          setFormData({
            ...formData,
            currentSteps: [createEmptyStep(0)],
            futureSteps: [createEmptyStep(0)],
          });
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading VSM:', error);
        toast.error('Errore nel caricamento della Value Stream Map');
        setLoading(false);
      }
    };
    loadVSM();
  }, []);

  const createEmptyStep = (order: number): ProcessStep => ({
    id: `step-${Date.now()}-${order}`,
    name: '',
    type: 'value_add',
    processingTime: 0,
    leadTime: 0,
    percentAccurate: 100,
    order,
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
        currentSteps: formData.currentSteps.filter(s => s.name.trim() !== ''),
        futureSteps: formData.futureSteps.filter(s => s.name.trim() !== ''),
      };

      const savedVSM = await saveVSM(DEFAULT_PROJECT_ID, dataToSave, currentUser.uid);
      setVsm(savedVSM);
      setEditMode(false);
      toast.success('Value Stream Map salvata con successo!');
    } catch (error) {
      console.error('Error saving VSM:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare la Value Stream Map?')) return;
    try {
      await deleteVSM(DEFAULT_PROJECT_ID);
      toast.success('Value Stream Map eliminata');
      navigate('/discovery');
    } catch (error) {
      console.error('Error deleting VSM:', error);
      toast.error("Errore durante l'eliminazione");
    }
  };

  const handleCancel = () => {
    if (vsm) {
      setFormData({
        title: vsm.title,
        description: vsm.description,
        currentSteps: vsm.currentSteps.length > 0 ? vsm.currentSteps : [createEmptyStep(0)],
        futureSteps: vsm.futureSteps.length > 0 ? vsm.futureSteps : [createEmptyStep(0)],
      });
      setEditMode(false);
    } else {
      navigate('/discovery');
    }
  };

  const updateStep = (listName: 'currentSteps' | 'futureSteps', index: number, field: keyof ProcessStep, value: any) => {
    const steps = [...formData[listName]];
    steps[index] = { ...steps[index], [field]: value };
    setFormData({ ...formData, [listName]: steps });
  };

  const addStep = (listName: 'currentSteps' | 'futureSteps') => {
    const steps = [...formData[listName]];
    steps.push(createEmptyStep(steps.length));
    setFormData({ ...formData, [listName]: steps });
  };

  const removeStep = (listName: 'currentSteps' | 'futureSteps', index: number) => {
    const steps = formData[listName];
    if (steps.length > 1) {
      setFormData({ ...formData, [listName]: steps.filter((_, i) => i !== index) });
    }
  };

  const calculateMetrics = (steps: ProcessStep[]) => {
    const totalLeadTime = steps.reduce((sum, s) => sum + s.leadTime, 0);
    const totalProcessTime = steps.reduce((sum, s) => sum + s.processingTime, 0);
    const efficiency = totalLeadTime > 0 ? (totalProcessTime / totalLeadTime) * 100 : 0;
    return { totalLeadTime, totalProcessTime, efficiency };
  };

  const currentMetrics = calculateMetrics(formData.currentSteps);
  const futureMetrics = calculateMetrics(formData.futureSteps);
  const timeReduction = vsm ? ((vsm.currentTotalLeadTime - vsm.futureTotalLeadTime) / vsm.currentTotalLeadTime * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento VSM...</p>
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
                    placeholder="Descrizione del processo"
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-metahodos-navy">{vsm?.title || formData.title}</h1>
                  {vsm?.description && <p className="text-metahodos-text-secondary mt-1">{vsm.description}</p>}
                  {vsm && !editMode && (
                    <p className="text-sm text-metahodos-text-secondary mt-1">
                      Ultimo aggiornamento: {format(vsm.updatedAt, 'dd MMM yyyy', { locale: it })}
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
                  {vsm && (
                    <MetahodosButton variant="outline" leftIcon={<TrashIcon className="h-5 w-5" />} onClick={handleDelete}>
                      Elimina
                    </MetahodosButton>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Metrics Summary */}
          {vsm && !editMode && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Lead Time Attuale</p>
                <p className="text-2xl font-bold text-metahodos-navy">{vsm.currentTotalLeadTime}h</p>
              </MetahodosCard>
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Lead Time Futuro</p>
                <p className="text-2xl font-bold text-green-600">{vsm.futureTotalLeadTime}h</p>
              </MetahodosCard>
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Riduzione Tempo</p>
                <p className="text-2xl font-bold text-metahodos-orange">{timeReduction.toFixed(1)}%</p>
              </MetahodosCard>
              <MetahodosCard>
                <p className="text-sm text-metahodos-text-secondary">Efficienza Futura</p>
                <p className="text-2xl font-bold text-metahodos-navy">{vsm.efficiencyGain.toFixed(1)}%</p>
              </MetahodosCard>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-metahodos-gray-200">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'current'
                ? 'text-metahodos-orange border-b-2 border-metahodos-orange'
                : 'text-metahodos-text-secondary hover:text-metahodos-navy'
            }`}
          >
            Stato Attuale
          </button>
          <button
            onClick={() => setActiveTab('future')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'future'
                ? 'text-metahodos-orange border-b-2 border-metahodos-orange'
                : 'text-metahodos-text-secondary hover:text-metahodos-navy'
            }`}
          >
            Stato Futuro
          </button>
        </div>

        {/* Process Steps */}
        <ProcessStepsList
          steps={activeTab === 'current' ? formData.currentSteps : formData.futureSteps}
          listName={activeTab === 'current' ? 'currentSteps' : 'futureSteps'}
          editMode={editMode}
          onUpdate={updateStep}
          onAdd={addStep}
          onRemove={removeStep}
          metrics={activeTab === 'current' ? currentMetrics : futureMetrics}
        />
      </div>
    </div>
  );
};

// Process Steps List Component
interface ProcessStepsListProps {
  steps: ProcessStep[];
  listName: 'currentSteps' | 'futureSteps';
  editMode: boolean;
  onUpdate: (listName: 'currentSteps' | 'futureSteps', index: number, field: keyof ProcessStep, value: any) => void;
  onAdd: (listName: 'currentSteps' | 'futureSteps') => void;
  onRemove: (listName: 'currentSteps' | 'futureSteps', index: number) => void;
  metrics: { totalLeadTime: number; totalProcessTime: number; efficiency: number };
}

const ProcessStepsList: React.FC<ProcessStepsListProps> = ({
  steps,
  listName,
  editMode,
  onUpdate,
  onAdd,
  onRemove,
  metrics,
}) => {
  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetahodosCard>
          <p className="text-xs text-metahodos-text-muted">Lead Time Totale</p>
          <p className="text-xl font-bold text-metahodos-navy">{metrics.totalLeadTime}h</p>
        </MetahodosCard>
        <MetahodosCard>
          <p className="text-xs text-metahodos-text-muted">Process Time Totale</p>
          <p className="text-xl font-bold text-metahodos-navy">{metrics.totalProcessTime}h</p>
        </MetahodosCard>
        <MetahodosCard>
          <p className="text-xs text-metahodos-text-muted">Efficienza</p>
          <p className="text-xl font-bold text-metahodos-orange">{metrics.efficiency.toFixed(1)}%</p>
        </MetahodosCard>
      </div>

      {/* Steps Table */}
      <MetahodosCard>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.id} className="border-b border-metahodos-gray-100 pb-3 last:border-0">
              {editMode ? (
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3">
                    <MetahodosInput
                      value={step.name}
                      onChange={(e) => onUpdate(listName, idx, 'name', e.target.value)}
                      placeholder="Nome step"
                    />
                  </div>
                  <div className="col-span-2">
                    <MetahodosSelect
                      value={step.type}
                      onChange={(e) => onUpdate(listName, idx, 'type', e.target.value)}
                      options={STEP_TYPES.map(t => ({ value: t.value, label: t.label }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <MetahodosInput
                      type="number"
                      value={step.processingTime}
                      onChange={(e) => onUpdate(listName, idx, 'processingTime', Number(e.target.value))}
                      placeholder="PT (h)"
                    />
                  </div>
                  <div className="col-span-2">
                    <MetahodosInput
                      type="number"
                      value={step.leadTime}
                      onChange={(e) => onUpdate(listName, idx, 'leadTime', Number(e.target.value))}
                      placeholder="LT (h)"
                    />
                  </div>
                  <div className="col-span-2">
                    <MetahodosInput
                      type="number"
                      value={step.percentAccurate}
                      onChange={(e) => onUpdate(listName, idx, 'percentAccurate', Number(e.target.value))}
                      placeholder="%"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => onRemove(listName, idx)}
                      className="text-error hover:text-red-700 transition-colors"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4 text-sm">
                  <div className="col-span-3 font-medium text-metahodos-navy">
                    {step.name || <span className="text-metahodos-text-muted italic">-</span>}
                  </div>
                  <div className="col-span-2">
                    <span className={STEP_TYPES.find(t => t.value === step.type)?.color}>
                      {STEP_TYPES.find(t => t.value === step.type)?.label}
                    </span>
                  </div>
                  <div className="col-span-2 text-metahodos-text-secondary">{step.processingTime}h</div>
                  <div className="col-span-2 text-metahodos-text-secondary">{step.leadTime}h</div>
                  <div className="col-span-2 text-metahodos-text-secondary">{step.percentAccurate}%</div>
                </div>
              )}
            </div>
          ))}

          {editMode && (
            <MetahodosButton
              variant="outline"
              size="sm"
              leftIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => onAdd(listName)}
              fullWidth
            >
              Aggiungi Step
            </MetahodosButton>
          )}
        </div>
      </MetahodosCard>
    </div>
  );
};
