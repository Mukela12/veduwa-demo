'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { OnboardingState, OnboardingStep, StepContext } from './types'
import { stepRegistry } from './registry'

const STORAGE_KEY = 'veduwa-onboarding'

interface OnboardingContextType {
  state: OnboardingState
  activePageKey: string | null
  activeStepIndex: number
  filteredSteps: OnboardingStep[]
  isActive: boolean
  startPage: (pageKey: string, ctx: StepContext) => void
  advanceStep: () => void
  skipPage: () => void
  completePageTutorial: () => void
  resetTutorial: () => void
  optIn: (value: boolean) => void
  showOptIn: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

function loadState(): OnboardingState {
  if (typeof window === 'undefined') return { optedIn: null, completedPages: {}, tutorialEnabled: true }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { optedIn: null, completedPages: {}, tutorialEnabled: true }
}

function saveState(state: OnboardingState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(loadState)
  const [activePageKey, setActivePageKey] = useState<string | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [filteredSteps, setFilteredSteps] = useState<OnboardingStep[]>([])
  const [showOptIn, setShowOptIn] = useState(false)
  const [pendingStart, setPendingStart] = useState<{ pageKey: string; ctx: StepContext } | null>(null)

  useEffect(() => {
    // Show opt-in prompt for new users after a short delay
    if (state.optedIn === null) {
      const timer = setTimeout(() => setShowOptIn(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [state.optedIn])

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      saveState(next)
      return next
    })
  }, [])

  const beginTutorial = useCallback((pageKey: string, ctx: StepContext) => {
    const steps = stepRegistry[pageKey]
    if (!steps) return

    const filtered = steps.filter(s => !s.condition || s.condition(ctx))
    if (filtered.length === 0) return

    setFilteredSteps(filtered)
    setActivePageKey(pageKey)
    setActiveStepIndex(0)
  }, [])

  const optIn = useCallback((value: boolean) => {
    updateState({ optedIn: value })
    setShowOptIn(false)
    // If user opted in and there's a pending page, start it immediately
    if (value && pendingStart) {
      setTimeout(() => {
        beginTutorial(pendingStart.pageKey, pendingStart.ctx)
        setPendingStart(null)
      }, 600)
    }
  }, [updateState, pendingStart, beginTutorial])

  const startPage = useCallback((pageKey: string, ctx: StepContext) => {
    // If opt-in hasn't been answered yet, queue this for after opt-in
    if (state.optedIn === null) {
      setPendingStart({ pageKey, ctx })
      return
    }
    if (!state.optedIn || !state.tutorialEnabled) return
    if (state.completedPages[pageKey]) return
    if (activePageKey) return // another tutorial is running

    beginTutorial(pageKey, ctx)
  }, [state, activePageKey, beginTutorial])

  const advanceStep = useCallback(() => {
    if (activeStepIndex < filteredSteps.length - 1) {
      setActiveStepIndex(i => i + 1)
    } else {
      // Last step - complete
      completePageTutorial()
    }
  }, [activeStepIndex, filteredSteps.length])

  const completePageTutorial = useCallback(() => {
    if (!activePageKey) return
    updateState({
      completedPages: { ...state.completedPages, [activePageKey]: true },
    })
    setActivePageKey(null)
    setActiveStepIndex(0)
    setFilteredSteps([])
  }, [activePageKey, state.completedPages, updateState])

  const skipPage = useCallback(() => {
    if (!activePageKey) return
    updateState({
      completedPages: { ...state.completedPages, [activePageKey]: true },
    })
    setActivePageKey(null)
    setActiveStepIndex(0)
    setFilteredSteps([])
  }, [activePageKey, state.completedPages, updateState])

  const resetTutorial = useCallback(() => {
    updateState({
      optedIn: true,
      completedPages: {},
      tutorialEnabled: true,
    })
    setActivePageKey(null)
    setActiveStepIndex(0)
    setFilteredSteps([])
  }, [updateState])

  const isActive = activePageKey !== null && filteredSteps.length > 0

  return (
    <OnboardingContext.Provider value={{
      state,
      activePageKey,
      activeStepIndex,
      filteredSteps,
      isActive,
      startPage,
      advanceStep,
      skipPage,
      completePageTutorial,
      resetTutorial,
      optIn,
      showOptIn,
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
