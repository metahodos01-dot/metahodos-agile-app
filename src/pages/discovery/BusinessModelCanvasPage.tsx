import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MetahodosButton,
  MetahodosCard,
  MetahodosInput,
  MetahodosTextarea,
} from '../../components/ui';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getBMCByProject, saveBMC, deleteBMC } from '../../lib/firestore-discovery';
import type { BusinessModelCanvas } from '../../lib/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const DEFAULT_PROJECT_ID = 'default-project';

interface BMCSection {
  id: keyof Omit<BusinessModelCanvas, 'id' | 'projectId' | 'title' | 'lastUpdated' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  title: string;
  placeholder: string;
  question: string;
}

const BMC_SECTIONS: BMCSection[] = [
  {
    id: 'keyPartnerships',
    title: 'Partnership Chiave',
    placeholder: 'Chi sono i nostri partner chiave? Chi sono i nostri fornitori chiave?',
    question: 'Chi ci aiuta a realizzare la nostra proposta di valore?',
  },
  {
    id: 'keyActivities',
    title: 'Attività Chiave',
    placeholder: 'Quali attività chiave richiede la nostra proposta di valore?',
    question: 'Cosa facciamo per creare e distribuire valore?',
  },
  {
    id: 'keyResources',
    title: 'Risorse Chiave',
    placeholder: 'Quali risorse chiave richiede la nostra proposta di valore?',
    question: 'Di cosa abbiamo bisogno per operare?',
  },
  {
    id: 'valuePropositions',
    title: 'Proposte di Valore',
    placeholder: 'Quale valore offriamo ai clienti? Quale problema risolviamo?',
    question: 'Perché i clienti scelgono noi?',
  },
  {
    id: 'customerRelationships',
    title: 'Relazioni con i Clienti',
    placeholder: 'Che tipo di relazione manteniamo con i clienti?',
    question: 'Come interagiamo con i nostri clienti?',
  },
  {
    id: 'channels',
    title: 'Canali',
    placeholder: 'Attraverso quali canali raggiungiamo i clienti?',
    question: 'Come consegnamo la nostra proposta di valore?',
  },
  {
    id: 'customerSegments',
    title: 'Segmenti di Clientela',
    placeholder: 'Per chi creiamo valore? Chi sono i nostri clienti più importanti?',
    question: 'Chi sono i nostri clienti?',
  },
  {
    id: 'costStructure',
    title: 'Struttura dei Costi',
    placeholder: 'Quali sono i costi più importanti? Quali risorse/attività sono più costose?',
    question: 'Quanto ci costa operare?',
  },
  {
    id: 'revenueStreams',
    title: 'Flussi di Ricavi',
    placeholder: 'Per quale valore i clienti sono disposti a pagare? Come pagano?',
    question: 'Come guadagniamo?',
  },
];

