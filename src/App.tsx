import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { OffersPage } from './pages/OffersPage'
import { NewOfferPage } from './pages/NewOfferPage'
import { CandidatesPage } from './pages/CandidatesPage'
import { NewCandidatePage } from './pages/NewCandidatePage'
import { CandidateDetailPage } from './pages/CandidateDetailPage'
import { InterviewsPage } from './pages/InterviewsPage'
import { SettingsPage } from './pages/SettingsPage'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return null
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />

      {/* App */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/offres" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <OffersPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/offres/nouvelle" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <NewOfferPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/offres/:id" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <OffersPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/candidats" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <CandidatesPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/candidats/nouveau" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <NewCandidatePage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/candidats/:id" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <CandidateDetailPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/entretiens" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <InterviewsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/parametres" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      <Route path="/mon-compte" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
