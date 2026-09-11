import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { PublicRoute } from './components/layout/PublicRoute'
import { CookieBanner } from './components/CookieBanner'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
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

// Public pages
import { FeaturesPage } from './pages/FeaturesPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { FaqPage } from './pages/FaqPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { HelpPage } from './pages/HelpPage'

// Legal pages
import { PrivacyPage } from './pages/legal/PrivacyPage'
import { TermsPage } from './pages/legal/TermsPage'
import { CgvPage } from './pages/legal/CgvPage'
import { LegalNoticePage } from './pages/legal/LegalNoticePage'
import { CookiesPage } from './pages/legal/CookiesPage'
import { CookieSettingsPage } from './pages/legal/CookieSettingsPage'
import { RefundPolicyPage } from './pages/legal/RefundPolicyPage'
import { PrivacyContactPage } from './pages/legal/PrivacyContactPage'
import { DataDeletionPage } from './pages/legal/DataDeletionPage'

// Settings sub-pages
import { ProfileSettingsPage } from './pages/settings/ProfileSettingsPage'
import { CompanySettingsPage } from './pages/settings/CompanySettingsPage'
import { NotificationsSettingsPage } from './pages/settings/NotificationsSettingsPage'
import { SecuritySettingsPage } from './pages/settings/SecuritySettingsPage'
import { SubscriptionSettingsPage } from './pages/settings/SubscriptionSettingsPage'
import { TeamSettingsPage } from './pages/settings/TeamSettingsPage'
import { DataSettingsPage } from './pages/settings/DataSettingsPage'

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
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Public info pages */}
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />

      {/* Legal pages */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cgv" element={<CgvPage />} />
      <Route path="/legal-notice" element={<LegalNoticePage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/cookie-settings" element={<CookieSettingsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/privacy-contact" element={<PrivacyContactPage />} />
      <Route path="/data-deletion" element={<DataDeletionPage />} />

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

      {/* Settings sub-pages */}
      <Route path="/settings/profile" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <ProfileSettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/settings/company" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <CompanySettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/settings/notifications" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <NotificationsSettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/settings/security" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <SecuritySettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/settings/subscription" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <SubscriptionSettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/settings/team" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <TeamSettingsPage />
            </AppLayout>
          </OnboardingGuard>
        </ProtectedRoute>
      } />
      <Route path="/settings/data" element={
        <ProtectedRoute>
          <OnboardingGuard>
            <AppLayout>
              <DataSettingsPage />
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
        <CookieBanner />
      </AuthProvider>
    </BrowserRouter>
  )
}
