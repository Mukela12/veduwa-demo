'use client'

import { mockStats, mockJobs, mockCandidates } from '@/lib/mock-data'
import { useEffect, useState } from 'react'
import StatCard from '@/components/ui/stat-card'
import CandidateCard from '@/components/candidates/candidate-card'
import MatchScoreRing from '@/components/ui/match-score-ring'
import LordIcon from '@/components/ui/lord-icon'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { fetchCandidates, fetchDashboardStats, fetchJobs, fetchPipeline, type PipelineStage } from '@/lib/api'
import type { Candidate, DashboardStats, Job } from '@/lib/mock-data'
import { usePageOnboarding } from '@/onboarding/use-page-onboarding'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const fallbackPipelineData = [
  { stage: 'Applied', count: 156 },
  { stage: 'Matched', count: 89 },
  { stage: 'Screening', count: 34 },
  { stage: 'Interviewed', count: 18 },
  { stage: 'Offered', count: 7 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>(fallbackPipelineData)
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  useEffect(() => {
    let active = true
    Promise.all([
      fetchDashboardStats(),
      fetchJobs(),
      fetchCandidates(),
      fetchPipeline(),
    ])
      .then(([nextStats, nextJobs, nextCandidates, nextPipeline]) => {
        if (!active) return
        setStats(nextStats)
        setJobs(nextJobs)
        setCandidates(nextCandidates)
        setPipelineData(nextPipeline.length ? nextPipeline : fallbackPipelineData)
        setSource('api')
      })
      .catch(() => {
        if (!active) return
        setStats(mockStats)
        setJobs(mockJobs)
        setCandidates(mockCandidates)
        setPipelineData(fallbackPipelineData)
        setSource('mock')
      })
    return () => {
      active = false
    }
  }, [])

  usePageOnboarding('dashboard', {
    hasJobs: jobs.length > 0,
    jobCount: jobs.length,
    hasCandidates: candidates.length > 0,
    candidateCount: candidates.length,
    userRole: 'employer',
  })

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Welcome */}
      <div data-onboarding="dashboard-header">
        <h1 className="text-[22px] font-heading font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your job postings today.
          {source === 'mock' && <span className="ml-2 text-[11px]">(demo data)</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4" data-onboarding="dashboard-stats">
        <StatCard
          label="Active Jobs"
          value={stats.activeJobs}
          delta={stats.activeJobsDelta}
          icon="system-regular-178-work-hover-work"
        />
        <StatCard
          label="Total Candidates"
          value={stats.totalCandidates}
          delta={stats.totalCandidatesDelta}
          icon="system-regular-96-groups-hover-groups"
        />
        <StatCard
          label="Avg Match Score"
          value={`${stats.avgMatchScore}%`}
          delta={stats.avgMatchScoreDelta}
          icon="system-regular-43-pie-chart-diagram-hover-pie-chart"
        />
        <StatCard
          label="Pending Screenings"
          value={stats.pendingScreenings}
          delta={stats.pendingScreeningsDelta}
          icon="system-regular-186-chat-empty-hover-chat"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Pipeline Chart */}
        <div className="col-span-2 clarity-card p-5" data-onboarding="dashboard-pipeline">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">Candidate Pipeline</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Candidates by stage across all jobs</p>
            </div>
            <LordIcon name="system-regular-43-pie-chart-diagram-hover-pie-chart" size={20} trigger="hover" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="stage"
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-md)',
                }}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="clarity-card p-5" data-onboarding="dashboard-actions">
          <h2 className="text-[15px] font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/dashboard/post" className="quick-action">
              <LordIcon name="system-regular-314-plus-hover-pinch" size={20} trigger="hover" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">Post a Job</p>
                <p className="text-[11px] text-muted-foreground">Create a new listing</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link href="/candidates" className="quick-action">
              <LordIcon name="system-regular-96-groups-hover-groups" size={20} trigger="hover" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">Browse Candidates</p>
                <p className="text-[11px] text-muted-foreground">View matched profiles</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link href="/screening" className="quick-action">
              <LordIcon name="system-regular-186-chat-empty-hover-chat" size={20} trigger="hover" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">AI Screening</p>
                <p className="text-[11px] text-muted-foreground">Start or review</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Jobs Table */}
      <div className="clarity-card">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-[15px] font-semibold text-foreground">Active Jobs</h2>
          <Link href="/jobs" className="text-[12px] text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Job Title
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidates
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Top Match
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Posted
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 5).map((job) => (
                <tr key={job.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center text-[11px] font-bold font-mono">
                        {job.companyLogo}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{job.title}</p>
                        <p className="text-[11px] text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-mono text-foreground">{job.candidateCount}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <MatchScoreRing score={job.topMatch} size={32} strokeWidth={3} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge badge--success">Active</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-[12px] text-muted-foreground font-mono">{job.createdAt}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Candidates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Recent Top Candidates</h2>
          <Link href="/candidates" className="text-[12px] text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {candidates.slice(0, 5).map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} compact />
          ))}
        </div>
      </div>
    </div>
  )
}
