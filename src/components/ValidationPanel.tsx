'use client'
import { useMemo, useState } from 'react'
import { ScheduleEntry, ValidationIssue } from '@/types'
import { validateSchedule, summarizeValidation } from '@/lib/validation'
import { ShieldCheck, ShieldAlert, AlertTriangle, Info, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

interface ValidationPanelProps {
  data: ScheduleEntry[]
  subjectNames?: Record<string, string>
  teacherNames?: Record<string, string>
  groupNames?: Record<string, string>
}

const SEV_CONFIG = {
  error: {
    icon: ShieldAlert,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    badge: 'rgba(239,68,68,0.15)',
    label: 'ข้อผิดพลาด',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    badge: 'rgba(245,158,11,0.15)',
    label: 'คำเตือน',
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    badge: 'rgba(59,130,246,0.12)',
    label: 'ข้อมูล',
  },
}

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SEV_CONFIG[issue.severity]
  const Icon = cfg.icon

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <Icon size={15} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: cfg.badge, color: cfg.color }}
            >
              {cfg.label}
            </span>
            <span className="text-xs font-mono" style={{ color: '#5a5a78' }}>
              {issue.type}
            </span>
          </div>
          <p className="text-sm mt-1 leading-snug" style={{ color: '#e8e8f0' }}>
            {issue.message}
          </p>
        </div>
        {issue.affected.length > 0 && (
          <span style={{ color: '#5a5a78', flexShrink: 0 }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </button>
      {expanded && issue.affected.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {[...new Set(issue.affected)].map((a, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#9090b0', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ValidationPanel({ data, subjectNames = {}, teacherNames = {}, groupNames = {} }: ValidationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')

  const issues = useMemo(
    () => validateSchedule(data, subjectNames, teacherNames, groupNames),
    [data, subjectNames, teacherNames, groupNames]
  )
  const summary = useMemo(() => summarizeValidation(issues), [issues])

  const filtered = filter === 'all' ? issues : issues.filter(i => i.severity === filter)

  const scoreColor = summary.score >= 90 ? '#06d6a0' : summary.score >= 70 ? '#f59e0b' : '#ef4444'
  const scoreLabel = summary.score >= 90 ? 'ดีเยี่ยม' : summary.score >= 70 ? 'พอใช้' : 'ต้องแก้ไข'

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,99,160,0.25)', background: 'rgba(10,10,20,0.7)' }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(99,99,160,0.2)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: '#00f5d4' }} />
            <span className="font-display font-semibold text-sm" style={{ color: '#e8e8f0' }}>
              ตรวจสอบความถูกต้อง
            </span>
          </div>
          {/* Score badge */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}40` }}
            >
              <span className="font-mono font-bold text-lg leading-none" style={{ color: scoreColor }}>
                {summary.score}
              </span>
              <div>
                <div className="text-xs font-semibold leading-none" style={{ color: scoreColor }}>{scoreLabel}</div>
                <div className="text-xs leading-none mt-0.5" style={{ color: '#5a5a78' }}>คะแนน</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary counts */}
        <div className="flex gap-3 mt-3">
          {[
            { key: 'error' as const, count: summary.errors, label: 'ข้อผิดพลาด' },
            { key: 'warning' as const, count: summary.warnings, label: 'คำเตือน' },
            { key: 'info' as const, count: summary.infos, label: 'ข้อมูล' },
          ].map(({ key, count, label }) => {
            const cfg = SEV_CONFIG[key]
            return (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? 'all' : key)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filter === key ? cfg.bg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${filter === key ? cfg.border : 'rgba(255,255,255,0.06)'}`,
                  color: filter === key ? cfg.color : '#9090b0',
                }}
              >
                <span className="font-mono font-bold">{count}</span>
                {label}
              </button>
            )
          })}
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="px-2 py-1 rounded text-xs"
              style={{ color: '#5a5a78' }}
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Issue list */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: '#06d6a0' }} />
            <p className="text-sm font-medium" style={{ color: '#06d6a0' }}>
              {summary.isValid ? 'ไม่พบข้อผิดพลาด ✓' : 'ไม่พบรายการในหมวดนี้'}
            </p>
            {summary.isValid && (
              <p className="text-xs mt-1" style={{ color: '#5a5a78' }}>ตารางเรียนถูกต้องสมบูรณ์</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(issue => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
