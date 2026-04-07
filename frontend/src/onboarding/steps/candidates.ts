import type { OnboardingStep } from '../types'

export const candidatesSteps: OnboardingStep[] = [
  {
    id: 'candidates-header',
    targetSelector: '[data-onboarding="candidates-header"]',
    title: 'Candidates',
    body: 'All matched candidates across your job postings. Each card shows their name, photo, skills, match score, and current status in your pipeline.',
    position: 'bottom',
  },
  {
    id: 'candidates-filters',
    targetSelector: '[data-onboarding="candidates-filters"]',
    title: 'Filter by Status',
    body: 'Quickly filter candidates by pipeline stage — Pending, Screening, Interviewed, Accepted, or Rejected.',
    position: 'bottom',
  },
]
