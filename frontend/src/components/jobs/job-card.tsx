'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MapPin, Clock, Users, Briefcase } from 'lucide-react'
import MatchScoreRing from '@/components/ui/match-score-ring'
import SkillTag from '@/components/ui/skill-tag'
import type { Job } from '@/lib/mock-data'
import { formatDistanceToNow } from 'date-fns'

interface JobCardProps {
  job: Job
  className?: string
}

export default function JobCard({ job, className }: JobCardProps) {
  const salaryRange = `$${(job.salaryMin / 1000).toFixed(0)}K - $${(job.salaryMax / 1000).toFixed(0)}K`
  const jobTypeLabel = { full_time: 'Full-time', contract: 'Contract', remote: 'Remote' }[job.jobType]

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className={cn('clarity-card clarity-card--interactive p-5 space-y-4', className)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center text-[13px] font-bold font-mono">
              {job.companyLogo}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-foreground leading-tight">
                {job.title}
              </h3>
              <p className="text-[12px] text-secondary mt-0.5">{job.company}</p>
            </div>
          </div>
          <MatchScoreRing score={job.topMatch} size={44} strokeWidth={3} />
        </div>

        {/* Description */}
        <p className="text-[12px] text-secondary leading-relaxed line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {job.skills.length > 4 && (
            <span className="text-[11px] text-muted-foreground self-center ml-1">
              +{job.skills.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {jobTypeLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              {job.candidateCount}
            </span>
            <span className="font-semibold font-mono text-foreground">
              {salaryRange}
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </div>
      </div>
    </Link>
  )
}
