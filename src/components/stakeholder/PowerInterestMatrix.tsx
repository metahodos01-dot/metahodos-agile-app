import React from 'react';
import { MetahodosCard } from '../ui';
import type { Stakeholder } from '../../lib/types';

interface PowerInterestMatrixProps {
  stakeholders: Stakeholder[];
  onStakeholderClick?: (stakeholder: Stakeholder) => void;
}

interface QuadrantProps {
  title: string;
  subtitle: string;
  stakeholders: Stakeholder[];
  bgColor: string;
  textColor: string;
  onStakeholderClick?: (stakeholder: Stakeholder) => void;
}

const Quadrant: React.FC<QuadrantProps> = ({
  title,
  subtitle,
  stakeholders,
  bgColor,
  textColor,
  onStakeholderClick,
}) => {
  return (
    <div className={`${bgColor} p-4 rounded-lg border-2 ${textColor} min-h-[200px]`}>
      <div className="mb-3">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs opacity-80 mt-0.5">{subtitle}</p>
        <p className="text-xs font-medium mt-1">({stakeholders.length} stakeholder)</p>
      </div>

      <div className="space-y-2">
        {stakeholders.map((stakeholder) => (
          <div
            key={stakeholder.id}
            onClick={() => onStakeholderClick?.(stakeholder)}
            className="bg-white p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
          >
            <p className="text-xs font-medium text-metahodos-navy truncate">
              {stakeholder.name}
            </p>
            <p className="text-xs text-metahodos-text-secondary truncate">
              {stakeholder.role}
            </p>
          </div>
        ))}

        {stakeholders.length === 0 && (
          <p className="text-xs opacity-60 italic">Nessuno stakeholder</p>
        )}
      </div>
    </div>
  );
};

export const PowerInterestMatrix: React.FC<PowerInterestMatrixProps> = ({
  stakeholders,
  onStakeholderClick,
}) => {
  // Categorize stakeholders by power and interest
  const manageClosely = stakeholders.filter(
    (s) => s.powerLevel === 'high' && s.interestLevel === 'high'
  );

  const keepSatisfied = stakeholders.filter(
    (s) => s.powerLevel === 'high' && s.interestLevel !== 'high'
  );

  const keepInformed = stakeholders.filter(
    (s) => s.powerLevel !== 'high' && s.interestLevel === 'high'
  );

  const monitor = stakeholders.filter(
    (s) => s.powerLevel !== 'high' && s.interestLevel !== 'high'
  );

  return (
    <MetahodosCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-metahodos-navy">
          Matrice Potere/Interesse
        </h3>
        <p className="text-sm text-metahodos-text-secondary mt-1">
          Visualizzazione strategica degli stakeholder
        </p>
      </div>

      {/* Matrix Container */}
      <div className="relative">
        {/* Axis Labels */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 -rotate-90">
          <div className="text-center">
            <p className="text-xs font-semibold text-metahodos-gray-600">POTERE</p>
            <div className="flex items-center justify-between mt-1 w-[200px]">
              <span className="text-xs text-metahodos-gray-500">Basso</span>
              <span className="text-xs text-metahodos-gray-500">Alto</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-2">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <span className="text-xs text-metahodos-gray-500">Basso</span>
            <p className="text-xs font-semibold text-metahodos-gray-600">INTERESSE</p>
            <span className="text-xs text-metahodos-gray-500">Alto</span>
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Left: Keep Satisfied (High Power, Low Interest) */}
          <Quadrant
            title="Mantieni Soddisfatto"
            subtitle="Alto potere, basso interesse"
            stakeholders={keepSatisfied}
            bgColor="bg-purple-50"
            textColor="border-purple-300"
            onStakeholderClick={onStakeholderClick}
          />

          {/* Top Right: Manage Closely (High Power, High Interest) */}
          <Quadrant
            title="Gestisci Attentamente"
            subtitle="Alto potere, alto interesse"
            stakeholders={manageClosely}
            bgColor="bg-orange-50"
            textColor="border-orange-300"
            onStakeholderClick={onStakeholderClick}
          />

          {/* Bottom Left: Monitor (Low Power, Low Interest) */}
          <Quadrant
            title="Monitora"
            subtitle="Basso potere, basso interesse"
            stakeholders={monitor}
            bgColor="bg-gray-50"
            textColor="border-gray-300"
            onStakeholderClick={onStakeholderClick}
          />

          {/* Bottom Right: Keep Informed (Low Power, High Interest) */}
          <Quadrant
            title="Mantieni Informato"
            subtitle="Basso potere, alto interesse"
            stakeholders={keepInformed}
            bgColor="bg-blue-50"
            textColor="border-blue-300"
            onStakeholderClick={onStakeholderClick}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-metahodos-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-metahodos-navy mb-2">Strategia di Coinvolgimento:</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start">
            <div className="w-3 h-3 bg-orange-400 rounded mr-2 mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-metahodos-navy">Gestisci Attentamente</p>
              <p className="text-metahodos-text-muted">Coinvolgimento massimo, comunicazione frequente</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-3 h-3 bg-purple-400 rounded mr-2 mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-metahodos-navy">Mantieni Soddisfatto</p>
              <p className="text-metahodos-text-muted">Soddisfa i bisogni ma non sovraccaricare</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-3 h-3 bg-blue-400 rounded mr-2 mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-metahodos-navy">Mantieni Informato</p>
              <p className="text-metahodos-text-muted">Informazioni regolari, mostrano interesse</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-3 h-3 bg-gray-400 rounded mr-2 mt-0.5 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-metahodos-navy">Monitora</p>
              <p className="text-metahodos-text-muted">Monitoraggio minimo, comunicazione efficiente</p>
            </div>
          </div>
        </div>
      </div>
    </MetahodosCard>
  );
};
