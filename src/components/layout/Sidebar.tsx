import React from 'react';
import { useLocation } from 'react-router-dom';
import { MetahodosDots } from '../landing/MetahodosDots';
import { ProjectSelector } from '../project/ProjectSelector';
import {
  HomeIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  Bars3BottomLeftIcon,
  FunnelIcon,
  CalendarIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  UsersIcon,
  SparklesIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChartPieIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children?: NavItem[];
  badge?: string;
}

interface NavSection {
  title?: string;
  badge?: string;
  description?: string;
  items: NavItem[];
}

// Structured navigation following Agile workflow timeline
const navSections: NavSection[] = [
  // Home
  {
    items: [
      { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
    ],
  },

  // Phase 1: Discovery & Planning
  {
    title: 'Discovery & Strategy',
    badge: '1',
    description: 'Define vision and strategy',
    items: [
      {
        name: 'Discovery',
        icon: LightBulbIcon,
        href: '/discovery',
        children: [
          { name: 'Overview', icon: HomeIcon, href: '/discovery' },
          { name: 'Business Model', icon: ChartPieIcon, href: '/discovery/bmc' },
          { name: 'Value Proposition', icon: SparklesIcon, href: '/discovery/vpc' },
          { name: 'Value Stream Map', icon: ArrowPathIcon, href: '/discovery/vsm' },
          { name: 'Gap Analysis', icon: AdjustmentsHorizontalIcon, href: '/discovery/gap' },
        ],
      },
      { name: 'Stakeholders', icon: UserGroupIcon, href: '/stakeholders' },
    ],
  },

  // Phase 2: Product Backlog
  {
    title: 'Product Backlog',
    badge: '2',
    description: 'Build and prioritize backlog',
    items: [
      { name: 'Epics', icon: RocketLaunchIcon, href: '/epics' },
      { name: 'User Stories', icon: Bars3BottomLeftIcon, href: '/backlog' },
      { name: 'Prioritization', icon: FunnelIcon, href: '/moscow' },
    ],
  },

  // Phase 3: Sprint Execution
  {
    title: 'Sprint Execution',
    badge: '3',
    description: 'Plan and run sprints',
    items: [
      {
        name: 'Sprints',
        icon: CalendarIcon,
        href: '/sprints',
        children: [
          { name: 'All Sprints', icon: CalendarIcon, href: '/sprints' },
        ],
      },
    ],
  },

  // Phase 4: Analysis & Improvement
  {
    title: 'Insights & Analytics',
    badge: '4',
    description: 'Measure and improve',
    items: [
      { name: 'Analytics', icon: PresentationChartLineIcon, href: '/analytics' },
    ],
  },

  // Team & Resources
  {
    title: 'Team & Resources',
    items: [
      { name: 'Team', icon: UsersIcon, href: '/team' },
      { name: 'AI Assistant', icon: SparklesIcon, href: '/ai-settings', badge: 'New' },
    ],
  },

  // Settings
  {
    items: [
      { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
    ],
  },
];

/**
 * Sidebar - Side navigation with Agile workflow timeline
 * Organized in sequential phases following the Agile process
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.href));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Always visible on desktop, toggleable on mobile */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-metahodos-gray-200 z-50
          transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:!translate-x-0
        `}
      >
        {/* Close button (mobile only) */}
        <div className="lg:hidden p-4 flex justify-end border-b border-metahodos-gray-200 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-metahodos-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6 text-metahodos-text-primary" />
          </button>
        </div>

        {/* Project Selector */}
        <ProjectSelector />

        {/* Navigation */}
        <nav className="p-4 pb-20">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Section Header */}
              {section.title && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 px-3">
                    {section.badge && (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-metahodos-orange/20 text-metahodos-orange text-xs font-bold border border-metahodos-orange/30">
                        {section.badge}
                      </span>
                    )}
                    <h3 className="text-xs font-bold text-metahodos-gray uppercase tracking-wider">
                      {section.title}
                    </h3>
                  </div>
                  {section.description && (
                    <p className="text-xs text-gray-400 px-3 mt-1">
                      {section.description}
                    </p>
                  )}
                </div>
              )}

              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const childActive = hasActiveChild(item);

                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={`
                          flex items-center justify-between gap-3 px-4 py-2.5 rounded-md transition-all duration-200
                          ${
                            active || childActive
                              ? 'bg-orange-50 text-metahodos-orange font-medium'
                              : 'text-metahodos-text-primary hover:bg-metahodos-gray-100'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            {item.badge}
                          </span>
                        )}
                      </a>

                      {/* Sub-navigation */}
                      {item.children && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isActive(child.href);

                            return (
                              <li key={child.name}>
                                <a
                                  href={child.href}
                                  className={`
                                    flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200
                                    ${
                                      childActive
                                        ? 'bg-orange-50 text-metahodos-orange font-medium'
                                        : 'text-metahodos-text-secondary hover:bg-metahodos-gray-100'
                                    }
                                  `}
                                >
                                  <ChildIcon className="h-4 w-4" />
                                  <span>{child.name}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Section Divider */}
              {section.title && sectionIndex < navSections.length - 1 && (
                <div className="h-px bg-gray-200 mt-6" />
              )}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MetahodosDots size="sm" />
            <span className="text-sm font-black text-metahodos-gray uppercase tracking-wide">
              METAHODOS
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Phase 8 - AI Enhanced
          </p>
        </div>
      </aside>
    </>
  );
};
