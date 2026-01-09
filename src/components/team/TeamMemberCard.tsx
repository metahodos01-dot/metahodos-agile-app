import React from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { MetahodosCard, MetahodosBadge } from '../ui';
import type { TeamMember } from '../../lib/types';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
  onClick?: (member: TeamMember) => void;
}

// Role labels and colors
const ROLE_CONFIG = {
  product_owner: { label: 'Product Owner', color: 'primary' as const },
  scrum_master: { label: 'Scrum Master', color: 'warning' as const },
  developer: { label: 'Developer', color: 'info' as const },
  designer: { label: 'Designer', color: 'secondary' as const },
  qa_tester: { label: 'QA Tester', color: 'success' as const },
  devops: { label: 'DevOps', color: 'error' as const },
  architect: { label: 'Architect', color: 'primary' as const },
  other: { label: 'Altro', color: 'default' as const },
};

// Status labels and colors
const STATUS_CONFIG = {
  active: { label: 'Attivo', color: 'success' as const },
  inactive: { label: 'Inattivo', color: 'default' as const },
  on_leave: { label: 'In Ferie', color: 'warning' as const },
};

// Skill level colors
const SKILL_LEVEL_COLORS = {
  beginner: 'bg-gray-200',
  intermediate: 'bg-blue-200',
  advanced: 'bg-green-200',
  expert: 'bg-purple-200',
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  onClick,
}) => {
  const roleConfig = ROLE_CONFIG[member.role];
  const statusConfig = STATUS_CONFIG[member.status];

  const handleCardClick = () => {
    if (onClick) {
      onClick(member);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(member);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler rimuovere ${member.name} dal team?`)) {
      onDelete(member.id);
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
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-metahodos-orange flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-metahodos-navy truncate">
                {member.name}
              </h3>
              {member.title && (
                <p className="text-sm text-metahodos-text-secondary">{member.title}</p>
              )}
              {member.location && (
                <div className="flex items-center mt-1 text-xs text-metahodos-text-muted">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  {member.location}
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
              title="Rimuovi"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <MetahodosBadge variant={roleConfig.color} size="sm">
            {roleConfig.label}
          </MetahodosBadge>
          <MetahodosBadge variant={statusConfig.color} size="sm">
            {statusConfig.label}
          </MetahodosBadge>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 pt-2 border-t border-metahodos-gray-200">
          <div className="flex items-center text-xs text-metahodos-text-secondary">
            <EnvelopeIcon className="h-3.5 w-3.5 mr-2 text-metahodos-gray-400" />
            <a
              href={`mailto:${member.email}`}
              className="hover:text-metahodos-orange transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {member.email}
            </a>
          </div>
          {member.phone && (
            <div className="flex items-center text-xs text-metahodos-text-secondary">
              <PhoneIcon className="h-3.5 w-3.5 mr-2 text-metahodos-gray-400" />
              <a
                href={`tel:${member.phone}`}
                className="hover:text-metahodos-orange transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {member.phone}
              </a>
            </div>
          )}
        </div>

        {/* Capacity & Allocation */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-metahodos-gray-200">
          <div>
            <div className="flex items-center text-xs text-metahodos-text-muted mb-1">
              <ClockIcon className="h-3 w-3 mr-1" />
              Capacità Settimanale
            </div>
            <p className="text-sm font-medium text-metahodos-navy">
              {member.weeklyHoursCapacity}h
            </p>
          </div>
          <div>
            <p className="text-xs text-metahodos-text-muted mb-1">Allocazione</p>
            <div className="flex items-center">
              <div className="flex-1 bg-metahodos-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-metahodos-orange h-2 rounded-full transition-all duration-300"
                  style={{ width: `${member.currentAllocation}%` }}
                />
              </div>
              <span className="text-sm font-medium text-metahodos-navy">
                {member.currentAllocation}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {(member.personalVelocity || member.completedStories) && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-metahodos-gray-200">
            {member.personalVelocity !== undefined && (
              <div>
                <div className="flex items-center text-xs text-metahodos-text-muted mb-1">
                  <ChartBarIcon className="h-3 w-3 mr-1" />
                  Velocity
                </div>
                <p className="text-sm font-medium text-metahodos-navy">
                  {member.personalVelocity.toFixed(1)}
                </p>
              </div>
            )}
            {member.completedStories !== undefined && (
              <div>
                <p className="text-xs text-metahodos-text-muted mb-1">Stories</p>
                <p className="text-sm font-medium text-metahodos-navy">
                  {member.completedStories}
                </p>
              </div>
            )}
            {member.completedPoints !== undefined && (
              <div>
                <p className="text-xs text-metahodos-text-muted mb-1">Punti</p>
                <p className="text-sm font-medium text-metahodos-navy">
                  {member.completedPoints}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {member.skills.length > 0 && (
          <div className="pt-2 border-t border-metahodos-gray-200">
            <p className="text-xs text-metahodos-text-muted mb-2">Competenze</p>
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill.id}
                  className={`text-xs px-2 py-1 rounded ${SKILL_LEVEL_COLORS[skill.level]} text-metahodos-navy`}
                  title={`${skill.name} - ${skill.level}`}
                >
                  {skill.name}
                </span>
              ))}
              {member.skills.length > 5 && (
                <span className="text-xs px-2 py-1 rounded bg-metahodos-gray-100 text-metahodos-text-muted">
                  +{member.skills.length - 5} altre
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </MetahodosCard>
  );
};
