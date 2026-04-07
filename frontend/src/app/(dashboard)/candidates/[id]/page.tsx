'use client'

import Image from 'next/image'
import { mockCandidates, mockJobs } from '@/lib/mock-data'
import MatchScoreRing from '@/components/ui/match-score-ring'
import LordIcon from '@/components/ui/lord-icon'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { MapPin, Briefcase, Mail, FileText, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { fetchCandidate, fetchJobs } from '@/lib/api'
import type { Candidate, Job } from '@/lib/mock-data'

const tabs = ['Overview', 'Skills & Experience', 'Screening History', 'Documents']

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState(0)
  const fallbackCandidate = mockCandidates.find((c) => c.id === params.id) || mockCandidates[0]
  const [candidate, setCandidate] = useState<Candidate>(fallbackCandidate)
  const [jobs, setJobs] = useState<Job[]>(mockJobs)

  useEffect(() => {
    let active = true
    Promise.all([
      fetchCandidate(params.id),
      fetchJobs(),
    ])
      .then(([nextCandidate, nextJobs]) => {
        if (!active) return
        setCandidate(nextCandidate)
        setJobs(nextJobs.length ? nextJobs : mockJobs)
      })
      .catch(() => {
        if (!active) return
        setCandidate(fallbackCandidate)
        setJobs(mockJobs)
      })
    return () => {
      active = false
    }
  }, [params.id, fallbackCandidate])

  return (
    <div className="max-w-[900px] space-y-6">
      {/* Back */}
      <Link href="/candidates" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to candidates
      </Link>

      {/* Profile header */}
      <div className="clarity-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {candidate.avatarUrl ? (
              <Image src={candidate.avatarUrl} alt={candidate.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center text-[24px] font-bold">
                {candidate.avatar}
              </div>
            )}
            <div>
              <h1 className="text-[22px] font-heading font-bold tracking-tight text-foreground">
                {candidate.name}
              </h1>
              <p className="text-[14px] text-secondary">{candidate.title}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{candidate.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{candidate.experienceYears}y exp</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{candidate.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MatchScoreRing score={candidate.matchScore} size={72} strokeWidth={5} />
            <div className="space-y-2">
              <Link href="/screening" className="btn btn--primary text-[12px] gap-1.5 w-full">
                <MessageSquare className="w-3.5 h-3.5" />
                Start Screening
              </Link>
              <button className="btn btn--secondary text-[12px] gap-1.5 w-full">
                <FileText className="w-3.5 h-3.5" />
                View Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn('tab-item', activeTab === i && 'tab-item--active')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div className="space-y-4 page-enter">
          {/* AI Summary */}
          <div className="clarity-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <LordIcon name="system-regular-121-bulb-hover-bulb" size={18} trigger="hover" />
              <h3 className="text-[14px] font-semibold text-foreground">AI Summary</h3>
            </div>
            <p className="text-[13px] text-secondary leading-relaxed">{candidate.summary}</p>
          </div>

          {/* Match scores across jobs */}
          <div className="clarity-card p-5">
            <h3 className="text-[14px] font-semibold text-foreground mb-4">Match Scores Across Jobs</h3>
            <div className="space-y-3">
              {jobs.slice(0, 3).map((job) => {
                const score = Math.floor(Math.random() * 30) + 65
                return (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold font-mono">
                        {job.companyLogo}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{job.title}</p>
                        <p className="text-[11px] text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <MatchScoreRing score={score} size={40} strokeWidth={3} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Key highlights */}
          <div className="clarity-card p-5">
            <h3 className="text-[14px] font-semibold text-foreground mb-3">Key Highlights</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-success-bg">
                <p className="text-[11px] font-semibold text-success mb-1">Strong Fit</p>
                <p className="text-[12px] text-foreground">Core tech stack matches 5/5 required skills</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-light">
                <p className="text-[11px] font-semibold text-primary mb-1">Experience</p>
                <p className="text-[12px] text-foreground">{candidate.experienceYears} years in relevant roles</p>
              </div>
              <div className="p-3 rounded-lg bg-warning-bg">
                <p className="text-[11px] font-semibold text-warning mb-1">Note</p>
                <p className="text-[12px] text-foreground">No cloud certification verified yet</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="clarity-card p-5 space-y-5 page-enter">
          <h3 className="text-[14px] font-semibold text-foreground">Skills & Proficiency</h3>
          <div className="space-y-3">
            {candidate.skills.map((skill) => {
              const proficiency = Math.floor(Math.random() * 40) + 60
              return (
                <div key={skill} className="flex items-center gap-4">
                  <span className="text-[13px] text-foreground w-[120px]">{skill}</span>
                  <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${proficiency}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground w-[32px] text-right">{proficiency}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="clarity-card p-5 space-y-4 page-enter">
          <h3 className="text-[14px] font-semibold text-foreground">Screening History</h3>
          <div className="space-y-4 pl-4 border-l-2 border-border">
            <div className="relative">
              <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-success border-2 border-surface" />
              <div className="clarity-card p-4">
                <p className="text-[13px] font-medium text-foreground">AI Screening — Senior Full-Stack Engineer</p>
                <p className="text-[11px] text-muted-foreground mt-1">TechFlow AI &middot; Score: 94/100 &middot; 2 hours ago</p>
                <p className="text-[12px] text-secondary mt-2">Strong technical skills demonstrated. Recommended for final interview.</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-muted border-2 border-surface" />
              <div className="clarity-card p-4 opacity-60">
                <p className="text-[13px] font-medium text-foreground">AI Screening — Lead Backend Engineer</p>
                <p className="text-[11px] text-muted-foreground mt-1">DataMind Labs &middot; Score: 78/100 &middot; 5 days ago</p>
                <p className="text-[12px] text-secondary mt-2">Good fit but lacking specific NLP experience required for this role.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="clarity-card p-5 space-y-4 page-enter">
          <h3 className="text-[14px] font-semibold text-foreground">Documents</h3>
          <div className="space-y-2">
            <div className="quick-action">
              <LordIcon name="system-regular-49-upload-file-hover-upload-1" size={20} trigger="hover" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">Resume_Sarah_Chen_2026.pdf</p>
                <p className="text-[11px] text-muted-foreground">Uploaded 3 days ago &middot; 245 KB</p>
              </div>
              <span className="badge badge--success">Parsed</span>
            </div>
            <div className="quick-action">
              <LordIcon name="system-regular-69-document-scan-hover-scan" size={20} trigger="hover" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">AI-Parsed Resume Data</p>
                <p className="text-[11px] text-muted-foreground">Auto-generated from resume &middot; JSON</p>
              </div>
              <span className="badge badge--accent">AI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
