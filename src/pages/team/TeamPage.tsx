import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChartBarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { MetahodosCard, MetahodosButton, MetahodosSelect } from '../../components/ui';
import { TeamMemberCard } from '../../components/team/TeamMemberCard';
import { TeamMemberFormModal } from '../../components/team/TeamMemberFormModal';
import { SkillMatrix } from '../../components/team/SkillMatrix';
import { WorkloadChart } from '../../components/team/WorkloadChart';
import {
  getTeamMembersByProject,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getTeamAnalytics,
  getCurrentSprintWorkload,
  calculatePersonalVelocity,
} from '../../lib/firestore-team';
import { getSprintsByProject } from '../../lib/firestore-sprint';
import { useAuth } from '../../contexts/AuthContext';
import type { TeamMember, TeamAnalytics, WorkloadItem, Sprint } from '../../lib/types';
import toast from 'react-hot-toast';

const DEFAULT_PROJECT_ID = 'default-project';

type ViewMode = 'cards' | 'skills' | 'workload';

export const TeamPage: React.FC = () => {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [workload, setWorkload] = useState<WorkloadItem[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [membersData, analyticsData, sprintsData] = await Promise.all([
        getTeamMembersByProject(DEFAULT_PROJECT_ID),
        getTeamAnalytics(DEFAULT_PROJECT_ID),
        getSprintsByProject(DEFAULT_PROJECT_ID),
      ]);

      setMembers(membersData);
      setAnalytics(analyticsData);

      // Find active sprint
      const active = sprintsData.find(s => s.status === 'active');
      setActiveSprint(active || null);

      // Load workload if there's an active sprint
      if (active) {
        const workloadData = await getCurrentSprintWorkload(DEFAULT_PROJECT_ID, active.id);
        setWorkload(workloadData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Errore nel caricamento del team');
      setLoading(false);
    }
  };

  const handleCreateMember = async (
    memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>
  ) => {
    try {
      setFormLoading(true);
      await createTeamMember(DEFAULT_PROJECT_ID, memberData, currentUser?.uid || 'anonymous');
      toast.success('Membro aggiunto al team con successo');
      await loadTeamData();
      setIsFormModalOpen(false);
      setFormLoading(false);
    } catch (error) {
      console.error('Error creating team member:', error);
      toast.error("Errore nell'aggiunta del membro");
      setFormLoading(false);
    }
  };

  const handleUpdateMember = async (
    memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>
  ) => {
    if (!editingMember) return;

    try {
      setFormLoading(true);

      // Calculate personal velocity
      const velocity = await calculatePersonalVelocity(editingMember.id);

      await updateTeamMember(editingMember.id, {
        ...memberData,
        personalVelocity: velocity,
      });

      toast.success('Membro aggiornato con successo');
      await loadTeamData();
      setIsFormModalOpen(false);
      setEditingMember(null);
      setFormLoading(false);
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error("Errore nell'aggiornamento del membro");
      setFormLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteTeamMember(memberId);
      toast.success('Membro rimosso dal team');
      await loadTeamData();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Errore nella rimozione del membro');
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingMember(null);
  };

  // Apply filters
  const filteredMembers = members.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento team...</p>
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
                Team Management
              </h1>
              <p className="text-metahodos-text-secondary mt-1">
                Gestisci il team, le competenze e il carico di lavoro
              </p>
            </div>

            <MetahodosButton
              variant="primary"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setIsFormModalOpen(true)}
            >
              Aggiungi Membro
            </MetahodosButton>
          </div>

          {/* KPI Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetahodosCard className="bg-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Totale Membri</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {analytics.totalMembers}
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-green-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-green-700">Membri Attivi</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {analytics.activeMembers}
                    </p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-green-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-orange-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Capacità Settimanale</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {Math.round(analytics.totalWeeklyCapacity)}h
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-purple-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Velocity Team</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {analytics.teamVelocity.toFixed(1)}
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tutti i Ruoli' },
                { value: 'product_owner', label: 'Product Owner' },
                { value: 'scrum_master', label: 'Scrum Master' },
                { value: 'developer', label: 'Developer' },
                { value: 'designer', label: 'Designer' },
                { value: 'qa_tester', label: 'QA Tester' },
                { value: 'devops', label: 'DevOps' },
                { value: 'architect', label: 'Architect' },
                { value: 'other', label: 'Altro' },
              ]}
            />
            <MetahodosSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tutti gli Stati' },
                { value: 'active', label: 'Attivi' },
                { value: 'inactive', label: 'Inattivi' },
                { value: 'on_leave', label: 'In Ferie' },
              ]}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white border border-metahodos-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded flex items-center ${
                viewMode === 'cards'
                  ? 'bg-metahodos-orange text-white'
                  : 'text-metahodos-gray-600 hover:bg-metahodos-gray-50'
              }`}
              title="Vista Schede"
            >
              <ListBulletIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Schede</span>
            </button>
            <button
              onClick={() => setViewMode('skills')}
              className={`p-2 rounded flex items-center ${
                viewMode === 'skills'
                  ? 'bg-metahodos-orange text-white'
                  : 'text-metahodos-gray-600 hover:bg-metahodos-gray-50'
              }`}
              title="Matrice Skill"
            >
              <AcademicCapIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Skills</span>
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`p-2 rounded flex items-center ${
                viewMode === 'workload'
                  ? 'bg-metahodos-orange text-white'
                  : 'text-metahodos-gray-600 hover:bg-metahodos-gray-50'
              }`}
              title="Workload"
              disabled={!activeSprint}
            >
              <Squares2X2Icon className="h-5 w-5 mr-1" />
              <span className="text-sm">Workload</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'cards' && (
          <>
            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteMember}
                  />
                ))}
              </div>
            ) : (
              <MetahodosCard>
                <div className="text-center py-12">
                  <UserGroupIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                    {members.length === 0 ? 'Nessun Membro nel Team' : 'Nessun Risultato'}
                  </h3>
                  <p className="text-metahodos-text-secondary max-w-md mx-auto">
                    {members.length === 0
                      ? 'Inizia aggiungendo il primo membro al team.'
                      : 'Nessun membro corrisponde ai filtri selezionati.'}
                  </p>
                  {members.length === 0 && (
                    <MetahodosButton
                      variant="primary"
                      leftIcon={<PlusIcon className="h-5 w-5" />}
                      onClick={() => setIsFormModalOpen(true)}
                      className="mt-4"
                    >
                      Aggiungi Primo Membro
                    </MetahodosButton>
                  )}
                </div>
              </MetahodosCard>
            )}
          </>
        )}

        {viewMode === 'skills' && <SkillMatrix members={filteredMembers} />}

        {viewMode === 'workload' && (
          <>
            {activeSprint ? (
              <WorkloadChart workload={workload} />
            ) : (
              <MetahodosCard>
                <div className="text-center py-12">
                  <ChartBarIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                    Nessuno Sprint Attivo
                  </h3>
                  <p className="text-metahodos-text-secondary max-w-md mx-auto">
                    Avvia uno sprint per visualizzare il carico di lavoro del team.
                  </p>
                </div>
              </MetahodosCard>
            )}
          </>
        )}
      </div>

      {/* Team Member Form Modal */}
      <TeamMemberFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
        member={editingMember}
        loading={formLoading}
      />
    </div>
  );
};
