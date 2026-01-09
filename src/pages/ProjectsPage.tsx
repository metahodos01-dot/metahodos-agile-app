/**
 * ProjectsPage - Manage user projects
 * Create, edit, delete, and switch between projects
 */

import { useState, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { createProject, updateProject, archiveProject } from '../lib/firestore-projects';
import { MetahodosButton } from '../components/ui/MetahodosButton';
import { MetahodosCard } from '../components/ui/MetahodosCard';
import { MetahodosBadge } from '../components/ui/MetahodosBadge';
import { MetahodosModal } from '../components/ui/MetahodosModal';
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Project } from '../lib/types';

export function ProjectsPage() {
  const { currentUser } = useAuth();
  const { projects, currentProject, setCurrentProject, refreshProjects } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  // Open create modal if no projects exist
  useEffect(() => {
    if (projects.length === 0 && !showCreateModal) {
      setShowCreateModal(true);
    }
  }, [projects.length]);

  async function handleCreateProject() {
    if (!currentUser) return;
    if (!formData.name.trim()) {
      toast.error('Inserisci un nome per il progetto');
      return;
    }

    try {
      setLoading(true);
      const newProject = await createProject(
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
        },
        currentUser.uid
      );

      await refreshProjects();
      setCurrentProject(newProject);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      toast.success('Progetto creato con successo!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Errore nella creazione del progetto');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProject() {
    if (!editingProject) return;
    if (!formData.name.trim()) {
      toast.error('Inserisci un nome per il progetto');
      return;
    }

    try {
      setLoading(true);
      await updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      await refreshProjects();
      setEditingProject(null);
      setFormData({ name: '', description: '' });
      toast.success('Progetto aggiornato con successo!');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Errore nell\'aggiornamento del progetto');
    } finally {
      setLoading(false);
    }
  }

  async function handleArchiveProject(projectId: string) {
    if (!confirm('Sei sicuro di voler archiviare questo progetto?')) return;

    try {
      await archiveProject(projectId);
      await refreshProjects();

      if (currentProject?.id === projectId) {
        setCurrentProject(projects.find(p => p.id !== projectId) || null);
      }

      toast.success('Progetto archiviato');
    } catch (error) {
      console.error('Error archiving project:', error);
      toast.error('Errore nell\'archiviazione del progetto');
    }
  }

  function openEditModal(project: Project) {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
    });
  }

  function closeModals() {
    setShowCreateModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-metahodos-gray uppercase tracking-tight">
            I Miei Progetti
          </h1>
          <p className="text-metahodos-text-secondary mt-2">
            Gestisci i tuoi progetti Agile
          </p>
        </div>
        <MetahodosButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nuovo Progetto
        </MetahodosButton>
      </div>

      {projects.length === 0 ? (
        <MetahodosCard className="text-center py-12">
          <FolderIcon className="h-16 w-16 text-metahodos-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-metahodos-gray mb-2">
            Nessun Progetto
          </h2>
          <p className="text-metahodos-text-secondary mb-6">
            Crea il tuo primo progetto per iniziare
          </p>
          <MetahodosButton
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon className="h-5 w-5" />}
          >
            Crea Primo Progetto
          </MetahodosButton>
        </MetahodosCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <MetahodosCard
              key={project.id}
              className={`relative ${
                currentProject?.id === project.id
                  ? 'ring-2 ring-metahodos-orange'
                  : ''
              }`}
            >
              {currentProject?.id === project.id && (
                <div className="absolute top-4 right-4">
                  <MetahodosBadge variant="primary" size="sm">
                    Attivo
                  </MetahodosBadge>
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-metahodos-orange/10">
                  <FolderIcon className="h-8 w-8 text-metahodos-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-metahodos-gray mb-1 truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-metahodos-text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-metahodos-text-secondary mt-2">
                    Creato il {project.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                {currentProject?.id !== project.id && (
                  <MetahodosButton
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProject(project)}
                    leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Seleziona
                  </MetahodosButton>
                )}
                <MetahodosButton
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(project)}
                >
                  <PencilIcon className="h-4 w-4" />
                </MetahodosButton>
                <MetahodosButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchiveProject(project.id)}
                  className="text-metahodos-red hover:bg-metahodos-red/10"
                >
                  <TrashIcon className="h-4 w-4" />
                </MetahodosButton>
              </div>
            </MetahodosCard>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <MetahodosModal
        isOpen={showCreateModal || !!editingProject}
        onClose={closeModals}
        title={editingProject ? 'Modifica Progetto' : 'Nuovo Progetto'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-metahodos-gray mb-2">
              Nome Progetto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="es. SACMI - Linea Produzione Tappi"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-metahodos-orange focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-metahodos-gray mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descrizione del progetto..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-metahodos-orange focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <MetahodosButton
              variant="outline"
              onClick={closeModals}
              className="flex-1"
            >
              Annulla
            </MetahodosButton>
            <MetahodosButton
              variant="primary"
              onClick={editingProject ? handleUpdateProject : handleCreateProject}
              isLoading={loading}
              className="flex-1"
            >
              {editingProject ? 'Salva' : 'Crea Progetto'}
            </MetahodosButton>
          </div>
        </div>
      </MetahodosModal>
    </div>
  );
}
