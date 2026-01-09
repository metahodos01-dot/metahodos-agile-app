import React from 'react';
import { XMarkIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ComparisonItem {
  phase: string;
  without: {
    time: string;
    tasks: string[];
    result: string;
    resultType: 'bad' | 'neutral';
  };
  with: {
    time: string;
    tasks: string[];
    result: string;
    resultType: 'good';
  };
}

const comparisons: ComparisonItem[] = [
  {
    phase: 'BACKLOG REFINEMENT',
    without: {
      time: '3 ore/settimana',
      tasks: [
        'PO scrive storie manualmente',
        'Team discute punti (accuracy 60%)',
        'Priorità "a feeling"',
      ],
      result: 'Backlog sempre incompleto',
      resultType: 'bad',
    },
    with: {
      time: '30 minuti/settimana',
      tasks: [
        'AI genera storie da brief',
        'AI stima con 87% accuracy',
        'AI prioritizza con data su ROI',
      ],
      result: 'Backlog sempre pronto',
      resultType: 'good',
    },
  },
  {
    phase: 'SPRINT PLANNING',
    without: {
      time: '4 ore meeting',
      tasks: [
        'Selezione storie manuale (caotica)',
        'Discussioni infinite su stime',
        'Commitment "speriamo"',
        'Risk invisibili',
      ],
      result: 'Sprint finiti: 55%',
      resultType: 'bad',
    },
    with: {
      time: '45 minuti meeting',
      tasks: [
        'AI suggerisce optimal backlog',
        'Success probability calcolata (92%)',
        'Risks evidenziati in anticipo',
      ],
      result: 'Sprint finiti: 89%',
      resultType: 'good',
    },
  },
  {
    phase: 'DAILY SCRUM',
    without: {
      time: '25 minuti avg',
      tasks: [
        '"Cosa hai fatto ieri" (ripetitivo)',
        'Blockers nascosti fino a troppo tardi',
        'No action items concreti',
      ],
      result: 'Perdita tempo, low value',
      resultType: 'bad',
    },
    with: {
      time: '8 minuti avg',
      tasks: [
        'AI pre-summary dei progressi',
        'Blockers rilevati automaticamente',
        'Action items suggeriti',
      ],
      result: 'Focus su problemi reali',
      resultType: 'good',
    },
  },
  {
    phase: 'RETROSPECTIVE',
    without: {
      time: '2h prep + 1.5h mtg',
      tasks: [
        'SM raccoglie metriche manualmente',
        'Discussione generica senza dati',
        'Action items vaghi',
        'Nessun tracking follow-up',
      ],
      result: 'Miglioramento minimo o zero',
      resultType: 'bad',
    },
    with: {
      time: '5min prep + 45min',
      tasks: [
        'AI genera report automatico completo',
        'Root cause analysis data-driven',
        'Action items SMART tracciati',
      ],
      result: 'Velocity +40% in 3 sprint',
      resultType: 'good',
    },
  },
];

export const BeforeAfterSection: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-metahodos-red/20 text-metahodos-red font-semibold text-sm mb-4 border border-metahodos-red/30">
            ⚖️ CONFRONTO DIRETTO
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-metahodos-gray mb-4 uppercase tracking-tight">
            Gestire Uno Sprint:<br />
            Con AI vs Senza AI
          </h2>
          <p className="text-xl text-metahodos-text-secondary max-w-3xl mx-auto">
            Stesso team, stessi obiettivi. Risultati completamente diversi.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="space-y-8">
          {comparisons.map((comparison, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              {/* Phase Header */}
              <div className="bg-metahodos-gray px-8 py-4">
                <h3 className="text-xl font-black text-white uppercase tracking-wide">{comparison.phase}</h3>
              </div>

              {/* Comparison Grid */}
              <div className="grid md:grid-cols-2 divide-x divide-gray-200">
                {/* WITHOUT AI */}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XMarkIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">SENZA AI</h4>
                      <p className="text-sm text-gray-500">Jira, Trello, Monday.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-red-500" />
                    <span className="text-lg font-semibold text-red-600">{comparison.without.time}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {comparison.without.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`
                    px-4 py-3 rounded-lg font-medium
                    ${comparison.without.resultType === 'bad'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }
                  `}>
                    <span className="text-sm font-semibold">RISULTATO: </span>
                    {comparison.without.result}
                  </div>
                </div>

                {/* WITH AI */}
                <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">CON METAHODOS AI</h4>
                      <p className="text-sm text-green-700 font-medium">AI-Native Platform</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <ClockIcon className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">{comparison.with.time}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {comparison.with.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span className="text-gray-800 font-medium">{task}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="px-4 py-3 rounded-lg bg-green-500 text-white font-medium border-2 border-green-600">
                    <span className="text-sm font-semibold">RISULTATO: </span>
                    {comparison.with.result}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ROI Summary Card */}
        <div className="mt-16 bg-metahodos-orange rounded-2xl p-10 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-black mb-6 text-center uppercase">
              📊 Totale Tempo Risparmiato Per Sprint (2 settimane)
            </h3>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="text-sm font-medium mb-2 opacity-90">❌ Senza AI</div>
                <div className="text-4xl font-bold mb-2">~18 ore</div>
                <div className="text-sm opacity-80">di lavoro cerimoniale</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="text-sm font-medium mb-2 opacity-90">✅ Con AI</div>
                <div className="text-4xl font-bold mb-2">~4 ore</div>
                <div className="text-sm opacity-80">di lavoro focalizzato</div>
              </div>
            </div>

            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">💰 ROI per team di 5 persone:</div>
                <div className="text-5xl font-bold mb-2">€18.000/anno</div>
                <div className="text-base opacity-90">
                  14 ore risparmiate × €50/h × 26 sprint/anno
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
