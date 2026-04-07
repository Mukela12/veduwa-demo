'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Clock, DollarSign, MapPin, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { fetchJob } from '@/lib/api'
import { mockJobs } from '@/lib/mock-data'
import type { Job } from '@/lib/mock-data'
import MatchScoreRing from '@/components/ui/match-score-ring'
import SkillTag from '@/components/ui/skill-tag'
import LordIcon from '@/components/ui/lord-icon'

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const fallbackJob = mockJobs.find((job) => job.id === params.id) || mockJobs[0]
  const [job, setJob] = useState<Job>(fallbackJob)
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  useEffect(() => {
    let active = true
    fetchJob(params.id)
      .then((data) => {
        if (!active) return
        setJob(data)
        setSource('api')
      })
      .catch(() => {
        if (!active) return
        setJob(fallbackJob)
        setSource('mock')
      })
    return () => {
      active = false
    }
  }, [params.id, fallbackJob])

  const salaryRange = job.salaryMin && job.salaryMax
    ? `$${(job.salaryMin / 1000).toFixed(0)}K - $${(job.salaryMax / 1000).toFixed(0)}K`
    : 'Salary not listed'
  const jobTypeLabel = { full_time: 'Full-time', contract: 'Contract', remote: 'Remote' }[job.jobType]

  return (
    <div className="max-w-[900px] space-y-6">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to jobs
      </Link>

      <div className="clarity-card p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary-light text-primary flex items-center justify-center text-[16px] font-bold font-mono">
              {job.companyLogo}
            </div>
            <div>
              <h1 className="text-[24px] font-heading font-bold tracking-tight text-foreground">{job.title}</h1>
              <p className="text-[14px] text-secondary mt-1">{job.company}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{jobTypeLabel}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{salaryRange}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.candidateCount} candidates</span>
              </div>
              {source === 'mock' && (
                <p className="text-[11px] text-muted-foreground mt-3">Showing demo data until the backend returns this job.</p>
              )}
            </div>
          </div>
          <MatchScoreRing score={job.topMatch} size={72} strokeWidth={5} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 clarity-card p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LordIcon name="system-regular-69-document-scan-hover-scan" size={18} trigger="hover" />
              <h2 className="text-[15px] font-semibold text-foreground">Role Overview</h2>
            </div>
            <p className="text-[13px] text-secondary leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-foreground mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <SkillTag key={skill} skill={skill} variant="primary" />
              ))}
            </div>
          </div>
        </div>

        <div className="clarity-card p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-foreground">Actions</h2>
          <Link href="/candidates" className="btn btn--primary w-full gap-2">
            <Users className="w-4 h-4" />
            View Matches
          </Link>
          <Link href="/screening" className="btn btn--secondary w-full gap-2">
            <LordIcon name="system-regular-186-chat-empty-hover-chat" size={16} trigger="hover" />
            Start Screening
          </Link>
          <div className="divider-fade" />
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="badge badge--success capitalize">{job.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seniority</span>
              <span className="text-foreground capitalize">{job.seniority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posted</span>
              <span className="text-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
