import React, { useState } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  SparklesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface LeadMagnet {
  id: string;
  icon: string;
  title: string;
  description: string;
  pages: string;
}

const leadMagnets: LeadMagnet[] = [
  {
    id: 'sprint-planning',
    icon: '📝',
    title: 'Sprint Planning in 90 Minuti - Template',
    description: 'Checklist step-by-step + script facilitazione parola-per-parola',
    pages: '6 pagine PDF',
  },
  {
    id: 'retrospective',
    icon: '✅',
    title: 'Checklist 47 Punti Retrospettive',
    description: 'Trasforma retro da "teatro" a miglioramento reale + Notion template',
    pages: '8 pagine PDF',
  },
  {
    id: 'value-framework',
    icon: '💰',
    title: 'Framework V.A.L.U.E (User Stories → ROI)',
    description: 'Collega ogni storia a € business value + workbook compilabile',
    pages: '12 pagine PDF',
  },
  {
    id: 'ai-guide',
    icon: '🤖',
    title: 'AI per Agile: Da 4h a 45min Planning',
    description: 'Caso studio + ROI Calculator + 7 prompt AI pronti all\'uso',
    pages: '18 pagine PDF + Excel',
  },
];

export const LeadMagnetSection: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    teamSize: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Inserisci la tua email');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrate with email service (Mailchimp, ConvertKit, etc.)
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store in localStorage as backup
      localStorage.setItem('metahodos_lead', JSON.stringify({
        ...formData,
        timestamp: new Date().toISOString(),
      }));

      setSubmitted(true);
      toast.success('🎉 Controlla la tua email! I template stanno arrivando.');

      // TODO: Trigger email automation
      console.log('Lead captured:', formData);
    } catch (error) {
      toast.error('Errore. Riprova tra poco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="lead-magnet" className="py-24 bg-metahodos-green/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-metahodos-green flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-black text-metahodos-gray mb-4 uppercase">
            🎉 Perfetto! Controlla la Tua Email
          </h2>
          <p className="text-xl text-metahodos-text-secondary mb-8">
            Ti abbiamo inviato i 4 template gratuiti + un link per una demo privata di 7 minuti dell'AI in azione.
          </p>
          <div className="bg-white p-6 rounded-xl border border-metahodos-green mb-8">
            <p className="text-metahodos-text-primary mb-4">
              📧 Email inviata a: <span className="font-black">{formData.email}</span>
            </p>
            <p className="text-sm text-gray-600">
              Non hai ricevuto l'email? Controlla spam/promozioni o{' '}
              <button
                onClick={() => setSubmitted(false)}
                className="text-metahodos-orange hover:underline font-medium"
              >
                riprova con un'altra email
              </button>
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/signup'}
            className="px-8 py-4 bg-metahodos-orange text-white rounded-lg font-semibold text-lg hover:bg-metahodos-orange-dark transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <RocketLaunchIcon className="h-6 w-6" />
            Vai Direttamente alla Prova Gratuita
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-magnet" className="py-24 bg-metahodos-orange/10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-metahodos-orange/20 text-metahodos-orange font-semibold text-sm mb-4 border border-metahodos-orange/30">
            🎁 RISORSE GRATUITE
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-metahodos-gray mb-4 uppercase tracking-tight">
            4 Template Professionali<br />
            Per Iniziare Subito
          </h2>
          <p className="text-xl text-metahodos-text-secondary max-w-3xl mx-auto">
            Gli stessi framework usati da 500+ team Agile italiani.<br />
            Scaricali gratis in cambio della tua email.
          </p>
        </div>

        {/* Lead Magnets Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {leadMagnets.map((magnet) => (
            <div
              key={magnet.id}
              className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-metahodos-orange transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{magnet.icon}</div>
                <div className="flex-1">
                  <h3 className="font-black text-metahodos-gray mb-2">{magnet.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{magnet.description}</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-metahodos-green/20 text-metahodos-green-dark text-xs font-bold border border-metahodos-green/40">
                    {magnet.pages}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-metahodos-orange">
          <div className="flex items-start gap-4 mb-8">
            <SparklesIcon className="h-10 w-10 text-metahodos-orange flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-black text-metahodos-gray mb-2">
                Inserisci la Tua Email per Ricevere Tutto Gratis
              </h3>
              <p className="text-metahodos-text-secondary">
                Download immediato + BONUS: Demo AI privata di 7 minuti
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Required) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email professionale *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tuo@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-metahodos-orange focus:ring focus:ring-metahodos-orange/20 transition-all"
              />
            </div>

            {/* Role (Optional) */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Il tuo ruolo (opzionale)
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-metahodos-orange focus:ring focus:ring-metahodos-orange/20 transition-all"
              >
                <option value="">Seleziona...</option>
                <option value="scrum-master">Scrum Master / Agile Coach</option>
                <option value="product-owner">Product Owner / Manager</option>
                <option value="developer">Developer / Tech Lead</option>
                <option value="c-level">C-Level / Decision Maker</option>
                <option value="other">Altro</option>
              </select>
            </div>

            {/* Team Size (Optional) */}
            <div>
              <label htmlFor="team-size" className="block text-sm font-medium text-gray-700 mb-2">
                Dimensione team (opzionale)
              </label>
              <select
                id="team-size"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-metahodos-orange focus:ring focus:ring-metahodos-orange/20 transition-all"
              >
                <option value="">Seleziona...</option>
                <option value="solo">Solo io (valutando Agile)</option>
                <option value="small">2-10 persone</option>
                <option value="medium">11-50 persone</option>
                <option value="large">50+ persone</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 bg-metahodos-orange text-white rounded-lg font-semibold text-lg hover:bg-metahodos-orange-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-6 w-6" />
                  Invia i Template Gratuiti
                </>
              )}
            </button>

            {/* Privacy Note */}
            <div className="flex items-start gap-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
              <LockClosedIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p>
                🔒 Privacy garantita. No spam, solo contenuti di valore. Puoi cancellarti quando vuoi.
                Cliccando invii, accetti la nostra Privacy Policy.
              </p>
            </div>
          </form>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ⚡ Preferisci provare direttamente l'app?
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            className="px-6 py-3 bg-white text-metahodos-orange border-2 border-metahodos-orange rounded-lg font-semibold hover:bg-metahodos-orange hover:text-white transition-all"
          >
            Inizia Prova Gratuita 14 Giorni
          </button>
        </div>
      </div>
    </section>
  );
};
