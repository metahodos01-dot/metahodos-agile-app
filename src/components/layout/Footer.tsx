import React from 'react';
import { MetahodosCircles } from '../ui/MetahodosCircles';

/**
 * Footer - Bottom page footer
 * Styled according to Metahodos design system
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-metahodos-navy text-white mt-auto">
      <div className="max-w-wide mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MetahodosCircles size="md" />
              <img
                src="/assets/images/LogoMetaHodos.png"
                alt="Metahodos Logo"
                className="h-8 object-contain invert"
              />
            </div>
            <p className="text-metahodos-gray-300 text-sm">
              Gestione progetti Agile professionale per lo sviluppo prodotto e il miglioramento dei processi.
            </p>
            <p className="text-metahodos-gray-400 text-xs mt-2 font-medium">
              PERSONE • AGILITÀ • RISULTATI
            </p>
          </div>

          {/* Links column */}
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs" className="text-metahodos-gray-300 hover:text-metahodos-orange transition-colors">
                  Documentazione
                </a>
              </li>
              <li>
                <a href="/support" className="text-metahodos-gray-300 hover:text-metahodos-orange transition-colors">
                  Supporto
                </a>
              </li>
              <li>
                <a href="/about" className="text-metahodos-gray-300 hover:text-metahodos-orange transition-colors">
                  Chi siamo
                </a>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="font-semibold mb-4">Contatti</h3>
            <ul className="space-y-2 text-sm text-metahodos-gray-300">
              <li>Email: info@metahodos.com</li>
              <li>Web: www.metahodos.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-metahodos-navy-light text-center text-sm text-metahodos-gray-300">
          <p>&copy; {currentYear} Metahodos. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};
