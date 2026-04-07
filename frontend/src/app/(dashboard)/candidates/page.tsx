'use client'

import { useEffect, useState } from 'react'
import { mockCandidates } from '@/lib/mock-data'
import CandidateCard from '@/components/candidates/candidate-card'
import LordIcon from '@/components/ui/lord-icon'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { fetchCandidates } from '@/lib/api'
import type { Candidate } from '@/lib/mock-data'

const statusFilters = ['All', 'Pending', 'Screening', 'Interviewed', 'Accepted', 'Rejected']

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  useEffect(() => {
    let active = true
    fetchCandidates()
      .then((data) => {
        if (!active) return
        setCandidates(data)
        setSource(data.length ? 'api' : 'mock')
      })
      .catch(() => {
        if (!active) return
        setCandidates(mockCandidates)
        setSource('mock')
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = candidates.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'All' && c.status !== statusFilter.toLowerCase()) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-[22px] font-heading font-bold tracking-tight text-foreground">
          Candidates
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          {filtered.length} candidates matched across all jobs
          {source === 'mock' && <span className="ml-2 text-[11px]">(demo data)</span>}
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
        <div className="tab-group">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn('tab-item', statusFilter === status && 'tab-item--active')}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <LordIcon name="system-regular-96-groups-hover-groups" size={40} trigger="loop" className="mx-auto mb-3 opacity-50" />
            <p className="text-[14px] text-muted-foreground">No candidates match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
