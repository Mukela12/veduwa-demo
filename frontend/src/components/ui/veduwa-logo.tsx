'use client'

import { cn } from '@/lib/utils'

interface VeduwaLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function VeduwaLogo({ size = 'md', showText = true, className }: VeduwaLogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-[14px]', inner: 'w-3 h-3' },
    md: { icon: 'w-8 h-8', text: 'text-[17px]', inner: 'w-4 h-4' },
    lg: { icon: 'w-12 h-12', text: 'text-[24px]', inner: 'w-6 h-6' },
  }

  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn(s.icon, 'rounded-lg bg-primary flex items-center justify-center relative overflow-hidden')}>
        {/* Custom V lettermark with circuit pattern */}
        <svg viewBox="0 0 32 32" fill="none" className={s.inner}>
          {/* V shape */}
          <path
            d="M6 8L16 26L26 8"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* AI nodes */}
          <circle cx="6" cy="8" r="2" fill="white" opacity="0.8" />
          <circle cx="26" cy="8" r="2" fill="white" opacity="0.8" />
          <circle cx="16" cy="26" r="2.5" fill="white" />
          {/* Connection dots */}
          <circle cx="11" cy="17" r="1.2" fill="white" opacity="0.5" />
          <circle cx="21" cy="17" r="1.2" fill="white" opacity="0.5" />
        </svg>
      </div>
      {showText && (
        <span className={cn(s.text, 'font-heading font-semibold tracking-tight text-foreground')}>
          Veduwa
        </span>
      )}
    </div>
  )
}
