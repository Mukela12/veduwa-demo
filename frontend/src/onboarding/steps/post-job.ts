import type { OnboardingStep } from '../types'

export const postJobSteps: OnboardingStep[] = [
  {
    id: 'post-job-form',
    targetSelector: '[data-onboarding="post-job-header"]',
    title: 'Post a Job',
    body: 'Create a new listing in 4 easy steps. AI will automatically parse your description to extract skills and requirements.',
    position: 'bottom',
  },
  {
    id: 'post-job-steps',
    targetSelector: '[data-onboarding="post-job-stepper"]',
    title: 'Step-by-Step Wizard',
    body: 'Fill in the basics, add requirements, configure AI screening preferences, then review and publish. AI starts matching candidates immediately.',
    position: 'bottom',
  },
]
