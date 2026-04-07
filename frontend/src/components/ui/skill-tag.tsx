'use client'

import { cn } from '@/lib/utils'

interface SkillTagProps {
  skill: string
  variant?: 'default' | 'primary' | 'match'
  size?: 'sm' | 'md'
  className?: string
}

export default function SkillTag({ skill, variant = 'default', size = 'sm', className }: SkillTagProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-md transition-colors',
      size === 'sm' && 'px-2 py-0.5 text-[11px]',
      size === 'md' && 'px-2.5 py-1 text-[12px]',
      variant === 'default' && 'bg-surface-hover text-secondary border border-border',
      variant === 'primary' && 'bg-primary-light text-primary',
      variant === 'match' && 'bg-success-bg text-success',
      className
    )}>
      {skill}
    </span>
  )
}
