/**
 * Script to populate the app with 3 realistic demo projects
 * Run with: npm run populate-demo
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to create dates
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Demo Projects Data
const demoProjects = [
  {
    id: 'sacmi-cellulose-caps',
    name: 'SACMI - Linea Produzione Tappi Cellulosa',
    description: 'Progettazione e implementazione di una linea di produzione automatizzata per la stampa di tappi in cellulosa biodegradabile',
    teamSize: 9,
    startDate: new Date('2024-11-01'),
    team: [
      { name: 'Marco Rossi', role: 'Product Owner', email: 'marco.rossi@sacmi.com' },
      { name: 'Laura Bianchi', role: 'Scrum Master', email: 'laura.bianchi@sacmi.com' },
      { name: 'Giovanni Verdi', role: 'Tech Lead', email: 'giovanni.verdi@sacmi.com' },
      { name: 'Francesca Neri', role: 'Senior Developer', email: 'francesca.neri@sacmi.com' },
      { name: 'Paolo Russo', role: 'Developer', email: 'paolo.russo@sacmi.com' },
      { name: 'Elena Moretti', role: 'Developer', email: 'elena.moretti@sacmi.com' },
      { name: 'Andrea Ferrari', role: 'QA Engineer', email: 'andrea.ferrari@sacmi.com' },
      { name: 'Simone Costa', role: 'DevOps Engineer', email: 'simone.costa@sacmi.com' },
      { name: 'Chiara Lombardi', role: 'UX Designer', email: 'chiara.lombardi@sacmi.com' },
    ],
    epics: [
      {
        title: 'Sistema di Controllo Qualità Automatizzato',
        description: 'Implementazione sistema visione artificiale per controllo qualità tappi in tempo reale',
        businessValue: 'Riduzione scarti del 40%, aumento efficienza produttiva',
        status: 'in_progress',
        stories: [
          { title: 'Integrazione telecamere ad alta velocità', description: 'Come operatore di linea, voglio che le telecamere catturino immagini dei tappi a 200 fps per rilevare difetti microscopici', storyPoints: 8, priority: 'must_have', status: 'done' },
          { title: 'Algoritmo ML per rilevamento difetti', description: 'Come quality manager, voglio un algoritmo che identifichi automaticamente crepe, bolle e difetti di stampa', storyPoints: 13, priority: 'must_have', status: 'in_progress' },
          { title: 'Dashboard real-time difetti', description: 'Come supervisore, voglio vedere in tempo reale statistiche su difetti rilevati per categoria', storyPoints: 5, priority: 'should_have', status: 'ready' },
          { title: 'Sistema di scarto automatico', description: 'Come operatore, voglio che i tappi difettosi vengano automaticamente scartati dalla linea', storyPoints: 8, priority: 'must_have', status: 'todo' },
        ],
      },
      {
        title: 'Modulo Stampa Digitale Alta Precisione',
        description: 'Sistema di stampa digitale per personalizzazione tappi con loghi e codici QR',
        businessValue: 'Apertura mercato premium con margini +35%',
        status: 'in_progress',
        stories: [
          { title: 'Calibrazione stampanti UV', description: 'Come tecnico, voglio calibrare le testine di stampa UV per precisione ±0.1mm', storyPoints: 5, priority: 'must_have', status: 'done' },
          { title: 'Generazione dinamica QR codes', description: 'Come product manager, voglio generare QR codes unici per tracciabilità prodotto', storyPoints: 8, priority: 'should_have', status: 'in_progress' },
          { title: 'Preview stampa in tempo reale', description: 'Come operatore, voglio vedere preview della stampa prima della produzione', storyPoints: 5, priority: 'could_have', status: 'todo' },
        ],
      },
      {
        title: 'Sistema MES e Tracciabilità',
        description: 'Manufacturing Execution System per tracciabilità completa da materia prima a prodotto finito',
        businessValue: 'Compliance normative EU, riduzione tempi audit 70%',
        status: 'todo',
        stories: [
          { title: 'Integrazione con ERP SAP', description: 'Come IT manager, voglio sincronizzare ordini di produzione da SAP', storyPoints: 13, priority: 'must_have', status: 'todo' },
          { title: 'Tracking lotti materia prima', description: 'Come quality manager, voglio tracciare ogni lotto di cellulosa usato', storyPoints: 8, priority: 'must_have', status: 'todo' },
          { title: 'Report conformità automatici', description: 'Come compliance officer, voglio report automatici per certificazioni ISO', storyPoints: 5, priority: 'should_have', status: 'todo' },
        ],
      },
    ],
  },
  {
    id: 'faac-integration',
    name: 'FAAC - Integrazione Prodotti Multi-Brand',
    description: 'Piattaforma unificata per integrazione prodotti di controllo accessi, automazioni e sicurezza dalle 7 aziende acquisite',
    teamSize: 12,
    startDate: new Date('2024-10-15'),
    team: [
      { name: 'Roberto Conti', role: 'Product Owner', email: 'roberto.conti@faacgroup.com' },
      { name: 'Giulia Romano', role: 'Scrum Master', email: 'giulia.romano@faacgroup.com' },
      { name: 'Matteo Ricci', role: 'Solutions Architect', email: 'matteo.ricci@faacgroup.com' },
      { name: 'Sara Marino', role: 'Tech Lead Frontend', email: 'sara.marino@faacgroup.com' },
      { name: 'Luca Greco', role: 'Tech Lead Backend', email: 'luca.greco@faacgroup.com' },
      { name: 'Valentina Bruno', role: 'Senior Developer', email: 'valentina.bruno@faacgroup.com' },
      { name: 'Alessandro Gallo', role: 'Developer', email: 'alessandro.gallo@faacgroup.com' },
      { name: 'Martina Colombo', role: 'Developer', email: 'martina.colombo@faacgroup.com' },
      { name: 'Federico Esposito', role: 'Developer', email: 'federico.esposito@faacgroup.com' },
      { name: 'Alessia Rizzo', role: 'QA Lead', email: 'alessia.rizzo@faacgroup.com' },
      { name: 'Davide Ferrara', role: 'DevOps Engineer', email: 'davide.ferrara@faacgroup.com' },
      { name: 'Silvia De Luca', role: 'UX/UI Designer', email: 'silvia.deluca@faacgroup.com' },
    ],
    epics: [
      {
        title: 'Gateway IoT Universale Multi-Protocollo',
        description: 'Gateway hardware/software per comunicazione con tutti i dispositivi delle 7 aziende (protocolli diversi: Modbus, KNX, BACnet, proprietari)',
        businessValue: 'Riduzione costi integrazione del 60%, time-to-market -50%',
        status: 'in_progress',
        stories: [
          { title: 'Abstraction layer protocolli comunicazione', description: 'Come system architect, voglio un layer astratto che normalizzi tutti i protocolli', storyPoints: 21, priority: 'must_have', status: 'in_progress' },
          { title: 'Driver per dispositivi FAAC legacy', description: 'Come tecnico, voglio supportare dispositivi FAAC prodotti negli ultimi 10 anni', storyPoints: 13, priority: 'must_have', status: 'in_progress' },
          { title: 'Driver per brand Somfy (acquisito)', description: 'Come integratore, voglio controllare motori e sensori Somfy', storyPoints: 8, priority: 'must_have', status: 'done' },
          { title: 'Driver per brand CAME (acquisito)', description: 'Come integratore, voglio controllare sistemi CAME', storyPoints: 8, priority: 'must_have', status: 'todo' },
          { title: 'Auto-discovery dispositivi in rete', description: 'Come installatore, voglio che il sistema rilevi automaticamente i dispositivi', storyPoints: 13, priority: 'should_have', status: 'todo' },
        ],
      },
      {
        title: 'Piattaforma Cloud Unificata',
        description: 'Piattaforma cloud multi-tenant per gestione centralizzata di tutti i sistemi installati',
        businessValue: 'Nuovo modello SaaS con ARR previsto €8M anno 3',
        status: 'in_progress',
        stories: [
          { title: 'Architettura multi-tenant sicura', description: 'Come cloud architect, voglio isolamento dati tra clienti con tenant separati', storyPoints: 13, priority: 'must_have', status: 'done' },
          { title: 'Dashboard unificata controllo accessi', description: 'Come security manager, voglio vedere tutti gli accessi da un\'unica interfaccia', storyPoints: 8, priority: 'must_have', status: 'in_progress' },
          { title: 'Gestione centralizzata utenti e permessi', description: 'Come admin, voglio gestire utenti e ruoli per tutti i siti', storyPoints: 8, priority: 'must_have', status: 'in_progress' },
          { title: 'Mobile app iOS/Android', description: 'Come utente finale, voglio controllare i sistemi da smartphone', storyPoints: 21, priority: 'should_have', status: 'ready' },
          { title: 'Sistema notifiche push real-time', description: 'Come security manager, voglio notifiche immediate per eventi critici', storyPoints: 5, priority: 'should_have', status: 'todo' },
        ],
      },
      {
        title: 'Marketplace & Ecosistema Partner',
        description: 'Marketplace per integrazioni di terze parti e partner (videocitofoni, allarmi, domotica)',
        businessValue: 'Creazione ecosistema con revenue share, obiettivo 50 partner anno 1',
        status: 'todo',
        stories: [
          { title: 'API pubbliche documentate', description: 'Come partner developer, voglio API REST ben documentate per integrazioni', storyPoints: 13, priority: 'must_have', status: 'todo' },
          { title: 'SDK per sviluppatori terze parti', description: 'Come partner, voglio SDK in Java, Python, Node.js', storyPoints: 21, priority: 'should_have', status: 'todo' },
          { title: 'Portale certificazione partner', description: 'Come FAAC, voglio certificare e approvare integrazioni partner', storyPoints: 8, priority: 'should_have', status: 'todo' },
          { title: 'Marketplace integrazioni', description: 'Come cliente, voglio scoprire e installare integrazioni dal marketplace', storyPoints: 13, priority: 'could_have', status: 'todo' },
        ],
      },
      {
        title: 'Analytics & Business Intelligence',
        description: 'Piattaforma analytics per insights su utilizzo, manutenzione predittiva, ottimizzazione',
        businessValue: 'Upselling servizi manutenzione predittiva, +25% retention',
        status: 'todo',
        stories: [
          { title: 'Data lake eventi multi-brand', description: 'Come data engineer, voglio aggregare eventi da tutti i dispositivi', storyPoints: 13, priority: 'must_have', status: 'todo' },
          { title: 'Dashboard analytics utilizzo', description: 'Come facility manager, voglio statistiche su pattern di utilizzo', storyPoints: 8, priority: 'should_have', status: 'todo' },
          { title: 'ML predizione guasti', description: 'Come service manager, voglio predire guasti prima che accadano', storyPoints: 21, priority: 'could_have', status: 'todo' },
        ],
      },
    ],
  },
  {
    id: 'reale-mutua-strategic-plan',
    name: 'REALE MUTUA - Piano Strategico 2025-2028',
    description: 'Trasformazione digitale e innovazione prodotti assicurativi per il quadriennio 2025-2028',
    teamSize: 20,
    startDate: new Date('2024-09-01'),
    team: [
      { name: 'Stefano Pellegrini', role: 'Strategic Program Manager', email: 'stefano.pellegrini@realemutua.it' },
      { name: 'Monica Santoro', role: 'Agile Coach', email: 'monica.santoro@realemutua.it' },
      { name: 'Carlo Barbieri', role: 'Enterprise Architect', email: 'carlo.barbieri@realemutua.it' },
      { name: 'Anna Marchetti', role: 'Product Owner - Digital Customer', email: 'anna.marchetti@realemutua.it' },
      { name: 'Fabio Rinaldi', role: 'Product Owner - Core Systems', email: 'fabio.rinaldi@realemutua.it' },
      { name: 'Elisa Fontana', role: 'Scrum Master Team 1', email: 'elisa.fontana@realemutua.it' },
      { name: 'Marco Vitale', role: 'Scrum Master Team 2', email: 'marco.vitale@realemutua.it' },
      { name: 'Roberta Mancini', role: 'Tech Lead', email: 'roberta.mancini@realemutua.it' },
      { name: 'Tommaso Benedetti', role: 'Senior Backend Developer', email: 'tommaso.benedetti@realemutua.it' },
      { name: 'Claudia Silvestri', role: 'Senior Frontend Developer', email: 'claudia.silvestri@realemutua.it' },
      { name: 'Nicola Morelli', role: 'Backend Developer', email: 'nicola.morelli@realemutua.it' },
      { name: 'Federica Rossetti', role: 'Frontend Developer', email: 'federica.rossetti@realemutua.it' },
      { name: 'Emanuele Barone', role: 'Frontend Developer', email: 'emanuele.barone@realemutua.it' },
      { name: 'Paola Fabbri', role: 'Backend Developer', email: 'paola.fabbri@realemutua.it' },
      { name: 'Riccardo Pellegrino', role: 'Data Engineer', email: 'riccardo.pellegrino@realemutua.it' },
      { name: 'Cristina Gentile', role: 'QA Engineer', email: 'cristina.gentile@realemutua.it' },
      { name: 'Lorenzo Caruso', role: 'QA Engineer', email: 'lorenzo.caruso@realemutua.it' },
      { name: 'Beatrice Mariani', role: 'DevOps Engineer', email: 'beatrice.mariani@realemutua.it' },
      { name: 'Daniele Orlando', role: 'Security Engineer', email: 'daniele.orlando@realemutua.it' },
      { name: 'Giuliana Montanari', role: 'UX Lead', email: 'giuliana.montanari@realemutua.it' },
    ],
    epics: [
      {
        title: 'Super App Mobile "Reale Insieme"',
        description: 'App mobile all-in-one: gestione polizze, denuncia sinistri, assistenza 24/7, pagamenti, documenti digitali',
        businessValue: 'Target 1M download anno 1, +40% engagement clienti, -30% costi call center',
        status: 'in_progress',
        stories: [
          { title: 'Architettura micro-frontend modulare', description: 'Come mobile architect, voglio architettura scalabile per aggiungere funzionalità senza riscrivere l\'app', storyPoints: 21, priority: 'must_have', status: 'done' },
          { title: 'Login biometrico e SPID', description: 'Come cliente, voglio accedere con Face ID/impronta o SPID', storyPoints: 8, priority: 'must_have', status: 'done' },
          { title: 'Dashboard personalizzata polizze', description: 'Come assicurato, voglio vedere tutte le mie polizze attive in una dashboard', storyPoints: 13, priority: 'must_have', status: 'in_progress' },
          { title: 'Denuncia sinistro guidata con foto', description: 'Come cliente, voglio denunciare un sinistro in 3 minuti con foto e geolocalizzazione', storyPoints: 13, priority: 'must_have', status: 'in_progress' },
          { title: 'Chat con AI per FAQ comuni', description: 'Come cliente, voglio risposte immediate da chatbot AI per domande frequenti', storyPoints: 13, priority: 'should_have', status: 'ready' },
          { title: 'Videocall con consulente', description: 'Come cliente, voglio videocall immediata con consulente umano per casi complessi', storyPoints: 8, priority: 'should_have', status: 'todo' },
          { title: 'Wallet digitale documenti', description: 'Come cliente, voglio tutti i documenti assicurativi digitalizzati accessibili offline', storyPoints: 8, priority: 'must_have', status: 'ready' },
          { title: 'Push notifications personalizzate', description: 'Come cliente, voglio notifiche intelligenti su scadenze e opportunità', storyPoints: 5, priority: 'should_have', status: 'todo' },
        ],
      },
      {
        title: 'Polizze Parametriche e On-Demand',
        description: 'Nuova generazione di polizze: assicurazione a consumo, parametriche (meteo, volo cancellato), micro-assicurazioni',
        businessValue: 'Apertura segmento millennials/Gen Z, target €15M premi anno 2',
        status: 'in_progress',
        stories: [
          { title: 'Engine pricing dinamico real-time', description: 'Come pricing analyst, voglio calcolare premi in tempo reale basati su dati IoT', storyPoints: 21, priority: 'must_have', status: 'in_progress' },
          { title: 'Polizza auto pay-per-km', description: 'Come automobilista, voglio pagare solo per i km effettivamente percorsi', storyPoints: 13, priority: 'must_have', status: 'in_progress' },
          { title: 'Polizza viaggio cancellazione smart', description: 'Come viaggiatore, voglio rimborso automatico se il volo è cancellato', storyPoints: 13, priority: 'should_have', status: 'ready' },
          { title: 'Micro-polizza eventi singoli', description: 'Come utente, voglio assicurazione per singolo evento (es. partita calcetto)', storyPoints: 8, priority: 'should_have', status: 'todo' },
          { title: 'Integrazione dati meteo/traffico', description: 'Come data scientist, voglio integrare dati esterni per pricing parametrico', storyPoints: 13, priority: 'must_have', status: 'ready' },
          { title: 'Smart contract blockchain per claims', description: 'Come innovatore, voglio liquidazioni automatiche su blockchain', storyPoints: 21, priority: 'could_have', status: 'todo' },
        ],
      },
      {
        title: 'Core Insurance Platform Modernization',
        description: 'Migrazione da mainframe AS/400 a piattaforma cloud-native microservizi',
        businessValue: 'Riduzione costi IT 40%, time-to-market nuovi prodotti da 6 mesi a 2 settimane',
        status: 'in_progress',
        stories: [
          { title: 'Assessment architettura legacy', description: 'Come architect, voglio mappare tutte le dipendenze del sistema attuale', storyPoints: 13, priority: 'must_have', status: 'done' },
          { title: 'Strategia migrazione strangler pattern', description: 'Come architect, voglio migrare gradualmente senza big bang', storyPoints: 8, priority: 'must_have', status: 'done' },
          { title: 'API Gateway layer', description: 'Come developer, voglio API gateway per esporre funzioni legacy come REST API', storyPoints: 13, priority: 'must_have', status: 'in_progress' },
          { title: 'Microservizio Policy Management', description: 'Come developer, voglio servizio cloud per gestione polizze', storyPoints: 21, priority: 'must_have', status: 'in_progress' },
          { title: 'Microservizio Claims Management', description: 'Come developer, voglio servizio cloud per gestione sinistri', storyPoints: 21, priority: 'must_have', status: 'ready' },
          { title: 'Event-driven architecture con Kafka', description: 'Come architect, voglio comunicazione asincrona tra servizi', storyPoints: 13, priority: 'must_have', status: 'ready' },
          { title: 'Data lake su AWS S3', description: 'Come data engineer, voglio centralizzare tutti i dati per analytics', storyPoints: 13, priority: 'should_have', status: 'todo' },
        ],
      },
      {
        title: 'Open Banking & Ecosistema Bancassurance',
        description: 'Integrazione con banche partner, PSD2, embedded insurance in app terze',
        businessValue: 'Accesso 5M+ clienti banche partner, +30% cross-selling',
        status: 'todo',
        stories: [
          { title: 'Integrazione API PSD2 banche partner', description: 'Come integration developer, voglio connettermi a 10 banche italiane via PSD2', storyPoints: 21, priority: 'must_have', status: 'todo' },
          { title: 'Proposta polizze in banking app', description: 'Come cliente banca, voglio vedere offerte assicurative nella app della mia banca', storyPoints: 13, priority: 'must_have', status: 'todo' },
          { title: 'Embedded insurance widget', description: 'Come e-commerce, voglio embeddare assicurazione nel checkout', storyPoints: 13, priority: 'should_have', status: 'todo' },
          { title: 'Pagamenti automatici via SEPA', description: 'Come cliente, voglio addebito automatico premi sul conto corrente', storyPoints: 8, priority: 'should_have', status: 'todo' },
        ],
      },
      {
        title: 'AI & Machine Learning for Underwriting',
        description: 'Modelli ML per pricing accurato, fraud detection, underwriting automatizzato',
        businessValue: 'Loss ratio migliorato 5%, frodi rilevate +60%, underwriting 70% automatizzato',
        status: 'todo',
        stories: [
          { title: 'Data pipeline per training ML', description: 'Come ML engineer, voglio pipeline automatica per preparare dati di training', storyPoints: 13, priority: 'must_have', status: 'todo' },
          { title: 'Modello ML pricing auto', description: 'Come data scientist, voglio modello predittivo accurato per polizze auto', storyPoints: 21, priority: 'must_have', status: 'todo' },
          { title: 'Fraud detection AI real-time', description: 'Come fraud analyst, voglio AI che rilevi claims sospetti in tempo reale', storyPoints: 21, priority: 'should_have', status: 'todo' },
          { title: 'Underwriting automatico low-risk', description: 'Come underwriter, voglio approvazione automatica per profili low-risk', storyPoints: 13, priority: 'should_have', status: 'todo' },
          { title: 'Dashboard ML ops e monitoring', description: 'Come ML engineer, voglio monitorare performance modelli in produzione', storyPoints: 8, priority: 'should_have', status: 'todo' },
        ],
      },
    ],
  },
];

// Function to create sprints
const createSprints = (projectId: string, startDate: Date) => {
  const sprints = [];
  const today = new Date();

  // Sprint 1 (completato)
  sprints.push({
    projectId,
    name: 'Sprint 1',
    goal: 'Setup infrastruttura e primi MVP features',
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(addDays(startDate, 14)),
    status: 'completed' as const,
    velocity: 0,
    createdAt: Timestamp.fromDate(startDate),
    updatedAt: Timestamp.now(),
  });

  // Sprint 2 (completato)
  const sprint2Start = addDays(startDate, 14);
  sprints.push({
    projectId,
    name: 'Sprint 2',
    goal: 'Core features development',
    startDate: Timestamp.fromDate(sprint2Start),
    endDate: Timestamp.fromDate(addDays(sprint2Start, 14)),
    status: 'completed' as const,
    velocity: 0,
    createdAt: Timestamp.fromDate(sprint2Start),
    updatedAt: Timestamp.now(),
  });

  // Sprint 3 (attivo)
  const sprint3Start = addDays(startDate, 28);
  if (sprint3Start <= today) {
    sprints.push({
      projectId,
      name: 'Sprint 3',
      goal: 'Integration e testing avanzato',
      startDate: Timestamp.fromDate(sprint3Start),
      endDate: Timestamp.fromDate(addDays(sprint3Start, 14)),
      status: 'active' as const,
      velocity: 0,
      createdAt: Timestamp.fromDate(sprint3Start),
      updatedAt: Timestamp.now(),
    });
  }

  // Sprint 4 (pianificato)
  const sprint4Start = addDays(startDate, 42);
  sprints.push({
    projectId,
    name: 'Sprint 4',
    goal: 'Ottimizzazioni e preparazione release',
    startDate: Timestamp.fromDate(sprint4Start),
    endDate: Timestamp.fromDate(addDays(sprint4Start, 14)),
    status: 'planned' as const,
    velocity: 0,
    createdAt: Timestamp.fromDate(sprint4Start),
    updatedAt: Timestamp.now(),
  });

  return sprints;
};

// Main population function
async function populateDemoData() {
  console.log('🚀 Starting demo data population...\n');

  for (const project of demoProjects) {
    console.log(`\n📦 Creating project: ${project.name}`);

    try {
      // Create project
      const projectRef = await addDoc(collection(db, 'projects'), {
        name: project.name,
        description: project.description,
        status: 'active',
        startDate: Timestamp.fromDate(project.startDate),
        teamSize: project.teamSize,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log(`  ✅ Project created with ID: ${projectRef.id}`);

      // Create team members
      console.log(`  👥 Creating ${project.team.length} team members...`);
      for (const member of project.team) {
        await addDoc(collection(db, 'teamMembers'), {
          projectId: projectRef.id,
          name: member.name,
          role: member.role,
          email: member.email,
          createdAt: Timestamp.now(),
        });
      }

      // Create epics and stories
      console.log(`  📚 Creating ${project.epics.length} epics...`);
      for (const epic of project.epics) {
        const epicRef = await addDoc(collection(db, 'epics'), {
          projectId: projectRef.id,
          title: epic.title,
          description: epic.description,
          businessValue: epic.businessValue,
          status: epic.status,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        console.log(`    ✅ Epic: ${epic.title} (${epic.stories.length} stories)`);

        // Create user stories for this epic
        for (const story of epic.stories) {
          await addDoc(collection(db, 'stories'), {
            projectId: projectRef.id,
            epicId: epicRef.id,
            title: story.title,
            description: story.description,
            storyPoints: story.storyPoints,
            priority: story.priority,
            status: story.status,
            tags: [epic.title.split(' ')[0]],
            acceptanceCriteria: [
              'Funzionalità completamente implementata',
              'Test automatici con coverage > 80%',
              'Documentazione tecnica aggiornata',
              'Code review approvata',
            ],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      }

      // Create sprints
      const sprints = createSprints(projectRef.id, project.startDate);
      console.log(`  🏃 Creating ${sprints.length} sprints...`);
      for (const sprint of sprints) {
        await addDoc(collection(db, 'sprints'), sprint);
      }

      console.log(`  ✅ Project ${project.name} completed!\n`);

    } catch (error) {
      console.error(`  ❌ Error creating project ${project.name}:`, error);
    }
  }

  console.log('\n🎉 Demo data population completed!\n');
  console.log('Summary:');
  console.log(`  - ${demoProjects.length} projects created`);
  console.log(`  - ${demoProjects.reduce((sum, p) => sum + p.team.length, 0)} team members`);
  console.log(`  - ${demoProjects.reduce((sum, p) => sum + p.epics.length, 0)} epics`);
  console.log(`  - ${demoProjects.reduce((sum, p) => sum + p.epics.reduce((s, e) => s + e.stories.length, 0), 0)} user stories`);
  console.log('\n✨ You can now login to the app and see the populated data!\n');
}

// Run the script
populateDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
