/**
 * ProjectSelector - Dropdown to select active project
 * Displayed in sidebar to switch between projects
 */

import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { ChevronDownIcon, PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

export function ProjectSelector() {
  const { currentProject, projects, setCurrentProject } = useProject();
  const navigate = useNavigate();

  if (projects.length === 0) {
    return (
      <div className="px-3 py-2">
        <button
          onClick={() => navigate('/projects')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-metahodos-orange/10 hover:bg-metahodos-orange/20 text-metahodos-orange transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-sm font-bold">Crea Progetto</span>
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <Menu as="div" className="relative">
        <Menu.Button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-metahodos-gray-100 transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <FolderIcon className="h-5 w-5 text-metahodos-orange flex-shrink-0" />
            <div className="min-w-0 text-left">
              <p className="text-sm font-bold text-metahodos-gray truncate">
                {currentProject?.name || 'Seleziona Progetto'}
              </p>
              <p className="text-xs text-metahodos-text-secondary">
                {projects.length} {projects.length === 1 ? 'progetto' : 'progetti'}
              </p>
            </div>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-metahodos-text-secondary flex-shrink-0" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 right-0 mt-2 mx-3 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-96 overflow-y-auto">
            <div className="py-1">
              {projects.map((project) => (
                <Menu.Item key={project.id}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        setCurrentProject(project);
                      }}
                      className={`
                        w-full text-left px-4 py-2 text-sm flex items-center gap-2
                        ${active ? 'bg-metahodos-orange/10' : ''}
                        ${currentProject?.id === project.id ? 'bg-metahodos-orange/20' : ''}
                      `}
                    >
                      <FolderIcon
                        className={`h-4 w-4 ${
                          currentProject?.id === project.id
                            ? 'text-metahodos-orange'
                            : 'text-metahodos-text-secondary'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold truncate ${
                            currentProject?.id === project.id
                              ? 'text-metahodos-orange'
                              : 'text-metahodos-gray'
                          }`}
                        >
                          {project.name}
                        </p>
                        {project.description && (
                          <p className="text-xs text-metahodos-text-secondary truncate">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>

            <div className="border-t border-gray-200 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate('/projects')}
                    className={`
                      w-full text-left px-4 py-2 text-sm flex items-center gap-2 font-bold
                      ${active ? 'bg-metahodos-orange/10 text-metahodos-orange' : 'text-metahodos-gray'}
                    `}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Gestisci Progetti
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