export const BusinessModelCanvasPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [bmc, setBmc] = useState<BusinessModelCanvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: 'Business Model Canvas',
    keyPartnerships: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: '',
  });

  // Load BMC
  useEffect(() => {
    const loadBMC = async () => {
      try {
        console.log('Loading BMC for project:', DEFAULT_PROJECT_ID);
        const bmcData = await getBMCByProject(DEFAULT_PROJECT_ID);

        if (bmcData) {
          console.log('BMC loaded:', bmcData);
          setBmc(bmcData);
          setFormData({
            title: bmcData.title,
            keyPartnerships: bmcData.keyPartnerships,
            keyActivities: bmcData.keyActivities,
            keyResources: bmcData.keyResources,
            valuePropositions: bmcData.valuePropositions,
            customerRelationships: bmcData.customerRelationships,
            channels: bmcData.channels,
            customerSegments: bmcData.customerSegments,
            costStructure: bmcData.costStructure,
            revenueStreams: bmcData.revenueStreams,
          });
        } else {
          console.log('No BMC found, starting in edit mode');
          setEditMode(true);
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error loading BMC:', error);
        toast.error('Errore nel caricamento del Business Model Canvas');
        setLoading(false);
      }
    };

    loadBMC();
  }, []);

  // Handle save
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
      const savedBMC = await saveBMC(DEFAULT_PROJECT_ID, formData, currentUser.uid);
      setBmc(savedBMC);
      setEditMode(false);
      toast.success('Business Model Canvas salvato con successo!');
    } catch (error) {
      console.error('Error saving BMC:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare il Business Model Canvas?')) {
      return;
    }

    try {
      await deleteBMC(DEFAULT_PROJECT_ID);
      toast.success('Business Model Canvas eliminato');
      navigate('/discovery');
    } catch (error) {
      console.error('Error deleting BMC:', error);
      toast.error('Errore durante l\'eliminazione');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (bmc) {
      // Restore original data
      setFormData({
        title: bmc.title,
        keyPartnerships: bmc.keyPartnerships,
        keyActivities: bmc.keyActivities,
        keyResources: bmc.keyResources,
        valuePropositions: bmc.valuePropositions,
        customerRelationships: bmc.customerRelationships,
        channels: bmc.channels,
        customerSegments: bmc.customerSegments,
        costStructure: bmc.costStructure,
        revenueStreams: bmc.revenueStreams,
      });
      setEditMode(false);
    } else {
      // No BMC exists, go back
      navigate('/discovery');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento Business Model Canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back button */}
          <MetahodosButton
            variant="ghost"
            leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => navigate('/discovery')}
            className="mb-4"
            size="sm"
          >
            Torna a Discovery
          </MetahodosButton>

          {/* Title */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editMode ? (
                <MetahodosInput
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titolo del canvas"
                  className="text-2xl font-bold"
                />
              ) : (
                <h1 className="text-3xl font-bold text-metahodos-navy">{bmc?.title || formData.title}</h1>
              )}
              {bmc && !editMode && (
                <p className="text-sm text-metahodos-text-secondary mt-1">
                  Ultimo aggiornamento: {format(bmc.lastUpdated, 'dd MMM yyyy, HH:mm', { locale: it })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 ml-4">
              {editMode ? (
                <>
                  <MetahodosButton
                    variant="primary"
                    leftIcon={<CheckIcon className="h-5 w-5" />}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Salvataggio...' : 'Salva'}
                  </MetahodosButton>
                  <MetahodosButton
                    variant="outline"
                    leftIcon={<XMarkIcon className="h-5 w-5" />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Annulla
                  </MetahodosButton>
                </>
              ) : (
                <>
                  <MetahodosButton
                    variant="primary"
                    leftIcon={<PencilIcon className="h-5 w-5" />}
                    onClick={() => setEditMode(true)}
                  >
                    Modifica
                  </MetahodosButton>
                  {bmc && (
                    <MetahodosButton
                      variant="outline"
                      leftIcon={<TrashIcon className="h-5 w-5" />}
                      onClick={handleDelete}
                    >
                      Elimina
                    </MetahodosButton>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content - BMC Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BMC_SECTIONS.map((section) => (
            <BMCSection
              key={section.id}
              section={section}
              value={formData[section.id]}
              onChange={(value) => setFormData({ ...formData, [section.id]: value })}
              editMode={editMode}
            />
          ))}
        </div>

        {/* Help */}
        {!bmc && !editMode && (
          <MetahodosCard className="mt-8">
            <div className="text-center py-8">
              <p className="text-metahodos-text-secondary">
                Nessun Business Model Canvas creato. Clicca "Modifica" per iniziare.
              </p>
            </div>
          </MetahodosCard>
        )}
      </div>
    </div>
  );
};

// BMC Section Component
interface BMCSectionProps {
  section: BMCSection;
  value: string;
  onChange: (value: string) => void;
  editMode: boolean;
}

const BMCSection: React.FC<BMCSectionProps> = ({ section, value, onChange, editMode }) => {
  return (
    <MetahodosCard className="h-full">
      <h3 className="text-lg font-semibold text-metahodos-navy mb-2">{section.title}</h3>
      <p className="text-xs text-metahodos-text-muted mb-3">{section.question}</p>

      {editMode ? (
        <MetahodosTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={section.placeholder}
          rows={6}
          className="text-sm"
        />
      ) : (
        <div className="text-sm text-metahodos-text-secondary whitespace-pre-wrap min-h-[150px]">
          {value || <span className="text-metahodos-text-muted italic">Nessun contenuto</span>}
        </div>
      )}
    </MetahodosCard>
  );
};
