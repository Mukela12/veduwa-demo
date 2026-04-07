'use client'

import { useEffect } from 'react'
import { useOnboarding } from './context'
import type { StepContext } from './types'

export function usePageOnboarding(pageKey: string, ctx: StepContext) {
  const { startPage } = useOnboarding()

  useEffect(() => {
    // Delay to allow the DOM to render before measuring targets
    const timer = setTimeout(() => {
      startPage(pageKey, ctx)
    }, 800)

    return () => clearTimeout(timer)
  }, [pageKey]) // only run once when page mounts
}
