import React from 'react';
import { RocketLaunchIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const CTASection: React.FC = () => {
  const scrollToLeadMagnet = () => {
    const element = document.getElementById('lead-magnet');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-metahodos-gray relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-metahodos-orange opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-metahodos-green opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-metahodos-green/20 backdrop-blur-sm border border-metahodos-green/40 text-white mb-6">
          <SparklesIcon className="h-5 w-5 text-metahodos-green" />
          <span className="text-sm font-bold">500+ team hanno già risparmiato 18.000+ ore grazie all'AI</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
          Pronto a Fare Agile<br />
          Con i Super-Poteri?
        </h2>

        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
          Mentre i tuoi competitor perdono ore in planning,<br />
          tu potresti finire in 45 minuti grazie all'AI.
        </p>

        <p className="text-lg text-gray-400 mb-12">
          Il tuo team sarà il prossimo?
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => window.location.href = '/signup'}
            className="w-full sm:w-auto px-8 py-5 bg-metahodos-orange text-white rounded-lg font-bold text-lg hover:bg-metahodos-orange-dark transition-all shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center justify-center gap-2 group"
          >
            <RocketLaunchIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" />
            Attiva l'AI Gratis per 14 Giorni
          </button>
          <button
            onClick={scrollToLeadMagnet}
            className="w-full sm:w-auto px-8 py-5 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center justify-center gap-2"
          >
            <DocumentTextIcon className="h-6 w-6" />
            Scarica prima la Guida AI
          </button>
        </div>

        {/* Features List */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: '✓', text: 'No carta di credito' },
            { icon: '✓', text: 'Setup in 5 minuti' },
            { icon: '✓', text: 'Tutte le feature AI' },
            { icon: '✓', text: 'Cancelli quando vuoi' },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 justify-center text-white/90"
            >
              <span className="text-metahodos-green font-bold text-xl">{feature.icon}</span>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-metahodos-orange mb-2">87%</div>
              <div className="text-gray-400 text-sm">Accuracy Stime AI</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="text-4xl font-bold text-metahodos-orange mb-2">-72%</div>
              <div className="text-gray-400 text-sm">Tempo Planning</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="text-4xl font-bold text-metahodos-orange mb-2">+34%</div>
              <div className="text-gray-400 text-sm">Sprint Completati</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div className="text-center">
              <div className="text-4xl font-bold text-metahodos-orange mb-2">500+</div>
              <div className="text-gray-400 text-sm">Team Attivi</div>
            </div>
          </div>
        </div>

        {/* Urgency Element */}
        <div className="mt-12 inline-block px-6 py-3 rounded-full bg-metahodos-red/20 border border-metahodos-red/40 text-white">
          <span className="font-bold">🔥 Offerta Early Adopter: </span>
          <span>Prime 100 iscrizioni ottengono onboarding 1-on-1 gratuito (valore €300)</span>
        </div>
      </div>
    </section>
  );
};
