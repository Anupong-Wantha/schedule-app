import { ScheduleResponse } from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function generateSchedule(): Promise<ScheduleResponse> {
  const response = await fetch(`${API_BASE}/api/v1/schedule/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(`API error: ${response.statusText}`)
  return response.json()
}

export const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
export const DAY_LABELS: Record<string, string> = {
  Mon: 'จันทร์',
  Tue: 'อังคาร',
  Wed: 'พุธ',
  Thu: 'พฤหัส',
  Fri: 'ศุกร์',
  Sat: 'เสาร์',
  Sun: 'อาทิตย์',
}

export const PERIOD_COLORS = [
  'from-cyan-500/20 to-cyan-400/10 border-cyan-500/40 text-cyan-300',
  'from-blue-500/20 to-blue-400/10 border-blue-500/40 text-blue-300',
  'from-purple-500/20 to-purple-400/10 border-purple-500/40 text-purple-300',
  'from-emerald-500/20 to-emerald-400/10 border-emerald-500/40 text-emerald-300',
  'from-amber-500/20 to-amber-400/10 border-amber-500/40 text-amber-300',
  'from-rose-500/20 to-rose-400/10 border-rose-500/40 text-rose-300',
  'from-indigo-500/20 to-indigo-400/10 border-indigo-500/40 text-indigo-300',
  'from-teal-500/20 to-teal-400/10 border-teal-500/40 text-teal-300',
  'from-orange-500/20 to-orange-400/10 border-orange-500/40 text-orange-300',
  'from-pink-500/20 to-pink-400/10 border-pink-500/40 text-pink-300',
]

export function getSubjectColor(subjectId: string): string {
  let hash = 0
  for (let i = 0; i < subjectId.length; i++) {
    hash = subjectId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PERIOD_COLORS[Math.abs(hash) % PERIOD_COLORS.length]
}
