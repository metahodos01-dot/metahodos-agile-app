import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MetahodosCard } from '../ui';
import type { WorkloadItem } from '../../lib/types';

interface WorkloadChartProps {
  workload: WorkloadItem[];
}

// Role labels
const ROLE_LABELS = {
  product_owner: 'PO',
  scrum_master: 'SM',
  developer: 'Dev',
  designer: 'Des',
  qa_tester: 'QA',
  devops: 'DevOps',
  architect: 'Arch',
  other: 'Other',
};

export const WorkloadChart: React.FC<WorkloadChartProps> = ({ workload }) => {
  if (workload.length === 0) {
    return (
      <MetahodosCard>
        <h3 className="text-lg font-semibold text-metahodos-navy mb-4">
          Bilanciamento Carico di Lavoro
        </h3>
        <div className="text-center py-12 text-metahodos-text-secondary">
          Nessun dato disponibile. Seleziona uno sprint attivo.
        </div>
      </MetahodosCard>
    );
  }

  // Prepare chart data
  const chartData = workload.map(item => ({
    name: `${item.teamMemberName.split(' ')[0]} (${ROLE_LABELS[item.role]})`,
    fullName: item.teamMemberName,
    Utilizzo: Math.round(item.utilization),
    'Story Assegnate': item.assignedStories,
    'Punti Assegnati': item.assignedPoints,
    'Capacità (h)': Math.round(item.availableCapacity),
  }));

  // Calculate stats
  const totalMembers = workload.length;
  const overloadedCount = workload.filter(w => w.isOverloaded).length;
  const underutilizedCount = workload.filter(w => w.isUnderutilized).length;
  const avgUtilization = workload.reduce((sum, w) => sum + w.utilization, 0) / totalMembers;

  return (
    <MetahodosCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-metahodos-navy">
          Bilanciamento Carico di Lavoro
        </h3>
        <p className="text-sm text-metahodos-text-secondary mt-1">
          Utilizzo del team nello sprint corrente
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">Utilizzo Medio</p>
          <p className="text-xl font-bold text-blue-900 mt-1">
            {avgUtilization.toFixed(0)}%
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700">Bilanciati</p>
          <p className="text-xl font-bold text-green-900 mt-1">
            {totalMembers - overloadedCount - underutilizedCount}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700">Sovraccarichi</p>
          <p className="text-xl font-bold text-red-900 mt-1">
            {overloadedCount}
          </p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-700">Sottoutilizzati</p>
          <p className="text-xl font-bold text-yellow-900 mt-1">
            {underutilizedCount}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={{ stroke: '#D1D5DB' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#D1D5DB' }}
            label={{ value: 'Utilizzo (%)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#1F2937', fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />

          {/* Reference lines for thresholds */}
          <ReferenceLine
            y={70}
            stroke="#FCD34D"
            strokeDasharray="3 3"
            label={{ value: 'Min 70%', position: 'right', fill: '#92400E', fontSize: 10 }}
          />
          <ReferenceLine
            y={100}
            stroke="#10B981"
            strokeDasharray="3 3"
            label={{ value: 'Target 100%', position: 'right', fill: '#065F46', fontSize: 10 }}
          />

          <Bar
            dataKey="Utilizzo"
            fill="#FFA500"
            radius={[8, 8, 0, 0]}
            label={{
              position: 'top',
              formatter: (value: number) => `${value}%`,
              fill: '#1F2937',
              fontSize: 11,
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Detailed List */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-metahodos-navy mb-3">
          Dettaglio Assegnazioni
        </h4>
        {workload.map((item) => (
          <div
            key={item.teamMemberId}
            className={`p-3 rounded-lg border ${
              item.isOverloaded
                ? 'bg-red-50 border-red-200'
                : item.isUnderutilized
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-metahodos-navy">
                    {item.teamMemberName}
                  </span>
                  <span className="ml-2 text-xs text-metahodos-text-muted">
                    ({ROLE_LABELS[item.role]})
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-metahodos-text-secondary">
                  <span>{item.assignedStories} stories</span>
                  <span>{item.assignedPoints} punti</span>
                  <span>{Math.round(item.availableCapacity)}h disponibili</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${
                  item.isOverloaded
                    ? 'text-red-900'
                    : item.isUnderutilized
                    ? 'text-yellow-900'
                    : 'text-green-900'
                }`}>
                  {Math.round(item.utilization)}%
                </div>
                <div className="text-xs text-metahodos-text-muted">
                  {item.isOverloaded
                    ? 'Sovraccarico'
                    : item.isUnderutilized
                    ? 'Sottoutilizzato'
                    : 'Bilanciato'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-metahodos-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-metahodos-navy mb-2">Soglie Utilizzo:</p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
            <span className="text-metahodos-text-secondary">
              Sottoutilizzato: {'<'} 70%
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
            <span className="text-metahodos-text-secondary">
              Bilanciato: 70-100%
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
            <span className="text-metahodos-text-secondary">
              Sovraccarico: {'>'} 100%
            </span>
          </div>
        </div>
      </div>
    </MetahodosCard>
  );
};
