import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import type { VelocityDataPoint } from '../../lib/types';
import { MetahodosCard } from '../ui';

interface VelocityChartProps {
  data: VelocityDataPoint[];
  showAverage?: boolean;
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ data, showAverage = true }) => {
  if (data.length === 0) {
    return (
      <MetahodosCard>
        <h3 className="text-lg font-semibold text-metahodos-navy mb-4">Velocity Chart</h3>
        <div className="text-center py-12 text-metahodos-text-secondary">
          Nessun dato disponibile. Completa almeno uno sprint per visualizzare la velocity.
        </div>
      </MetahodosCard>
    );
  }

  // Calculate average velocity
  const averageVelocity = data.reduce((sum, point) => sum + point.completed, 0) / data.length;

  // Prepare data with average line
  const chartData = data.map(point => ({
    name: point.sprintName,
    Pianificato: point.planned,
    Completato: point.completed,
    Media: averageVelocity,
  }));

  return (
    <MetahodosCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-metahodos-navy">Velocity Chart</h3>
        <p className="text-sm text-metahodos-text-secondary mt-1">
          Story points pianificati vs completati per sprint
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#D1D5DB' }}
            label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
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
            iconType="circle"
          />
          <Bar dataKey="Pianificato" fill="#FFA500" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Completato" fill="#00D084" radius={[8, 8, 0, 0]} />
          {showAverage && (
            <Line
              type="monotone"
              dataKey="Media"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              strokeDasharray="5 5"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {showAverage && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Velocity Media:</span>{' '}
            {averageVelocity.toFixed(1)} story points per sprint
          </p>
        </div>
      )}
    </MetahodosCard>
  );
};
