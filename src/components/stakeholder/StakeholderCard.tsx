import React from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { MetahodosCard, MetahodosBadge } from '../ui';
import type { Stakeholder } from '../../lib/types';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholderId: string) => void;
  onClick?: (stakeholder: Stakeholder) => void;
}

// Category labels and colors (using MetahodosBadge variants)
const CATEGORY_CONFIG = {
  sponsor: { label: 'Sponsor', color: 'primary' as const },
  user: { label: 'Utente', color: 'info' as const },
  decision_maker: { label: 'Decision Maker', color: 'warning' as const },
  influencer: { label: 'Influencer', color: 'info' as const },
  team_member: { label: 'Team Member', color: 'success' as const },
  vendor: { label: 'Vendor', color: 'secondary' as const },
  other: { label: 'Altro', color: 'default' as const },
};

// Sentiment labels and colors
const SENTIMENT_CONFIG = {
  champion: { label: 'Champion', color: 'success' as const },
  supporter: { label: 'Supporter', color: 'success' as const },
  neutral: { label: 'Neutrale', color: 'default' as const },
  skeptic: { label: 'Scettico', color: 'warning' as const },
  blocker: { label: 'Blocker', color: 'error' as const },
};

// Engagement strategy labels and colors
const STRATEGY_CONFIG = {
  manage_closely: { label: 'Gestisci Attentamente', color: 'warning' as const },
  keep_satisfied: { label: 'Mantieni Soddisfatto', color: 'primary' as const },
  keep_informed: { label: 'Mantieni Informato', color: 'info' as const },
  monitor: { label: 'Monitora', color: 'secondary' as const },
};

// Power/Interest level labels
const POWER_LABELS = {
  low: 'Basso',
  medium: 'Medio',
  high: 'Alto',
};

const INTEREST_LABELS = {
  low: 'Basso',
  medium: 'Medio',
  high: 'Alto',
};

export const StakeholderCard: React.FC<StakeholderCardProps> = ({
  stakeholder,
  onEdit,
  onDelete,
  onClick,
}) => {
  const categoryConfig = CATEGORY_CONFIG[stakeholder.category];
  const sentimentConfig = SENTIMENT_CONFIG[stakeholder.sentiment];
  const strategyConfig = STRATEGY_CONFIG[stakeholder.engagementStrategy];

  const handleCardClick = () => {
    if (onClick) {
      onClick(stakeholder);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(stakeholder);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler eliminare ${stakeholder.name}?`)) {
      onDelete(stakeholder.id);
    }
  };

  return (
    <MetahodosCard
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* Header with Name and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <UserCircleIcon className="h-12 w-12 text-metahodos-orange flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-metahodos-navy truncate">
                {stakeholder.name}
              </h3>
              <p className="text-sm text-metahodos-text-secondary">{stakeholder.role}</p>
              {stakeholder.organization && (
                <div className="flex items-center mt-1 text-xs text-metahodos-text-muted">
                  <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                  {stakeholder.organization}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={handleEdit}
              className="p-1.5 text-metahodos-gray-600 hover:text-metahodos-orange hover:bg-metahodos-gray-50 rounded transition-colors"
              title="Modifica"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-metahodos-gray-600 hover:text-metahodos-red hover:bg-red-50 rounded transition-colors"
              title="Elimina"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <MetahodosBadge variant={categoryConfig.color} size="sm">
            {categoryConfig.label}
          </MetahodosBadge>
          <MetahodosBadge variant={sentimentConfig.color} size="sm">
            {sentimentConfig.label}
          </MetahodosBadge>
          <MetahodosBadge variant={strategyConfig.color} size="sm">
            {strategyConfig.label}
          </MetahodosBadge>
        </div>

        {/* Contact Info */}
        {(stakeholder.email || stakeholder.phone) && (
          <div className="space-y-1 pt-2 border-t border-metahodos-gray-200">
            {stakeholder.email && (
              <div className="flex items-center text-xs text-metahodos-text-secondary">
                <EnvelopeIcon className="h-3.5 w-3.5 mr-2 text-metahodos-gray-400" />
                <a
                  href={`mailto:${stakeholder.email}`}
                  className="hover:text-metahodos-orange transition-colors truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {stakeholder.email}
                </a>
              </div>
            )}
            {stakeholder.phone && (
              <div className="flex items-center text-xs text-metahodos-text-secondary">
                <PhoneIcon className="h-3.5 w-3.5 mr-2 text-metahodos-gray-400" />
                <a
                  href={`tel:${stakeholder.phone}`}
                  className="hover:text-metahodos-orange transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {stakeholder.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Power & Interest */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-metahodos-gray-200">
          <div>
            <p className="text-xs text-metahodos-text-muted mb-1">Potere</p>
            <p className="text-sm font-medium text-metahodos-navy">
              {POWER_LABELS[stakeholder.powerLevel]}
            </p>
          </div>
          <div>
            <p className="text-xs text-metahodos-text-muted mb-1">Interesse</p>
            <p className="text-sm font-medium text-metahodos-navy">
              {INTEREST_LABELS[stakeholder.interestLevel]}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {(stakeholder.needs || stakeholder.concerns) && (
          <div className="space-y-2 pt-2 border-t border-metahodos-gray-200">
            {stakeholder.needs && (
              <div>
                <p className="text-xs text-metahodos-text-muted mb-0.5">Bisogni</p>
                <p className="text-sm text-metahodos-text-secondary line-clamp-2">
                  {stakeholder.needs}
                </p>
              </div>
            )}
            {stakeholder.concerns && (
              <div>
                <p className="text-xs text-metahodos-text-muted mb-0.5">Preoccupazioni</p>
                <p className="text-sm text-metahodos-text-secondary line-clamp-2">
                  {stakeholder.concerns}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </MetahodosCard>
  );
};
