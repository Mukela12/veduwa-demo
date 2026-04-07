'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useClerk } from '@clerk/nextjs'
import VeduwaLogo from '@/components/ui/veduwa-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Mail, Lock, AlertCircle, Briefcase, Search } from 'lucide-react'
import dynamic from 'next/dynamic'

const AnimationPanel = dynamic(() => import('@/components/auth/animation-panel'), { ssr: false })

const demoAccounts = [
  {
    role: 'employer',
    label: 'Employer Demo',
    description: 'Post jobs, view matches, screen candidates',
    email: 'employer@veduwa.com',
    password: 'demo123',
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    role: 'candidate',
    label: 'Candidate Demo',
    description: 'Browse jobs, view profile, apply',
    email: 'candidate@veduwa.com',
    password: 'demo123',
    icon: <Search className="w-4 h-4" />,
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const clerk = useClerk()
  const router = useRouter()

  const handleGoogleSignIn = () => {
    try {
      clerk.redirectToSignIn()
    } catch {
      setError('Google sign-in not available. Try email login.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setLoading(true)
    // Clear onboarding state so demo users always get the guided tour
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veduwa-onboarding')
    }
    const { error } = await signIn(account.email, account.password)
    if (error) {
      setError('Demo account not available yet. Please sign up first.')
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

      {/* Right - Login form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          <div className="lg:hidden">
            <VeduwaLogo size="sm" />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[400px] page-enter">
            <div className="mb-8">
              <h1 className="text-[26px] font-heading font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Sign in to your Veduwa account
              </p>
            </div>

            {/* Demo account cards */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoLogin(account)}
                  className="p-3 rounded-lg border border-primary/20 bg-primary-light text-left hover:bg-primary-muted transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary">{account.icon}</span>
                    <span className="text-[12px] font-semibold text-primary">{account.label}</span>
                  </div>
                  <p className="text-[10px] text-primary/60 leading-snug">{account.description}</p>
                </button>
              ))}
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full btn btn--secondary py-2.5"
            >
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
              <span className="text-[11px] text-muted-foreground">or sign in with email</span>
              <div className="divider-fade flex-1 rotate-180" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-bg text-[12px] text-error">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="text-[12px] font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-surface text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn--primary py-2.5 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-[12px] text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
