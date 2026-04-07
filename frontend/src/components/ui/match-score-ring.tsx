'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface MatchScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  animate?: boolean
}

export default function MatchScoreRing({
  score,
  size = 48,
  strokeWidth = 4,
  className,
  showLabel = true,
  animate = true,
}: MatchScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(animate ? 0 : score)

  useEffect(() => {
    if (!animate) return
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score, animate])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: 'var(--color-success)', text: 'text-success' }
    if (s >= 60) return { stroke: 'var(--color-warning)', text: 'text-warning' }
    return { stroke: 'var(--color-error)', text: 'text-error' }
  }

  const color = getColor(score)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="match-ring"
          style={{ transition: animate ? 'stroke-dashoffset 1s ease-out' : 'none' }}
        />
      </svg>
      {showLabel && (
        <span className={cn(
          'absolute text-[11px] font-semibold font-mono',
          color.text
        )}>
          {score}
        </span>
      )}
    </div>
  )
}
