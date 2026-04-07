'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { MapPin, Briefcase, Mail } from 'lucide-react'
import MatchScoreRing from '@/components/ui/match-score-ring'
import SkillTag from '@/components/ui/skill-tag'
import type { Candidate } from '@/lib/mock-data'

interface CandidateCardProps {
  candidate: Candidate
  className?: string
  compact?: boolean
}

export default function CandidateCard({ candidate, className, compact = false }: CandidateCardProps) {
  const statusLabel: Record<string, { text: string; class: string }> = {
    pending: { text: 'Pending', class: 'badge--neutral' },
    screening: { text: 'Screening', class: 'badge--accent' },
    interviewed: { text: 'Interviewed', class: 'badge--warning' },
    accepted: { text: 'Accepted', class: 'badge--success' },
    rejected: { text: 'Rejected', class: 'badge--error' },
  }

  const status = statusLabel[candidate.status]

  if (compact) {
    return (
      <Link href={`/candidates/${candidate.id}`}>
        <div className={cn('clarity-card clarity-card--interactive p-4 min-w-[220px]', className)}>
          <div className="flex items-center gap-3">
            {candidate.avatarUrl ? (
              <Image src={candidate.avatarUrl} alt={candidate.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-[12px] font-bold">
                {candidate.avatar}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{candidate.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{candidate.title}</p>
            </div>
            <MatchScoreRing score={candidate.matchScore} size={36} strokeWidth={3} />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/candidates/${candidate.id}`}>
      <div className={cn('clarity-card clarity-card--interactive p-5 space-y-3', className)}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {candidate.avatarUrl ? (
              <Image src={candidate.avatarUrl} alt={candidate.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center text-[14px] font-bold">
                {candidate.avatar}
              </div>
            )}
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">{candidate.name}</h3>
              <p className="text-[12px] text-secondary">{candidate.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('badge', status.class)}>{status.text}</span>
            <MatchScoreRing score={candidate.matchScore} size={44} strokeWidth={3} />
          </div>
        </div>

        {/* Summary */}
        <p className="text-[12px] text-secondary leading-relaxed line-clamp-2">
          {candidate.summary}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 5).map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {candidate.skills.length > 5 && (
            <span className="text-[11px] text-muted-foreground self-center ml-1">
              +{candidate.skills.length - 5}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 pt-2 border-t border-border text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {candidate.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {candidate.experienceYears}y exp
          </span>
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {candidate.email}
          </span>
        </div>
      </div>
    </Link>
  )
}
