import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { MetahodosButton, MetahodosCard, MetahodosInput } from '../components/ui';
import {
  ChartBarIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * DashboardMockup - Demonstration page showing all components
 * This mockup demonstrates the Metahodos design system implementation
 */
export const DashboardMockup: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mock data for stats cards
  const stats = [
    {
      title: 'Progetti Attivi',
      value: '12',
      icon: RocketLaunchIcon,
      color: 'text-metahodos-orange',
    },
    {
      title: 'Sprint Corrente',
      value: 'Sprint 5',
      icon: ChartBarIcon,
      color: 'text-info',
    },
    {
      title: 'Story Completate',
      value: '48',
      icon: CheckCircleIcon,
      color: 'text-success',
    },
    {
      title: 'Ore Rimanenti',
      value: '124',
      icon: ClockIcon,
      color: 'text-warning',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-wide mx-auto px-4 lg:px-6 py-8">
            {/* Page title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-metahodos-navy mb-2">
                Dashboard Mockup
              </h1>
              <p className="text-metahodos-text-secondary">
                Benvenuto nella demo del design system Metahodos
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <MetahodosCard key={index}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <p className="text-3xl font-bold text-metahodos-navy mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-metahodos-text-secondary">
                      {stat.title}
                    </p>
                  </MetahodosCard>
                );
              })}
            </div>

            {/* Buttons showcase */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-metahodos-navy mb-6">
                Button Components
              </h2>
              <MetahodosCard>
                <div className="space-y-6">
                  {/* Primary buttons */}
                  <div>
                    <h3 className="text-lg font-medium text-metahodos-navy mb-3">
                      Primary Buttons
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <MetahodosButton variant="primary" size="sm">
                        Small
                      </MetahodosButton>
                      <MetahodosButton variant="primary" size="md">
                        Medium
                      </MetahodosButton>
                      <MetahodosButton variant="primary" size="lg">
                        Large
                      </MetahodosButton>
                      <MetahodosButton variant="primary" disabled>
                        Disabled
                      </MetahodosButton>
                      <MetahodosButton variant="primary" isLoading>
                        Loading
                      </MetahodosButton>
                    </div>
                  </div>

                  {/* Secondary buttons */}
                  <div>
                    <h3 className="text-lg font-medium text-metahodos-navy mb-3">
                      Secondary & Outline Buttons
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <MetahodosButton variant="secondary">
                        Secondary
                      </MetahodosButton>
                      <MetahodosButton variant="outline">
                        Outline
                      </MetahodosButton>
                      <MetahodosButton variant="ghost">
                        Ghost
                      </MetahodosButton>
                    </div>
                  </div>

                  {/* Button with icons */}
                  <div>
                    <h3 className="text-lg font-medium text-metahodos-navy mb-3">
                      Buttons with Icons
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      <MetahodosButton
                        variant="primary"
                        leftIcon={<RocketLaunchIcon className="h-5 w-5" />}
                      >
                        Start Sprint
                      </MetahodosButton>
                      <MetahodosButton
                        variant="outline"
                        rightIcon={<ChartBarIcon className="h-5 w-5" />}
                      >
                        View Reports
                      </MetahodosButton>
                    </div>
                  </div>
                </div>
              </MetahodosCard>
            </section>

            {/* Form inputs showcase */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-metahodos-navy mb-6">
                Form Components
              </h2>
              <MetahodosCard>
                <div className="max-w-md space-y-6">
                  <MetahodosInput
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText="Inserisci il tuo indirizzo email"
                  />

                  <MetahodosInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <MetahodosInput
                    label="Nome progetto"
                    type="text"
                    placeholder="Es. Redesign Homepage"
                    error="Il nome del progetto è obbligatorio"
                  />

                  <MetahodosInput
                    label="Budget"
                    type="text"
                    placeholder="€ 10,000"
                    disabled
                    helperText="Campo non modificabile"
                  />

                  <MetahodosButton variant="primary" fullWidth>
                    Submit Form
                  </MetahodosButton>
                </div>
              </MetahodosCard>
            </section>

            {/* Interactive cards showcase */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-metahodos-navy mb-6">
                Card Components
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetahodosCard interactive onClick={() => alert('Card 1 clicked')}>
                  <h3 className="text-xl font-semibold text-metahodos-navy mb-2">
                    Interactive Card
                  </h3>
                  <p className="text-metahodos-text-secondary mb-4">
                    Click me! I have hover effects and can trigger actions.
                  </p>
                  <span className="text-sm text-metahodos-orange font-medium">
                    Learn more →
                  </span>
                </MetahodosCard>

                <MetahodosCard>
                  <h3 className="text-xl font-semibold text-metahodos-navy mb-2">
                    Static Card
                  </h3>
                  <p className="text-metahodos-text-secondary">
                    This is a standard card without interactive features.
                  </p>
                </MetahodosCard>

                <MetahodosCard interactive>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-metahodos-orange/10 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-metahodos-orange" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-metahodos-navy">Sprint 5</h4>
                      <p className="text-sm text-metahodos-text-muted">In progresso</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-metahodos-text-secondary">Progresso</span>
                      <span className="font-medium text-metahodos-navy">68%</span>
                    </div>
                    <div className="w-full bg-metahodos-gray-200 rounded-full h-2">
                      <div className="bg-metahodos-orange h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                  </div>
                </MetahodosCard>
              </div>
            </section>

            {/* Typography showcase */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-metahodos-navy mb-6">
                Typography Scale
              </h2>
              <MetahodosCard>
                <div className="space-y-4">
                  <h1>Heading 1 - The quick brown fox</h1>
                  <h2>Heading 2 - The quick brown fox</h2>
                  <h3>Heading 3 - The quick brown fox</h3>
                  <h4>Heading 4 - The quick brown fox</h4>
                  <h5>Heading 5 - The quick brown fox</h5>
                  <h6>Heading 6 - The quick brown fox</h6>
                  <p className="text-base text-metahodos-text-primary">
                    Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <p className="text-sm text-metahodos-text-secondary">
                    Small text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                  <p className="text-xs text-metahodos-text-muted">
                    Extra small text - Lorem ipsum dolor sit amet.
                  </p>
                </div>
              </MetahodosCard>
            </section>

            {/* Colors showcase */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-metahodos-navy mb-6">
                Color Palette
              </h2>
              <MetahodosCard>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-metahodos-navy mb-3">
                      Brand Colors
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="h-20 bg-metahodos-navy rounded-lg mb-2"></div>
                        <p className="text-sm font-medium">Navy</p>
                        <p className="text-xs text-metahodos-text-muted">#1a1f2e</p>
                      </div>
                      <div>
                        <div className="h-20 bg-metahodos-orange rounded-lg mb-2"></div>
                        <p className="text-sm font-medium">Orange</p>
                        <p className="text-xs text-metahodos-text-muted">#ff6b35</p>
                      </div>
                      <div>
                        <div className="h-20 bg-success rounded-lg mb-2"></div>
                        <p className="text-sm font-medium">Success</p>
                        <p className="text-xs text-metahodos-text-muted">#00d084</p>
                      </div>
                      <div>
                        <div className="h-20 bg-error rounded-lg mb-2"></div>
                        <p className="text-sm font-medium">Error</p>
                        <p className="text-xs text-metahodos-text-muted">#cf2e2e</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-metahodos-navy mb-3">
                      Gray Scale
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                        <div key={shade}>
                          <div className={`h-16 bg-metahodos-gray-${shade} rounded-lg mb-1`}></div>
                          <p className="text-xs text-center">{shade}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </MetahodosCard>
            </section>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};
