# Metahodos Design System Style Guide

![Metahodos Logo](./assets/images/LogoMetaHodos.png)

## Overview
This document defines the complete design system for the Metahodos Agile Project Management application, ensuring visual consistency with the Metahodos.com brand identity.

**Brand Personality**: Modern, professional, corporate yet approachable. Balances credibility with human-centered design.

**Brand Essence**: PERSONE • AGILITÀ • RISULTATI

### Visual Identity Elements

The Metahodos visual identity is built around three key elements represented by **three colored circles**:

- 🔴 **Red/Coral Circle** (#E57373): Represents **PERSONE** (People) - the human element, collaboration, and team dynamics
- 🟠 **Orange Circle** (#FFB74D): Represents **AGILITÀ** (Agility) - process, methodology, and adaptive thinking
- 🟢 **Green Circle** (#81C784): Represents **RISULTATI** (Results) - outcomes, goals achieved, and value delivered

These three circles symbolize the interconnected nature of successful agile methodology: people working together through agile processes to achieve tangible results.

---

## Color Palette

### Primary Colors

```css
--metahodos-navy: #1a1f2e;        /* Primary brand color - headers, structure */
--metahodos-navy-dark: #0f1419;   /* Darker variant for hover states */
--metahodos-navy-light: #2c3544;  /* Lighter variant for backgrounds */

--metahodos-orange: #ff6b35;      /* Accent color - CTAs, highlights */
--metahodos-orange-dark: #e65a2a; /* Hover state for orange buttons */
--metahodos-orange-light: #ff8659; /* Light orange for subtle highlights */
```

### Neutral Colors

```css
--metahodos-white: #ffffff;
--metahodos-black: #000000;

/* Gray Scale */
--metahodos-gray-50: #f9fafb;
--metahodos-gray-100: #f3f4f6;
--metahodos-gray-200: #e5e7eb;
--metahodos-gray-300: #d1d5db;
--metahodos-gray-400: #9ca3af;
--metahodos-gray-500: #6b7280;
--metahodos-gray-600: #4b5563;
--metahodos-gray-700: #374151;
--metahodos-gray-800: #1f2937;
--metahodos-gray-900: #111827;

/* Text Colors */
--metahodos-text-primary: #2c3e50;   /* Body text */
--metahodos-text-secondary: #4b5563; /* Secondary text */
--metahodos-text-muted: #9ca3af;     /* Muted text, placeholders */
```

### Semantic Colors

```css
--metahodos-success: #00d084;  /* Success states, positive feedback */
--metahodos-warning: #fcb900;  /* Warning states, attention needed */
--metahodos-error: #cf2e2e;    /* Error states, destructive actions */
--metahodos-info: #0693e3;     /* Informational messages */
```

### Color Usage Guidelines

- **Navy (#1a1f2e)**: Primary brand color for headers, navigation, structural elements
- **Orange (#ff6b35)**: Call-to-action buttons, active states, important highlights
- **White (#ffffff)**: Main background, card backgrounds
- **Gray 50-300**: Subtle backgrounds, borders, dividers
- **Gray 600-900**: Text hierarchy, secondary UI elements
- **Semantic colors**: Used exclusively for their intended purpose (success/error/warning/info)

---

## Typography

### Font Families

```css
--font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Note**: Using system font stack for optimal performance and native feel across platforms.

### Font Sizes

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.8125rem;  /* 13px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 2.625rem;  /* 42px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Heading Styles

```css
h1: font-size: 2.625rem (42px), font-weight: 700, line-height: 1.2
h2: font-size: 2.25rem (36px), font-weight: 700, line-height: 1.3
h3: font-size: 1.875rem (30px), font-weight: 600, line-height: 1.4
h4: font-size: 1.5rem (24px), font-weight: 600, line-height: 1.5
h5: font-size: 1.25rem (20px), font-weight: 600, line-height: 1.5
h6: font-size: 1.125rem (18px), font-weight: 600, line-height: 1.5
```

### Body Text

```css
body: font-size: 1rem (16px), font-weight: 400, line-height: 1.6, color: #2c3e50
```

### Typography Guidelines

- Generous spacing between sections and text blocks
- Clear size differentiation for hierarchy
- Ample whitespace for readability
- Line-height 1.6 for body text, tighter (1.2-1.4) for headings

---

## Spacing System

### Base Spacing Scale

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-content: 800px;  /* Optimal reading width */
--container-wide: 1200px;    /* Standard max-width */
--container-full: 1400px;    /* Wide layouts */
```

### Spacing Guidelines

- Use 24px (spacing-6) as base gap between content blocks
- Use 48px (spacing-12) between major sections
- Card padding: 24px (spacing-6)
- Button padding: 10px 20px
- Input padding: 10px 12px

---

## Border Radius

### Border Radius Values

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px - Standard for buttons, inputs */
--radius-lg: 0.5rem;    /* 8px - Cards */
--radius-xl: 0.75rem;   /* 12px - Larger cards */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Pill shape - Badges */
```

### Usage

- **Buttons**: 6px (rounded-md)
- **Inputs**: 6px (rounded-md)
- **Cards**: 8px (rounded-lg)
- **Badges**: 9999px (rounded-full)
- **Modals**: 12px (rounded-xl)

---

## Shadows (Elevation System)

### Shadow Definitions

```css
/* Natural Shadow - Default for cards */
--shadow-natural: 6px 6px 9px rgba(0, 0, 0, 0.2);

/* Elevated Shadow - Hover state for cards */
--shadow-deep: 12px 12px 50px rgba(0, 0, 0, 0.4);

/* Sharp Shadow - Alternative style */
--shadow-sharp: 6px 6px 0px rgba(0, 0, 0, 0.2);

/* Crisp Shadow - High contrast */
--shadow-crisp: 6px 6px 0px rgba(0, 0, 0, 1);

/* Outlined Shadow - Dual-layer effect */
--shadow-outlined: 6px 6px 0px -3px rgba(255, 255, 255, 1),
                   6px 6px rgba(0, 0, 0, 1);

/* Subtle Shadow - For inputs, small elements */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Standard Shadow - Medium elevation */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Large Shadow - High elevation */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### Shadow Usage

- **Default cards**: `shadow-natural` or `shadow-md`
- **Hover/Interactive cards**: `shadow-deep` or `shadow-lg`
- **Inputs (focus)**: `shadow-sm` with orange border
- **Dropdowns**: `shadow-lg`
- **Modals**: `shadow-lg`

---

## Logo and Brand Elements

### Logo Usage

The Metahodos logo consists of three colored circles and the wordmark "METÀHODOS" with the tagline "PERSONE AGILITÀ RISULTATI".

**Logo Files**
- Main logo: `/assets/images/LogoMetaHodos.png`
- Available formats: PNG (transparent background)

**Logo Sizes**
- Header: 32px height (h-8)
- Footer: 32px height (h-8)
- Login page: 80px height (h-20)
- Marketing materials: Variable, maintain aspect ratio

**Logo Guidelines**
- Always maintain adequate clear space around the logo (minimum 16px)
- Never distort or stretch the logo
- On dark backgrounds, use inverted version (add `invert` class)
- Never separate the circles from the wordmark in official applications

### MetahodosCircles Component

The three colored circles are available as a reusable React component:

```tsx
import { MetahodosCircles } from '@/components/ui/MetahodosCircles';

// Usage
<MetahodosCircles size="sm" />  // Small: 1.5px circles
<MetahodosCircles size="md" />  // Medium: 2px circles (default)
<MetahodosCircles size="lg" />  // Large: 3px circles
```

**Circle Colors**
- Red/Coral: `#E57373` - Represents PERSONE (People)
- Orange: `#FFB74D` - Represents AGILITÀ (Agility)
- Green: `#81C784` - Represents RISULTATI (Results)

**Usage Guidelines**
- Use as a visual accent throughout the interface
- Maintain the sequence: red, orange, green (left to right)
- Never change the colors or reorder the circles
- Effective for representing progress, connection, or the brand identity

---

## Component Styles

### Buttons

**Primary Button (Orange)**
```css
background: #ff6b35;
color: #ffffff;
padding: 10px 20px;
border-radius: 6px;
font-weight: 600;
transition: all 0.2s ease;

hover: background: #e65a2a;
active: background: #cc4d1f;
disabled: background: #d1d5db, cursor: not-allowed;
```

**Secondary Button (Navy)**
```css
background: #1a1f2e;
color: #ffffff;
padding: 10px 20px;
border-radius: 6px;
font-weight: 600;

hover: background: #2c3544;
```

**Outline Button**
```css
background: transparent;
border: 2px solid #1a1f2e;
color: #1a1f2e;
padding: 10px 20px;
border-radius: 6px;
font-weight: 600;

hover: background: #1a1f2e, color: #ffffff;
```

**Button Sizes**
- Small: padding 8px 16px, font-size 14px
- Medium (default): padding 10px 20px, font-size 16px
- Large: padding 12px 24px, font-size 18px

### Cards

```css
background: #ffffff;
border-radius: 8px;
padding: 24px;
box-shadow: 6px 6px 9px rgba(0, 0, 0, 0.2);
transition: box-shadow 0.3s ease;

hover (if interactive):
  box-shadow: 12px 12px 50px rgba(0, 0, 0, 0.4);
  cursor: pointer;
```

### Form Inputs

```css
background: #ffffff;
border: 1px solid #d1d5db;
border-radius: 6px;
padding: 10px 12px;
font-size: 16px;
color: #2c3e50;
transition: all 0.2s ease;

focus:
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  outline: none;

error:
  border-color: #cf2e2e;

disabled:
  background: #f3f4f6;
  cursor: not-allowed;
```

### Badges

```css
background: #e5e7eb;
color: #374151;
padding: 4px 12px;
border-radius: 9999px;
font-size: 13px;
font-weight: 600;

/* Semantic variants */
success: background: #d1fae5, color: #065f46;
warning: background: #fef3c7, color: #92400e;
error: background: #fee2e2, color: #991b1b;
info: background: #dbeafe, color: #1e40af;
```

### Tables

```css
border: 1px solid #e5e7eb;
border-radius: 8px;
overflow: hidden;

thead:
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;

th:
  padding: 12px 16px;
  font-weight: 600;
  text-align: left;
  color: #1f2937;

td:
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;

tr:hover:
  background: #f9fafb;
```

---

## Layout Patterns

### Header

```css
background: #1a1f2e;
color: #ffffff;
height: 64px;
position: sticky;
top: 0;
z-index: 50;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

Logo area: left-aligned, padding-left: 24px
Navigation: center or left after logo
User menu: right-aligned, padding-right: 24px
```

### Sidebar

```css
background: #ffffff;
width: 240px;
height: 100vh;
border-right: 1px solid #e5e7eb;
position: fixed;

Menu items:
  padding: 12px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;

  hover: background: #f3f4f6;

  active:
    background: #fff7ed; /* Light orange tint */
    color: #ff6b35;
    border-left: 3px solid #ff6b35;
```

### Footer

```css
background: #1a1f2e;
color: #ffffff;
padding: 48px 24px 24px;

Three-column layout on desktop
Stack on mobile
Links: color #e5e7eb, hover: #ff6b35
```

### Page Container

```css
max-width: 1200px;
margin: 0 auto;
padding: 24px;

Mobile: padding: 16px;
```

---

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

### Responsive Behavior

- **Mobile (<768px)**: Stack layouts, full-width components, hamburger menu
- **Tablet (768-1024px)**: Two-column layouts, visible sidebar
- **Desktop (>1024px)**: Three-column layouts, full feature set

---

## Animations & Transitions

### Transition Durations

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions

```css
/* Buttons */
transition: all 200ms ease;

/* Cards */
transition: box-shadow 300ms ease, transform 200ms ease;

/* Inputs */
transition: border-color 200ms ease, box-shadow 200ms ease;

/* Hover scale */
hover: transform: scale(1.02);
```

---

## Accessibility Guidelines

### Contrast Ratios
- **Body text**: Minimum 4.5:1 (AA standard)
- **Large text (18px+)**: Minimum 3:1 (AA standard)
- **UI components**: Minimum 3:1 contrast

### Focus States
- All interactive elements must have visible focus indicator
- Use orange border (2px solid #ff6b35) for focus state
- Never remove outline without providing alternative

### ARIA Labels
- All buttons must have clear aria-label if icon-only
- Form inputs must have associated labels
- Use semantic HTML whenever possible

---

## Tailwind CSS Configuration

Apply this design system in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        metahodos: {
          navy: { DEFAULT: '#1a1f2e', dark: '#0f1419', light: '#2c3544' },
          orange: { DEFAULT: '#ff6b35', dark: '#e65a2a', light: '#ff8659' },
          gray: {
            50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
            300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280',
            600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827'
          },
        },
        success: '#00d084',
        warning: '#fcb900',
        error: '#cf2e2e',
        info: '#0693e3',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'natural': '6px 6px 9px rgba(0, 0, 0, 0.2)',
        'deep': '12px 12px 50px rgba(0, 0, 0, 0.4)',
      },
      spacing: {
        'container-content': '800px',
        'container-wide': '1200px',
      },
    },
  },
}
```

---

## Usage Examples

### Button Example
```html
<!-- Primary Button -->
<button class="bg-metahodos-orange hover:bg-metahodos-orange-dark text-white font-semibold py-2.5 px-5 rounded-md transition-all duration-200">
  Click Me
</button>

<!-- Secondary Button -->
<button class="bg-metahodos-navy hover:bg-metahodos-navy-light text-white font-semibold py-2.5 px-5 rounded-md transition-all duration-200">
  Secondary
</button>
```

### Card Example
```html
<div class="bg-white rounded-lg p-6 shadow-natural hover:shadow-deep transition-shadow duration-300">
  <h3 class="text-xl font-semibold text-metahodos-navy mb-2">Card Title</h3>
  <p class="text-metahodos-text-primary">Card content goes here...</p>
</div>
```

### Input Example
```html
<div>
  <label class="block text-sm font-medium text-metahodos-text-primary mb-2">
    Email
  </label>
  <input
    type="email"
    class="w-full px-3 py-2.5 border border-metahodos-gray-300 rounded-md focus:border-metahodos-orange focus:ring-2 focus:ring-metahodos-orange/10 outline-none transition-all"
    placeholder="you@example.com"
  />
</div>
```

---

## Design Principles

1. **Consistency**: Every component follows the same visual language
2. **Clarity**: Clear hierarchy and intuitive interactions
3. **Simplicity**: No unnecessary decoration, focus on content
4. **Professionalism**: Corporate-appropriate while remaining approachable
5. **Responsiveness**: Fluid layouts that work on all devices
6. **Accessibility**: WCAG 2.1 AA compliant minimum

---

## Version History

- **v1.0** (2026-01-07): Initial design system extraction from Metahodos.com

---

## Maintenance

This style guide should be updated whenever:
- New components are added to the design system
- Brand colors or typography change
- New patterns emerge from user testing
- Accessibility requirements evolve

For questions or suggestions, contact the design team.
