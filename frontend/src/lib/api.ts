import { createClient } from '@/lib/supabase'
import type { Candidate, DashboardStats, Job, Screening } from '@/lib/mock-data'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Page<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

interface BackendJob {
  id: string
  title: string
  company: string
  description: string
  location: string | null
  job_type: Job['jobType'] | null
  salary_min: number | null
  salary_max: number | null
  seniority: Job['seniority'] | null
  skills: string[]
  status: Job['status']
  candidate_count: number
  top_match: number | null
  created_at: string
}

interface BackendCandidate {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  title: string | null
  location: string | null
  summary: string | null
  skills: string[]
  experience_years: number | null
  match_score: number | null
  status: Candidate['status'] | null
  created_at: string
}

interface BackendStats {
  activeJobs?: number
  totalCandidates?: number
  avgMatchScore?: number
  pendingScreenings?: number
  active_jobs?: number
  total_candidates?: number
  avg_match_score?: number
  pending_screenings?: number
}

interface BackendScreening {
  id: string
  application_id: string
  messages: Screening['messages']
  summary: string | null
  outcome: 'pass' | 'fail' | 'pending'
  started_at: string
  completed_at: string | null
}

export interface PipelineStage {
  stage: string
  status?: string
  count: number
}

export interface CreateJobPayload {
  title: string
  company: string
  location: string
  jobType: Job['jobType']
  salaryMin: string
  salaryMax: string
  seniority: Job['seniority']
  skills: string[]
  description: string
  screeningQuestions: string[]
  autoMatch: boolean
  matchThreshold: number
}

async function getAccessToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function toJob(job: BackendJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: initials(job.company),
    location: job.location || 'Remote',
    jobType: job.job_type || 'full_time',
    salaryMin: job.salary_min || 0,
    salaryMax: job.salary_max || 0,
    seniority: job.seniority || 'mid',
    skills: job.skills || [],
    description: job.description,
    status: job.status,
    candidateCount: job.candidate_count || 0,
    topMatch: Math.round(job.top_match || 0),
    createdAt: job.created_at,
  }
}

// Explicit name-to-avatar map for seeded candidates (gender-matched)
const AVATAR_MAP: Record<string, string> = {
  'Sarah Chen': 'https://randomuser.me/api/portraits/women/44.jpg',
  'Marcus Johnson': 'https://randomuser.me/api/portraits/men/32.jpg',
  'Elena Rodriguez': 'https://randomuser.me/api/portraits/women/68.jpg',
  'David Kim': 'https://randomuser.me/api/portraits/men/75.jpg',
  'Aisha Patel': 'https://randomuser.me/api/portraits/women/26.jpg',
  'James Wright': 'https://randomuser.me/api/portraits/men/22.jpg',
  'Lisa Nakamura': 'https://randomuser.me/api/portraits/women/90.jpg',
  'Omar Hassan': 'https://randomuser.me/api/portraits/men/46.jpg',
}

// Fallback pools by first-name gender heuristic
const WOMEN_AVATARS = [
  'https://randomuser.me/api/portraits/women/55.jpg',
  'https://randomuser.me/api/portraits/women/33.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/79.jpg',
]
const MEN_AVATARS = [
  'https://randomuser.me/api/portraits/men/67.jpg',
  'https://randomuser.me/api/portraits/men/85.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/53.jpg',
]

function stableAvatarUrl(name: string): string {
  // Check explicit map first
  if (AVATAR_MAP[name]) return AVATAR_MAP[name]

  // For unknown names, pick a stable avatar from the appropriate pool
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  const pool = Math.abs(hash) % 2 === 0 ? WOMEN_AVATARS : MEN_AVATARS
  return pool[Math.abs(hash) % pool.length]
}

export function toCandidate(candidate: BackendCandidate): Candidate {
  const name = candidate.full_name || 'Candidate'
  return {
    id: candidate.id,
    name,
    avatar: initials(name),
    avatarUrl: candidate.avatar_url || stableAvatarUrl(name),
    title: candidate.title || 'Software Engineer',
    location: candidate.location || 'Remote',
    skills: candidate.skills || [],
    experienceYears: candidate.experience_years || 0,
    matchScore: Math.round(candidate.match_score || 0),
    status: candidate.status || 'pending',
    summary: candidate.summary || 'Candidate profile is ready for AI matching.',
    email: candidate.email || '',
  }
}

export async function fetchJobs(): Promise<Job[]> {
  const page = await apiFetch<Page<BackendJob>>('/api/jobs?per_page=100')
  return page.data.map(toJob)
}

export async function fetchJob(id: string): Promise<Job> {
  return toJob(await apiFetch<BackendJob>(`/api/jobs/${id}`))
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const page = await apiFetch<Page<BackendCandidate>>('/api/candidates?per_page=100')
  return page.data.map(toCandidate)
}

export async function fetchCandidate(id: string): Promise<Candidate> {
  return toCandidate(await apiFetch<BackendCandidate>(`/api/candidates/${id}`))
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const stats = await apiFetch<BackendStats>('/api/dashboard/stats')
  return {
    activeJobs: stats.activeJobs ?? stats.active_jobs ?? 0,
    activeJobsDelta: 0,
    totalCandidates: stats.totalCandidates ?? stats.total_candidates ?? 0,
    totalCandidatesDelta: 0,
    avgMatchScore: stats.avgMatchScore ?? stats.avg_match_score ?? 0,
    avgMatchScoreDelta: 0,
    pendingScreenings: stats.pendingScreenings ?? stats.pending_screenings ?? 0,
    pendingScreeningsDelta: 0,
  }
}

export function fetchPipeline(): Promise<PipelineStage[]> {
  return apiFetch<PipelineStage[]>('/api/dashboard/pipeline')
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  return toJob(await apiFetch<BackendJob>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      company: payload.company,
      location: payload.location,
      job_type: payload.jobType,
      salary_min: payload.salaryMin ? Number(payload.salaryMin) : null,
      salary_max: payload.salaryMax ? Number(payload.salaryMax) : null,
      seniority: payload.seniority,
      skills: payload.skills,
      description: payload.description,
      screening_questions: payload.screeningQuestions.filter(Boolean),
      auto_match: payload.autoMatch,
      match_threshold: payload.matchThreshold,
      status: 'active',
    }),
  }))
}

export function toScreening(screening: BackendScreening): Screening {
  return {
    id: screening.id,
    candidateName: 'Candidate',
    jobTitle: 'AI Screening',
    matchScore: 0,
    status: screening.completed_at ? 'completed' : 'in_progress',
    startedAt: screening.started_at,
    messages: screening.messages || [],
  }
}

export async function fetchActiveScreening(): Promise<Screening> {
  return toScreening(await apiFetch<BackendScreening>('/api/screening/active'))
}

export async function sendScreeningMessage(screeningId: string, content: string): Promise<Screening> {
  return toScreening(await apiFetch<BackendScreening>(`/api/screening/${screeningId}/message`, {
    method: 'POST',
    body: JSON.stringify({ role: 'candidate', content }),
  }))
}

export async function summarizeScreening(screeningId: string): Promise<Screening> {
  return toScreening(await apiFetch<BackendScreening>(`/api/screening/${screeningId}/summarize`, {
    method: 'POST',
  }))
}
