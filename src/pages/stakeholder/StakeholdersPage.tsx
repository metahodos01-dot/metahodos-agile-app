import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  FunnelIcon,
  ChartBarIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { MetahodosCard, MetahodosButton, MetahodosSelect } from '../../components/ui';
import { StakeholderCard } from '../../components/stakeholder/StakeholderCard';
import { StakeholderFormModal } from '../../components/stakeholder/StakeholderFormModal';
import { PowerInterestMatrix } from '../../components/stakeholder/PowerInterestMatrix';
import {
  getStakeholdersByProject,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
  getStakeholderAnalysis,
} from '../../lib/firestore-stakeholder';
import { useAuth } from '../../contexts/AuthContext';
import type { Stakeholder, StakeholderAnalysis } from '../../lib/types';
import toast from 'react-hot-toast';

const DEFAULT_PROJECT_ID = 'default-project';

type ViewMode = 'cards' | 'matrix';

export const StakeholdersPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [analysis, setAnalysis] = useState<StakeholderAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    try {
      setLoading(true);
      const [stakeholdersData, analysisData] = await Promise.all([
        getStakeholdersByProject(DEFAULT_PROJECT_ID),
        getStakeholderAnalysis(DEFAULT_PROJECT_ID),
      ]);

      setStakeholders(stakeholdersData);
      setAnalysis(analysisData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Errore nel caricamento degli stakeholder');
      setLoading(false);
    }
  };

  const handleCreateStakeholder = async (
    stakeholderData: Omit<Stakeholder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>
  ) => {
    try {
      setFormLoading(true);
      await createStakeholder(DEFAULT_PROJECT_ID, stakeholderData, currentUser?.uid || 'anonymous');
      toast.success('Stakeholder creato con successo');
      await loadStakeholders();
      setIsFormModalOpen(false);
      setFormLoading(false);
    } catch (error) {
      console.error('Error creating stakeholder:', error);
      toast.error('Errore nella creazione dello stakeholder');
      setFormLoading(false);
    }
  };

  const handleUpdateStakeholder = async (
    stakeholderData: Omit<Stakeholder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>
  ) => {
    if (!editingStakeholder) return;

    try {
      setFormLoading(true);
      await updateStakeholder(editingStakeholder.id, stakeholderData);
      toast.success('Stakeholder aggiornato con successo');
      await loadStakeholders();
      setIsFormModalOpen(false);
      setEditingStakeholder(null);
      setFormLoading(false);
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast.error("Errore nell'aggiornamento dello stakeholder");
      setFormLoading(false);
    }
  };

  const handleDeleteStakeholder = async (stakeholderId: string) => {
    try {
      await deleteStakeholder(stakeholderId);
      toast.success('Stakeholder eliminato con successo');
      await loadStakeholders();
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast.error("Errore nell'eliminazione dello stakeholder");
    }
  };

  const handleEditClick = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingStakeholder(null);
  };

  // Apply filters
  const filteredStakeholders = stakeholders.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (strategyFilter !== 'all' && s.engagementStrategy !== strategyFilter) return false;
    if (sentimentFilter !== 'all' && s.sentiment !== sentimentFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento stakeholder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-metahodos-navy flex items-center">
                <UserGroupIcon className="h-8 w-8 mr-3 text-metahodos-orange" />
                Stakeholder Management
              </h1>
              <p className="text-metahodos-text-secondary mt-1">
                Gestisci gli stakeholder del progetto e le strategie di coinvolgimento
              </p>
            </div>

            <MetahodosButton
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setIsFormModalOpen(true)}
            >
              Nuovo Stakeholder
            </MetahodosButton>
          </div>

          {/* KPI Cards */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetahodosCard className="bg-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Totale Stakeholder</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {analysis.totalStakeholders}
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-orange-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Gestisci Attentamente</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {analysis.matrix.highPowerHighInterest}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-green-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-green-700">Champion/Supporter</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {analysis.bySentiment
                        .filter((s) => s.sentiment === 'champion' || s.sentiment === 'supporter')
                        .reduce((sum, s) => sum + s.count, 0)}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-purple-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Categorie Uniche</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {analysis.byCategory.length}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
              </MetahodosCard>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-metahodos-gray-600" />
            <MetahodosSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tutte le Categorie' },
                { value: 'sponsor', label: 'Sponsor' },
                { value: 'user', label: 'Utente' },
                { value: 'decision_maker', label: 'Decision Maker' },
                { value: 'influencer', label: 'Influencer' },
                { value: 'team_member', label: 'Team Member' },
                { value: 'vendor', label: 'Vendor' },
                { value: 'other', label: 'Altro' },
              ]}
            />
            <MetahodosSelect
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tutte le Strategie' },
                { value: 'manage_closely', label: 'Gestisci Attentamente' },
                { value: 'keep_satisfied', label: 'Mantieni Soddisfatto' },
                { value: 'keep_informed', label: 'Mantieni Informato' },
                { value: 'monitor', label: 'Monitora' },
              ]}
            />
            <MetahodosSelect
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tutti i Sentiment' },
                { value: 'champion', label: 'Champion' },
                { value: 'supporter', label: 'Supporter' },
                { value: 'neutral', label: 'Neutrale' },
                { value: 'skeptic', label: 'Scettico' },
                { value: 'blocker', label: 'Blocker' },
              ]}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white border border-metahodos-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${
                viewMode === 'cards'
                  ? 'bg-metahodos-orange text-white'
                  : 'text-metahodos-gray-600 hover:bg-metahodos-gray-50'
              }`}
              title="Vista Schede"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-2 rounded ${
                viewMode === 'matrix'
                  ? 'bg-metahodos-orange text-white'
                  : 'text-metahodos-gray-600 hover:bg-metahodos-gray-50'
              }`}
              title="Matrice Potere/Interesse"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'cards' ? (
          <>
            {/* Cards Grid */}
            {filteredStakeholders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStakeholders.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteStakeholder}
                  />
                ))}
              </div>
            ) : (
              <MetahodosCard>
                <div className="text-center py-12">
                  <UserGroupIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                    {stakeholders.length === 0
                      ? 'Nessuno Stakeholder'
                      : 'Nessun Risultato'}
                  </h3>
                  <p className="text-metahodos-text-secondary max-w-md mx-auto">
                    {stakeholders.length === 0
                      ? 'Inizia aggiungendo il primo stakeholder del progetto.'
                      : 'Nessuno stakeholder corrisponde ai filtri selezionati.'}
                  </p>
                  {stakeholders.length === 0 && (
                    <MetahodosButton
                      variant="primary"
                      leftIcon={<PlusIcon className="h-5 w-5" />}
                      onClick={() => setIsFormModalOpen(true)}
                      className="mt-4"
                    >
                      Crea Primo Stakeholder
                    </MetahodosButton>
                  )}
                </div>
              </MetahodosCard>
            )}
          </>
        ) : (
          /* Matrix View */
          <PowerInterestMatrix
            stakeholders={filteredStakeholders}
            onStakeholderClick={handleEditClick}
          />
        )}
      </div>

      {/* Stakeholder Form Modal */}
      <StakeholderFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingStakeholder ? handleUpdateStakeholder : handleCreateStakeholder}
        stakeholder={editingStakeholder}
        loading={formLoading}
      />
    </div>
  );
};
