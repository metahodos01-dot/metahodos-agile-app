# Logo Integration Guide

**Date**: 2026-01-07
**Status**: ✅ COMPLETE - Code Ready, Logo File Needed

---

## Summary

Il sistema è stato preparato per integrare il logo Metahodos in tutte le pagine dell'applicazione. Il codice è pronto e funzionante con fallback automatici.

---

## Where the Logo Appears

Il logo Metahodos è ora integrato in **5 posizioni strategiche**:

### 1. Header (Top Navigation Bar)
- **Location**: [Header.tsx](src/components/layout/Header.tsx:45-56)
- **Size**: 32x32px (8x8 Tailwind units)
- **Position**: Top-left corner, accanto al menu hamburger (mobile)
- **Visibility**: Visibile su tutte le pagine protette

### 2. Sidebar Footer
- **Location**: [Sidebar.tsx](src/components/layout/Sidebar.tsx:274-284)
- **Size**: 24x24px (6x6 Tailwind units)
- **Position**: Footer della sidebar, accanto ai 4 dots arancioni
- **Visibility**: Sempre visibile quando la sidebar è aperta

### 3. Login Page
- **Location**: [LoginPage.tsx](src/pages/auth/LoginPage.tsx:89-100)
- **Size**: 64x64px (16x16 Tailwind units)
- **Position**: Centrato sopra il titolo "Benvenuto su Metahodos"
- **Visibility**: Prima schermata che gli utenti vedono

### 4. Signup Page
- **Location**: [SignupPage.tsx](src/pages/auth/SignupPage.tsx:115-126)
- **Size**: 64x64px (16x16 Tailwind units)
- **Position**: Centrato sopra il titolo "Crea il tuo account"
- **Visibility**: Pagina di registrazione

### 5. Password Reset Page
- **Location**: [PasswordResetPage.tsx](src/pages/auth/PasswordResetPage.tsx:115-126)
- **Size**: 64x64px (16x16 Tailwind units)
- **Position**: Centrato sopra il titolo "Password dimenticata?"
- **Visibility**: Pagina di recupero password

---

## How to Add Your Logo

### Step 1: Prepare Your Logo File

**Formato consigliato: SVG**
- ✅ Scalabile senza perdita di qualità
- ✅ File size piccolo
- ✅ Supporta trasparenza
- ✅ Funziona su qualsiasi sfondo

**Formati alternativi supportati:**
- PNG (con trasparenza)
- JPG (per loghi con background solido)
- WEBP (ottimo compromesso qualità/dimensioni)

**Nome file richiesto:**
```
metahodos-logo.svg
```
(oppure `.png`, `.jpg`, `.webp` se usi un altro formato)

### Step 2: Place the Logo File

**Posizione corretta:**
```
/Users/franz/Documents/metahodos_claude_AI/public/metahodos-logo.svg
```

**Percorso completo:**
```
metahodos_claude_AI/
├── public/                    ← La cartella è già stata creata
│   └── metahodos-logo.svg    ← Metti qui il tuo file
├── src/
├── dist/
└── ...
```

### Step 3: Verify the Integration

Dopo aver copiato il file:

1. **Restart dev server** (se è running):
   ```bash
   npm run dev
   ```

2. **Check the logo appears**:
   - Login page → Logo grande centrato
   - Header → Logo piccolo top-left
   - Sidebar → Logo piccolo nel footer

3. **Test fallback** (opzionale):
   - Se il logo non viene trovato, vedrai la lettera "M" arancione
   - Questo conferma che il fallback funziona correttamente

---

## Technical Implementation

### Code Structure

Tutti i loghi usano questa struttura:

```tsx
<img
  src="/metahodos-logo.svg"
  alt="Metahodos Logo"
  className="h-8 w-8 object-contain"
  onError={(e) => {
    // Fallback to letter logo if image not found
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const fallback = target.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  }}
/>
<div className="w-8 h-8 bg-metahodos-orange rounded-lg items-center justify-center hidden">
  <span className="text-white font-bold text-sm">M</span>
</div>
```

### How Fallback Works

1. **Primary**: Prova a caricare `/metahodos-logo.svg`
2. **onError**: Se il file non esiste:
   - Nasconde l'immagine
   - Mostra il fallback (lettera "M" arancione)
3. **User Experience**: Nessun logo rotto, sempre qualcosa di visibile

### Tailwind Classes Used

| Size       | Tailwind Class | Pixels | Usage                    |
|------------|----------------|--------|--------------------------|
| Small      | `h-6 w-6`      | 24x24  | Sidebar footer           |
| Medium     | `h-8 w-8`      | 32x32  | Header                   |
| Large      | `h-16 w-16`    | 64x64  | Auth pages (login/signup)|

- `object-contain`: Mantiene aspect ratio, no crop
- `object-cover`: Riempie il container (alternativa)

---

## Logo Design Recommendations

### For Best Results

