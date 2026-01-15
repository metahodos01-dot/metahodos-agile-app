import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PresentationChartLineIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const scrollToLeadMagnet = () => {
    const element = document.getElementById('lead-magnet');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-metahodos-gray-600 pt-20 pb-32">
      {/* Geometric elements in Metahodos style */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-metahodos-orange/10 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-metahodos-green/10 transform -rotate-12 -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          {/* 3 Dots Badge */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-metahodos-red" />
              <div className="w-4 h-4 rounded-full bg-metahodos-orange" />
              <div className="w-4 h-4 rounded-full bg-metahodos-green" />
            </div>
          </div>

          {/* Main Headline - Metahodos Style */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
            IL METODO
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-6 italic">
            L'efficienza aziendale, in PRATICA.
          </p>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-4 leading-relaxed">
            A differenza della maggior parte dei consulenti che ti spiega cosa fare,
            <br className="hidden md:block" />
            ma poi non riesce a trasformare quelle procedure in routine,
          </p>
          <p className="text-lg md:text-xl text-white font-semibold max-w-3xl mx-auto mb-12">
            io guido la trasformazione aziendale insieme a te fino al
            <br className="hidden md:block" />
            miglioramento completo della sua efficienza.
          </p>

          {/* Subtitle con AI focus */}
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            Percorreremo insieme 7 fasi che ci porteranno a rinnovare completamente l'azienda, dall'interno.
            <br className="hidden md:block" />
            <span className="text-white font-semibold">Powered by AI.</span>
          </p>

          {/* CTA Buttons - Metahodos Style */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-metahodos-orange text-white font-bold text-lg hover:bg-metahodos-orange-dark transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              SCOPRI METAHODOS
            </button>
            <button
              onClick={scrollToLeadMagnet}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border-2 border-white/50 font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Scarica Template Gratuiti
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-white/90 text-sm">
                <span className="font-bold">500+</span> team già usano Metahodos
              </span>
            </div>
            <p className="text-gray-400 italic text-sm">
              "L'AI ha fatto quello che 3 consulenti Agile non erano riusciti a fare in 6 mesi"
            </p>
          </div>
        </div>

        {/* AI Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: DocumentTextIcon,
              title: 'Scrive User Stories',
              description: 'Partendo da una frase, genera storie complete con AC',
            },
            {
              icon: ChartBarIcon,
              title: 'Stima Story Points',
              description: 'Accuracy 87% analizzando storico e complessità',
            },
            {
              icon: MagnifyingGlassIcon,
              title: 'Trova Blockers',
              description: 'Predice problemi prima che emergano',
            },
            {
              icon: PresentationChartLineIcon,
              title: 'Genera Retrospettive',
              description: 'Report automatici data-driven in 5 minuti',
            },
            {
              icon: LightBulbIcon,
              title: 'Suggerisce Split di Epic',
              description: 'Divide epic troppo grandi in dimensioni gestibili',
            },
            {
              icon: SparklesIcon,
              title: 'Priorità MoSCoW',
              description: 'Ordina backlog per valore e ROI automaticamente',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group"
            >
              <feature.icon className="h-8 w-8 text-metahodos-orange mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '87%', label: 'Accuracy Stime AI' },
            { value: '-72%', label: 'Tempo Planning' },
            { value: '+34%', label: 'Sprint Completati' },
            { value: '+28%', label: 'Velocity Media' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-metahodos-orange mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
