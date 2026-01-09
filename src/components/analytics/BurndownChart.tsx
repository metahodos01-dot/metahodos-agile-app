import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { BurndownDataPoint } from '../../lib/types';
import { MetahodosCard } from '../ui';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface BurndownChartProps {
  data: BurndownDataPoint[];
  sprintName?: string;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data, sprintName }) => {
  if (data.length === 0) {
    return (
      <MetahodosCard>
        <h3 className="text-lg font-semibold text-metahodos-navy mb-4">
          Sprint Burndown Chart
        </h3>
        <div className="text-center py-12 text-metahodos-text-secondary">
          Nessun dato disponibile per questo sprint.
        </div>
      </MetahodosCard>
    );
  }

  // Prepare chart data
  const chartData = data.map(point => ({
    day: `Giorno ${point.day}`,
    date: format(point.date, 'dd MMM', { locale: it }),
    Ideale: Math.round(point.ideal),
    Attuale: Math.round(point.actual),
    Rimanente: Math.round(point.remaining),
  }));

  // Get current status
  const lastPoint = data[data.length - 1];
  const isOnTrack = lastPoint.actual <= lastPoint.ideal;
  const today = new Date();
  const currentDayIndex = data.findIndex(point => {
    const pointDate = new Date(point.date);
    return pointDate.toDateString() === today.toDateString();
  });

  return (
    <MetahodosCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-metahodos-navy">
          Sprint Burndown Chart
          {sprintName && <span className="text-metahodos-text-secondary ml-2">- {sprintName}</span>}
        </h3>
        <p className="text-sm text-metahodos-text-secondary mt-1">
          Andamento lavoro rimanente rispetto alla linea ideale
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
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
            iconType="line"
          />
          {currentDayIndex >= 0 && (
            <ReferenceLine
              x={chartData[currentDayIndex].date}
              stroke="#9CA3AF"
              strokeDasharray="3 3"
              label={{ value: 'Oggi', position: 'top', fill: '#6B7280' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="Ideale"
            stroke="#94A3B8"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="Attuale"
            stroke={isOnTrack ? '#00D084' : '#EF4444'}
            strokeWidth={3}
            dot={{ fill: isOnTrack ? '#00D084' : '#EF4444', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className={`p-3 rounded-lg ${isOnTrack ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs text-metahodos-text-muted">Status</p>
          <p className={`text-sm font-semibold ${isOnTrack ? 'text-green-900' : 'text-red-900'}`}>
            {isOnTrack ? 'In Linea' : 'In Ritardo'}
          </p>
        </div>
        <div className="p-3 bg-metahodos-gray-50 rounded-lg">
          <p className="text-xs text-metahodos-text-muted">Lavoro Rimanente</p>
          <p className="text-sm font-semibold text-metahodos-navy">
            {Math.round(lastPoint.remaining)} punti
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-metahodos-text-muted">Giorni Rimanenti</p>
          <p className="text-sm font-semibold text-blue-900">
            {Math.max(0, data.length - currentDayIndex - 1)} giorni
          </p>
        </div>
      </div>
    </MetahodosCard>
  );
};
