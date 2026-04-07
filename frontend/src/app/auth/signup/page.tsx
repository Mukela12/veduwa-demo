'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import VeduwaLogo from '@/components/ui/veduwa-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Mail, Lock, User, Briefcase, Search, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const AnimationPanel = dynamic(() => import('@/components/auth/animation-panel'), { ssr: false })

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'employer' | 'candidate'>('employer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Fresh onboarding for new signups
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veduwa-onboarding')
    }
    const { error, needsConfirmation } = await signUp(email, password, fullName, role)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (needsConfirmation) {
      setEmailSent(true)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Rive animation (desktop only) */}
      <div className="hidden lg:block w-[45%] relative">
        <AnimationPanel />
      </div>

      {/* Right - Signup form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="lg:hidden">
            <VeduwaLogo size="sm" />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[420px] page-enter">
            {emailSent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-success-bg mx-auto flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-[24px] font-heading font-bold tracking-tight text-foreground">
                  Check your email
                </h1>
                <p className="text-[14px] text-secondary mt-3 max-w-[320px] mx-auto leading-relaxed">
                  We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to verify your account and start using Veduwa.
                </p>
                <div className="mt-8 space-y-3">
                  <Link href="/auth/login" className="btn btn--primary w-full py-2.5">
                    Back to Sign In
                  </Link>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Didn&apos;t receive it? Try again
                  </button>
                </div>
              </div>
            ) : (
            <>
            <div className="text-center mb-8">
              <div className="hidden lg:block">
                <VeduwaLogo size="lg" className="justify-center mb-4" />
              </div>
              <h1 className="text-[26px] font-heading font-bold tracking-tight text-foreground">
                Create your account
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Get started with Veduwa in seconds
              </p>
            </div>

            {/* Role selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setRole('employer')}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  role === 'employer'
                    ? 'border-primary bg-primary-light shadow-sm'
                    : 'border-border hover:border-border-hover'
                )}
              >
                <Briefcase className={cn('w-5 h-5 mb-2', role === 'employer' ? 'text-primary' : 'text-muted-foreground')} />
                <p className="text-[13px] font-semibold text-foreground">Employer</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Post jobs & hire</p>
              </button>
              <button
                onClick={() => setRole('candidate')}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  role === 'candidate'
                    ? 'border-primary bg-primary-light shadow-sm'
                    : 'border-border hover:border-border-hover'
                )}
              >
                <Search className={cn('w-5 h-5 mb-2', role === 'candidate' ? 'text-primary' : 'text-muted-foreground')} />
                <p className="text-[13px] font-semibold text-foreground">Candidate</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Find your next role</p>
              </button>
            </div>

            {/* Google */}
            <button onClick={() => signInWithGoogle()} className="w-full btn btn--secondary py-2.5 mb-4">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="divider-fade flex-1" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <div className="divider-fade flex-1 rotate-180" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-bg text-[12px] text-error">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="text-[12px] font-medium text-foreground mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors" required />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors" required />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors" required minLength={6} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn btn--primary py-2.5 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-[12px] text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
