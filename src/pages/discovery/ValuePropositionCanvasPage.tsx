import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosInput,
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
import { getVPCByProject, saveVPC, deleteVPC } from '../../lib/firestore-discovery';
import type { ValuePropositionCanvas } from '../../lib/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_PROJECT_ID = 'default-project';

export const ValuePropositionCanvasPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [vpc, setVpc] = useState<ValuePropositionCanvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Value Proposition Canvas',
    customerJobs: [''] as string[],
    customerPains: [''] as string[],
    customerGains: [''] as string[],
    products: [''] as string[],
    painRelievers: [''] as string[],
    gainCreators: [''] as string[],
  });

  useEffect(() => {
    const loadVPC = async () => {
      try {
        const vpcData = await getVPCByProject(DEFAULT_PROJECT_ID);
        if (vpcData) {
          setVpc(vpcData);
          setFormData({
            title: vpcData.title,
            customerJobs: vpcData.customerJobs.length > 0 ? vpcData.customerJobs : [''],
            customerPains: vpcData.customerPains.length > 0 ? vpcData.customerPains : [''],
            customerGains: vpcData.customerGains.length > 0 ? vpcData.customerGains : [''],
            products: vpcData.products.length > 0 ? vpcData.products : [''],
            painRelievers: vpcData.painRelievers.length > 0 ? vpcData.painRelievers : [''],
            gainCreators: vpcData.gainCreators.length > 0 ? vpcData.gainCreators : [''],
          });
        } else {
          setEditMode(true);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading VPC:', error);
        toast.error('Errore nel caricamento del Value Proposition Canvas');
        setLoading(false);
      }
    };
    loadVPC();
  }, []);

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Devi essere autenticato');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        customerJobs: formData.customerJobs.filter(j => j.trim() !== ''),
        customerPains: formData.customerPains.filter(p => p.trim() !== ''),
        customerGains: formData.customerGains.filter(g => g.trim() !== ''),
        products: formData.products.filter(p => p.trim() !== ''),
        painRelievers: formData.painRelievers.filter(p => p.trim() !== ''),
        gainCreators: formData.gainCreators.filter(g => g.trim() !== ''),
      };

      const savedVPC = await saveVPC(DEFAULT_PROJECT_ID, dataToSave, currentUser.uid);
      setVpc(savedVPC);
      setEditMode(false);
      toast.success('Value Proposition Canvas salvato!');
    } catch (error) {
      console.error('Error saving VPC:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare il Value Proposition Canvas?')) return;
    try {
      await deleteVPC(DEFAULT_PROJECT_ID);
      toast.success('Value Proposition Canvas eliminato');
      navigate('/discovery');
    } catch (error) {
      console.error('Error deleting VPC:', error);
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handleCancel = () => {
    if (vpc) {
      setFormData({
        title: vpc.title,
        customerJobs: vpc.customerJobs.length > 0 ? vpc.customerJobs : [''],
        customerPains: vpc.customerPains.length > 0 ? vpc.customerPains : [''],
        customerGains: vpc.customerGains.length > 0 ? vpc.customerGains : [''],
        products: vpc.products.length > 0 ? vpc.products : [''],
        painRelievers: vpc.painRelievers.length > 0 ? vpc.painRelievers : [''],
        gainCreators: vpc.gainCreators.length > 0 ? vpc.gainCreators : [''],
      });
      setEditMode(false);
    } else {
      navigate('/discovery');
    }
  };

  const updateList = (listName: keyof typeof formData, index: number, value: string) => {
    const list = [...formData[listName] as string[]];
    list[index] = value;
    setFormData({ ...formData, [listName]: list });
  };

  const addToList = (listName: keyof typeof formData) => {
    setFormData({ ...formData, [listName]: [...formData[listName] as string[], ''] });
  };

  const removeFromList = (listName: keyof typeof formData, index: number) => {
    const list = formData[listName] as string[];
    if (list.length > 1) {
      setFormData({ ...formData, [listName]: list.filter((_, i) => i !== index) });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento VPC...</p>
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
                <MetahodosInput
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              ) : (
                <h1 className="text-3xl font-bold text-metahodos-navy">{vpc?.title || formData.title}</h1>
              )}
              {vpc && !editMode && (
                <p className="text-sm text-metahodos-text-secondary mt-1">
                  Ultimo aggiornamento: {format(vpc.lastUpdated, 'dd MMM yyyy', { locale: it })}
                </p>
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
                  {vpc && (
                    <MetahodosButton variant="outline" leftIcon={<TrashIcon className="h-5 w-5" />} onClick={handleDelete}>
                      Elimina
                    </MetahodosButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Profile */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-metahodos-navy">Customer Profile</h2>

            <ListSection
              title="Customer Jobs"
              description="Cosa cercano di fare i clienti?"
              items={formData.customerJobs}
              editMode={editMode}
              onUpdate={(idx, val) => updateList('customerJobs', idx, val)}
              onAdd={() => addToList('customerJobs')}
              onRemove={(idx) => removeFromList('customerJobs', idx)}
            />

            <ListSection
              title="Pains"
              description="Quali problemi, rischi e frustrazioni hanno?"
              items={formData.customerPains}
              editMode={editMode}
              onUpdate={(idx, val) => updateList('customerPains', idx, val)}
              onAdd={() => addToList('customerPains')}
              onRemove={(idx) => removeFromList('customerPains', idx)}
            />

            <ListSection
              title="Gains"
              description="Quali benefici desiderano?"
              items={formData.customerGains}
              editMode={editMode}
              onUpdate={(idx, val) => updateList('customerGains', idx, val)}
              onAdd={() => addToList('customerGains')}
              onRemove={(idx) => removeFromList('customerGains', idx)}
            />
          </div>

          {/* Value Map */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-metahodos-navy">Value Map</h2>

            <ListSection
              title="Products & Services"
              description="Cosa offriamo?"
              items={formData.products}
              editMode={editMode}
              onUpdate={(idx, val) => updateList('products', idx, val)}
              onAdd={() => addToList('products')}
              onRemove={(idx) => removeFromList('products', idx)}
            />

            <ListSection
              title="Pain Relievers"
              description="Come alleviamo i pains?"
              items={formData.painRelievers}
              editMode={editMode}
              onUpdate={(idx, val) => updateList('painRelievers', idx, val)}
              onAdd={() => addToList('painRelievers')}
              onRemove={(idx) => removeFromList('painRelievers', idx)}
            />

            <ListSection
              title="Gain Creators"
              description="Come creiamo i gains?"
              items={formData.gainCreators}
              editMode={editMode}
              onUpdate={(idx, val) => updateList('gainCreators', idx, val)}
              onAdd={() => addToList('gainCreators')}
              onRemove={(idx) => removeFromList('gainCreators', idx)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// List Section Component
interface ListSectionProps {
  title: string;
  description: string;
  items: string[];
  editMode: boolean;
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ListSection: React.FC<ListSectionProps> = ({ title, description, items, editMode, onUpdate, onAdd, onRemove }) => {
  return (
    <MetahodosCard>
      <h3 className="text-lg font-semibold text-metahodos-navy mb-1">{title}</h3>
      <p className="text-xs text-metahodos-text-muted mb-3">{description}</p>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            {editMode ? (
              <>
                <MetahodosInput
                  value={item}
                  onChange={(e) => onUpdate(idx, e.target.value)}
                  placeholder={`${title} ${idx + 1}`}
                  className="flex-1"
                />
                <button
                  onClick={() => onRemove(idx)}
                  className="text-error hover:text-red-700 transition-colors"
                  title="Rimuovi"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="text-sm text-metahodos-text-secondary flex-1">
                {item || <span className="text-metahodos-text-muted italic">-</span>}
              </div>
            )}
          </div>
        ))}

        {editMode && (
          <MetahodosButton
            variant="outline"
            size="sm"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={onAdd}
            fullWidth
          >
            Aggiungi
          </MetahodosButton>
        )}
      </div>
    </MetahodosCard>
  );
};
