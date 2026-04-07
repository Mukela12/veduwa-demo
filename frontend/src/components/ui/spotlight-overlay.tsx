'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOnboarding } from '@/onboarding/context'
import type { StepContext } from '@/onboarding/types'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 8

export default function SpotlightOverlay() {
  const {
    isActive,
    filteredSteps,
    activeStepIndex,
    advanceStep,
    skipPage,
  } = useOnboarding()

  const [targetRect, setTargetRect] = useState<Rect | null>(null)
  const [tooltipSide, setTooltipSide] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = isActive ? filteredSteps[activeStepIndex] : null
  const isLast = activeStepIndex === filteredSteps.length - 1

  const measure = useCallback(() => {
    if (!step) { setTargetRect(null); return }
    const el = document.querySelector(step.targetSelector) as HTMLElement | null
    if (!el) { setTargetRect(null); return }

    // Scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height })

      // Determine tooltip position
      const preferred = step.position || 'bottom'
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (preferred === 'bottom' && r.bottom + PAD + 200 < vh) setTooltipSide('bottom')
      else if (preferred === 'top' && r.top - PAD - 200 > 0) setTooltipSide('top')
      else if (preferred === 'right' && r.right + PAD + 340 < vw) setTooltipSide('right')
      else if (preferred === 'left' && r.left - PAD - 340 > 0) setTooltipSide('left')
      else if (r.bottom + PAD + 200 < vh) setTooltipSide('bottom')
      else setTooltipSide('top')
    })
  }, [step])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  if (!isActive || !step || !targetRect) return null

  // Calculate cutout dimensions
  const cutTop = targetRect.top - PAD
  const cutLeft = targetRect.left - PAD
  const cutWidth = targetRect.width + PAD * 2
  const cutHeight = targetRect.height + PAD * 2
  const cutRight = cutLeft + cutWidth
  const cutBottom = cutTop + cutHeight

  // Tooltip position
  let tooltipStyle: React.CSSProperties = {}
  const tooltipWidth = 320
  switch (tooltipSide) {
    case 'bottom':
      tooltipStyle = {
        top: cutBottom + 12,
        left: Math.max(12, Math.min(cutLeft, window.innerWidth - tooltipWidth - 12)),
      }
      break
    case 'top':
      tooltipStyle = {
        bottom: window.innerHeight - cutTop + 12,
        left: Math.max(12, Math.min(cutLeft, window.innerWidth - tooltipWidth - 12)),
      }
      break
    case 'right':
      tooltipStyle = {
        top: cutTop,
        left: cutRight + 12,
      }
      break
    case 'left':
      tooltipStyle = {
        top: cutTop,
        right: window.innerWidth - cutLeft + 12,
      }
      break
  }

  const body = typeof step.body === 'function'
    ? step.body({} as StepContext)
    : step.body

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>
      {/* Dark overlay - 4 rectangles around the cutout */}
      <div onClick={skipPage} style={{ position: 'fixed', top: 0, left: 0, right: 0, height: Math.max(0, cutTop), background: 'rgba(0,0,0,0.55)', pointerEvents: 'auto', cursor: 'pointer' }} />
      <div onClick={skipPage} style={{ position: 'fixed', top: cutBottom, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', pointerEvents: 'auto', cursor: 'pointer' }} />
      <div onClick={skipPage} style={{ position: 'fixed', top: cutTop, left: 0, width: Math.max(0, cutLeft), height: cutHeight, background: 'rgba(0,0,0,0.55)', pointerEvents: 'auto', cursor: 'pointer' }} />
      <div onClick={skipPage} style={{ position: 'fixed', top: cutTop, left: cutRight, right: 0, height: cutHeight, background: 'rgba(0,0,0,0.55)', pointerEvents: 'auto', cursor: 'pointer' }} />

      {/* Cutout border ring */}
      <div style={{
        position: 'fixed',
        top: cutTop,
        left: cutLeft,
        width: cutWidth,
        height: cutHeight,
        border: '2px solid var(--primary, #3B5BDB)',
        borderRadius: 'var(--radius-lg, 10px)',
        pointerEvents: 'none',
        boxShadow: '0 0 0 4px rgba(59, 91, 219, 0.15)',
      }} />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          width: tooltipWidth,
          pointerEvents: 'auto',
          ...tooltipStyle,
        }}
      >
        <div style={{
          background: 'var(--card, #fff)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: 'var(--radius-lg, 10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          padding: '16px 18px',
        }}>
          {/* Step counter */}
          <p style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: 'var(--primary, #3B5BDB)',
            marginBottom: '8px',
            fontFamily: 'var(--font-mono)',
          }}>
            Step {activeStepIndex + 1} of {filteredSteps.length}
          </p>

          {/* Title */}
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--foreground, #1a1a2e)',
            marginBottom: '6px',
            fontFamily: 'var(--font-heading)',
          }}>
            {step.title}
          </h4>

          {/* Body */}
          <p style={{
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--secondary, #6b6b66)',
            marginBottom: '14px',
          }}>
            {body}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={skipPage}
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--muted-foreground, #9ca3af)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              Skip tour
            </button>
            <button
              onClick={advanceStep}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary-foreground, #fff)',
                background: 'var(--primary, #3B5BDB)',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '6px 16px',
                cursor: 'pointer',
              }}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
