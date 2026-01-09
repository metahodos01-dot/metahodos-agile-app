import React from 'react';
import { MetahodosBadge, MetahodosButton } from '../ui';
import {
  XMarkIcon,
  PencilIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { Story, Epic, StoryStatus, MoscowPriority } from '../../lib/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface StoryDetailSidebarProps {
  story: Story | null;
  epic?: Epic;
  onClose: () => void;
  onEdit: () => void;
}

export const StoryDetailSidebar: React.FC<StoryDetailSidebarProps> = ({
  story,
  epic,
  onClose,
  onEdit,
}) => {
  if (!story) return null;

  // Get status badge variant
  const getStatusBadgeVariant = (status: StoryStatus) => {
    switch (status) {
      case 'backlog':
        return 'default';
      case 'ready':
        return 'info';
      case 'in_sprint':
        return 'warning';
      case 'in_progress':
        return 'warning';
      case 'review':
        return 'info';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get MoSCoW badge variant
  const getMoscowBadgeVariant = (priority?: MoscowPriority) => {
    switch (priority) {
      case 'must_have':
        return 'error';
      case 'should_have':
        return 'warning';
      case 'could_have':
        return 'info';
      case 'wont_have':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: StoryStatus): string => {
    switch (status) {
      case 'backlog':
        return 'Backlog';
      case 'ready':
        return 'Pronta';
      case 'in_sprint':
        return 'In Sprint';
      case 'in_progress':
        return 'In Corso';
      case 'review':
        return 'In Revisione';
      case 'done':
        return 'Completata';
    }
  };

  // Get MoSCoW label
  const getMoscowLabel = (priority?: MoscowPriority): string => {
    switch (priority) {
      case 'must_have':
        return 'Must Have - Essenziale';
      case 'should_have':
        return 'Should Have - Importante';
      case 'could_have':
        return 'Could Have - Desiderabile';
      case 'wont_have':
        return 'Won\'t Have - Futuro';
      default:
        return 'Non assegnata';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-deep z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-metahodos-gray-200 z-10">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-metahodos-navy">Dettagli Story</h2>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              title="Modifica"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-metahodos-text-secondary hover:text-metahodos-navy transition-colors"
              title="Chiudi"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-metahodos-navy mb-2">{story.title}</h3>
          <div className="flex flex-wrap gap-2">
            <MetahodosBadge variant={getStatusBadgeVariant(story.status)}>
              {getStatusLabel(story.status)}
            </MetahodosBadge>
            {story.moscowPriority && (
              <MetahodosBadge variant={getMoscowBadgeVariant(story.moscowPriority)}>
                {story.moscowPriority === 'must_have'
                  ? 'Must Have'
                  : story.moscowPriority === 'should_have'
                  ? 'Should Have'
                  : story.moscowPriority === 'could_have'
                  ? 'Could Have'
                  : 'Won\'t Have'}
              </MetahodosBadge>
            )}
            {story.storyPoints && (
              <MetahodosBadge variant="primary">
                {story.storyPoints} {story.storyPoints === 1 ? 'punto' : 'punti'}
              </MetahodosBadge>
            )}
          </div>
        </div>

        {/* Description */}
        {story.description && (
          <div>
            <h4 className="text-sm font-semibold text-metahodos-navy mb-2 flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              User Story
            </h4>
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <p className="text-metahodos-text-primary whitespace-pre-wrap">
                {story.description}
              </p>
            </div>
          </div>
        )}

        {/* Acceptance Criteria */}
        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-metahodos-navy mb-2 flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Criteri di Accettazione
            </h4>
            <ul className="space-y-2">
              {story.acceptanceCriteria.map((criterion, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-metahodos-orange text-white text-xs font-semibold mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-metahodos-text-primary">{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Epic */}
        {epic && (
          <div>
            <h4 className="text-sm font-semibold text-metahodos-navy mb-2">Epic</h4>
            <div
              className="border-l-4 pl-4 py-2"
              style={{ borderColor: epic.color || '#ff6b35' }}
            >
              <div className="font-medium text-metahodos-navy">{epic.title}</div>
              {epic.description && (
                <div className="text-sm text-metahodos-text-secondary mt-1">
                  {epic.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-metahodos-navy mb-2 flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <MetahodosBadge key={tag} variant="default">
                  {tag}
                </MetahodosBadge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-metahodos-gray-200 pt-6 space-y-3">
          <h4 className="text-sm font-semibold text-metahodos-navy mb-3">Informazioni</h4>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-metahodos-text-secondary">Priorità MoSCoW</span>
            <span className="text-sm font-medium text-metahodos-text-primary">
              {getMoscowLabel(story.moscowPriority)}
            </span>
          </div>

          {/* Story Points */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-metahodos-text-secondary">Story Points</span>
            <span className="text-sm font-medium text-metahodos-text-primary">
              {story.storyPoints || 'Non stimata'}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-metahodos-text-secondary">Status</span>
            <span className="text-sm font-medium text-metahodos-text-primary">
              {getStatusLabel(story.status)}
            </span>
          </div>

          {/* Sprint */}
          {story.sprintId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-metahodos-text-secondary">Sprint</span>
              <span className="text-sm font-medium text-metahodos-text-primary">
                {story.sprintId}
              </span>
            </div>
          )}

          {/* Assignee */}
          {story.assigneeId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-metahodos-text-secondary">Assegnato a</span>
              <span className="text-sm font-medium text-metahodos-text-primary">
                {story.assigneeId}
              </span>
            </div>
          )}

          {/* Created At */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-metahodos-text-secondary flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Creata il
            </span>
            <span className="text-sm font-medium text-metahodos-text-primary">
              {format(story.createdAt, 'dd MMM yyyy', { locale: it })}
            </span>
          </div>

          {/* Updated At */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-metahodos-text-secondary flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Aggiornata il
            </span>
            <span className="text-sm font-medium text-metahodos-text-primary">
              {format(story.updatedAt, 'dd MMM yyyy', { locale: it })}
            </span>
          </div>

          {/* Created By */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-metahodos-text-secondary">Creata da</span>
            <span className="text-sm font-medium text-metahodos-text-primary">
              {story.createdBy}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-metahodos-gray-200 pt-6">
          <MetahodosButton variant="primary" fullWidth onClick={onEdit}>
            Modifica Story
          </MetahodosButton>
        </div>
      </div>
    </div>
  );
};
