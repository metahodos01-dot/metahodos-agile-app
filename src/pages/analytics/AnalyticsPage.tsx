import React, { useState, useEffect } from 'react';
import {
  MetahodosCard,
  MetahodosSelect,
} from '../../components/ui';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { VelocityChart } from '../../components/analytics/VelocityChart';
import { BurndownChart } from '../../components/analytics/BurndownChart';
import {
  getVelocityData,
  getBurndownData,
  getTeamMetrics,
  getEpicProgress,
} from '../../lib/firestore-analytics';
import { getSprintsByProject } from '../../lib/firestore-sprint';
import type {
  VelocityDataPoint,
  BurndownDataPoint,
  TeamMetrics,
  EpicProgress,
  Sprint,
} from '../../lib/types';
import toast from 'react-hot-toast';

const DEFAULT_PROJECT_ID = 'default-project';

export const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [velocityData, setVelocityData] = useState<VelocityDataPoint[]>([]);
  const [burndownData, setBurndownData] = useState<BurndownDataPoint[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [epicProgress, setEpicProgress] = useState<EpicProgress[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (selectedSprintId) {
      loadBurndownData(selectedSprintId);
    }
  }, [selectedSprintId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [velocity, team, epics, sprintsData] = await Promise.all([
        getVelocityData(DEFAULT_PROJECT_ID),
        getTeamMetrics(DEFAULT_PROJECT_ID),
        getEpicProgress(DEFAULT_PROJECT_ID),
        getSprintsByProject(DEFAULT_PROJECT_ID),
      ]);

      setVelocityData(velocity);
      setTeamMetrics(team);
      setEpicProgress(epics);
      setSprints(sprintsData);

      // Auto-select active sprint or most recent
      const activeSprint = sprintsData.find(s => s.status === 'active');
      const targetSprint = activeSprint || sprintsData[sprintsData.length - 1];

      if (targetSprint) {
        setSelectedSprintId(targetSprint.id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Errore nel caricamento delle analytics');
      setLoading(false);
    }
  };

  const loadBurndownData = async (sprintId: string) => {
    try {
      const burndown = await getBurndownData(sprintId);
      setBurndownData(burndown);
    } catch (error) {
      console.error('Error loading burndown data:', error);
      toast.error('Errore nel caricamento del burndown');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento analytics...</p>
        </div>
      </div>
    );
  }

  const selectedSprint = sprints.find(s => s.id === selectedSprintId);

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-metahodos-navy flex items-center">
                <ChartBarIcon className="h-8 w-8 mr-3 text-metahodos-orange" />
                Analytics & Reporting
              </h1>
              <p className="text-metahodos-text-secondary mt-1">
                Metriche, grafici e insights sul progetto
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          {teamMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <MetahodosCard className="bg-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Sprint Completati</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {teamMetrics.totalSprints}
                    </p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-green-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-green-700">Velocity Media</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {teamMetrics.averageVelocity.toFixed(1)}
                    </p>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-orange-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-orange-700">Story Points Totali</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {teamMetrics.totalStoryPoints}
                    </p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
              </MetahodosCard>

              <MetahodosCard className="bg-purple-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-purple-700">Completion Rate</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {teamMetrics.averageCompletionRate.toFixed(0)}%
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-purple-600" />
                </div>
              </MetahodosCard>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Velocity Chart */}
        <VelocityChart data={velocityData} showAverage={true} />

        {/* Burndown Chart */}
        <div>
          <div className="mb-4">
            <MetahodosSelect
              label="Seleziona Sprint"
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              options={sprints.map(sprint => ({
                value: sprint.id,
                label: `${sprint.name} ${sprint.status === 'active' ? '(Attivo)' : ''}`,
              }))}
            />
          </div>
          <BurndownChart
            data={burndownData}
            sprintName={selectedSprint?.name}
          />
        </div>

        {/* Epic Progress */}
        {epicProgress.length > 0 && (
          <MetahodosCard>
            <h3 className="text-lg font-semibold text-metahodos-navy mb-4">
              Progresso Epic
            </h3>
            <div className="space-y-4">
              {epicProgress.map(epic => (
                <div key={epic.epicId}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-metahodos-navy">{epic.epicName}</p>
                      <p className="text-sm text-metahodos-text-secondary">
                        {epic.completedStoriesCount} / {epic.storiesCount} stories ({epic.completedPoints} / {epic.totalPoints} punti)
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-metahodos-orange">
                      {epic.progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-metahodos-gray-200 rounded-full h-2">
                    <div
                      className="bg-metahodos-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${epic.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </MetahodosCard>
        )}

        {/* Empty State */}
        {velocityData.length === 0 && (
          <MetahodosCard>
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                Nessun Dato Disponibile
              </h3>
              <p className="text-metahodos-text-secondary max-w-md mx-auto">
                Completa almeno uno sprint per visualizzare le metriche e i grafici di analytics.
              </p>
            </div>
          </MetahodosCard>
        )}
      </div>
    </div>
  );
};
