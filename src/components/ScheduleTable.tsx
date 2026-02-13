'use client'
import { useState } from 'react'
import { ScheduleEntry } from '@/types'
import { DAYS_ORDER, DAY_LABELS } from '@/lib/api'

interface ScheduleTableProps {
  data: ScheduleEntry[]
  subjectNames?: Record<string, string>
  teacherNames?: Record<string, string>
  groupNames?: Record<string, string>
  title?: string
  filterGroup?: string
}

// คาบ + เวลา (ตรงตามภาพ)
const ALL_PERIODS: { period: number; time: string; isBreak?: boolean }[] = [
  { period: 1,  time: '08:00-09:00' },
  { period: 2,  time: '09:00-10:00' },
  { period: 3,  time: '10:00-11:00' },
  { period: 4,  time: '11:00-12:00' },
  { period: 5,  time: '12:00-13:00', isBreak: true },
  { period: 6,  time: '13:00-14:00' },
  { period: 7,  time: '14:00-15:00' },
  { period: 8,  time: '15:00-16:00' },
  { period: 9,  time: '16:00-17:00' },
  { period: 10, time: '17:00-18:00' },
  { period: 11, time: '18:00-19:00' },
  { period: 12, time: '19:00-20:00' },
]

// สีประจำวิชา (hash-based, consistent)
const SUBJECT_PALETTE = [
  { bg: 'rgba(67,97,238,0.18)',   border: 'rgba(67,97,238,0.45)',   text: '#a5b4fc' },
  { bg: 'rgba(0,245,212,0.12)',   border: 'rgba(0,245,212,0.4)',    text: '#67e8f9' },
  { bg: 'rgba(114,9,183,0.15)',   border: 'rgba(114,9,183,0.45)',   text: '#d8b4fe' },
  { bg: 'rgba(6,214,160,0.14)',   border: 'rgba(6,214,160,0.4)',    text: '#6ee7b7' },
  { bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.4)',   text: '#fcd34d' },
  { bg: 'rgba(239,68,68,0.14)',   border: 'rgba(239,68,68,0.35)',   text: '#fca5a5' },
  { bg: 'rgba(16,185,129,0.14)',  border: 'rgba(16,185,129,0.4)',   text: '#6ee7b7' },
  { bg: 'rgba(59,130,246,0.16)',  border: 'rgba(59,130,246,0.4)',   text: '#93c5fd' },
  { bg: 'rgba(236,72,153,0.14)',  border: 'rgba(236,72,153,0.4)',   text: '#f9a8d4' },
  { bg: 'rgba(251,146,60,0.14)',  border: 'rgba(251,146,60,0.4)',   text: '#fdba74' },
]

function getColor(subjectId: string) {
  let hash = 0
  for (let i = 0; i < subjectId.length; i++) {
    hash = subjectId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length]
}

interface TooltipProps {
  entry: ScheduleEntry
  subjectNames?: Record<string, string>
  teacherNames?: Record<string, string>
  groupNames?: Record<string, string>
}

