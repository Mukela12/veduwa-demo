'use client'

import { cn } from '@/lib/utils'
import LordIcon from '@/components/ui/lord-icon'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  delta?: number
  icon: string
  className?: string
}

export default function StatCard({ label, value, delta, icon, className }: StatCardProps) {
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0

  return (
    <div className={cn('clarity-card p-5 flex items-start justify-between', className)}>
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-[28px] font-heading font-bold tracking-tight text-foreground leading-none">
          {value}
        </p>
        {delta !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-[11px] font-medium',
            isPositive && 'text-success',
            isNegative && 'text-error',
            !isPositive && !isNegative && 'text-muted-foreground'
          )}>
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? '+' : ''}{delta} this week</span>
          </div>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
        <LordIcon name={icon} size={22} trigger="hover" className="lordicon-primary" />
      </div>
    </div>
  )
}
