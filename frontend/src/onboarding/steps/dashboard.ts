import type { OnboardingStep } from '../types'

export const dashboardSteps: OnboardingStep[] = [
  {
    id: 'dashboard-welcome',
    targetSelector: '[data-onboarding="dashboard-header"]',
    title: 'Welcome to Veduwa',
    body: "This is your hiring command center. You'll see live stats, your hiring pipeline, and recent activity — all in one view.",
    position: 'bottom',
  },
  {
    id: 'dashboard-stats',
    targetSelector: '[data-onboarding="dashboard-stats"]',
    title: 'Live Stats',
    body: (ctx) =>
      ctx.hasJobs
        ? `You have ${ctx.jobCount} active job${ctx.jobCount === 1 ? '' : 's'}. These cards update in real-time as candidates apply and AI processes matches.`
        : 'These cards will populate once you post your first job. They show active jobs, total candidates, average match scores, and pending screenings.',
    position: 'bottom',
  },
  {
    id: 'dashboard-pipeline',
    targetSelector: '[data-onboarding="dashboard-pipeline"]',
    title: 'Candidate Pipeline',
    body: 'Track candidates across every stage — from application to offer. This chart gives you a bird\'s-eye view of your hiring funnel.',
    position: 'bottom',
  },
  {
    id: 'dashboard-actions',
    targetSelector: '[data-onboarding="dashboard-actions"]',
    title: 'Quick Actions',
    body: 'Jump straight to posting a job, browsing candidates, or starting an AI screening session. These shortcuts save you time.',
    position: 'left',
  },
]
