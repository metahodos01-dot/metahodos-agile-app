import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { MetahodosDots } from './MetahodosDots';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <MetahodosDots size="md" />
            <span className="text-xl font-bold text-metahodos-gray">
              METAHODOS
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
            >
              Testimonianze
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 bg-metahodos-orange text-white rounded-lg font-medium hover:bg-metahodos-orange-dark transition-colors shadow-md hover:shadow-lg"
            >
              Inizia Gratis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              >
                Testimonianze
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              >
                FAQ
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-left text-metahodos-text-secondary hover:text-metahodos-orange transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-metahodos-orange text-white rounded-lg font-medium hover:bg-metahodos-orange-dark transition-colors text-center"
              >
                Inizia Gratis
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
