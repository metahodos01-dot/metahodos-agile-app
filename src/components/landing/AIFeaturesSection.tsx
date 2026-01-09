import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  PresentationChartLineIcon,
  ScissorsIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface Feature {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  example: {
    input: string;
    output: string[];
  };
  stats: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: DocumentTextIcon,
    title: 'AI Story Writer',
    subtitle: 'Genera User Stories complete in 30 secondi',
    description: 'Scrivi una semplice frase e l\'AI genera User Stories complete con Acceptance Criteria, Story Points stimati, dependencies e tags.',
    example: {
      input: 'Servizio per resettare password',
      output: [
        '✓ User Story con formato corretto',
        '✓ 5 Acceptance Criteria dettagliati',
        '✓ Story Points: 5 SP (da storico)',
        '✓ Dependencies: Email service, Auth middleware',
        '✓ Tags: Security, UX, Must-Have',
      ],
    },
    stats: 'Tempo risparmiato: 15 min → 30 sec',
  },
  {
    id: 2,
    icon: ChartBarIcon,
    title: 'AI Estimation Engine',
    subtitle: 'Stima con 87% accuracy (vs 60% umana)',
    description: 'L\'AI analizza complessità tecnica, storie simili passate, velocity del team e calcola Story Points con reasoning trasparente.',
    example: {
      input: 'Stima per "One-Page Checkout Mobile"',
      output: [
        '📊 Raccomandato: 8 Story Points (87% confidence)',
        '💡 Complessità: ALTA (form + API + mobile)',
        '📈 Storie simili: US-67, US-89 (media 7.8 SP)',
        '⚠️ Risk factors: Google API nuova (+20%)',
        '✓ Allineato con 25% capacity sprint',
      ],
    },
    stats: 'Accuracy: 87% vs 62% stime manuali',
  },
  {
    id: 3,
    icon: LightBulbIcon,
    title: 'AI Sprint Advisor',
    subtitle: 'Commitment ottimale con success probability',
    description: 'Durante Sprint Planning, l\'AI suggerisce il backlog ottimale analizzando velocity, dependencies e capacity team.',
    example: {
      input: 'Aiutami a pianificare lo sprint',
      output: [
        '✅ Commitment ottimale: 28 SP (88% capacity)',
        '🎯 Success Probability: 92%',
        '💡 US-42 e US-44 hanno dependency: falle in parallelo',
        '⚠️ US-51 richiede designer (in ferie): sostituire?',
        '📊 Alternative: Conservative 24SP (97%), Aggressive 35SP (68%)',
      ],
    },
    stats: 'Sprint finiti in tempo: +40%',
  },
  {
    id: 4,
    icon: ExclamationTriangleIcon,
    title: 'AI Blocker Detector',
    subtitle: 'Predice problemi prima che esplodano',
    description: 'L\'AI monitora dependencies esterne, API keys, setup tecnici e avvisa di potenziali blockers con giorni di anticipo.',
    example: {
      input: 'Analisi sprint in corso',
      output: [
        '🚨 RISCHIO BLOCCO: US-78 "Integrazione Payment" (83%)',
        '💡 API keys Stripe non ancora ricevute',
        '⏰ Sprint finisce tra 6 giorni, setup richiede 3gg',
        '📋 Azioni: 1) Sollecitare oggi 2) Preparare mock 3) Backup PayPal',
        '📊 Impact: 3 storie in cascade, sprint goal compromesso 60%',
      ],
    },
    stats: 'Blockers rilevati in anticipo: +65%',
  },
  {
    id: 5,
    icon: PresentationChartLineIcon,
    title: 'AI Retrospective Insights',
    subtitle: 'Report automatico data-driven in 5 minuti',
    description: 'Fine sprint, l\'AI genera automaticamente retrospettive complete con root cause analysis, pattern detection e action items SMART.',
    example: {
      input: 'Sprint #12 completato',
      output: [
        '📈 Velocity: 28/32 SP (-12%), Lead Time: 4.2gg (+35%)',
        '🔍 Root Cause: Staging down 8h → 3 storie bloccate',
        '🔁 Pattern: 4° volta in 8 sprint (investire in stability)',
        '🎯 Top 3 Actions: Fix staging SLA, Delegare code review, Team pizza',
        '🎉 Wins: Zero bug produzione, Daily 8min vs 15min target',
      ],
    },
    stats: 'Tempo prep retro: 2h → 5 minuti',
  },
  {
    id: 6,
    icon: ScissorsIcon,
    title: 'AI Epic Splitter',
    subtitle: 'Divide epic troppo grandi automaticamente',
    description: 'L\'AI rileva epic sovradimensionate e suggerisce come splittarle in dimensioni gestibili mantenendo valore business.',
    example: {
      input: 'Epic "E-commerce Checkout Completo" (89 SP)',
      output: [
        '⚠️ EPIC TROPPO GRANDE: 3.2 sprint, risk ALTO',
        '💡 Suggerimento: Split in 3 epic',
        '📦 Epic 1 "Checkout Base MVP": 28 SP, 1 sprint, valore ALTO',
        '📦 Epic 2 "Payment Extended": 34 SP, PayPal + Apple Pay',
        '📦 Epic 3 "Optimization": 27 SP, guest + promo codes',
      ],
    },
    stats: 'Epic splittate ottimalmente: 100%',
  },
  {
    id: 7,
    icon: FunnelIcon,
    title: 'AI Prioritization Assistant',
    subtitle: 'MoSCoW automatico in 15 secondi',
    description: 'Upload backlog disordinato, l\'AI analizza impact score, ROI, complessità e genera prioritizzazione MoSCoW completa.',
    example: {
      input: 'Backlog 50 storie non prioritizzate',
      output: [
        '🔴 MUST HAVE: 12 storie (78 SP), impact >8/10',
        '🟡 SHOULD HAVE: 18 storie (94 SP), impact 5-7/10',
        '🟢 COULD HAVE: 15 storie (67 SP), nice-to-have',
        '⚪ WON\'T HAVE: 5 storie (rimuovi o posterga)',
        '💡 Focus Must Have = MVP in 2.4 sprint (85% success)',
      ],
    },
    stats: 'Tempo prioritizzazione: 3h → 15 secondi',
  },
];

