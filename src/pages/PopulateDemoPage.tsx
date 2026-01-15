/**
 * PopulateDemoPage - Page to populate demo data
 * Accessible at /populate-demo
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { MetahodosButton } from '../components/ui/MetahodosButton';
import { MetahodosCard } from '../components/ui/MetahodosCard';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProject } from '../lib/firestore-projects';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';

// Demo data - SACMI
const sacmiEpics = [
  {
    title: '[SACMI] Sistema di Controllo Qualità Automatizzato',
    description: 'Implementazione sistema visione artificiale per controllo qualità tappi in tempo reale nella linea produzione tappi cellulosa',
    businessValue: 90,
    effort: 65,
    priority: 'high' as const,
    color: '#E77566',
    stories: [
      { title: '[SACMI] Integrazione telecamere ad alta velocità', description: 'Come operatore di linea, voglio che le telecamere catturino immagini dei tappi a 200 fps per rilevare difetti microscopici', storyPoints: 8, priority: 'must_have' as const, status: 'done' as const },
      { title: '[SACMI] Algoritmo ML per rilevamento difetti', description: 'Come quality manager, voglio un algoritmo che identifichi automaticamente crepe, bolle e difetti di stampa', storyPoints: 13, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[SACMI] Dashboard real-time difetti', description: 'Come supervisore, voglio vedere in tempo reale statistiche su difetti rilevati per categoria', storyPoints: 5, priority: 'should_have' as const, status: 'ready' as const },
      { title: '[SACMI] Sistema di scarto automatico', description: 'Come operatore, voglio che i tappi difettosi vengano automaticamente scartati dalla linea', storyPoints: 8, priority: 'must_have' as const, status: 'todo' as const },
    ],
  },
  {
    title: '[SACMI] Modulo Stampa Digitale Alta Precisione',
    description: 'Sistema di stampa digitale per personalizzazione tappi con loghi e codici QR - linea produzione SACMI',
    businessValue: 85,
    effort: 55,
    priority: 'high' as const,
    color: '#F5A962',
    stories: [
      { title: '[SACMI] Calibrazione stampanti UV', description: 'Come tecnico, voglio calibrare le testine di stampa UV per precisione ±0.1mm', storyPoints: 5, priority: 'must_have' as const, status: 'done' as const },
      { title: '[SACMI] Generazione dinamica QR codes', description: 'Come product manager, voglio generare QR codes unici per tracciabilità prodotto', storyPoints: 8, priority: 'should_have' as const, status: 'in_progress' as const },
      { title: '[SACMI] Preview stampa in tempo reale', description: 'Come operatore, voglio vedere preview della stampa prima della produzione', storyPoints: 5, priority: 'could_have' as const, status: 'todo' as const },
    ],
  },
];

// Demo data - FAAC
const faacEpics = [
  {
    title: '[FAAC] Gateway IoT Universale Multi-Protocollo',
    description: 'Gateway hardware/software per comunicazione con tutti i dispositivi delle 7 aziende acquisite (protocolli: Modbus, KNX, BACnet)',
    businessValue: 95,
    effort: 80,
    priority: 'high' as const,
    color: '#E77566',
    stories: [
      { title: '[FAAC] Abstraction layer protocolli comunicazione', description: 'Come system architect, voglio un layer astratto che normalizzi tutti i protocolli', storyPoints: 21, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[FAAC] Driver per dispositivi FAAC legacy', description: 'Come tecnico, voglio supportare dispositivi FAAC prodotti negli ultimi 10 anni', storyPoints: 13, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[FAAC] Driver per brand Somfy (acquisito)', description: 'Come integratore, voglio controllare motori e sensori Somfy', storyPoints: 8, priority: 'must_have' as const, status: 'done' as const },
      { title: '[FAAC] Auto-discovery dispositivi in rete', description: 'Come installatore, voglio che il sistema rilevi automaticamente i dispositivi', storyPoints: 13, priority: 'should_have' as const, status: 'todo' as const },
    ],
  },
  {
    title: '[FAAC] Piattaforma Cloud Unificata',
    description: 'Piattaforma cloud multi-tenant per gestione centralizzata di tutti i sistemi di controllo accessi e automazioni installati',
    businessValue: 90,
    effort: 70,
    priority: 'high' as const,
    color: '#F5A962',
    stories: [
      { title: '[FAAC] Architettura multi-tenant sicura', description: 'Come cloud architect, voglio isolamento dati tra clienti con tenant separati', storyPoints: 13, priority: 'must_have' as const, status: 'done' as const },
      { title: '[FAAC] Dashboard unificata controllo accessi', description: 'Come security manager, voglio vedere tutti gli accessi da un\'unica interfaccia', storyPoints: 8, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[FAAC] Mobile app iOS/Android', description: 'Come utente finale, voglio controllare i sistemi da smartphone', storyPoints: 21, priority: 'should_have' as const, status: 'ready' as const },
      { title: '[FAAC] Sistema notifiche push real-time', description: 'Come security manager, voglio notifiche immediate per eventi critici', storyPoints: 5, priority: 'should_have' as const, status: 'todo' as const },
    ],
  },
];

// Demo data - REALE MUTUA
const realeMutuaEpics = [
  {
    title: '[REALE] Super App Mobile "Reale Insieme"',
    description: 'App mobile all-in-one: gestione polizze, denuncia sinistri, assistenza 24/7, pagamenti, documenti digitali - Piano Strategico 2025-2028',
    businessValue: 95,
    effort: 85,
    priority: 'high' as const,
    color: '#E77566',
    stories: [
      { title: '[REALE] Architettura micro-frontend modulare', description: 'Come mobile architect, voglio architettura scalabile per aggiungere funzionalità senza riscrivere l\'app', storyPoints: 21, priority: 'must_have' as const, status: 'done' as const },
      { title: '[REALE] Login biometrico e SPID', description: 'Come cliente, voglio accedere con Face ID/impronta o SPID', storyPoints: 8, priority: 'must_have' as const, status: 'done' as const },
      { title: '[REALE] Dashboard personalizzata polizze', description: 'Come assicurato, voglio vedere tutte le mie polizze attive in una dashboard', storyPoints: 13, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[REALE] Denuncia sinistro guidata con foto', description: 'Come cliente, voglio denunciare un sinistro in 3 minuti con foto e geolocalizzazione', storyPoints: 13, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[REALE] Chat con AI per FAQ comuni', description: 'Come cliente, voglio risposte immediate da chatbot AI per domande frequenti', storyPoints: 13, priority: 'should_have' as const, status: 'ready' as const },
      { title: '[REALE] Wallet digitale documenti', description: 'Come cliente, voglio tutti i documenti assicurativi digitalizzati accessibili offline', storyPoints: 8, priority: 'must_have' as const, status: 'ready' as const },
    ],
  },
  {
    title: '[REALE] Polizze Parametriche e On-Demand',
    description: 'Nuova generazione di polizze: assicurazione a consumo, parametriche (meteo, volo cancellato), micro-assicurazioni per millennials',
    businessValue: 88,
    effort: 70,
    priority: 'high' as const,
    color: '#F5A962',
    stories: [
      { title: '[REALE] Engine pricing dinamico real-time', description: 'Come pricing analyst, voglio calcolare premi in tempo reale basati su dati IoT', storyPoints: 21, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[REALE] Polizza auto pay-per-km', description: 'Come automobilista, voglio pagare solo per i km effettivamente percorsi', storyPoints: 13, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[REALE] Polizza viaggio cancellazione smart', description: 'Come viaggiatore, voglio rimborso automatico se il volo è cancellato', storyPoints: 13, priority: 'should_have' as const, status: 'ready' as const },
      { title: '[REALE] Integrazione dati meteo/traffico', description: 'Come data scientist, voglio integrare dati esterni per pricing parametrico', storyPoints: 13, priority: 'must_have' as const, status: 'ready' as const },
    ],
  },
  {
    title: '[REALE] Core Insurance Platform Modernization',
    description: 'Migrazione da mainframe AS/400 a piattaforma cloud-native microservizi per ridurre costi IT e accelerare time-to-market',
    businessValue: 92,
    effort: 95,
    priority: 'high' as const,
    color: '#8FBC5A',
    stories: [
      { title: '[REALE] Assessment architettura legacy', description: 'Come architect, voglio mappare tutte le dipendenze del sistema attuale', storyPoints: 13, priority: 'must_have' as const, status: 'done' as const },
      { title: '[REALE] Strategia migrazione strangler pattern', description: 'Come architect, voglio migrare gradualmente senza big bang', storyPoints: 8, priority: 'must_have' as const, status: 'done' as const },
      { title: '[REALE] API Gateway layer', description: 'Come developer, voglio API gateway per esporre funzioni legacy come REST API', storyPoints: 13, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[REALE] Microservizio Policy Management', description: 'Come developer, voglio servizio cloud per gestione polizze', storyPoints: 21, priority: 'must_have' as const, status: 'in_progress' as const },
      { title: '[REALE] Event-driven architecture con Kafka', description: 'Come architect, voglio comunicazione asincrona tra servizi', storyPoints: 13, priority: 'must_have' as const, status: 'ready' as const },
    ],
  },
];

export function PopulateDemoPage() {
  const { currentUser } = useAuth();
  const { refreshProjects, setCurrentProject } = useProject();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  async function handlePopulateSACMIComplete() {
    if (!currentUser) {
      toast.error('Devi essere loggato per popolare i dati');
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: 10 }); // 1 project + 2 epics + 7 stories + 2 sprints

    try {
      let currentProgress = 0;

      // 1. Create SACMI Project
      toast('Creazione progetto SACMI...');
      const sacmiProject = await createProject(
        {
          name: 'SACMI - Linea Produzione Tappi Cellulosa',
          description: 'Sistema automatizzato per produzione e controllo qualità di tappi in cellulosa con stampa digitale personalizzata. Team di 9 persone.',
        },
        currentUser.uid
      );
      currentProgress++;
      setProgress({ current: currentProgress, total: 10 });

      // 2. Create epics and collect story IDs
      const storyIds: string[] = [];

      for (const epicData of sacmiEpics) {
        const { stories, ...epicWithoutStories } = epicData;
        const epicRef = await addDoc(collection(db, 'epics'), {
          ...epicWithoutStories,
          projectId: sacmiProject.id,
          status: 'in_progress',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        currentProgress++;
        setProgress({ current: currentProgress, total: 10 });

        for (const story of stories) {
          const storyRef = await addDoc(collection(db, 'stories'), {
            ...story,
            projectId: sacmiProject.id,
            epicId: epicRef.id,
            tags: ['SACMI'],
            acceptanceCriteria: [
              'Funzionalità completamente implementata',
              'Test automatici con coverage > 80%',
              'Code review approvata',
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          storyIds.push(storyRef.id);
          currentProgress++;
          setProgress({ current: currentProgress, total: 10 });
        }
      }

      // 3. Create Sprint 1 (active)
      toast('Creazione Sprint 1...');
      const sprint1Ref = await addDoc(collection(db, 'sprints'), {
        name: 'Sprint 1 - MVP Controllo Qualità',
        goal: 'Implementare le funzionalità core del sistema di visione artificiale e integrazione telecamere',
        projectId: sacmiProject.id,
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-02-02'),
        capacity: 34,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      currentProgress++;
      setProgress({ current: currentProgress, total: 10 });

      // 4. Create Sprint 2 (planning)
      toast('Creazione Sprint 2...');
      const sprint2Ref = await addDoc(collection(db, 'sprints'), {
        name: 'Sprint 2 - Stampa Digitale & Ottimizzazione',
        goal: 'Completare modulo stampa digitale e ottimizzare algoritmi ML per detection',
        projectId: sacmiProject.id,
        startDate: new Date('2025-02-03'),
        endDate: new Date('2025-02-16'),
        capacity: 26,
        status: 'planning',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      currentProgress++;
      setProgress({ current: currentProgress, total: 10 });

      // 5. Assign first 4 stories to Sprint 1
      toast('Assegnazione stories a Sprint 1...');
      for (let i = 0; i < Math.min(4, storyIds.length); i++) {
        const storyDocRef = doc(db, 'stories', storyIds[i]);
        await updateDoc(storyDocRef, {
          sprintId: sprint1Ref.id,
        });
      }

      // 6. Assign remaining stories to Sprint 2
      toast('Assegnazione stories a Sprint 2...');
      for (let i = 4; i < storyIds.length; i++) {
        const storyDocRef = doc(db, 'stories', storyIds[i]);
        await updateDoc(storyDocRef, {
          sprintId: sprint2Ref.id,
        });
      }

      // Refresh projects and set SACMI as current
      await refreshProjects();
      setCurrentProject(sacmiProject);

      toast.success('🎉 Progetto SACMI completo creato con 2 epics, 7 stories e 2 sprint!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error populating SACMI data:', error);
      toast.error('Errore durante la creazione del progetto SACMI');
    } finally {
      setLoading(false);
    }
  }

  async function handlePopulate() {
    if (!currentUser) {
      toast.error('Devi essere loggato per popolare i dati');
      return;
    }

    setLoading(true);
    const totalStories = sacmiEpics.reduce((s, e) => s + e.stories.length, 0) +
                        faacEpics.reduce((s, e) => s + e.stories.length, 0) +
                        realeMutuaEpics.reduce((s, e) => s + e.stories.length, 0);
    const totalEpics = sacmiEpics.length + faacEpics.length + realeMutuaEpics.length;
    // 3 projects + epics + stories
    setProgress({ current: 0, total: 3 + totalEpics + totalStories });

    try {
      let currentProgress = 0;

      // 1. Create SACMI Project
      const sacmiProject = await createProject(
        {
          name: 'SACMI - Linea Produzione Tappi Cellulosa',
          description: 'Sistema automatizzato per produzione e controllo qualità di tappi in cellulosa con stampa digitale personalizzata. Team di 9 persone.',
        },
        currentUser.uid
      );
      currentProgress++;
      setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });

      // Populate SACMI epics and stories
      for (const epicData of sacmiEpics) {
        const { stories, ...epicWithoutStories } = epicData;
        const epicRef = await addDoc(collection(db, 'epics'), {
          ...epicWithoutStories,
          projectId: sacmiProject.id,
          status: 'in_progress',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        currentProgress++;
        setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });

        for (const story of stories) {
          await addDoc(collection(db, 'stories'), {
            ...story,
            projectId: sacmiProject.id,
            epicId: epicRef.id,
            tags: ['SACMI'],
            acceptanceCriteria: [
              'Funzionalità completamente implementata',
              'Test automatici con coverage > 80%',
              'Code review approvata',
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          currentProgress++;
          setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });
        }
      }

      // 2. Create FAAC Project
      const faacProject = await createProject(
        {
          name: 'FAAC - Integrazione Multi-Brand',
          description: 'Piattaforma unificata per integrazione di 7 aziende acquisite: gateway IoT multi-protocollo e cloud platform. Team di 12 persone.',
        },
        currentUser.uid
      );
      currentProgress++;
      setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });

      // Populate FAAC epics and stories
      for (const epicData of faacEpics) {
        const { stories, ...epicWithoutStories } = epicData;
        const epicRef = await addDoc(collection(db, 'epics'), {
          ...epicWithoutStories,
          projectId: faacProject.id,
          status: 'in_progress',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        currentProgress++;
        setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });

        for (const story of stories) {
          await addDoc(collection(db, 'stories'), {
            ...story,
            projectId: faacProject.id,
            epicId: epicRef.id,
            tags: ['FAAC'],
            acceptanceCriteria: [
              'Funzionalità completamente implementata',
              'Test automatici con coverage > 80%',
              'Code review approvata',
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          currentProgress++;
          setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });
        }
      }

      // 3. Create REALE MUTUA Project
      const realeMutuaProject = await createProject(
        {
          name: 'REALE MUTUA - Piano Strategico 2025-2028',
          description: 'Trasformazione digitale: Super App mobile, polizze parametriche on-demand, modernizzazione core insurance platform. Team di 20 persone.',
        },
        currentUser.uid
      );
      currentProgress++;
      setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });

      // Populate REALE MUTUA epics and stories
      for (const epicData of realeMutuaEpics) {
        const { stories, ...epicWithoutStories } = epicData;
        const epicRef = await addDoc(collection(db, 'epics'), {
          ...epicWithoutStories,
          projectId: realeMutuaProject.id,
          status: 'in_progress',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        currentProgress++;
        setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });

        for (const story of stories) {
          await addDoc(collection(db, 'stories'), {
            ...story,
            projectId: realeMutuaProject.id,
            epicId: epicRef.id,
            tags: ['REALE MUTUA'],
            acceptanceCriteria: [
              'Funzionalità completamente implementata',
              'Test automatici con coverage > 80%',
              'Code review approvata',
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          currentProgress++;
          setProgress({ current: currentProgress, total: 3 + totalEpics + totalStories });
        }
      }

      // Refresh projects and set SACMI as current
      await refreshProjects();
      setCurrentProject(sacmiProject);

      toast.success(`🎉 3 progetti, ${totalEpics} epics e ${totalStories} user stories creati con successo!`);

      // Wait 2 seconds then redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error populating data:', error);
      toast.error('Errore durante il popolamento dei dati');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <SparklesIcon className="h-16 w-16 text-metahodos-orange mx-auto mb-4" />
        <h1 className="text-4xl font-black text-metahodos-gray mb-2 uppercase tracking-tight">
          Popola Dati Demo
        </h1>
        <p className="text-metahodos-text-secondary">
          Crea 3 progetti separati con dati realistici per testare tutte le funzionalità
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetahodosCard className="text-center">
          <div className="w-12 h-12 rounded-full bg-metahodos-red/10 flex items-center justify-center mx-auto mb-3">
            <div className="text-2xl font-black text-metahodos-red">S</div>
          </div>
          <h3 className="font-bold text-metahodos-gray mb-2 uppercase">SACMI</h3>
          <p className="text-sm text-metahodos-text-secondary">
            Linea Produzione Tappi Cellulosa - 2 epics, 7 stories
          </p>
        </MetahodosCard>

        <MetahodosCard className="text-center">
          <div className="w-12 h-12 rounded-full bg-metahodos-orange/10 flex items-center justify-center mx-auto mb-3">
            <div className="text-2xl font-black text-metahodos-orange">F</div>
          </div>
          <h3 className="font-bold text-metahodos-gray mb-2 uppercase">FAAC</h3>
          <p className="text-sm text-metahodos-text-secondary">
            Integrazione Multi-Brand - 2 epics, 8 stories
          </p>
        </MetahodosCard>

        <MetahodosCard className="text-center">
          <div className="w-12 h-12 rounded-full bg-metahodos-green/10 flex items-center justify-center mx-auto mb-3">
            <div className="text-2xl font-black text-metahodos-green">R</div>
          </div>
          <h3 className="font-bold text-metahodos-gray mb-2 uppercase">REALE MUTUA</h3>
          <p className="text-sm text-metahodos-text-secondary">
            Piano Strategico 2025-2028 - 3 epics, 16 stories
          </p>
        </MetahodosCard>
      </div>

      <MetahodosCard>
        <h2 className="text-xl font-black text-metahodos-gray mb-4 uppercase tracking-tight">
          Cosa Verrà Creato
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-metahodos-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-metahodos-gray">3 Progetti Separati</p>
              <p className="text-sm text-metahodos-text-secondary">
                SACMI, FAAC e REALE MUTUA - ogni progetto è completamente isolato
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-metahodos-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-metahodos-gray">7 Epics Realistici</p>
              <p className="text-sm text-metahodos-text-secondary">
                Epic con business value, effort, priority e colori distintivi
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-metahodos-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-metahodos-gray">31 User Stories Complete</p>
              <p className="text-sm text-metahodos-text-secondary">
                Stories con description, story points, priority, status e acceptance criteria
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-6 w-6 text-metahodos-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-metahodos-gray">Stati Variati</p>
              <p className="text-sm text-metahodos-text-secondary">
                Mix di stories: done, in_progress, ready, todo per testare workflow completo
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-metahodos-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-metahodos-gray">Nota</p>
              <p className="text-sm text-metahodos-text-secondary">
                Verranno creati 3 nuovi progetti con i loro dati. I progetti esistenti non saranno modificati.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-metahodos-text-secondary">Progresso</span>
              <span className="font-bold text-metahodos-gray">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-metahodos-orange h-2 rounded-full transition-all"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetahodosButton
            variant="primary"
            onClick={handlePopulate}
            disabled={loading}
            isLoading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Popolamento in corso...' : 'Popola Tutti i Progetti'}
          </MetahodosButton>

          <MetahodosButton
            variant="secondary"
            onClick={handlePopulateSACMIComplete}
            disabled={loading}
            isLoading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Popolamento in corso...' : 'Solo SACMI + 2 Sprint'}
          </MetahodosButton>
        </div>
      </MetahodosCard>
    </div>
  );
}
