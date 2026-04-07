import type { OnboardingStep } from '../types'

export const jobsSteps: OnboardingStep[] = [
  {
    id: 'jobs-header',
    targetSelector: '[data-onboarding="jobs-header"]',
    title: 'Job Board',
    body: 'Browse all active positions. Each job card shows the title, company, skills, salary range, and an AI-computed match score.',
    position: 'bottom',
  },
  {
    id: 'jobs-search',
    targetSelector: '[data-onboarding="jobs-search"]',
    title: 'Search & Filter',
    body: 'Search by title, company, or skills. Use the sidebar filters to narrow by job type, seniority level, or specific technologies.',
    position: 'bottom',
  },
  {
    id: 'jobs-card',
    targetSelector: '[data-onboarding="jobs-card"]',
    title: 'Job Cards',
    body: 'Each card displays the match score ring — green for 80%+, amber for 60-79%, red below 60%. Click any card to see the full listing.',
    position: 'bottom',
    condition: (ctx) => ctx.hasJobs,
  },
]
