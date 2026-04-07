'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import LordIcon from '@/components/ui/lord-icon'
import VeduwaLogo from '@/components/ui/veduwa-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { ContainerScroll } from '@/components/ui/container-scroll'
import { OrbitingCircles } from '@/components/ui/orbiting-circles'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ArrowRight, Users, BarChart3, MessageSquare, FileSearch, Brain, Target } from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } }
const stagger = { animate: { transition: { staggerChildren: 0.12 } } }

const teamProfiles = [
  { id: 1, name: 'Sarah Chen', designation: '94% Match', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Marcus Johnson', designation: '91% Match', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, name: 'Elena Rodriguez', designation: '88% Match', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 4, name: 'David Kim', designation: '86% Match', image: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { id: 5, name: 'Aisha Patel', designation: '92% Match', image: 'https://randomuser.me/api/portraits/women/26.jpg' },
]

const steps = [
  {
    num: '01',
    icon: 'system-regular-178-work-hover-work',
    title: 'Post Your Job',
    description: 'Describe the role in natural language. Claude AI parses your description, extracting skills, seniority, and domain requirements into structured data automatically.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  },
  {
    num: '02',
    icon: 'system-regular-121-bulb-hover-bulb',
    title: 'AI Matches Candidates',
    description: 'Vector embeddings and cosine similarity analyze every profile. Combined with skills overlap scoring, candidates are ranked 0-100 with full transparency.',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  },
  {
    num: '03',
    icon: 'system-regular-186-chat-empty-hover-chat',
    title: 'Claude Screens Top Picks',
    description: 'Claude AI conducts structured technical interviews via streaming chat. Employers receive a plain-English summary with a clear hire/pass recommendation.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
  },
]

const features = [
  { icon: <Brain className="w-5 h-5" />, title: 'Semantic Matching', desc: 'AI understands context — "React" experience maps to "Frontend" roles intelligently, beyond simple keyword matching.' },
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Live AI Screening', desc: 'Claude conducts real-time structured interviews, asking domain-specific questions tailored to job requirements.' },
  { icon: <FileSearch className="w-5 h-5" />, title: 'Resume Parsing', desc: 'Upload a PDF — AI extracts skills, experience, education, and generates a structured profile instantly.' },
  { icon: <Target className="w-5 h-5" />, title: 'Match Scoring', desc: 'Cosine similarity + skills overlap produces a transparent 0-100 match score for every application.' },
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Pipeline Analytics', desc: 'Track your hiring funnel, monitor candidate flow, and view match analytics in a beautiful dashboard.' },
  { icon: <Users className="w-5 h-5" />, title: 'Rich Profiles', desc: 'Skill proficiency bars, screening history, AI summaries, and document management — all in one view.' },
]

// techStack used in OrbitingCircles section directly

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <VeduwaLogo />
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-[13px] text-secondary hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="text-[13px] text-secondary hover:text-foreground transition-colors">Features</a>
            <Link href="/jobs" className="text-[13px] text-secondary hover:text-foreground transition-colors">Job Board</Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login" className="text-[13px] text-secondary hover:text-foreground transition-colors hidden sm:block">Sign In</Link>
            <Link href="/auth/signup" className="btn btn--primary text-[13px]">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative pt-[100px] pb-20 md:pt-[130px] md:pb-28 px-6">
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="ambient-glow ambient-glow--primary top-[60px] left-[5%]" />
        <div className="ambient-glow ambient-glow--accent top-[200px] right-[10%]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-[1100px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left - Text */}
            <motion.div {...stagger} initial="initial" animate="animate">
              <motion.div {...fadeUp}>
                <TextShimmer as="span" className="text-[12px] font-semibold tracking-wider uppercase" duration={3}>
                  AI-Powered IT Talent Marketplace
                </TextShimmer>
              </motion.div>

              <motion.h1 {...fadeUp} className="text-[36px] md:text-[48px] lg:text-[54px] font-heading font-bold tracking-tight text-foreground leading-[1.06] mt-4">
                Find the{' '}
                <span className="gradient-text">perfect match</span>
                <br className="hidden md:block" />
                for every IT role
              </motion.h1>

              <motion.p {...fadeUp} className="text-[15px] md:text-[16px] text-secondary mt-5 max-w-[500px] leading-relaxed">
                Post jobs, let AI match and rank candidates using vector embeddings,
                then watch Claude conduct intelligent pre-screening interviews in real-time.
              </motion.p>

              <motion.div {...fadeUp} className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/auth/signup" className="btn btn--primary px-6 py-3 text-[14px] gap-2 shadow-lg shadow-primary/20">
                  Start Hiring Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/jobs" className="btn btn--secondary px-6 py-3 text-[14px]">Browse Jobs</Link>
              </motion.div>

              {/* Social proof - Animated Tooltip */}
              <motion.div {...fadeUp} className="flex items-center gap-4 mt-10">
                <AnimatedTooltip items={teamProfiles} />
                <div className="ml-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-warning fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">500+ companies trust Veduwa</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-2xl bg-card">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop"
                  alt="Team collaborating"
                  width={800}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
                {/* Floating match notification */}
                <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image src="https://randomuser.me/api/portraits/women/44.jpg" alt="" width={40} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">New Match Found</p>
                        <p className="text-[11px] text-muted-foreground">Sarah Chen &middot; Senior Full-Stack Engineer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[22px] font-heading font-bold text-success">94%</p>
                      <p className="text-[10px] text-muted-foreground">Match Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating AI parsing card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 clarity-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <LordIcon name="system-regular-69-document-scan-hover-scan" size={18} trigger="loop" />
                  <div>
                    <p className="text-[11px] font-medium text-foreground">Parsing Resume...</p>
                    <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <motion.div className="h-full bg-primary rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2.5, repeat: Infinity }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating screening card */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-3 -left-4 clarity-card p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <LordIcon name="system-regular-186-chat-empty-hover-chat" size={18} trigger="loop" />
                  <div>
                    <p className="text-[11px] font-medium text-foreground">AI Screening Active</p>
                    <p className="text-[10px] text-success">3 interviews in progress</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-6 border-y border-border bg-surface">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: 'system-regular-178-work-hover-work', value: '500+', label: 'Jobs Posted' },
              { icon: 'system-regular-96-groups-hover-groups', value: '10K+', label: 'Candidates' },
              { icon: 'system-regular-43-pie-chart-diagram-hover-pie-chart', value: '94%', label: 'Avg Match' },
              { icon: 'system-regular-186-chat-empty-hover-chat', value: '3min', label: 'Screening Time' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light mx-auto flex items-center justify-center mb-3 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <LordIcon name={stat.icon} size={22} trigger="hover" />
                </div>
                <p className="text-[28px] font-heading font-bold text-foreground">{stat.value}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 relative">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <div className="max-w-[1000px] mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[11px] font-semibold uppercase tracking-[3px] text-primary mb-3 block">Process</span>
            <h2 className="text-[30px] md:text-[36px] font-heading font-bold tracking-tight text-foreground">Three steps to your next hire</h2>
            <p className="text-[14px] text-secondary mt-3 max-w-[460px] mx-auto">From job posting to AI screening — fully automated, beautifully transparent.</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="clarity-card overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className={`md:w-[280px] h-[180px] md:h-auto relative shrink-0 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                    <Image src={step.image} alt={step.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-card/80 to-transparent md:bg-gradient-to-l" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                          <LordIcon name={step.icon} size={22} trigger="loop" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-primary tracking-wider">{step.num}</span>
                      </div>
                      <h3 className="text-[20px] font-heading font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-[13px] text-secondary leading-relaxed max-w-[480px]">{step.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 md:py-28 px-6 bg-surface relative">
        <div className="ambient-glow ambient-glow--accent top-[50%] left-[5%]" style={{ opacity: 0.06 }} />
        <div className="max-w-[1100px] mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[3px] text-primary mb-3 block">Capabilities</span>
            <h2 className="text-[30px] md:text-[36px] font-heading font-bold tracking-tight text-foreground">Built for modern hiring teams</h2>
            <p className="text-[14px] text-secondary mt-3 max-w-[480px] mx-auto">Enterprise-grade AI infrastructure wrapped in a beautiful, intuitive interface.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="clarity-card clarity-card--interactive p-6 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-[13px] text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview (ContainerScroll) ── */}
      <section className="py-0 px-6 bg-background relative overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[3px] text-primary mb-3 block">Live Preview</span>
              <h2 className="text-[28px] md:text-[36px] font-heading font-bold tracking-tight text-foreground">
                See the dashboard in action
              </h2>
              <p className="text-[14px] text-secondary mt-2 max-w-[460px] mx-auto">
                Real-time stats, pipeline analytics, and AI-powered candidate matching — all in one view.
              </p>
            </div>
          }
        >
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&h=900&fit=crop"
            alt="Veduwa Dashboard"
            width={1400}
            height={900}
            className="w-full h-full object-cover object-left-top"
          />
        </ContainerScroll>
      </section>

      {/* ── Tech Stack with Orbiting Circles ── */}
      <section className="py-20 px-6 border-y border-border relative overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[3px] text-muted-foreground text-center mb-4">Powered By</p>
          <h3 className="text-[22px] font-heading font-bold text-center text-foreground mb-12">Modern, production-ready stack</h3>

          <div className="relative flex h-[360px] w-full items-center justify-center overflow-hidden">
            <span className="pointer-events-none text-center text-[14px] font-heading font-bold text-foreground whitespace-pre-wrap leading-tight">
              AI-Powered<br />Hiring
            </span>

            {/* Inner orbit */}
            <OrbitingCircles className="size-[36px] border-none bg-transparent" duration={20} delay={0} radius={80}>
              <div className="flex items-center justify-center w-full h-full text-[10px] font-mono font-bold text-primary">Next.js</div>
            </OrbitingCircles>
            <OrbitingCircles className="size-[36px] border-none bg-transparent" duration={20} delay={10} radius={80}>
              <div className="flex items-center justify-center w-full h-full text-[10px] font-mono font-bold text-accent">FastAPI</div>
            </OrbitingCircles>

            {/* Outer orbit */}
            <OrbitingCircles className="size-[40px] border-none bg-transparent" duration={30} delay={0} radius={160} reverse>
              <div className="flex items-center justify-center w-full h-full text-[10px] font-mono font-bold text-success">Supabase</div>
            </OrbitingCircles>
            <OrbitingCircles className="size-[40px] border-none bg-transparent" duration={30} delay={7.5} radius={160} reverse>
              <div className="flex items-center justify-center w-full h-full text-[10px] font-mono font-bold text-warning">Claude</div>
            </OrbitingCircles>
            <OrbitingCircles className="size-[40px] border-none bg-transparent" duration={30} delay={15} radius={160} reverse>
              <div className="flex items-center justify-center w-full h-full text-[10px] font-mono font-bold text-error">Redis</div>
            </OrbitingCircles>
            <OrbitingCircles className="size-[40px] border-none bg-transparent" duration={30} delay={22.5} radius={160} reverse>
              <div className="flex items-center justify-center w-full h-full text-[10px] font-mono font-bold text-primary">PG</div>
            </OrbitingCircles>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="ambient-glow ambient-glow--primary" style={{ width: 600, height: 600, opacity: 0.08, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <div className="max-w-[580px] mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <LordIcon name="system-regular-122-launch-hover-launch" size={40} trigger="loop" className="mx-auto mb-4" />
            <h2 className="text-[30px] md:text-[36px] font-heading font-bold tracking-tight text-foreground">
              Ready to transform your hiring?
            </h2>
            <p className="text-[14px] text-secondary mt-3 max-w-[420px] mx-auto">
              Join hundreds of companies using AI to find better talent, faster. Start for free — no credit card required.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link href="/auth/signup" className="btn btn--primary px-8 py-3 text-[14px] gap-2 shadow-lg shadow-primary/20">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">Free to post up to 3 jobs. No lock-in.</p>
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
          <p className="text-[11px] text-muted-foreground">&copy; 2026 Veduwa. AI-powered talent matching.</p>
        </div>
      </footer>
    </div>
  )
}
