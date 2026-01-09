import React, { useState, useEffect } from 'react';
import {
  MetahodosModal,
  MetahodosInput,
  MetahodosTextarea,
  MetahodosSelect,
  MetahodosButton,
} from '../ui';
import type {
  Stakeholder,
  StakeholderCategory,
  PowerLevel,
  InterestLevel,
  StakeholderSentiment,
  CommunicationFrequency,
} from '../../lib/types';
import { calculateEngagementStrategy } from '../../lib/firestore-stakeholder';

interface StakeholderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stakeholderData: Omit<Stakeholder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'projectId'>) => Promise<void>;
  stakeholder?: Stakeholder | null;
  loading?: boolean;
}

// Category options
const CATEGORY_OPTIONS = [
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'user', label: 'Utente' },
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'other', label: 'Altro' },
];

// Power level options
const POWER_OPTIONS = [
  { value: 'low', label: 'Basso' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
];

// Interest level options
const INTEREST_OPTIONS = [
  { value: 'low', label: 'Basso' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
];

// Sentiment options
const SENTIMENT_OPTIONS = [
  { value: 'champion', label: 'Champion' },
  { value: 'supporter', label: 'Supporter' },
  { value: 'neutral', label: 'Neutrale' },
  { value: 'skeptic', label: 'Scettico' },
  { value: 'blocker', label: 'Blocker' },
];

// Communication frequency options
const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Giornaliero' },
  { value: 'weekly', label: 'Settimanale' },
  { value: 'biweekly', label: 'Bisettimanale' },
  { value: 'monthly', label: 'Mensile' },
  { value: 'quarterly', label: 'Trimestrale' },
  { value: 'as_needed', label: 'Al Bisogno' },
];

// Engagement strategy labels (read-only, auto-calculated)
const STRATEGY_LABELS = {
  manage_closely: 'Gestisci Attentamente',
  keep_satisfied: 'Mantieni Soddisfatto',
  keep_informed: 'Mantieni Informato',
  monitor: 'Monitora',
};

export const StakeholderFormModal: React.FC<StakeholderFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stakeholder,
  loading = false,
}) => {
  const isEditMode = !!stakeholder;

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    organization: '',
    category: 'user' as StakeholderCategory,
    email: '',
    phone: '',
    powerLevel: 'medium' as PowerLevel,
    interestLevel: 'medium' as InterestLevel,
    sentiment: 'neutral' as StakeholderSentiment,
    communicationFrequency: 'monthly' as CommunicationFrequency,
    preferredChannel: '',
    needs: '',
    concerns: '',
    influence: '',
    notes: '',
  });

  // Auto-calculate engagement strategy based on power and interest
  const engagementStrategy = calculateEngagementStrategy(
    formData.powerLevel,
    formData.interestLevel
  );

  useEffect(() => {
    if (stakeholder) {
      setFormData({
        name: stakeholder.name,
        role: stakeholder.role,
        organization: stakeholder.organization || '',
        category: stakeholder.category,
        email: stakeholder.email || '',
        phone: stakeholder.phone || '',
        powerLevel: stakeholder.powerLevel,
        interestLevel: stakeholder.interestLevel,
        sentiment: stakeholder.sentiment,
        communicationFrequency: stakeholder.communicationFrequency,
        preferredChannel: stakeholder.preferredChannel || '',
        needs: stakeholder.needs || '',
        concerns: stakeholder.concerns || '',
        influence: stakeholder.influence || '',
        notes: stakeholder.notes || '',
      });
    } else {
      setFormData({
        name: '',
        role: '',
        organization: '',
        category: 'user',
        email: '',
        phone: '',
        powerLevel: 'medium',
        interestLevel: 'medium',
        sentiment: 'neutral',
        communicationFrequency: 'monthly',
        preferredChannel: '',
        needs: '',
        concerns: '',
        influence: '',
        notes: '',
      });
    }
  }, [stakeholder, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      ...formData,
      engagementStrategy,
    });

    onClose();
  };

  return (
    <MetahodosModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifica Stakeholder' : 'Nuovo Stakeholder'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Informazioni Base
          </h3>

          <MetahodosInput
            label="Nome *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="es. Mario Rossi"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <MetahodosInput
              label="Ruolo *"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="es. CEO"
              required
            />

            <MetahodosSelect
              label="Categoria *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as StakeholderCategory })}
              options={CATEGORY_OPTIONS}
              required
            />
          </div>

          <MetahodosInput
            label="Organizzazione"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            placeholder="es. Acme Corporation"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Contatti
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <MetahodosInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@esempio.it"
            />

            <MetahodosInput
              label="Telefono"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+39 123 456 7890"
            />
          </div>
        </div>

        {/* Power & Interest Matrix */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Matrice Potere/Interesse
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <MetahodosSelect
              label="Livello di Potere *"
              value={formData.powerLevel}
              onChange={(e) => setFormData({ ...formData, powerLevel: e.target.value as PowerLevel })}
              options={POWER_OPTIONS}
              required
            />

            <MetahodosSelect
              label="Livello di Interesse *"
              value={formData.interestLevel}
              onChange={(e) => setFormData({ ...formData, interestLevel: e.target.value as InterestLevel })}
              options={INTEREST_OPTIONS}
              required
            />
          </div>

          {/* Auto-calculated Engagement Strategy */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 mb-1">Strategia di Coinvolgimento (Auto-calcolata)</p>
            <p className="text-sm font-semibold text-blue-900">
              {STRATEGY_LABELS[engagementStrategy]}
            </p>
          </div>
        </div>

        {/* Engagement Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Dettagli Coinvolgimento
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <MetahodosSelect
              label="Sentiment *"
              value={formData.sentiment}
              onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as StakeholderSentiment })}
              options={SENTIMENT_OPTIONS}
              required
            />

            <MetahodosSelect
              label="Frequenza Comunicazione *"
              value={formData.communicationFrequency}
              onChange={(e) => setFormData({ ...formData, communicationFrequency: e.target.value as CommunicationFrequency })}
              options={FREQUENCY_OPTIONS}
              required
            />
          </div>

          <MetahodosInput
            label="Canale Preferito"
            value={formData.preferredChannel}
            onChange={(e) => setFormData({ ...formData, preferredChannel: e.target.value })}
            placeholder="es. Email, Slack, Telefono"
          />
        </div>

        {/* Additional Context */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-metahodos-navy border-b border-metahodos-gray-200 pb-2">
            Contesto Aggiuntivo
          </h3>

          <MetahodosTextarea
            label="Bisogni"
            value={formData.needs}
            onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
            placeholder="Cosa si aspetta dal progetto..."
            rows={2}
          />

          <MetahodosTextarea
            label="Preoccupazioni"
            value={formData.concerns}
            onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
            placeholder="Quali sono le sue preoccupazioni..."
            rows={2}
          />

          <MetahodosTextarea
            label="Influenza"
            value={formData.influence}
            onChange={(e) => setFormData({ ...formData, influence: e.target.value })}
            placeholder="Come influenza il progetto..."
            rows={2}
          />

          <MetahodosTextarea
            label="Note"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Note aggiuntive..."
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-metahodos-gray-200">
          <MetahodosButton type="button" variant="secondary" onClick={onClose}>
            Annulla
          </MetahodosButton>
          <MetahodosButton type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvataggio...' : isEditMode ? 'Aggiorna Stakeholder' : 'Crea Stakeholder'}
          </MetahodosButton>
        </div>
      </form>
    </MetahodosModal>
  );
};
