'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
import LordIcon from '@/components/ui/lord-icon'
import { cn } from '@/lib/utils'

const dockItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'system-regular-41-home-hover-home' },
  { label: 'Jobs', path: '/jobs', icon: 'system-regular-42-search-hover-pinch' },
  { label: 'Post', path: '/dashboard/post', icon: 'system-regular-314-plus-hover-pinch' },
  { label: 'Screening', path: '/screening', icon: 'system-regular-186-chat-empty-hover-chat' },
  { label: 'Candidates', path: '/candidates', icon: 'system-regular-96-groups-hover-groups' },
]

export default function MobileDock() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 md:hidden flex justify-center">
      <Dock
        magnification={56}
        distance={100}
        panelHeight={52}
        spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
        className="shadow-lg"
      >
        {dockItems.map((item) => {
          const active = item.path === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.path)

          return (
            <DockItem key={item.path}>
              <DockLabel>{item.label}</DockLabel>
              <DockIcon>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center justify-center w-full h-full rounded-xl transition-colors',
                    active ? 'bg-primary/10' : 'hover:bg-surface-hover'
                  )}
                >
                  <LordIcon
                    name={item.icon}
                    size={22}
                    trigger="hover"
                    className={active ? 'lordicon-primary' : ''}
                  />
                </Link>
              </DockIcon>
            </DockItem>
          )
        })}
      </Dock>
    </div>
  )
}