function Tooltip({ entry, subjectNames, teacherNames, groupNames }: TooltipProps) {
  return (
    <div
      className="absolute z-50 bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-52 rounded-xl p-3 text-xs shadow-2xl pointer-events-none"
      style={{
        background: 'rgba(8,8,20,0.97)',
        border: '1px solid rgba(0,245,212,0.35)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <p className="font-semibold mb-2 leading-snug" style={{ color: '#00f5d4' }}>
        {subjectNames?.[entry.subject] || entry.subject}
      </p>
      <div className="space-y-1" style={{ color: '#9090b0' }}>
        <div className="flex gap-2">
          <span style={{ color: '#5a5a78' }}>รหัส</span>
          <span className="font-mono" style={{ color: '#e8e8f0' }}>{entry.subject}</span>
        </div>
        <div className="flex gap-2">
          <span style={{ color: '#5a5a78' }}>อาจารย์</span>
          <span style={{ color: '#e8e8f0' }}>{teacherNames?.[entry.teacher] || entry.teacher}</span>
        </div>
        <div className="flex gap-2">
          <span style={{ color: '#5a5a78' }}>ห้อง</span>
          <span style={{ color: '#e8e8f0' }}>{entry.room}</span>
        </div>
        {groupNames?.[entry.group] && (
          <div className="flex gap-2">
            <span style={{ color: '#5a5a78' }}>กลุ่ม</span>
            <span style={{ color: '#e8e8f0' }}>{groupNames[entry.group]}</span>
          </div>
        )}
      </div>
      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-3 h-3 rotate-45"
        style={{ background: 'rgba(8,8,20,0.97)', border: 'right 1px solid rgba(0,245,212,0.35)', borderRight: '1px solid rgba(0,245,212,0.35)', borderBottom: '1px solid rgba(0,245,212,0.35)' }}
      />
    </div>
  )
}

export default function ScheduleTable({
  data,
  subjectNames,
  teacherNames,
  groupNames,
  title,
  filterGroup,
}: ScheduleTableProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const filteredData = filterGroup ? data.filter((e) => e.group === filterGroup) : data

  // Build cell map: day-period -> entries[]
  const cellMap: Record<string, ScheduleEntry[]> = {}
  filteredData.forEach((entry) => {
    const key = `${entry.day}-${entry.period}`
    if (!cellMap[key]) cellMap[key] = []
    cellMap[key].push(entry)
  })

  // Get used days (row headers)
  const usedDays = [...new Set(filteredData.map((e) => e.day))]
  const days = DAYS_ORDER.filter((d) => usedDays.includes(d))

  // Get max period used
  const usedPeriods = filteredData.map((e) => e.period)
  const maxPeriod = usedPeriods.length > 0 ? Math.max(...usedPeriods) : 7
  const periods = ALL_PERIODS.filter((p) => p.period <= Math.max(maxPeriod, 7))

  if (days.length === 0) {
    return (
      <div className="text-center py-12 text-sm" style={{ color: '#5a5a78' }}>
        ไม่มีข้อมูลตารางเรียน
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {title && (
        <h3 className="font-display font-semibold text-sm mb-3" style={{ color: '#e8e8f0' }}>
          {title}
        </h3>
      )}

      <table
        style={{
          borderCollapse: 'separate',
          borderSpacing: '0',
          width: '100%',
          fontSize: '11px',
        }}
      >
        {/* ===== HEADER ROW 1: time labels ===== */}
        <thead>
          <tr>
            {/* corner cell */}
            <th
              rowSpan={2}
              style={{
                background: 'rgba(10,10,28,0.9)',
                border: '1px solid rgba(99,99,160,0.25)',
                padding: '6px 10px',
                color: '#5a5a78',
                fontWeight: 600,
                fontSize: '10px',
                whiteSpace: 'nowrap',
                minWidth: 72,
                verticalAlign: 'middle',
                textAlign: 'center',
              }}
            >
              ก่อนคาบ
            </th>
            {periods.map(({ period, time, isBreak }) => (
              <th
                key={period}
                style={{
                  background: isBreak
                    ? 'rgba(99,99,160,0.12)'
                    : 'rgba(10,10,28,0.9)',
                  border: '1px solid rgba(99,99,160,0.25)',
                  padding: '5px 4px',
                  color: isBreak ? '#5a5a78' : '#9090b0',
                  fontWeight: 400,
                  fontSize: '10px',
                  textAlign: 'center',
                  minWidth: isBreak ? 52 : 88,
                  whiteSpace: 'nowrap',
                }}
              >
                {isBreak ? '' : time}
              </th>
            ))}
          </tr>

          {/* ===== HEADER ROW 2: period numbers ===== */}
          <tr>
            {periods.map(({ period, isBreak }) => (
              <th
                key={period}
                style={{
                  background: isBreak
                    ? 'rgba(99,99,160,0.12)'
                    : 'rgba(0,245,212,0.06)',
                  border: '1px solid rgba(99,99,160,0.25)',
                  padding: '5px 4px',
                  color: isBreak ? '#5a5a78' : '#00f5d4',
                  fontWeight: 700,
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                {isBreak ? 'พัก' : period}
              </th>
            ))}
          </tr>
        </thead>

        {/* ===== BODY: one row per day ===== */}
        <tbody>
          {days.map((day, dayIdx) => (
            <tr key={day}>
              {/* Day label cell */}
              <td
                style={{
                  background: dayIdx % 2 === 0 ? 'rgba(0,245,212,0.05)' : 'rgba(67,97,238,0.05)',
                  border: '1px solid rgba(99,99,160,0.25)',
                  padding: '0 10px',
                  color: dayIdx % 2 === 0 ? '#00f5d4' : '#7b96ff',
                  fontWeight: 700,
                  fontSize: '12px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                }}
              >
                {DAY_LABELS[day] || day}
              </td>

              {/* Period cells */}
              {periods.map(({ period, isBreak }) => {
                if (isBreak) {
                  return (
                    <td
                      key={period}
                      style={{
                        background: 'rgba(99,99,160,0.08)',
                        border: '1px solid rgba(99,99,160,0.2)',
                        textAlign: 'center',
                        color: '#5a5a78',
                        fontWeight: 500,
                        fontSize: '11px',
                        verticalAlign: 'middle',
                        padding: '4px 2px',
                      }}
                    >
                      พัก
                    </td>
                  )
                }

                const key = `${day}-${period}`
                const entries = cellMap[key] || []

                return (
                  <td
                    key={period}
                    style={{
                      border: '1px solid rgba(99,99,160,0.2)',
                      padding: '3px',
                      verticalAlign: 'top',
                      background: entries.length > 0 ? 'transparent' : 'rgba(255,255,255,0.008)',
                    }}
                  >
                    {entries.length === 0 ? null : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {entries.map((entry, idx) => {
                          const color = getColor(entry.subject)
                          const tooltipKey = `${key}-${idx}`
                          return (
                            <div
                              key={idx}
                              onMouseEnter={() => setHovered(tooltipKey)}
                              onMouseLeave={() => setHovered(null)}
                              style={{
                                position: 'relative',
                                background: color.bg,
                                border: `1px solid ${color.border}`,
                                borderRadius: 6,
                                padding: '5px 6px',
                                cursor: 'pointer',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                transform: hovered === tooltipKey ? 'scale(1.03)' : 'scale(1)',
                                boxShadow: hovered === tooltipKey
                                  ? `0 4px 16px ${color.border}`
                                  : 'none',
                              }}
                            >
                              {/* Subject code */}
                              <div style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontWeight: 600,
                                fontSize: '10px',
                                color: color.text,
                                lineHeight: 1.2,
                                marginBottom: 2,
                              }}>
                                {entry.subject}
                              </div>
                              {/* Teacher */}
                              <div style={{
                                fontSize: '10px',
                                color: color.text,
                                opacity: 0.75,
                                lineHeight: 1.2,
                              }}>
                                {teacherNames?.[entry.teacher] || entry.teacher}
                              </div>
                              {/* Room */}
                              <div style={{
                                fontSize: '10px',
                                color: color.text,
                                opacity: 0.6,
                                lineHeight: 1.2,
                              }}>
                                [{entry.room}]
                              </div>

                              {/* Tooltip */}
                              {hovered === tooltipKey && (
                                <Tooltip
                                  entry={entry}
                                  subjectNames={subjectNames}
                                  teacherNames={teacherNames}
                                  groupNames={groupNames}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
