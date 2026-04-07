'use client'

import { useEffect, useState } from 'react'
import { mockJobs, allSkills } from '@/lib/mock-data'
import JobCard from '@/components/jobs/job-card'
import LordIcon from '@/components/ui/lord-icon'
import { cn } from '@/lib/utils'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { fetchJobs } from '@/lib/api'
import type { Job } from '@/lib/mock-data'

const jobTypes = ['All', 'Full-time', 'Contract', 'Remote']
const seniorityLevels = ['All', 'Junior', 'Mid', 'Senior', 'Lead']

export default function JobBoardPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedSeniority, setSelectedSeniority] = useState('All')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  useEffect(() => {
    let active = true
    fetchJobs()
      .then((data) => {
        if (!active) return
        setJobs(data)
        setSource(data.length ? 'api' : 'mock')
      })
      .catch(() => {
        if (!active) return
        setJobs(mockJobs)
        setSource('mock')
      })
    return () => {
      active = false
    }
  }, [])

  const filteredJobs = jobs.filter((job) => {
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) && !job.company.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedType !== 'All' && job.jobType !== selectedType.toLowerCase().replace('-', '_')) return false
    if (selectedSeniority !== 'All' && job.seniority !== selectedSeniority.toLowerCase()) return false
    if (selectedSkills.length > 0 && !selectedSkills.some((s) => job.skills.includes(s))) return false
    return true
  })

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-heading font-bold tracking-tight text-foreground">
            Job Board
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {filteredJobs.length} active positions with AI matching
            {source === 'mock' && <span className="ml-2 text-[11px]">(demo data)</span>}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('btn btn--secondary gap-2', showFilters && 'bg-primary-light text-primary border-primary/20')}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title, company, or skills..."
          className="w-full pl-11 pr-4 py-3 rounded-lg border border-input bg-surface text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors"
        />
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <div className="w-[240px] shrink-0 space-y-5">
            {/* Job Type */}
            <div className="clarity-card p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Job Type
              </h3>
              <div className="space-y-1">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors',
                      selectedType === type
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-secondary hover:bg-surface-hover'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Seniority */}
            <div className="clarity-card p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Seniority
              </h3>
              <div className="space-y-1">
                {seniorityLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedSeniority(level)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded-md text-[13px] transition-colors',
                      selectedSeniority === level
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-secondary hover:bg-surface-hover'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="clarity-card p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.slice(0, 15).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors',
                      selectedSkills.includes(skill)
                        ? 'bg-primary-light text-primary border-primary/20'
                        : 'bg-surface text-secondary border-border hover:border-border-hover'
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="text-[12px] text-error font-medium flex items-center gap-1 hover:underline"
              >
                <X className="w-3 h-3" />
                Clear skill filters
              </button>
            )}
          </div>
        )}

        {/* Job cards grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 content-start">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {filteredJobs.length === 0 && (
            <div className="col-span-2 py-16 text-center">
              <LordIcon name="system-regular-42-search-hover-pinch" size={40} trigger="loop" className="mx-auto mb-3 opacity-50" />
              <p className="text-[14px] text-muted-foreground">No jobs match your filters</p>
              <button
                onClick={() => { setSearch(''); setSelectedType('All'); setSelectedSeniority('All'); setSelectedSkills([]) }}
                className="text-[13px] text-primary font-medium mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
