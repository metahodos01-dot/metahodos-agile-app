import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PasswordResetPage } from './pages/auth/PasswordResetPage';
import { Dashboard } from './pages/Dashboard';
import { EpicsPage } from './pages/backlog/EpicsPage';
import { BacklogPage } from './pages/backlog/BacklogPage';
import { MoscowBoardPage } from './pages/backlog/MoscowBoardPage';
import { SprintsPage } from './pages/sprint/SprintsPage';
import { SprintDetailPage } from './pages/sprint/SprintDetailPage';
import { SprintBoardPage } from './pages/sprint/SprintBoardPage';
import { DiscoveryPage } from './pages/discovery/DiscoveryPage';
import { BusinessModelCanvasPage } from './pages/discovery/BusinessModelCanvasPage';
import { ValuePropositionCanvasPage } from './pages/discovery/ValuePropositionCanvasPage';
import { ValueStreamMapPage } from './pages/discovery/ValueStreamMapPage';
import { GapAnalysisPage } from './pages/discovery/GapAnalysisPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { StakeholdersPage } from './pages/stakeholder/StakeholdersPage';
import { TeamPage } from './pages/team/TeamPage';
import { AISettingsPage } from './pages/ai/AISettingsPage';
import { PopulateDemoPage } from './pages/PopulateDemoPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AICopilot } from './components/ai/AICopilot';
import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#2c3e50',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00d084',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#cf2e2e',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />

          {/* Protected routes with MainLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/epics"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EpicsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/backlog"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BacklogPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/moscow"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MoscowBoardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sprints"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SprintsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sprint/:sprintId"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SprintDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sprint/:sprintId/board"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SprintBoardPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discovery"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DiscoveryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discovery/bmc"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BusinessModelCanvasPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discovery/vpc"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ValuePropositionCanvasPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discovery/vsm"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ValueStreamMapPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discovery/gap"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GapAnalysisPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AnalyticsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stakeholders"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StakeholdersPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeamPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AISettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/populate-demo"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PopulateDemoPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProjectsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global AI Copilot - Available on all protected pages */}
        <AICopilot />
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
