import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  MetahodosButton,
  MetahodosCard,
  MetahodosBadge,
} from '../../components/ui';
import {
  LightBulbIcon,
  ChartPieIcon,
  SparklesIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { checkCanvasStatus } from '../../lib/firestore-discovery';
import toast from 'react-hot-toast';

// Temporary hardcoded projectId
const DEFAULT_PROJECT_ID = 'default-project';

interface DiscoveryTool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  bgColor: string;
}

const DISCOVERY_TOOLS: DiscoveryTool[] = [
  {
    id: 'bmc',
    title: 'Business Model Canvas',
    description: 'Definisci il modello di business con 9 elementi chiave: segmenti clienti, proposte di valore, canali, relazioni, ricavi, risorse, attività, partnership e costi.',
    icon: ChartPieIcon,
    path: '/discovery/bmc',
    color: '#ff6b35',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'vpc',
    title: 'Value Proposition Canvas',
    description: 'Mappa i bisogni dei clienti (jobs, pains, gains) e come il prodotto li indirizza con funzionalità, pain relievers e gain creators.',
    icon: SparklesIcon,
    path: '/discovery/vpc',
    color: '#fcb900',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'vsm',
    title: 'Value Stream Mapping',
    description: 'Visualizza il flusso di valore dei processi, identifica sprechi e progetta lo stato futuro migliorato per aumentare l\'efficienza.',
    icon: ArrowPathIcon,
    path: '/discovery/vsm',
    color: '#0693e3',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'gap',
    title: 'Gap Analysis',
    description: 'Analizza il divario tra lo stato attuale e futuro, identifica gap critici e pianifica azioni concrete per colmarli.',
    icon: AdjustmentsHorizontalIcon,
    path: '/discovery/gap',
    color: '#16a34a',
    bgColor: 'bg-green-50',
  },
];

export const DiscoveryPage: React.FC = () => {
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [canvasStatus, setCanvasStatus] = useState({
    bmcExists: false,
    vpcExists: false,
    vsmExists: false,
    gatExists: false,
  });

  // Load canvas status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        console.log('Loading canvas status for project:', DEFAULT_PROJECT_ID);
        const status = await checkCanvasStatus(DEFAULT_PROJECT_ID);
        console.log('Canvas status loaded:', status);
        setCanvasStatus(status);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading canvas status:', error);
        toast.error('Errore nel caricamento dello stato dei canvas');
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  // Get status for tool
  const getToolStatus = (toolId: string): boolean => {
    switch (toolId) {
      case 'bmc':
        return canvasStatus.bmcExists;
      case 'vpc':
        return canvasStatus.vpcExists;
      case 'vsm':
        return canvasStatus.vsmExists;
      case 'gap':
        return canvasStatus.gatExists;
      default:
        return false;
    }
  };

  // Navigate to tool
  const handleNavigateToTool = (tool: DiscoveryTool) => {
    navigate(tool.path);
  };

  // Calculate stats
  const totalTools = DISCOVERY_TOOLS.length;
  const completedTools = Object.values(canvasStatus).filter(Boolean).length;
  const progressPercentage = Math.round((completedTools / totalTools) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-metahodos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-metahodos-text-secondary">Caricamento Discovery Tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metahodos-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-metahodos-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-metahodos-navy flex items-center">
                <LightBulbIcon className="h-8 w-8 mr-3 text-metahodos-orange" />
                Discovery & Process Improvement
              </h1>
              <p className="text-metahodos-text-secondary mt-1">
                Strumenti strategici per analisi di business e miglioramento dei processi
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Tools Totali</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">{totalTools}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-700">Tools Completati</div>
              <div className="text-2xl font-bold text-green-900 mt-1">{completedTools}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700">Progresso</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{progressPercentage}%</div>
            </div>
            <div className="bg-metahodos-gray-50 rounded-lg p-4">
              <div className="text-sm text-metahodos-text-secondary">Da Completare</div>
              <div className="text-2xl font-bold text-metahodos-navy mt-1">
                {totalTools - completedTools}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {completedTools === 0 ? (
          <MetahodosCard>
            <div className="text-center py-12">
              <LightBulbIcon className="h-16 w-16 text-metahodos-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metahodos-navy mb-2">
                Inizia con Discovery Tools
              </h3>
              <p className="text-metahodos-text-secondary mb-6 max-w-2xl mx-auto">
                Utilizza questi strumenti strategici per analizzare il tuo business, mappare la
                proposta di valore, ottimizzare i processi e identificare opportunità di
                miglioramento.
              </p>
              <p className="text-sm text-metahodos-text-muted mb-6">
                Seleziona uno strumento qui sotto per iniziare
              </p>
            </div>
          </MetahodosCard>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-metahodos-navy mb-4">
              Strumenti Disponibili
            </h2>
          </div>
        )}

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DISCOVERY_TOOLS.map((tool) => {
            const exists = getToolStatus(tool.id);

            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                exists={exists}
                onNavigate={handleNavigateToTool}
              />
            );
          })}
        </div>

        {/* Help Section */}
        <MetahodosCard className="mt-8">
          <div className="flex items-start space-x-2">
            <LightBulbIcon className="h-5 w-5 text-metahodos-orange mt-0.5" />
            <div>
              <h4 className="font-semibold text-metahodos-navy">Suggerimento</h4>
              <p className="text-sm text-metahodos-text-secondary mt-1">
                Inizia con il <strong>Business Model Canvas</strong> per definire il modello di
                business, poi usa il <strong>Value Proposition Canvas</strong> per dettagliare la
                proposta di valore. Utilizza <strong>Value Stream Mapping</strong> per
                ottimizzare i processi e <strong>Gap Analysis</strong> per pianificare i
                miglioramenti.
              </p>
            </div>
          </div>
        </MetahodosCard>
      </div>
    </div>
  );
};

// Tool Card Component
interface ToolCardProps {
  tool: DiscoveryTool;
  exists: boolean;
  onNavigate: (tool: DiscoveryTool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, exists, onNavigate }) => {
  const Icon = tool.icon;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate(tool);
  };

  return (
    <MetahodosCard
      className="hover:shadow-deep transition-shadow cursor-pointer h-full"
      onClick={() => onNavigate(tool)}
    >
      <div className="flex flex-col h-full">
        {/* Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`${tool.bgColor} rounded-lg p-3 border-2`}
              style={{ borderColor: tool.color }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-metahodos-navy">{tool.title}</h3>
            </div>
          </div>
          {exists ? (
            <MetahodosBadge variant="success" size="sm">
              Creato
            </MetahodosBadge>
          ) : (
            <MetahodosBadge variant="default" size="sm">
              Vuoto
            </MetahodosBadge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-metahodos-text-secondary mb-6 flex-1">
          {tool.description}
        </p>

        {/* Actions */}
        <div className="flex space-x-2">
          {exists ? (
            <>
              <MetahodosButton
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<EyeIcon className="h-4 w-4" />}
                onClick={handleButtonClick}
              >
                Visualizza
              </MetahodosButton>
              <MetahodosButton
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<PencilIcon className="h-4 w-4" />}
                onClick={handleButtonClick}
              >
                Modifica
              </MetahodosButton>
            </>
          ) : (
            <MetahodosButton
              variant="primary"
              size="sm"
              fullWidth
              leftIcon={<PlusIcon className="h-4 w-4" />}
              onClick={handleButtonClick}
            >
              Crea
            </MetahodosButton>
          )}
        </div>
      </div>
    </MetahodosCard>
  );
};
