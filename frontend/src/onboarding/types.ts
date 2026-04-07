export interface OnboardingStep {
  id: string
  targetSelector: string
  title: string
  body: string | ((ctx: StepContext) => string)
  position?: 'top' | 'bottom' | 'left' | 'right'
  condition?: (ctx: StepContext) => boolean
}

export interface StepContext {
  hasJobs: boolean
  jobCount: number
  hasCandidates: boolean
  candidateCount: number
  userRole: 'employer' | 'candidate'
}

export interface OnboardingState {
  optedIn: boolean | null
  completedPages: Record<string, boolean>
  tutorialEnabled: boolean
}
