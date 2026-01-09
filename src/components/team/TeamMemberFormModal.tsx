import React, { useState, useEffect } from 'react';
import {
  MetahodosModal,
  MetahodosInput,
  MetahodosSelect,
  MetahodosButton,
} from '../ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type {
  TeamMember,
  TeamRole,
  TeamMemberStatus,
  Skill,
  SkillLevel,
} from '../../lib/types';

interface TeamMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => Promise<void>;
  member?: TeamMember | null;
  loading?: boolean;
}

// Role options
const ROLE_OPTIONS = [
  { value: 'product_owner', label: 'Product Owner' },
  { value: 'scrum_master', label: 'Scrum Master' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'qa_tester', label: 'QA Tester' },
  { value: 'devops', label: 'DevOps' },
  { value: 'architect', label: 'Architect' },
  { value: 'other', label: 'Altro' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'active', label: 'Attivo' },
  { value: 'inactive', label: 'Inattivo' },
  { value: 'on_leave', label: 'In Ferie' },
];

// Skill level options
const SKILL_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzato' },
  { value: 'expert', label: 'Esperto' },
];

const createEmptySkill = (): Skill => ({
  id: `skill-${Date.now()}-${Math.random()}`,
  name: '',
  level: 'intermediate',
  yearsOfExperience: undefined,
});

export const TeamMemberFormModal: React.FC<TeamMemberFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  loading = false,
}) => {
  const isEditMode = !!member;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'developer' as TeamRole,
    title: '',
    status: 'active' as TeamMemberStatus,
    weeklyHoursCapacity: 40,
    currentAllocation: 100,
    skills: [createEmptySkill()],
    phone: '',
    avatar: '',
    location: '',
    timezone: '',
    joinedDate: new Date(),
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        title: member.title || '',
        status: member.status,
        weeklyHoursCapacity: member.weeklyHoursCapacity,
        currentAllocation: member.currentAllocation,
        skills: member.skills.length > 0 ? member.skills : [createEmptySkill()],
        phone: member.phone || '',
        avatar: member.avatar || '',
        location: member.location || '',
        timezone: member.timezone || '',
        joinedDate: member.joinedDate,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'developer',
        title: '',
        status: 'active',
        weeklyHoursCapacity: 40,
        currentAllocation: 100,
        skills: [createEmptySkill()],
        phone: '',
        avatar: '',
        location: '',
        timezone: '',
        joinedDate: new Date(),
      });
    }
  }, [member, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty skills
    const validSkills = formData.skills.filter(skill => skill.name.trim() !== '');

    await onSubmit({
      ...formData,
      skills: validSkills,
    });

    onClose();
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, createEmptySkill()],
    });
  };

  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((_, i) => i !== index),
      });
    }
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setFormData({ ...formData, skills: updatedSkills });
  };

  return (
    <MetahodosModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifica Membro Team' : 'Nuovo Membro Team'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Informazioni Base
          </h3>

          <MetahodosInput
            label="Nome Completo *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="es. Mario Rossi"
            required
          />

          <MetahodosInput
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="mario.rossi@esempio.it"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <MetahodosSelect
              label="Ruolo *"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
              options={ROLE_OPTIONS}
              required
            />

            <MetahodosSelect
              label="Stato *"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TeamMemberStatus })}
              options={STATUS_OPTIONS}
              required
            />
          </div>

          <MetahodosInput
            label="Titolo/Posizione"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="es. Senior Full Stack Developer"
          />
        </div>

        {/* Contact & Location */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Contatti & Località
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <MetahodosInput
              label="Telefono"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+39 123 456 7890"
            />

            <MetahodosInput
              label="Località"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="es. Milano, Italia"
            />
          </div>

          <MetahodosInput
            label="Fuso Orario"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            placeholder="es. Europe/Rome"
          />

          <MetahodosInput
            label="URL Avatar"
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Capacity & Allocation */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Capacità & Allocazione
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <MetahodosInput
              label="Ore Settimanali *"
              type="number"
              value={formData.weeklyHoursCapacity}
              onChange={(e) => setFormData({ ...formData, weeklyHoursCapacity: parseInt(e.target.value) || 0 })}
              placeholder="40"
              required
              min="1"
              max="168"
            />

            <MetahodosInput
              label="Allocazione al Progetto (%) *"
              type="number"
              value={formData.currentAllocation}
              onChange={(e) => setFormData({ ...formData, currentAllocation: parseInt(e.target.value) || 0 })}
              placeholder="100"
              required
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-metahodos-gray-200 pb-2">
            <h3 className="text-sm font-semibold text-metahodos-navy">
              Competenze
            </h3>
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center text-xs text-metahodos-orange hover:text-metahodos-orange-dark transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Aggiungi Skill
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {formData.skills.map((skill, index) => (
              <div key={skill.id} className="flex items-start gap-2 p-3 bg-metahodos-gray-50 rounded">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <MetahodosInput
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="Nome skill"
                  />
                  <MetahodosSelect
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', e.target.value as SkillLevel)}
                    options={SKILL_LEVEL_OPTIONS}
                  />
                  <MetahodosInput
                    type="number"
                    value={skill.yearsOfExperience || ''}
                    onChange={(e) => updateSkill(index, 'yearsOfExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Anni exp."
                    min="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="p-2 text-metahodos-gray-600 hover:text-metahodos-red hover:bg-red-50 rounded transition-colors"
                  title="Rimuovi"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-metahodos-gray-200">
          <MetahodosButton type="button" variant="secondary" onClick={onClose}>
            Annulla
          </MetahodosButton>
          <MetahodosButton type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvataggio...' : isEditMode ? 'Aggiorna Membro' : 'Aggiungi al Team'}
          </MetahodosButton>
        </div>
      </form>
    </MetahodosModal>
  );
};
