import React from 'react';
import {
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-metahodos-gray text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-metahodos-red" />
                <div className="w-3 h-3 rounded-full bg-metahodos-orange" />
                <div className="w-3 h-3 rounded-full bg-metahodos-green" />
              </div>
              <span className="text-xl font-black uppercase">Metahodos</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              La prima piattaforma Agile italiana potenziata da Intelligenza Artificiale.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-metahodos-green/20 border border-metahodos-green/40 text-metahodos-green text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-metahodos-green animate-pulse" />
              AI-Powered
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-black text-white mb-4 uppercase">Prodotto</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#features" className="hover:text-metahodos-orange transition-colors">
                  Features AI
                </a>
              </li>
              <li>
                <a href="/signup" className="hover:text-metahodos-orange transition-colors">
                  Prova Gratuita
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Prezzi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-black text-white mb-4 uppercase">Risorse</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#lead-magnet" className="hover:text-metahodos-orange transition-colors">
                  Template Gratuiti
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Documentazione
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Video Tutorial
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Case Study
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-black text-white mb-4 uppercase">Azienda</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Chi Siamo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-metahodos-orange transition-colors">
                  Termini di Servizio
                </a>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                <a href="mailto:support@metahodos.com" className="hover:text-metahodos-orange transition-colors">
                  support@metahodos.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Italia 🇮🇹</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © {currentYear} Metahodos. Tutti i diritti riservati.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-metahodos-orange transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-metahodos-orange transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-metahodos-orange transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Made with Love */}
          <div className="text-sm text-gray-400">
            Made with <span className="text-red-500">❤️</span> in Italy
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-metahodos-green">✓</span>
              <span>GDPR Compliant</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-metahodos-green">✓</span>
              <span>Hosting EU (Frankfurt)</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-metahodos-green">✓</span>
              <span>SSL/TLS Encryption</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-metahodos-green">✓</span>
              <span>SOC 2 Type II</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-metahodos-green">✓</span>
              <span>99.9% Uptime SLA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
