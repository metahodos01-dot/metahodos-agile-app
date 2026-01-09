# Troubleshooting Guide - Metahodos Agile App

## Problema: Pagina Epics/Backlog/MoSCoW non carica (rotellina infinita)

### Causa
Firestore richiede indici composti per alcune query. Quando accedi per la prima volta a queste pagine, Firestore deve creare gli indici necessari.

### Soluzione

#### Passo 1: Apri la Console del Browser
1. Vai su http://localhost:3000/epics
2. Premi **F12** (oppure **Cmd+Option+I** su Mac) per aprire Developer Tools
3. Vai alla tab **Console**

#### Passo 2: Cerca l'errore Firestore
Dovresti vedere un errore simile a questo:

```
FirebaseError: The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/project/metahodos-agile-app/firestore/indexes?create_composite=...
```

#### Passo 3: Crea l'indice
1. **Clicca sul link** nell'errore (si aprirà Firebase Console)
2. Firebase ti mostrerà una schermata con l'indice da creare già configurato
3. Clicca su **"Create Index"**
4. Aspetta 2-3 minuti che l'indice venga costruito (vedrai lo status "Building...")
5. Quando lo status diventa **"Enabled"** (verde), torna all'app e ricarica la pagina

#### Passo 4: Ripeti per ogni pagina
Dovrai creare indici separati per:
- `/epics` - Indice per la collection `epics`
- `/backlog` - Indice per la collection `stories`
- `/moscow` - Indice per la collection `stories` (stesso indice del backlog)

### Indici Necessari

Se vuoi crearli manualmente, vai su **Firebase Console** → **Firestore Database** → **Indexes** e crea questi indici composti:

#### 1. Indice per Epics
```
Collection: epics
Fields:
  - projectId (Ascending)
  - createdAt (Descending)
```

#### 2. Indice per Stories (base)
```
Collection: stories
Fields:
  - projectId (Ascending)
  - priority (Descending)
```

#### 3. Indice per Stories con Status
```
Collection: stories
Fields:
  - projectId (Ascending)
  - status (Ascending)
  - priority (Descending)
```

#### 4. Indice per Stories con MoSCoW
```
Collection: stories
Fields:
  - projectId (Ascending)
  - moscowPriority (Ascending)
  - priority (Descending)
```

#### 5. Indice per Stories per Epic
```
Collection: stories
Fields:
  - projectId (Ascending)
  - epicId (Ascending)
  - priority (Descending)
```

---

## Problema: Toast "Errore nel caricamento degli epic/backlog"

### Causa
Problema di connessione con Firestore o regole di sicurezza troppo restrittive.

### Soluzione

#### Verifica le regole Firestore
1. Vai su **Firebase Console** → **Firestore Database** → **Rules**
2. Usa queste regole per sviluppo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Clicca **"Publish"**

**IMPORTANTE:** Queste regole sono per sviluppo. In produzione dovrai implementare regole più restrittive.

---

## Problema: "Missing or insufficient permissions"

### Causa
L'utente non è autenticato o le regole Firestore sono troppo restrittive.

### Soluzione

1. Verifica di essere autenticato:
   - Controlla che vedi il tuo nome nel menu utente (angolo in alto a destra)
   - Se non sei autenticato, vai su `/login` e accedi

2. Verifica le regole Firestore (vedi sopra)

3. Controlla la console del browser per errori di autenticazione:
   ```javascript
   // Dovresti vedere questo nella console quando accedi
   firebase.auth().onAuthStateChanged((user) => {
     if (user) {
       console.log("User authenticated:", user.uid);
     }
   });
   ```

---

## Problema: Nessun dato appare anche dopo aver creato epic/story

### Causa
Potrebbero essere salvati in un progetto diverso (ricorda che usiamo `DEFAULT_PROJECT_ID = 'default-project'`).

### Soluzione

1. Verifica in **Firebase Console** → **Firestore Database** → **Data**
2. Controlla che le collection `epics` e `stories` esistano
3. Verifica che i documenti abbiano il campo `projectId: "default-project"`

Se i dati sono in un altro `projectId`, puoi:
- Eliminarli e ricrearli
- Oppure modificare `DEFAULT_PROJECT_ID` nei file delle pagine

---

## Problema: HMR (Hot Reload) non funziona

### Causa
Dev server potrebbe essere crashato o disconnesso.

### Soluzione

1. Controlla che il server sia ancora in esecuzione:
   ```bash
   # Verifica che npm run dev sia attivo
   ps aux | grep vite
   ```

2. Se necessario, riavvia il dev server:
   ```bash
   npm run dev
   ```

3. Ricarica la pagina nel browser (Cmd+R o Ctrl+R)

---

## Problema: Build error o TypeScript error

### Causa
Dipendenze mancanti o conflitti di tipo.

### Soluzione

1. Reinstalla le dipendenze:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Verifica che tutte le dipendenze siano installate:
   ```bash
   npm list react react-dom firebase date-fns react-router-dom react-hot-toast
   ```

3. Se ci sono errori TypeScript, controlla il file `.tsconfig.json`

---

## Problema: "Cannot read properties of undefined"

### Causa Comune
Stai cercando di accedere a dati che non sono ancora caricati (async).

### Soluzione

Verifica che i componenti gestiscano correttamente lo stato di loading:

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (!data) {
  return <EmptyState />;
}

// Ora è sicuro usare data
```

Tutti i nostri componenti principali hanno già questa gestione.

---

## Problema: Drag-and-drop non funziona su MoSCoW Board

### Causa
Browser potrebbe non supportare HTML5 Drag and Drop API o JavaScript disabilitato.

### Soluzione

1. Verifica che JavaScript sia abilitato nel browser
2. Prova un browser moderno (Chrome, Firefox, Safari, Edge)
3. Controlla la console per errori durante il drag

---

## Debugging Generale

### Comandi Utili

**Pulire la cache del browser:**
- Chrome: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)
- Seleziona "Cached images and files"

**Vedere i log Firestore:**
```javascript
// Aggiungi questo in firestore-backlog.ts temporaneamente
console.log('Query result:', result);
```

**Vedere lo stato React:**
- Installa React Developer Tools (estensione browser)
- Apri Developer Tools → tab "Components"
- Ispeziona lo state dei componenti

**Controllare le richieste di rete:**
- Developer Tools → tab "Network"
- Filtra per "firestore" per vedere le chiamate API

---

## Contatti & Support

Se il problema persiste:

1. **Controlla la console del browser** (F12) per errori
2. **Controlla Firebase Console** → **Firestore** → **Usage** per vedere se ci sono richieste
3. **Verifica la connessione internet**
4. **Riavvia il dev server** (`npm run dev`)

Per problemi più complessi, consulta:
- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## Quick Fixes Checklist

Prima di cercare aiuto, prova questi quick fixes:

- [ ] Ricarica la pagina (Cmd+R / Ctrl+R)
- [ ] Pulisci la cache del browser
- [ ] Controlla di essere autenticato
- [ ] Verifica gli indici Firestore (vedi errori nella console)
- [ ] Verifica le regole Firestore (devono permettere read/write)
- [ ] Riavvia il dev server (`npm run dev`)
- [ ] Controlla la console del browser per errori
- [ ] Verifica la connessione Firebase in Firebase Console

Se tutti questi check passano e il problema persiste, probabilmente c'è un bug nel codice che va investigato più a fondo.
