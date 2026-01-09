# Metahodos Agile Project Management App

![Metahodos Logo](./assets/images/LogoMetaHodos.png)

**PERSONE • AGILITÀ • RISULTATI**

Professional Agile project management application specialized for product development and business process improvement. Built with the Metahodos brand design system.

## Overview

This application supports the complete Agile lifecycle:
- Discovery & Research
- Product Backlog Management
- Sprint Planning & Execution
- Retrospectives & Reviews
- Process Improvement Tracking
- Stakeholder Management
- Analytics & Reporting

## Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework with custom Metahodos theme
- **Heroicons** - Icon library
- **React Router v6** - Client-side routing (to be added in Phase 1)
- **Zustand** - State management (to be added in Phase 1)

### Backend (Phase 1+)
- **Firebase** - Authentication, Firestore database, Storage

### Additional Libraries
- **React Hook Form** + **Zod** - Form handling and validation
- **date-fns** - Date manipulation
- **Recharts** - Charts and data visualization
- **React Hot Toast** - Toast notifications

## Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── ui/               # Branded UI components (Button, Card, Input)
│   │   └── layout/           # Layout components (Header, Sidebar, Footer)
│   ├── lib/
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── utils.ts          # Utility functions
│   │   └── constants.ts      # App constants
│   ├── pages/
│   │   └── DashboardMockup.tsx  # Demo/mockup page
│   ├── styles/
│   │   └── globals.css       # Global styles with Tailwind
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
├── METAHODOS_STYLEGUIDE.md   # Complete design system documentation
├── tailwind.config.js        # Tailwind configuration with Metahodos theme
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd metahodos_claude_AI
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file** (for Phase 1+ when Firebase is integrated)

```bash
cp .env.example .env
```

Then edit `.env` and add your Firebase credentials.

### Development

Start the development server:

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Design System

The application uses a custom Tailwind configuration matching the Metahodos brand identity:

### Brand Elements

The Metahodos visual identity is built around **three colored circles** that represent:
- 🔴 **Red/Coral** (#E57373) - PERSONE (People) - collaboration and team dynamics
- 🟠 **Orange** (#FFB74D) - AGILITÀ (Agility) - process and methodology
- 🟢 **Green** (#81C784) - RISULTATI (Results) - outcomes and value delivered

These circles are used throughout the interface as a visual signature, available through the `MetahodosCircles` component.

### Colors
- **Navy** (#1a1f2e) - Primary brand color for headers and structure
- **Orange** (#ff6b35) - Accent color for CTAs and highlights
- **Grays** - Complete gray scale for UI elements
- **Semantic** - Success, Warning, Error, Info colors

### Typography
- System font stack for optimal performance
- Clear size hierarchy from h1 to h6
- Generous spacing for readability

### Components
- **MetahodosButton** - Primary, secondary, outline, ghost variants
- **MetahodosCard** - Interactive and static card components
- **MetahodosInput** - Form inputs with error states and validation support
- **MetahodosCircles** - Brand signature element with three colored circles

See [METAHODOS_STYLEGUIDE.md](./METAHODOS_STYLEGUIDE.md) for complete design system documentation.

## Phase 0 Status (Current)

✅ **Completed:**
- Design system extraction and documentation
- Project setup (Vite + React + TypeScript + Tailwind)
- Tailwind configuration with Metahodos theme
- Core UI components (Button, Card, Input)
- Layout components (Header, Sidebar, Footer)
- Dashboard mockup demonstrating all components
- Full responsive design

🎯 **Next Phase:** Phase 1 - Core Foundation
- Firebase setup and configuration
- Authentication flow (login, signup, password reset)
- Organization & user management
- Protected routes
- Real data integration

## Phase 0 Deliverables

This Phase 0 implementation includes:

1. **METAHODOS_STYLEGUIDE.md** - Complete design system documentation
2. **3 Core UI Components** - Button, Card, Input with full TypeScript support
3. **3 Layout Components** - Header, Sidebar, Footer
4. **Dashboard Mockup** - Fully functional demonstration page
5. **Responsive Design** - Works on mobile, tablet, desktop
6. **Documentation** - README and setup instructions

## Development Roadmap

### Phase 1: Core Foundation (Next)
- Firebase setup
- Authentication system
- User & organization management
- Protected routing
- Base dashboard with real data

### Phase 2: Backlog Management
- Epic & story CRUD operations
- Backlog prioritization tools
- Estimation features
- MoSCoW, WSJF, Value/Effort matrix

### Phase 3: Sprint Management
- Sprint planning
- Kanban board
- Daily scrum tracking
- Sprint review & retrospective

### Phase 4: Discovery & Process Improvement
- Discovery repository
- Pretotype experiments
- Process mapping
- Metrics dashboard

### Phase 5: Reporting & Analytics
- Velocity charts
- Burndown charts
- Team health dashboard
- Export features

### Phase 6: Collaboration & Polish
- Comments system
- Activity feed
- Notifications
- Templates library
- Accessibility audit

### Phase 7: Testing & Deployment
- Cross-browser testing
- Mobile optimization
- Performance optimization
- Production deployment

### Phase 8+: AI Enhancement (Future)
- Claude API integration
- AI copilot features
- Smart suggestions
- Automated insights

## Contributing

This is a Metahodos proprietary project. For questions or contributions, contact the project team.

## License

Proprietary - Metahodos. All rights reserved.

## Support

For support or questions:
- Email: info@metahodos.com
- Website: [www.metahodos.com](https://www.metahodos.com)

---

**Current Version:** 0.1.0 (Phase 0 - Design System & Setup)

**Last Updated:** January 2026
