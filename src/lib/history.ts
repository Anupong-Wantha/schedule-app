import { SavedSchedule, ScheduleEntry } from '@/types'

const STORAGE_KEY = 'schedsy_history'
const MAX_SAVED = 20

export function getSavedSchedules(): SavedSchedule[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveSchedule(
  data: ScheduleEntry[],
  status: string,
  name?: string
): SavedSchedule {
  const existing = getSavedSchedules()
  const now = new Date()
  const id = `sched_${now.getTime()}`
  const defaultName = `ตาราง ${now.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`

  const entry: SavedSchedule = {
    id,
    name: name || defaultName,
    createdAt: now.toISOString(),
    entryCount: data.length,
    status,
    data,
  }

  const updated = [entry, ...existing].slice(0, MAX_SAVED)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    // Storage full — remove oldest
    const trimmed = [entry, ...existing].slice(0, MAX_SAVED - 5)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }
  return entry
}

export function deleteSchedule(id: string): void {
  const existing = getSavedSchedules()
  const updated = existing.filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function renameSchedule(id: string, name: string): void {
  const existing = getSavedSchedules()
  const updated = existing.map(s => s.id === id ? { ...s, name } : s)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
