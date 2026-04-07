import type { OnboardingStep } from './types'
import { dashboardSteps } from './steps/dashboard'
import { jobsSteps } from './steps/jobs'
import { screeningSteps } from './steps/screening'
import { candidatesSteps } from './steps/candidates'
import { postJobSteps } from './steps/post-job'

export const stepRegistry: Record<string, OnboardingStep[]> = {
  dashboard: dashboardSteps,
  jobs: jobsSteps,
  screening: screeningSteps,
  candidates: candidatesSteps,
  'post-job': postJobSteps,
}

export const pageOrder = ['dashboard', 'jobs', 'post-job', 'candidates', 'screening']
