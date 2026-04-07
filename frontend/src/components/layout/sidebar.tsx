'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LordIcon from '@/components/ui/lord-icon'
import VeduwaLogo from '@/components/ui/veduwa-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/components/auth/auth-provider'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: string
  badge?: number
  roles?: ('employer' | 'candidate')[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'system-regular-41-home-hover-home' },
  { label: 'Job Board', path: '/jobs', icon: 'system-regular-42-search-hover-pinch' },
  { label: 'Post a Job', path: '/dashboard/post', icon: 'system-regular-178-work-hover-work', roles: ['employer'] },
  { label: 'Screening', path: '/screening', icon: 'system-regular-186-chat-empty-hover-chat', roles: ['employer'] },
  { label: 'Candidates', path: '/candidates', icon: 'system-regular-96-groups-hover-groups', roles: ['employer'] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const userRole = user?.user_metadata?.role || 'employer'

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(userRole))

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  const userAvatar = user?.user_metadata?.avatar_url
  const userName = user?.user_metadata?.full_name || 'Demo User'
  const userInitial = userName[0]?.toUpperCase() || 'U'

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col z-40 transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 h-[60px] border-b border-sidebar-border',
        collapsed && 'justify-center px-2'
      )}>
        <VeduwaLogo size="md" showText={!collapsed} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                active
                  ? 'bg-sidebar-active text-sidebar-active-foreground'
                  : 'text-secondary hover:bg-surface-hover hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <LordIcon
                name={item.icon}
                size={20}
                trigger="hover"
                className={active ? 'lordicon-primary' : ''}
              />
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto badge badge--accent text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}

        {/* AI Activity Feed */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-sidebar-border">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              AI Activity
            </p>
            <div className="space-y-1.5 px-3">
              <ActivityItem
                icon="system-regular-69-document-scan-hover-scan"
                text="Parsing 3 new resumes..."
                time="2m ago"
                status="active"
              />
              <ActivityItem
                icon="system-regular-134-celebration-hover-celebration"
                text="Match found: 94% score"
                time="5m ago"
                status="success"
              />
              <ActivityItem
                icon="system-regular-186-chat-empty-hover-chat"
                text="Screening completed"
                time="12m ago"
                status="info"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border py-3 px-2 space-y-1">
        {/* Theme toggle */}
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[12px] text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-secondary hover:bg-surface-hover hover:text-foreground transition-all',
            collapsed && 'justify-center px-2'
          )}
        >
          <LordIcon name="system-regular-63-settings-cog-hover-cog-1" size={20} trigger="hover" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-[12px] font-bold">
                {userInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate capitalize">{userRole}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-all w-full',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

function ActivityItem({ icon, text, time, status }: {
  icon: string
  text: string
  time: string
  status: 'active' | 'success' | 'info'
}) {
  return (
    <div className="flex items-start gap-2.5 py-1">
      <LordIcon
        name={icon}
        size={16}
        trigger={status === 'active' ? 'loop' : 'none'}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-foreground leading-tight truncate">{text}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
      </div>
      <span className={cn(
        'status-dot mt-1',
        status === 'active' && 'status-dot--screening',
        status === 'success' && 'status-dot--active',
        status === 'info' && 'status-dot--pending'
      )} />
    </div>
  )
}