**SVG Logo:**
- ✅ Viewbox corretto (es: `viewBox="0 0 100 100"`)
- ✅ Percorsi puliti e ottimizzati
- ✅ Colori brand (arancione #ff6b35, navy #1e3a5f)
- ✅ Senza testo (solo simbolo) per dimensioni piccole
- ✅ Con testo per dimensioni grandi (opzionale)

**PNG Logo:**
- ✅ Risoluzione: 512x512px minimo
- ✅ Formato: PNG-24 con alpha channel
- ✅ Background trasparente
- ✅ Padding interno di ~10% per breathing room

**Colori Brand Metahodos:**
- **Orange**: #ff6b35 (primary)
- **Navy**: #1e3a5f (secondary)
- **White**: #ffffff (text on dark)

---

## Alternative Logo Paths

Se vuoi usare percorsi diversi:

### Option 1: Multiple Logo Variants

```
public/
├── metahodos-logo.svg           ← Default
├── metahodos-logo-light.svg     ← Per sfondi scuri
├── metahodos-logo-dark.svg      ← Per sfondi chiari
└── metahodos-icon.svg           ← Solo icona (no testo)
```

### Option 2: Assets Directory

```
src/
└── assets/
    └── images/
        └── metahodos-logo.svg
```

**Update import path in components:**
```tsx
import logoUrl from '../../assets/images/metahodos-logo.svg';

<img src={logoUrl} alt="Metahodos Logo" />
```

---

## Responsive Behavior

### Desktop
- Header: Logo + "Metahodos Agile" text (hidden on small screens)
- Sidebar: Logo visibile nel footer

### Mobile
- Header: Solo logo (text nascosto per risparmiare spazio)
- Sidebar: Logo visibile quando sidebar è aperta

### Breakpoints
```css
sm: 640px   - Logo visibile, text nascosto
md: 768px   - Logo visibile, text nascosto
lg: 1024px  - Logo + text visibili
```

---

## Testing Checklist

Una volta caricato il logo:

✅ **Login Page**
- [ ] Logo visibile e centrato (64x64px)
- [ ] Non sfocato o distorto
- [ ] Carica velocemente

✅ **Signup Page**
- [ ] Logo visibile e centrato (64x64px)
- [ ] Stesso aspetto del login

✅ **Password Reset Page**
- [ ] Logo visibile e centrato (64x64px)
- [ ] Coerente con altre auth pages

✅ **Header**
- [ ] Logo visibile top-left (32x32px)
- [ ] Allineato con menu hamburger
- [ ] Visibile su tutte le pagine protette

✅ **Sidebar**
- [ ] Logo visibile nel footer (24x24px)
- [ ] Allineato con i 4 dots arancioni
- [ ] Non coperto dallo scroll

✅ **Fallback**
- [ ] Rimuovi temporaneamente il file logo
- [ ] Verifica che appaia la lettera "M" arancione
- [ ] Ripristina il logo

✅ **Performance**
- [ ] Logo carica in <100ms
- [ ] No flickering o FOUC
- [ ] Cached dopo primo load

---

## File Size Optimization

### SVG Optimization

Se il tuo SVG è grande, ottimizzalo con:

**Online Tools:**
- [SVGOMG](https://jakearchibald.github.io/svgomg/)
- [SVG Optimizer](https://www.svgviewer.dev/svg-optimizer)

**CLI Tools:**
```bash
npm install -g svgo
svgo metahodos-logo.svg -o metahodos-logo-optimized.svg
```

**Target size:**
- SVG: < 10KB (ideale < 5KB)
- PNG: < 50KB (ideale < 20KB)

### PNG Optimization

```bash
# Install tools
npm install -g pngquant

# Optimize
pngquant --quality=85-95 metahodos-logo.png -o metahodos-logo-optimized.png
```

---

## Troubleshooting

### Logo non appare

**Possibili cause:**

1. **File path errato**
   - ✅ Deve essere: `/public/metahodos-logo.svg`
   - ❌ Non: `/src/assets/metahodos-logo.svg`

2. **Nome file errato**
   - ✅ `metahodos-logo.svg` (lowercase, con trattino)
   - ❌ `Metahodos Logo.svg` (spazi, uppercase)

3. **Server non riavviato**
   - Riavvia: `npm run dev`

4. **Cache browser**
   - Hard refresh: `Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Win)

5. **Formato non supportato**
   - Usa SVG, PNG, JPG, o WEBP
   - Evita formati esotici (TIFF, BMP, etc)

### Logo distorto

**Soluzioni:**

1. **Aspect ratio sbagliato**
   - Usa `object-contain` invece di `object-cover`
   - O crea un logo quadrato (1:1 ratio)

2. **SVG viewBox errato**
   ```svg
   <!-- ✅ Corretto -->
   <svg viewBox="0 0 100 100" ...>

   <!-- ❌ Errato -->
   <svg viewBox="50 50 200 200" ...>
   ```

3. **Padding interno**
   - Aggiungi 10% di padding nel design del logo
   - O usa `p-1` Tailwind class sull'immagine

---

## Future Enhancements

Possibili miglioramenti futuri:

### Dark Mode Support
```tsx
<img
  src={darkMode ? '/metahodos-logo-light.svg' : '/metahodos-logo.svg'}
  alt="Metahodos Logo"
/>
```

### Animated Logo
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.logo-animated {
  animation: pulse 2s ease-in-out infinite;
}
```

### Logo Click Action
```tsx
<img
  src="/metahodos-logo.svg"
  alt="Metahodos Logo"
  onClick={() => navigate('/dashboard')}
  className="cursor-pointer hover:opacity-80 transition-opacity"
/>
```

---

## Summary

✅ **Code Ready**: Tutti i componenti sono stati aggiornati
✅ **Fallback Active**: Lettera "M" se logo non trovato
✅ **5 Locations**: Header, Sidebar, Login, Signup, Reset
✅ **Responsive**: Dimensioni ottimizzate per ogni device
✅ **Performance**: Lazy loading e caching automatici

**Next Step**: Copia il file `metahodos-logo.svg` nella cartella `/public/` e il logo apparirà automaticamente! 🎨

---

## Quick Commands

```bash
# Navigate to project
cd /Users/franz/Documents/metahodos_claude_AI

# Create public directory (già fatto)
mkdir -p public

# Copy your logo (sostituisci PATH_TO_YOUR_LOGO)
cp PATH_TO_YOUR_LOGO/metahodos-logo.svg public/

# Restart dev server
npm run dev

# Open in browser
open http://localhost:5173
```

**That's it!** Il logo sarà visibile ovunque. 🚀
