'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import LordIcon from '@/components/ui/lord-icon'
import SkillTag from '@/components/ui/skill-tag'
import { allSkills } from '@/lib/mock-data'
import type { Job } from '@/lib/mock-data'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createJob } from '@/lib/api'

const stepConfig = [
  { title: 'Job Basics', icon: 'system-regular-178-work-hover-work', description: 'Title, company, and location' },
  { title: 'Requirements', icon: 'system-regular-69-document-scan-hover-scan', description: 'Skills and description' },
  { title: 'AI Config', icon: 'system-regular-121-bulb-hover-bulb', description: 'Screening preferences' },
  { title: 'Review', icon: 'system-regular-122-launch-hover-launch', description: 'Confirm and publish' },
]

interface PostJobForm {
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

export default function PostJobPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [form, setForm] = useState<PostJobForm>({
    title: '',
    company: '',
    location: '',
    jobType: 'full_time',
    salaryMin: '',
    salaryMax: '',
    seniority: 'mid',
    skills: [] as string[],
    description: '',
    screeningQuestions: ['Tell me about a challenging project you led.', 'How do you handle tight deadlines?'],
    autoMatch: true,
    matchThreshold: 70,
  })

  const updateForm = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const handlePublish = async () => {
    if (!form.title || !form.company || !form.description) {
      toast.error('Add a title, company, and description before publishing.')
      return
    }

    setPublishing(true)
    try {
      const job = await createJob(form)
      toast.success('Job posted successfully! AI is now parsing the description...', {
        description: 'Candidates will be matched within minutes.',
      })
      router.push(`/jobs/${job.id}`)
    } catch (error) {
      toast.error('Could not publish to the backend yet.', {
        description: error instanceof Error ? error.message : 'Check that the API server is running.',
      })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="max-w-[720px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-heading font-bold tracking-tight text-foreground">
          Post a Job
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          AI will parse your description and start matching candidates automatically
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {stepConfig.map((s, i) => (
          <div key={s.title} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1',
                i === step && 'bg-primary-light',
                i < step && 'bg-success-bg cursor-pointer',
                i > step && 'opacity-50'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                i === step && 'bg-primary text-primary-foreground',
                i < step && 'bg-success text-white',
                i > step && 'bg-muted text-muted-foreground'
              )}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <div className="text-left hidden sm:block">
                <p className={cn('text-[12px] font-medium', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.title}
                </p>
              </div>
            </button>
            {i < stepConfig.length - 1 && (
              <div className={cn('w-6 h-px', i < step ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="clarity-card p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Job Basics */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <LordIcon name={stepConfig[0].icon} size={24} trigger="loop" />
                  <div>
                    <h2 className="text-[16px] font-semibold text-foreground">Job Basics</h2>
                    <p className="text-[12px] text-muted-foreground">Tell us about the position</p>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-foreground mb-1.5 block">Job Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-foreground mb-1.5 block">Company</label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => updateForm('company', e.target.value)}
                      placeholder="Company name"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-foreground mb-1.5 block">Location</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => updateForm('location', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-foreground mb-1.5 block">Job Type</label>
                    <select
                      value={form.jobType}
                      onChange={(e) => updateForm('jobType', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                    >
                      <option value="full_time">Full-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-foreground mb-1.5 block">Min Salary</label>
                    <input
                      type="number"
                      value={form.salaryMin}
                      onChange={(e) => updateForm('salaryMin', e.target.value)}
                      placeholder="$80,000"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-foreground mb-1.5 block">Max Salary</label>
                    <input
                      type="number"
                      value={form.salaryMax}
                      onChange={(e) => updateForm('salaryMax', e.target.value)}
                      placeholder="$150,000"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Requirements */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <LordIcon name={stepConfig[1].icon} size={24} trigger="loop" />
                  <div>
                    <h2 className="text-[16px] font-semibold text-foreground">Requirements</h2>
                    <p className="text-[12px] text-muted-foreground">Skills, seniority, and description</p>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-foreground mb-1.5 block">Seniority Level</label>
                  <div className="tab-group inline-flex">
                    {['junior', 'mid', 'senior', 'lead'].map((level) => (
                      <button
                        key={level}
                        onClick={() => updateForm('seniority', level)}
                        className={cn('tab-item capitalize', form.seniority === level && 'tab-item--active')}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-foreground mb-1.5 block">
                    Required Skills
                    <span className="text-muted-foreground font-normal ml-2">({form.skills.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-input bg-surface min-h-[100px]">
                    {allSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all',
                          form.skills.includes(skill)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-surface text-secondary border-border hover:border-border-hover'
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-foreground mb-1.5 block">Job Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-surface text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI will automatically extract additional skills and requirements from this description
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: AI Config */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <LordIcon name={stepConfig[2].icon} size={24} trigger="loop" />
                  <div>
                    <h2 className="text-[16px] font-semibold text-foreground">AI Configuration</h2>
                    <p className="text-[12px] text-muted-foreground">Customize screening and matching</p>
                  </div>
                </div>

                <div className="clarity-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Auto-Match Candidates</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">AI automatically ranks incoming applications</p>
                  </div>
                  <button
                    onClick={() => updateForm('autoMatch', !form.autoMatch)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative',
                      form.autoMatch ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                      form.autoMatch ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-foreground mb-1.5 block">
                    Match Threshold: <span className="font-mono text-primary">{form.matchThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    value={form.matchThreshold}
                    onChange={(e) => updateForm('matchThreshold', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>More candidates (50%)</span>
                    <span>Higher quality (95%)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-medium text-foreground mb-3 block">
                    Screening Questions
                  </label>
                  <div className="space-y-2">
                    {form.screeningQuestions.map((q, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground w-5">{i + 1}.</span>
                        <input
                          type="text"
                          value={q}
                          onChange={(e) => {
                            const qs = [...form.screeningQuestions]
                            qs[i] = e.target.value
                            updateForm('screeningQuestions', qs)
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-input bg-surface text-[13px] focus:border-ring focus:ring-1 focus:ring-ring outline-none"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateForm('screeningQuestions', [...form.screeningQuestions, ''])}
                      className="text-[12px] text-primary font-medium hover:underline"
                    >
                      + Add question
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <LordIcon name={stepConfig[3].icon} size={24} trigger="loop" />
                  <div>
                    <h2 className="text-[16px] font-semibold text-foreground">Review & Publish</h2>
                    <p className="text-[12px] text-muted-foreground">Confirm everything looks good</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-surface-hover">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Job Title</p>
                    <p className="text-[15px] font-semibold text-foreground">{form.title || 'Not set'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-surface-hover">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Company</p>
                      <p className="text-[13px] text-foreground">{form.company || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-hover">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Location</p>
                      <p className="text-[13px] text-foreground">{form.location || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-hover">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Salary</p>
                      <p className="text-[13px] text-foreground font-mono">
                        {form.salaryMin && form.salaryMax ? `$${Number(form.salaryMin).toLocaleString()} - $${Number(form.salaryMax).toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.skills.map((skill) => (
                        <SkillTag key={skill} skill={skill} variant="primary" />
                      ))}
                      {form.skills.length === 0 && <p className="text-[12px] text-muted-foreground">No skills selected</p>}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary-light border border-primary/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[12px] font-medium text-primary">AI Features Enabled</p>
                    </div>
                    <p className="text-[11px] text-primary/70">
                      Auto-matching at {form.matchThreshold}% threshold &middot; {form.screeningQuestions.filter(Boolean).length} screening questions
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn btn--ghost gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(Math.min(3, step + 1))}
              className="btn btn--primary gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handlePublish} disabled={publishing} className="btn btn--primary gap-2 disabled:opacity-50">
              <LordIcon name="system-regular-122-launch-hover-launch" size={16} trigger="hover" />
              {publishing ? 'Publishing...' : 'Publish Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
