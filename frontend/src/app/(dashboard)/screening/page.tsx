'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { mockScreening, mockCandidates } from '@/lib/mock-data'
import MatchScoreRing from '@/components/ui/match-score-ring'
import SkillTag from '@/components/ui/skill-tag'
import LordIcon from '@/components/ui/lord-icon'
import { Send, StopCircle, FileText, Sparkles, Clock, User, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { fetchActiveScreening, sendScreeningMessage, summarizeScreening } from '@/lib/api'

export default function ScreeningPage() {
  const [screening, setScreening] = useState(mockScreening)
  const [messages, setMessages] = useState(mockScreening.messages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [source, setSource] = useState<'api' | 'mock'>('mock')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const candidate = mockCandidates[0]

  useEffect(() => {
    let active = true
    fetchActiveScreening()
      .then((data) => {
        if (!active) return
        setScreening({ ...mockScreening, ...data })
        setMessages(data.messages.length ? data.messages : mockScreening.messages)
        setSource('api')
      })
      .catch(() => {
        if (!active) return
        setScreening(mockScreening)
        setMessages(mockScreening.messages)
        setSource('mock')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const simulateStreaming = (text: string) => {
    setIsStreaming(true)
    setStreamingText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setStreamingText((prev) => prev + text[i])
        i++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        setMessages((prev) => [...prev, {
          role: 'ai' as const,
          content: text,
          timestamp: new Date().toISOString(),
        }])
        setStreamingText('')
      }
    }, 20)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const outgoing = input
    setMessages((prev) => [...prev, {
      role: 'candidate' as const,
      content: outgoing,
      timestamp: new Date().toISOString(),
    }])
    setInput('')

    if (source === 'api') {
      setIsStreaming(true)
      try {
        const updated = await sendScreeningMessage(screening.id, outgoing)
        setScreening({ ...screening, ...updated })
        setMessages(updated.messages.length ? updated.messages : messages)
      } finally {
        setIsStreaming(false)
      }
      return
    }

    // Dynamic AI follow-up based on message count
    const aiResponses = [
      `That's a great point about ${outgoing.split(' ').slice(0, 3).join(' ')}. Can you walk me through how you've handled database migrations in production? Specifically, how do you ensure zero-downtime deployments when schema changes are involved?`,
      `Interesting approach. Let me drill deeper — when building APIs at scale, how do you handle rate limiting and request throttling? Have you implemented circuit breaker patterns?`,
      `Thanks for sharing that. Now, this role involves AI/LLM integrations. Have you worked with streaming API responses? How would you architect a system that needs to handle real-time Claude API responses while maintaining conversation state?`,
      `Good technical depth. Let's talk about team dynamics — describe a situation where you had to push back on a technical decision from a senior engineer. How did you handle it and what was the outcome?`,
      `That's very relevant experience. Final question: if you had to design the match scoring algorithm for a job marketplace from scratch, what signals would you prioritize and why?`,
    ]
    const idx = (messages.length - 2) % aiResponses.length
    setTimeout(() => {
      simulateStreaming(aiResponses[idx])
    }, 1000)
  }

  const handleGenerateSummary = async () => {
    if (source === 'api') {
      setIsStreaming(true)
      try {
        const updated = await summarizeScreening(screening.id)
        setScreening({ ...screening, ...updated })
        setMessages(updated.messages)
        if (updated.messages.length === messages.length) {
          setMessages((prev) => [...prev, {
            role: 'ai' as const,
            content: 'Screening summary generated and emailed to the hiring team.',
            timestamp: new Date().toISOString(),
          }])
        }
      } finally {
        setIsStreaming(false)
      }
      return
    }

    simulateStreaming(
      "📋 **Screening Summary — Sarah Chen**\n\n**Overall Assessment: Strong Match (94/100)**\n\nSarah demonstrated deep expertise in full-stack development with particular strength in:\n- **Architecture**: Led monolith-to-microservices migration using strangler fig pattern\n- **Data**: Experience with CDC, saga patterns, distributed transactions\n- **Scale**: Served 50K+ DAU with real-time WebSocket streaming\n- **AI/LLM**: Relevant experience integrating AI APIs in production\n\n**Recommendation**: Proceed to final interview. Strong technical fit with excellent communication skills."
    )
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-112px)] -m-6">
      {/* Chat area - 70% */}
      <div className="flex-[7] flex flex-col border-r border-border">
        {/* Chat header */}
        <div className="px-6 py-3 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LordIcon name="system-regular-186-chat-empty-hover-chat" size={20} trigger="loop" />
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">AI Screening — {screening.candidateName}</h2>
              <p className="text-[11px] text-muted-foreground">
                {screening.jobTitle} &middot; Started {formatDistanceToNow(new Date(screening.startedAt), { addSuffix: true })}
                {source === 'mock' && <span className="ml-1">(demo data)</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSummary}
              className="btn btn--secondary text-[12px] gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Summary
            </button>
            <button className="btn btn--ghost text-[12px] gap-1.5 text-error">
              <StopCircle className="w-3.5 h-3.5" />
              End
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === 'system' ? (
                  <div className="flex items-center justify-center py-3">
                    <span className="text-[11px] text-muted-foreground bg-surface-hover px-3 py-1 rounded-full">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div className={cn(
                    'flex gap-3 max-w-[85%]',
                    msg.role === 'candidate' && 'ml-auto flex-row-reverse'
                  )}>
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold',
                      msg.role === 'ai' ? 'bg-primary-light text-primary' : 'bg-surface-hover text-secondary'
                    )}>
                      {msg.role === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className={cn(
                      'rounded-xl px-4 py-3 text-[13px] leading-relaxed',
                      msg.role === 'ai'
                        ? 'bg-surface border border-border text-foreground'
                        : 'bg-primary-light text-foreground'
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming message */}
          {isStreaming && streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%]"
            >
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="rounded-xl px-4 py-3 bg-surface border border-border text-[13px] leading-relaxed text-foreground">
                <p className="whitespace-pre-wrap">{streamingText}<span className="animate-pulse-soft">|</span></p>
              </div>
            </motion.div>
          )}

          {/* Typing indicator */}
          {isStreaming && !streamingText && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="rounded-xl px-4 py-3 bg-surface border border-border flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Inject a question or let AI continue..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-[13px] placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none pr-10"
                disabled={isStreaming}
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="btn btn--primary p-2.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate panel - 30% */}
      <div className="flex-[3] overflow-y-auto bg-surface p-5 space-y-5">
        <div className="text-center py-3">
          {candidate.avatarUrl ? (
            <Image src={candidate.avatarUrl} alt={candidate.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center text-[22px] font-bold mx-auto mb-3">
              {candidate.avatar}
            </div>
          )}
          <h3 className="text-[16px] font-semibold text-foreground">{candidate.name}</h3>
          <p className="text-[12px] text-muted-foreground">{candidate.title}</p>
          <div className="flex justify-center mt-3">
            <MatchScoreRing score={candidate.matchScore} size={64} strokeWidth={4} />
          </div>
        </div>

        <div className="divider-fade" />

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} size="sm" />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</p>
          <p className="text-[12px] text-secondary leading-relaxed">{candidate.summary}</p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</p>
          <div className="space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Location</span>
              <span className="text-foreground">{candidate.location}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Experience</span>
              <span className="text-foreground">{candidate.experienceYears} years</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">Status</span>
              <span className="badge badge--accent">Screening</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Screening Timeline</p>
          <div className="space-y-3 pl-4 border-l-2 border-border">
            <div className="relative">
              <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-success border-2 border-surface" />
              <p className="text-[12px] text-foreground">Application submitted</p>
              <p className="text-[10px] text-muted-foreground">2 days ago</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-success border-2 border-surface" />
              <p className="text-[12px] text-foreground">AI matched — 94% score</p>
              <p className="text-[10px] text-muted-foreground">1 day ago</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary border-2 border-surface animate-pulse-soft" />
              <p className="text-[12px] text-foreground font-medium">AI screening in progress</p>
              <p className="text-[10px] text-muted-foreground">Now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
