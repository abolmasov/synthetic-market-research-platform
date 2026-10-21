import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PersonasPage = lazy(() => import('./pages/PersonasPage'));
const SegmentsPage = lazy(() => import('./pages/SegmentsPage'));
const HypothesesPage = lazy(() => import('./pages/HypothesesPage'));
const SimulationsPage = lazy(() => import('./pages/SimulationsPage'));
const SimulationDetailPage = lazy(() => import('./pages/SimulationDetailPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const StudiesPage = lazy(() => import('./pages/StudiesPage'));
const HypothesisWizardPage = lazy(() => import('./pages/HypothesisWizardPage'));
const RunComparisonPage = lazy(() => import('./pages/RunComparisonPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const GuidesPage = lazy(() => import('./pages/GuidesPage'));
const Layout = lazy(() => import('./components/Layout'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="disclaimer" element={<DisclaimerPage />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="personas" element={<PersonasPage />} />
                <Route path="segments" element={<SegmentsPage />} />
                <Route path="hypotheses" element={<HypothesesPage />} />
                <Route path="simulations" element={<SimulationsPage />} />
                <Route path="simulations/:id" element={<SimulationDetailPage />} />
                <Route path="runs/:id/comparison" element={<RunComparisonPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="studies" element={<StudiesPage />} />
                <Route path="guides" element={<GuidesPage />} />
                <Route path="create-test" element={<HypothesisWizardPage />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
