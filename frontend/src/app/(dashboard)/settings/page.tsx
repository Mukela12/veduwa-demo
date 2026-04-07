'use client'

import { useAuth } from '@/components/auth/auth-provider'
import LordIcon from '@/components/ui/lord-icon'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function SettingsPage() {
  const { user } = useAuth()
  const userName = user?.user_metadata?.full_name || 'Demo User'
  const userRole = user?.user_metadata?.role || 'employer'

  return (
    <div className="max-w-[600px] space-y-6">
      <div>
        <h1 className="text-[22px] font-heading font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="clarity-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <LordIcon name="system-regular-63-settings-cog-hover-cog-1" size={20} trigger="hover" />
          <h2 className="text-[15px] font-semibold text-foreground">Profile</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Name</span>
            <span className="text-[13px] text-foreground font-medium">{userName}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Email</span>
            <span className="text-[13px] text-foreground font-medium">{user?.email || 'demo@veduwa.com'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Role</span>
            <span className="badge badge--accent capitalize">{userRole}</span>
          </div>
        </div>
      </div>

      <div className="clarity-card p-5 space-y-4">
        <h2 className="text-[15px] font-semibold text-foreground">Appearance</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] text-foreground">Theme</p>
            <p className="text-[11px] text-muted-foreground">Toggle between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="clarity-card p-5 space-y-4">
        <h2 className="text-[15px] font-semibold text-foreground">Notifications</h2>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <p className="text-[13px] text-foreground">Email notifications</p>
            <p className="text-[11px] text-muted-foreground">New matches and screening results</p>
          </div>
          <div className="w-9 h-5 rounded-full bg-primary relative cursor-pointer">
            <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] right-[3px]" />
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] text-foreground">AI activity updates</p>
            <p className="text-[11px] text-muted-foreground">Parsing, matching, and screening events</p>
          </div>
          <div className="w-9 h-5 rounded-full bg-primary relative cursor-pointer">
            <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] right-[3px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
