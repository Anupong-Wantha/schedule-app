'use client'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'cyan' | 'blue' | 'purple' | 'green' | 'amber' | 'rose'
  loading?: boolean
}

const colorMap = {
  cyan: {
    bg: 'rgba(0, 245, 212, 0.08)',
    border: 'rgba(0, 245, 212, 0.2)',
    icon: '#00f5d4',
    glow: 'rgba(0, 245, 212, 0.1)',
    text: '#00f5d4',
  },
  blue: {
    bg: 'rgba(67, 97, 238, 0.08)',
    border: 'rgba(67, 97, 238, 0.2)',
    icon: '#4361ee',
    glow: 'rgba(67, 97, 238, 0.1)',
    text: '#7b96ff',
  },
  purple: {
    bg: 'rgba(114, 9, 183, 0.08)',
    border: 'rgba(114, 9, 183, 0.2)',
    icon: '#9b5cf6',
    glow: 'rgba(114, 9, 183, 0.1)',
    text: '#c084fc',
  },
  green: {
    bg: 'rgba(6, 214, 160, 0.08)',
    border: 'rgba(6, 214, 160, 0.2)',
    icon: '#06d6a0',
    glow: 'rgba(6, 214, 160, 0.1)',
    text: '#34d399',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    icon: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.1)',
    text: '#fcd34d',
  },
  rose: {
    bg: 'rgba(239, 35, 60, 0.08)',
    border: 'rgba(239, 35, 60, 0.2)',
    icon: '#ef4444',
    glow: 'rgba(239, 35, 60, 0.1)',
    text: '#fb7185',
  },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color, loading }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-default"
      style={{
        background: `linear-gradient(135deg, ${c.bg}, rgba(13,13,24,0.8))`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px ${c.glow}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon size={20} style={{ color: c.icon }} />
        </div>
        {!loading && (
          <span className="text-3xl font-display font-bold" style={{ color: c.text }}>
            {value}
          </span>
        )}
        {loading && (
          <div className="h-8 w-20 rounded shimmer" />
        )}
      </div>
      <p className="text-sm font-medium" style={{ color: '#e8e8f0' }}>{title}</p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: '#5a5a78' }}>{subtitle}</p>
      )}
    </div>
  )
}
