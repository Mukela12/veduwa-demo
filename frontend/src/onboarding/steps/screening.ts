import type { OnboardingStep } from '../types'

export const screeningSteps: OnboardingStep[] = [
  {
    id: 'screening-chat',
    targetSelector: '[data-onboarding="screening-chat"]',
    title: 'AI Screening Chat',
    body: 'Claude AI conducts structured technical interviews in real-time. You can observe the conversation or inject your own questions at any point.',
    position: 'right',
  },
  {
    id: 'screening-candidate',
    targetSelector: '[data-onboarding="screening-candidate"]',
    title: 'Candidate Profile',
    body: 'See the candidate\'s match score, skills, experience, and screening timeline at a glance while the interview progresses.',
    position: 'left',
  },
  {
    id: 'screening-summary',
    targetSelector: '[data-onboarding="screening-summary"]',
    title: 'Generate Summary',
    body: 'When the screening is done, click "Generate Summary" to get a plain-English assessment with a hire/pass recommendation from Claude.',
    position: 'bottom',
  },
]
