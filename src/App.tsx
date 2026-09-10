import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicRoute } from './components/layout/PublicRoute'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { OffersPage } from './pages/OffersPage'
import { NewOfferPage } from './pages/NewOfferPage'
import { OfferDetailPage } from './pages/OfferDetailPage'
import { CandidatesPage } from './pages/CandidatesPage'
import { NewCandidatePage } from './pages/NewCandidatePage'
import { CandidateDetailPage } from './pages/CandidateDetailPage'
import { InterviewsPage } from './pages/InterviewsPage'
import { CalendarPage } from './pages/CalendarPage'
import { SettingsPage } from './pages/SettingsPage'
import { PublicInterviewPage } from './pages/PublicInterviewPage'
import { PricingPage } from './pages/PricingPage'
import { BillingPage } from './pages/BillingPage'
import { AdminPage } from './pages/AdminPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SuperAdminLayout } from './pages/superadmin/SuperAdminLayout'
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard'
import { SuperAdminCompanies } from './pages/superadmin/SuperAdminCompanies'
import { SuperAdminSubscriptions } from './pages/superadmin/SuperAdminSubscriptions'
import { SuperAdminRevenue } from './pages/superadmin/SuperAdminRevenue'
import { SuperAdminUsage } from './pages/superadmin/SuperAdminUsage'

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
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/connexion" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/inscription" element={<PublicRoute><RegisterPage /></PublicRoute>} />
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
              <OfferDetailPage />
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

      <Route path="/calendrier" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <CalendarPage />
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

      {/* Pricing (public) */}
      <Route path="/pricing" element={<PricingPage />} />

      {/* Billing */}
      <Route path="/billing" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <BillingPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      {/* Analytics */}
      <Route path="/analytics" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/admin/utilisateurs" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <AdminUsersPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />

      {/* Super Admin */}
      <Route path="/super-admin" element={
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminDashboard />
          </SuperAdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/entreprises" element={
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminCompanies />
          </SuperAdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/abonnements" element={
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminSubscriptions />
          </SuperAdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/revenus" element={
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminRevenue />
          </SuperAdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/usage" element={
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminUsage />
          </SuperAdminLayout>
        </ProtectedRoute>
      } />

      {/* Public candidate interview page */}
      <Route path="/c/:token" element={<PublicInterviewPage />} />

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
