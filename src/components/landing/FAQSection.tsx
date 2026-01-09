import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQ {
  question: string;
  answer: string;
  category: 'ai' | 'pricing' | 'technical' | 'general';
}

const faqs: FAQ[] = [
  {
    question: "L'AI sostituisce il mio ruolo di Scrum Master/PO?",
    answer: "Assolutamente no! L'AI fa il lavoro noioso (data collection, calcoli, pattern matching) così TU puoi fare il vero lavoro strategico: guidare il team, risolvere conflitti, innovare. L'AI è il tuo assistente super-intelligente, non il tuo sostituto. Pensa a lei come un junior PM perfetto che non dorme mai.",
    category: 'ai',
  },
  {
    question: "Come fa l'AI a stimare Story Points così bene?",
    answer: "L'AI analizza 4 dimensioni: 1) Storico del TUO team (velocità, patterns unici), 2) Similarità con storie già completate (trova analogie), 3) Complessità tecnica (keywords, dependencies), 4) Capacity attuale team (ferie, assenze). Più la usi, più impara. Dopo 3 sprint raggiunge 87% accuracy (vs. 60% umana). Il bello? Ti mostra SEMPRE il reasoning, non è una black box.",
    category: 'ai',
  },
  {
    question: "I miei dati sono usati per allenare l'AI?",
    answer: "NO. I tuoi dati restano TUOI. L'AI è addestrata su dataset pubblici + best practices Agile da 50.000+ sprint anonimi. Il tuo backlog è analizzato solo per generare insights PER TE. Zero condivisione, zero training su dati clienti. Siamo GDPR compliant, hosting EU (Frankfurt), encryption at rest e in transit. I tuoi dati non lasciano mai l'Europa.",
    category: 'ai',
  },
  {
    question: "Funziona anche se non abbiamo storico sprint?",
    answer: "Sì! Per team nuovi, l'AI usa: • Industry benchmarks (es. 'login feature = ~5 SP avg'), • Pattern comuni di complessità (form = 3-5 SP, API integration = 5-8 SP), • Template da migliaia di team simili. Dopo il tuo primo sprint, inizia a personalizzarsi sul TUO modo di lavorare. In 3 sprint diventa precisa quanto un senior PM con 5 anni di esperienza.",
    category: 'ai',
  },
  {
    question: "Posso customizzare i suggerimenti AI?",
    answer: "Assolutamente! Tu hai sempre il controllo finale. Puoi: • Accettare suggerimenti AI (1 click), • Modificarli (edit inline), • Ignorarli (dismiss), • Insegnare all'AI le tue preferenze (feedback loop). Per esempio, se l'AI stima sempre troppo alto, puoi calibrare il suo 'pessimismo'. L'AI impara dal tuo feedback.",
    category: 'ai',
  },
  {
    question: "Quale AI usate? È ChatGPT?",
    answer: "No, non è ChatGPT generico. Usiamo modelli proprietari fine-tuned specificatamente per Agile + Lean + Value Stream Mapping. Il modello è allenato su 50.000+ sprint reali, epiche, retrospettive, burndown charts. Risultato: suggerimenti pratici e contestuali, non risposte generiche. È come la differenza tra un consulente Agile generico e uno specializzato nel TUO settore.",
    category: 'ai',
  },
  {
    question: "Quanto tempo serve per vedere risultati?",
    answer: "Team tipici vedono miglioramenti misurabili dopo 2 sprint (4 settimane): • Sprint 1: Setup + primo sprint con AI (già -50% tempo planning), • Sprint 2: Team si abitua, velocity +15-20%, • Sprint 3: AI completamente calibrata, +25-30% velocity. Il ROI più veloce? Backlog refinement: risparmi 2.5 ore dalla prima settimana.",
    category: 'general',
  },
  {
    question: "Funziona se non siamo esperti Agile?",
    answer: "Sì, anzi è PERFETTO per team nuovi! Metahodos include template e best practice integrate. L'AI ti guida passo-passo: • Suggerisce format User Story corretto, • Ti ricorda Definition of Done, • Avvisa se sprint overcommitted, • Genera agenda retrospettiva. È come avere un Agile Coach sempre disponibile. Molti nostri utenti hanno imparato Scrum usando Metahodos.",
    category: 'general',
  },
  {
    question: "Quanto costa Metahodos?",
    answer: "Offriamo 3 piani: • FREE: 1 progetto, 5 utenti, tutte features AI base (€0/mese), • PRO: Progetti illimitati, team illimitato, AI avanzata, Business Model Canvas, export PDF/Excel (€29/mese), • ENTERPRISE: SLA, SSO, onboarding dedicato, custom AI training (contattaci). Tutti i piani hanno 14 giorni di prova gratuita, no carta di credito richiesta. Puoi cambiare o cancellare in qualsiasi momento.",
    category: 'pricing',
  },
  {
    question: "I dati sono al sicuro? Cosa succede se cancello?",
    answer: "Sicurezza: • Hosting EU (Frankfurt AWS), • GDPR compliant, • Encryption AES-256 at rest, • SSL/TLS in transit, • Backup automatici giornalieri (retention 30gg), • 2FA disponibile. Se cancelli: • Puoi esportare tutti i dati (JSON, CSV, PDF), • Retention 90 giorni (recovery se cambi idea), • Dopo 90gg: hard delete permanente. Zero vendor lock-in.",
    category: 'technical',
  },
  {
    question: "Si integra con Jira/Trello/Slack?",
    answer: "Sì! Integrazioni disponibili: • Jira (import/export bidirezionale), • Trello (import backlog), • Slack (notifiche sprint, daily scrum reminder), • GitHub/GitLab (link commit a user stories), • Zapier/Make (connetti a 1000+ app). Roadmap Q1 2025: • Microsoft Teams, • Azure DevOps, • Linear. Vuoi un'integrazione specifica? Scrivici!",
    category: 'technical',
  },
  {
    question: "Posso provare prima di pagare?",
    answer: "Assolutamente! 14 giorni di prova gratuita, TUTTE le feature PRO incluse, no carta di credito richiesta. Puoi: • Creare progetti illimitati, • Invitare il team completo, • Usare tutte le AI features, • Esportare dati. Dopo 14 giorni: o passi a PRO (€29/mese) o continui con FREE (limitato ma funzionale). Zero pressione di vendita, zero chiamate spam.",
    category: 'pricing',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | FAQ['category']>('all');

  const filteredFAQs = filter === 'all' ? faqs : faqs.filter(faq => faq.category === filter);

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-metahodos-red/20 text-metahodos-red font-semibold text-sm mb-4 border border-metahodos-red/30">
            ❓ DOMANDE FREQUENTI
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-metahodos-gray mb-4 uppercase tracking-tight">
            Tutto Quello Che Devi Sapere
          </h2>
          <p className="text-xl text-metahodos-text-secondary">
            Abbiamo risposto alle domande più comuni. Non trovi la tua? Scrivici!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'all', label: 'Tutte', emoji: '📋' },
            { id: 'ai', label: 'AI', emoji: '🤖' },
            { id: 'pricing', label: 'Prezzi', emoji: '💰' },
            { id: 'technical', label: 'Tecnico', emoji: '⚙️' },
            { id: 'general', label: 'Generale', emoji: '💡' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`
                px-4 py-2 rounded-lg font-bold transition-all
                ${filter === cat.id
                  ? 'bg-metahodos-orange text-white shadow-md'
                  : 'bg-white text-metahodos-gray hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-metahodos-gray flex-1 leading-relaxed">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`h-6 w-6 text-metahodos-orange flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-metahodos-text-secondary leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-metahodos-orange rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-black mb-3 uppercase">Non hai trovato la risposta?</h3>
          <p className="mb-6 opacity-90">
            Scrivici direttamente. Rispondiamo entro 2 ore (lun-ven 9-18).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@metahodos.com"
              className="px-6 py-3 bg-white text-metahodos-orange rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              📧 support@metahodos.com
            </a>
            <button
              onClick={() => window.location.href = '/signup'}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg font-semibold hover:bg-white/30 transition-all"
            >
              💬 Oppure Provalo Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
