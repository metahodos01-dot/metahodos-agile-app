import React from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeroSection } from '../components/landing/HeroSection';
import { ValuePropositionSection } from '../components/landing/ValuePropositionSection';
import { AIFeaturesSection } from '../components/landing/AIFeaturesSection';
import { BeforeAfterSection } from '../components/landing/BeforeAfterSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { LeadMagnetSection } from '../components/landing/LeadMagnetSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingFooter } from '../components/landing/LandingFooter';

/**
 * LandingPage - Marketing landing page for lead generation
 * AI-focused value proposition for Metahodos Agile App
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <LandingHeader />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Value Proposition - Metahodos Style */}
        <ValuePropositionSection />

        {/* Problem/Solution Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-metahodos-gray mb-4">
                Perché Gli Strumenti Agile Tradizionali<br />
                Stanno Diventando Obsoleti
              </h2>
              <p className="text-xl text-metahodos-text-secondary max-w-3xl mx-auto">
                L'AI non è il futuro dell'Agile. È il presente.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Without AI */}
              <div className="bg-white p-8 rounded-xl border-2 border-red-200">
                <div className="flex items-center gap-3 mb-6">
                  <XMarkIcon className="h-8 w-8 text-red-500" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Jira, Trello, Monday.com
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-6 italic">Strumenti "stupidi"</p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Scrivi User Stories manualmente</p>
                      <p className="text-sm text-gray-600">Tempo perso: 2-3 ore/settimana</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Indovini gli Story Points</p>
                      <p className="text-sm text-gray-600">Accuracy: ~60% (studi dimostrano)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Raccogli metriche manualmente</p>
                      <p className="text-sm text-gray-600">Dati incompleti, bias umano</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Blockers scoperti troppo tardi</p>
                      <p className="text-sm text-gray-600">70% emerge quando è già tardi</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* With AI */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -mr-16 -mt-16 opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <SparklesIcon className="h-8 w-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Metahodos AI
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 mb-6 italic font-medium">AI-Native Agile Platform</p>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI genera User Stories complete</p>
                        <p className="text-sm text-gray-700">In 30 secondi con Acceptance Criteria</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI stima con accuracy del 87%</p>
                        <p className="text-sm text-gray-700">Analizza storico + complessità + capacity</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI genera insights automatici</p>
                        <p className="text-sm text-gray-700">Daily scrum e retro data-driven</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AI predice problemi in anticipo</p>
                        <p className="text-sm text-gray-700">Blockers rilevati prima che esplodano</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Showcase */}
        <AIFeaturesSection />

        {/* Before/After Comparison */}
        <BeforeAfterSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Lead Magnet */}
        <LeadMagnetSection />

        {/* FAQ */}
        <FAQSection />

        {/* Final CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
