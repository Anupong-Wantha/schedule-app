'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  DoorOpen,
  Clock,
  Zap,
  History,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'ตารางเรียน', icon: Calendar },
  { href: '/history', label: 'ประวัติตาราง', icon: History },
  { href: '/teachers', label: 'อาจารย์', icon: GraduationCap },
  { href: '/groups', label: 'กลุ่มเรียน', icon: Users },
  { href: '/subjects', label: 'วิชา', icon: BookOpen },
  { href: '/rooms', label: 'ห้องเรียน', icon: DoorOpen },
  { href: '/timeslots', label: 'ช่วงเวลา', icon: Clock },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 z-30 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0a0a18 0%, #080816 100%)',
        borderRight: '1px solid rgba(99, 99, 160, 0.15)',
      }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b"
        style={{ borderColor: 'rgba(99, 99, 160, 0.15)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00f5d4, #4361ee)' }}>
          <Zap size={16} className="text-black" />
        </div>
        <div>
          <p className="font-display font-700 text-sm leading-none" style={{ color: '#e8e8f0' }}>
            SchedSys
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#5a5a78' }}>
            ระบบตารางเรียน
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'nav-item-active'
                  : 'hover:bg-white/5 text-secondary'
              )}
              style={!isActive ? { color: '#9090b0' } : {}}
            >
              <Icon size={16} className={isActive ? 'text-cyan-400' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(99, 99, 160, 0.15)' }}>
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg"
          style={{ background: 'rgba(0, 245, 212, 0.05)' }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs" style={{ color: '#9090b0' }}>API Connected</span>
        </div>
      </div>
    </aside>
  )
}
