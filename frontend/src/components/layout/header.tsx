'use client'

import { Search, Command } from 'lucide-react'
import LordIcon from '@/components/ui/lord-icon'
import VeduwaLogo from '@/components/ui/veduwa-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="h-[60px] border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Mobile logo */}
      <div className="md:hidden">
        <VeduwaLogo size="sm" showText={false} />
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-surface-hover rounded-lg px-3 py-1.5 w-[320px] cursor-pointer hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-[13px] text-muted-foreground flex-1">Search jobs, candidates...</span>
        <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] text-muted-foreground font-mono">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </div>

      {/* Mobile search */}
      <button className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors">
        <Search className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle - mobile only (sidebar has it on desktop) */}
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors">
          <LordIcon name="system-regular-46-notification-bell-hover-bell" size={20} trigger="hover" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>
        <Link href="/dashboard/post" className="hidden sm:flex btn btn--primary text-[13px] gap-2">
          <LordIcon name="system-regular-314-plus-hover-pinch" size={16} trigger="hover" />
          Post a Job
        </Link>
      </div>
    </header>
  )
}
