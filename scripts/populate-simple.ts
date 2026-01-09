/**
 * Simplified script to populate demo data
 * Popola l'app con 3 progetti demo realistici
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration missing!');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_PROJECT_ID = 'default-project';

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

async function populateData() {
  console.log('🚀 Populating demo data for 3 projects...\n');

  const allEpics = [...sacmiEpics, ...faacEpics, ...realeMutuaEpics];
  let totalStories = 0;

  for (const epicData of allEpics) {
    try {
      // Create epic
      const { stories, ...epicWithoutStories } = epicData;

      const epicRef = await addDoc(collection(db, 'epics'), {
        ...epicWithoutStories,
        projectId: DEFAULT_PROJECT_ID,
        status: 'in_progress',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Epic: ${epicData.title}`);

      // Create stories for this epic
      for (const story of stories) {
        await addDoc(collection(db, 'stories'), {
          ...story,
          projectId: DEFAULT_PROJECT_ID,
          epicId: epicRef.id,
          tags: [epicData.title.match(/\[([^\]]+)\]/)?.[1] || 'General'],
          acceptanceCriteria: [
            'Funzionalità completamente implementata',
            'Test automatici con coverage > 80%',
            'Code review approvata',
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        totalStories++;
      }

      console.log(`   → ${stories.length} user stories create`);

    } catch (error) {
      console.error(`❌ Error creating epic ${epicData.title}:`, error);
    }
  }

  console.log(`\n🎉 Completato!\n`);
  console.log(`📊 Summary:`);
  console.log(`   - 3 progetti: SACMI, FAAC, REALE MUTUA`);
  console.log(`   - ${allEpics.length} epics creati`);
  console.log(`   - ${totalStories} user stories create`);
  console.log(`\n✨ Vai su http://localhost:3003/dashboard per vedere i dati!\n`);
}

populateData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
