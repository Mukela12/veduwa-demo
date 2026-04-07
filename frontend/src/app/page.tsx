'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import LordIcon from '@/components/ui/lord-icon'
import VeduwaLogo from '@/components/ui/veduwa-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ArrowRight, CheckCircle2, Users, BarChart3, MessageSquare, FileSearch, Brain, Target } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const stats = [
  { value: '500+', label: 'Jobs Posted', icon: 'system-regular-178-work-hover-work' },
  { value: '10K+', label: 'Candidates Matched', icon: 'system-regular-96-groups-hover-groups' },
  { value: '94%', label: 'Avg Match Score', icon: 'system-regular-43-pie-chart-diagram-hover-pie-chart' },
  { value: '3min', label: 'Avg Screening Time', icon: 'system-regular-186-chat-empty-hover-chat' },
]

const steps = [
  {
    num: '01',
    icon: 'system-regular-178-work-hover-work',
    title: 'Post Your Job',
    description: 'Describe the role. Our AI parses the description, extracts skills, seniority, and domain requirements automatically using Claude.',
    color: 'from-primary/10 to-accent/5',
  },
  {
    num: '02',
    icon: 'system-regular-121-bulb-hover-bulb',
    title: 'AI Matches Candidates',
    description: 'Vector embeddings and cosine similarity analyze every candidate profile. Skills overlap scoring ensures precise matches, ranked 0-100.',
    color: 'from-success/10 to-primary/5',
  },
  {
    num: '03',
    icon: 'system-regular-186-chat-empty-hover-chat',
    title: 'Claude Screens Top Picks',
    description: 'Claude AI conducts structured technical interviews via streaming chat. You get a plain-English summary with a hire/pass recommendation.',
    color: 'from-accent/10 to-primary/5',
  },
]

const features = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: 'Semantic Matching',
    description: 'Goes beyond keyword matching. AI understands context — "React" experience maps to "Frontend" roles intelligently.',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Live AI Screening',
    description: 'Claude conducts real-time structured interviews, asking domain-specific questions tailored to the job requirements.',
  },
  {
    icon: <FileSearch className="w-5 h-5" />,
    title: 'Resume Parsing',
    description: 'Upload a PDF and AI extracts skills, experience, education, and generates a structured candidate profile instantly.',
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Match Scoring',
    description: 'Cosine similarity (40%) + skills overlap (60%) produces a transparent 0-100 match score for every application.',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Employer Dashboard',
    description: 'Track your hiring pipeline, monitor candidate flow, and view match analytics all in one beautiful interface.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Candidate Profiles',
    description: 'Rich profiles with skill proficiency bars, screening history, AI-generated summaries, and document management.',
  },
]

const testimonialImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <VeduwaLogo />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-[13px] text-secondary hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-[13px] text-secondary hover:text-foreground transition-colors">
              Features
            </a>
            <Link href="/jobs" className="text-[13px] text-secondary hover:text-foreground transition-colors">
              Job Board
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login" className="text-[13px] text-secondary hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn btn--primary text-[13px]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-[120px] pb-24 px-6">
        {/* Ambient glows */}
        <div className="ambient-glow ambient-glow--primary top-[80px] left-[10%]" />
        <div className="ambient-glow ambient-glow--accent top-[200px] right-[15%]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern pointer-events-none" />

        <div className="max-w-[1100px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <motion.div {...stagger} initial="initial" animate="animate">
              <motion.div {...fadeInUp}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary-light text-primary text-[12px] font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
                  AI-Powered IT Talent Marketplace
                </div>
              </motion.div>

              <motion.h1
                {...fadeInUp}
                className="text-[42px] lg:text-[52px] font-heading font-bold tracking-tight text-foreground leading-[1.08]"
              >
                Hire smarter with
                <br />
                <span className="gradient-text">AI-driven matching</span>
              </motion.h1>

              <motion.p
                {...fadeInUp}
                className="text-[16px] text-secondary mt-5 max-w-[480px] leading-relaxed"
              >
                Post jobs, let AI match and rank candidates using vector embeddings,
                then watch Claude conduct intelligent pre-screening interviews in real-time.
              </motion.p>

              <motion.div {...fadeInUp} className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/auth/signup" className="btn btn--primary px-6 py-3 text-[14px] gap-2">
                  Start Hiring Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/jobs" className="btn btn--secondary px-6 py-3 text-[14px]">
                  Browse Jobs
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div {...fadeInUp} className="flex items-center gap-4 mt-10">
                <div className="flex -space-x-2">
                  {testimonialImages.map((img, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                      <Image src={img} alt="" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-warning fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Trusted by 500+ companies</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative rounded-xl overflow-hidden border border-border shadow-xl bg-card">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop"
                  alt="Team collaborating on hiring"
                  width={800}
                  height={500}
                  className="w-full h-auto opacity-90"
                />
                {/* Overlay cards */}
                <div className="absolute bottom-4 left-4 right-4 glass rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <LordIcon name="system-regular-134-celebration-hover-celebration" size={22} trigger="loop" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">New Match Found</p>
                        <p className="text-[11px] text-muted-foreground">Sarah Chen &middot; 94% match</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[20px] font-heading font-bold text-success">94%</p>
                      <p className="text-[10px] text-muted-foreground">Match Score</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 clarity-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <LordIcon name="system-regular-69-document-scan-hover-scan" size={18} trigger="loop" />
                  <div>
                    <p className="text-[11px] font-medium text-foreground">AI Parsing Resume...</p>
                    <div className="w-20 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        animate={{ width: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 border-y border-border bg-surface">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light mx-auto flex items-center justify-center mb-3">
                  <LordIcon name={stat.icon} size={20} trigger="hover" />
                </div>
                <p className="text-[28px] font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <div className="max-w-[1000px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2 block">Process</span>
            <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground">
              Three steps to your next hire
            </h2>
            <p className="text-[14px] text-secondary mt-3 max-w-[500px] mx-auto">
              From job posting to AI screening — fully automated, beautifully transparent.
            </p>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="clarity-card p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                    <LordIcon name={step.icon} size={28} trigger="loop" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[11px] font-mono font-bold text-primary tracking-wider">{step.num}</span>
                      <h3 className="text-[18px] font-heading font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-[14px] text-secondary leading-relaxed max-w-[600px]">
                      {step.description}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary/40" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-surface relative">
        <div className="ambient-glow ambient-glow--accent top-[50%] left-[5%]" style={{ opacity: 0.08 }} />
        <div className="max-w-[1100px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2 block">Features</span>
            <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground">
              Built for modern hiring teams
            </h2>
            <p className="text-[14px] text-secondary mt-3 max-w-[500px] mx-auto">
              Enterprise-grade AI infrastructure wrapped in a beautiful, intuitive interface.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="clarity-card clarity-card--interactive p-6 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-[13px] text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack Banner ── */}
      <section className="py-16 px-6 border-y border-border">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-center mb-8">
            Built With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['Next.js', 'FastAPI', 'PostgreSQL', 'Redis', 'Claude AI', 'Supabase', 'Railway', 'Vercel'].map((tech) => (
              <span key={tech} className="text-[14px] font-mono font-medium text-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="ambient-glow ambient-glow--primary top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" style={{ width: 600, height: 600, opacity: 0.1 }} />
        <div className="max-w-[600px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[32px] font-heading font-bold tracking-tight text-foreground">
              Ready to transform your hiring?
            </h2>
            <p className="text-[14px] text-secondary mt-3 max-w-[440px] mx-auto">
              Join hundreds of companies using AI to find better talent, faster.
              Start for free — no credit card required.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link href="/auth/signup" className="btn btn--primary px-8 py-3 text-[14px] gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">Free to post up to 3 jobs. No credit card needed.</p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <VeduwaLogo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="/jobs" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Job Board</Link>
            <a href="#how-it-works" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Features</a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 Veduwa. AI-powered talent matching.
          </p>
        </div>
      </footer>
    </div>
  )
}