export const AIFeaturesSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(1);
  const currentFeature = features.find(f => f.id === activeFeature) || features[0];
  const Icon = currentFeature.icon;

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-metahodos-green/20 text-metahodos-green font-semibold text-sm mb-4 border border-metahodos-green/30">
            🤖 AI SUPER-POWERS
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-metahodos-gray mb-4 uppercase tracking-tight">
            Le 7 Funzioni AI Che Trasformano<br />
            Il Tuo Modo di Fare Agile
          </h2>
          <p className="text-xl text-metahodos-text-secondary max-w-3xl mx-auto">
            Non è magia. È machine learning applicato a 50.000+ sprint reali.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`
                px-6 py-3 rounded-lg font-bold transition-all
                ${activeFeature === feature.id
                  ? 'bg-metahodos-orange text-white shadow-lg scale-105'
                  : 'bg-white text-metahodos-gray hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {feature.id}. {feature.title.replace('AI ', '')}
            </button>
          ))}
        </div>

        {/* Active Feature Display */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Feature Description */}
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-metahodos-orange flex items-center justify-center">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-metahodos-gray mb-2">
                  {currentFeature.title}
                </h3>
                <p className="text-lg text-metahodos-red font-semibold">
                  {currentFeature.subtitle}
                </p>
              </div>
            </div>

            <p className="text-lg text-metahodos-text-secondary mb-6 leading-relaxed">
              {currentFeature.description}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-metahodos-green/20 border border-metahodos-green/40">
              <span className="text-2xl">⏱️</span>
              <span className="font-bold text-metahodos-green-dark">{currentFeature.stats}</span>
            </div>
          </div>

          {/* Right: Example Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-2 border-gray-200 shadow-xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-3">
                💬 INPUT
              </div>
              <p className="text-metahodos-text-primary font-mono text-sm bg-white p-4 rounded-lg border border-gray-300">
                {currentFeature.example.input}
              </p>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
                🤖 AI OUTPUT
              </div>
              <div className="bg-white p-6 rounded-lg border-2 border-green-300 space-y-3">
                {currentFeature.example.output.map((line, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-sm font-mono text-gray-700 leading-relaxed">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-300">
              <p className="text-xs text-gray-500 italic text-center">
                Questo è un esempio reale di output AI. Puoi testarlo gratis per 14 giorni.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-metahodos-text-secondary mb-6">
            Pronto a vedere l'AI in azione nel tuo backlog?
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            className="px-8 py-4 bg-metahodos-orange text-white rounded-lg font-semibold text-lg hover:bg-metahodos-orange-dark transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Prova Tutte le 7 Funzioni AI Gratis
          </button>
        </div>
      </div>
    </section>
  );
};
