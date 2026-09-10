export type PlanId = 'free' | 'tpe_pme' | 'agence'

export interface PlanLimits {
  maxActiveOffers: number
  maxCandidatesPerMonth: number
  maxUsers: number
  maxInterviews: number
  hasSms: boolean
  hasAudioAnalysis: boolean
  hasInterview2: boolean
  hasInterview3: boolean
  hasAdvancedStats: boolean
  hasTeamManagement: boolean
  hasExport: boolean
  hasPrioritySupport: boolean
  hasCalendar: boolean
}

export const PLANS: Record<PlanId, { id: PlanId; name: string; price: number; annualPrice: number; description: string; limits: PlanLimits }> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    annualPrice: 0,
    description: 'Découvrez rekruit sans engagement',
    limits: {
      maxActiveOffers: 1,
      maxCandidatesPerMonth: 10,
      maxUsers: 1,
      maxInterviews: 1,
      hasSms: false,
      hasAudioAnalysis: false,
      hasInterview2: false,
      hasInterview3: false,
      hasAdvancedStats: false,
      hasTeamManagement: false,
      hasExport: false,
      hasPrioritySupport: false,
      hasCalendar: false,
    }
  },
  tpe_pme: {
    id: 'tpe_pme',
    name: 'TPE / PME',
    price: 39.90,
    annualPrice: 399,
    description: 'Recrutez simplement et efficacement',
    limits: {
      maxActiveOffers: Infinity,
      maxCandidatesPerMonth: 200,
      maxUsers: 5,
      maxInterviews: 3,
      hasSms: true,
      hasAudioAnalysis: true,
      hasInterview2: true,
      hasInterview3: true,
      hasAdvancedStats: true,
      hasTeamManagement: false,
      hasExport: true,
      hasPrioritySupport: false,
      hasCalendar: true,
    }
  },
  agence: {
    id: 'agence',
    name: 'Agence',
    price: 79.90,
    annualPrice: 799,
    description: 'Le recrutement à grande échelle',
    limits: {
      maxActiveOffers: Infinity,
      maxCandidatesPerMonth: 1000,
      maxUsers: Infinity,
      maxInterviews: 3,
      hasSms: true,
      hasAudioAnalysis: true,
      hasInterview2: true,
      hasInterview3: true,
      hasAdvancedStats: true,
      hasTeamManagement: true,
      hasExport: true,
      hasPrioritySupport: true,
      hasCalendar: true,
    }
  }
}

export function getPlan(planId: string): typeof PLANS[PlanId] {
  return PLANS[(planId as PlanId)] || PLANS.free
}

export function canAddCandidate(plan: PlanId, currentMonthCount: number): boolean {
  return currentMonthCount < PLANS[plan].limits.maxCandidatesPerMonth
}

export function canAddOffer(plan: PlanId, activeOfferCount: number): boolean {
  return activeOfferCount < PLANS[plan].limits.maxActiveOffers
}

export function hasFeature(plan: PlanId, feature: keyof PlanLimits): boolean {
  const val = PLANS[plan].limits[feature]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val > 0
  return false
}
