/**
 * ProjectContext - Manages current active project
 * Provides project selection and switching functionality across the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserProjects } from '../lib/firestore-projects';
import type { Project } from '../lib/types';
import toast from 'react-hot-toast';

interface ProjectContextValue {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  setCurrentProject: (project: Project | null) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

const CURRENT_PROJECT_KEY = 'metahodos_current_project_id';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects for current user
  useEffect(() => {
    if (currentUser) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProjectState(null);
      setLoading(false);
    }
  }, [currentUser]);

  // Load last selected project from localStorage
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      const savedProjectId = localStorage.getItem(CURRENT_PROJECT_KEY);

      if (savedProjectId) {
        const savedProject = projects.find(p => p.id === savedProjectId);
        if (savedProject) {
          setCurrentProjectState(savedProject);
          return;
        }
      }

      // No saved project or not found, select first project
      setCurrentProjectState(projects[0]);
    }
  }, [projects]);

  async function loadProjects() {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log('Loading projects for user:', currentUser.uid);
      const userProjects = await getUserProjects(currentUser.uid);
      console.log('Projects loaded:', userProjects.length, userProjects);
      setProjects(userProjects);

      if (userProjects.length === 0) {
        console.warn('No projects found for user. User may need to create a project.');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Errore nel caricamento dei progetti');
    } finally {
      setLoading(false);
    }
  }

  function setCurrentProject(project: Project | null) {
    setCurrentProjectState(project);

    if (project) {
      localStorage.setItem(CURRENT_PROJECT_KEY, project.id);
    } else {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  }

  async function refreshProjects() {
    await loadProjects();
  }

  const value: ProjectContextValue = {
    currentProject,
    projects,
    loading,
    setCurrentProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
