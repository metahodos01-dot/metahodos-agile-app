# 🚀 Quick Start Guide

## Avvio Immediato

```bash
# Avvia il server di sviluppo
npm run dev
```

L'applicazione si aprirà automaticamente su **http://localhost:3000**

## Cosa Vedrai

Il **Dashboard Mockup** dimostra tutto il design system Metahodos:

### Sezioni della Dashboard
1. **Stats Cards** - 4 card con metriche (Progetti, Sprint, Story, Ore)
2. **Button Components** - Tutti i variants (Primary, Secondary, Outline, Ghost)
3. **Form Components** - Input fields con stati (normal, error, disabled)
4. **Interactive Cards** - Cards cliccabili con hover effects
5. **Typography Scale** - h1-h6 + body text examples
6. **Color Palette** - Brand colors + semantic colors showcase

### Responsive Testing
- **Mobile**: < 768px - Menu hamburger, layout stacked
- **Tablet**: 768px - 1024px - Sidebar visible, 2-column layouts
- **Desktop**: > 1024px - Full layout con sidebar fissa

## Componenti Disponibili

### MetahodosButton
```tsx
import { MetahodosButton } from '@/components/ui';

<MetahodosButton variant="primary" size="md">
  Click Me
</MetahodosButton>
```

Variants: `primary` | `secondary` | `outline` | `ghost`
Sizes: `sm` | `md` | `lg`

### MetahodosCard
```tsx
import { MetahodosCard } from '@/components/ui';

<MetahodosCard interactive onClick={() => alert('Clicked!')}>
  <h3>Card Title</h3>
  <p>Card content...</p>
</MetahodosCard>
```

### MetahodosInput
```tsx
import { MetahodosInput } from '@/components/ui';

<MetahodosInput
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
/>
```

## Sviluppo

### Comandi Disponibili
```bash
npm run dev      # Avvia dev server (port 3000)
npm run build    # Build produzione
npm run preview  # Preview build produzione
```

### Struttura Files
```
src/
├── components/
│   ├── ui/          ← Componenti riutilizzabili
│   └── layout/      ← Header, Sidebar, Footer
├── pages/           ← DashboardMockup
├── lib/             ← Utils, types, constants
└── styles/          ← Global CSS + Tailwind
```

## Customizzazione Colori

Modifica `tailwind.config.js` per cambiare i colori:

```js
colors: {
  metahodos: {
    navy: '#1a1f2e',     // ← Cambia qui
    orange: '#ff6b35',   // ← Cambia qui
  }
}
```

## Troubleshooting

### Port 3000 già in uso?
```bash
# Modifica vite.config.ts, cambia port: 3000 in port: 3001
```

### Build fallisce?
```bash
# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

### Tailwind non applica stili?
```bash
# Verifica che globals.css sia importato in App.tsx
# Verifica che tailwind.config.js abbia i paths corretti
```

## Prossimo Step

Dopo aver verificato il mockup, fornisci feedback su:
- ✅ Colori corretti vs Metahodos.com?
- ✅ Typography appropriata?
- ✅ Spacing e layout ok?
- ✅ Componenti funzionano come atteso?

Una volta approvato → **Phase 1: Firebase & Authentication**

---

**Domande?** Consulta [README.md](./README.md) per documentazione completa.
**Design System?** Vedi [METAHODOS_STYLEGUIDE.md](./METAHODOS_STYLEGUIDE.md).
