import { ScheduleEntry, ValidationIssue } from '@/types'

let _issueCounter = 0
function makeId() { return `issue-${++_issueCounter}` }

export function validateSchedule(
  data: ScheduleEntry[],
  subjectNames: Record<string, string> = {},
  teacherNames: Record<string, string> = {},
  groupNames: Record<string, string> = {}
): ValidationIssue[] {
  _issueCounter = 0
  const issues: ValidationIssue[] = []

  // ── 1. Teacher double-booked (same day+period, different groups) ──────────
  const teacherSlots = new Map<string, ScheduleEntry[]>()
  data.forEach(e => {
    const key = `${e.teacher}__${e.day}__${e.period}`
    if (!teacherSlots.has(key)) teacherSlots.set(key, [])
    teacherSlots.get(key)!.push(e)
  })
  teacherSlots.forEach((entries, key) => {
    if (entries.length > 1) {
      const [teacherId, day, period] = key.split('__')
      const groupList = [...new Set(entries.map(e => groupNames[e.group] || e.group))]
      issues.push({
        id: makeId(),
        severity: 'error',
        type: 'teacher_conflict',
        message: `อาจารย์ ${teacherNames[teacherId] || teacherId} สอนซ้ำกัน วัน${day} คาบ ${period} (${groupList.join(', ')})`,
        affected: entries.map(e => e.teacher),
      })
    }
  })

  // ── 2. Room double-booked (same day+period, different groups) ─────────────
  const roomSlots = new Map<string, ScheduleEntry[]>()
  data.forEach(e => {
    const key = `${e.room}__${e.day}__${e.period}`
    if (!roomSlots.has(key)) roomSlots.set(key, [])
    roomSlots.get(key)!.push(e)
  })
  roomSlots.forEach((entries, key) => {
    if (entries.length > 1) {
      const [room, day, period] = key.split('__')
      const groups = [...new Set(entries.map(e => groupNames[e.group] || e.group))]
      issues.push({
        id: makeId(),
        severity: 'error',
        type: 'room_conflict',
        message: `ห้อง ${room} ถูกใช้ซ้ำ วัน${day} คาบ ${period} (${groups.join(', ')})`,
        affected: entries.map(e => e.room),
      })
    }
  })

  // ── 3. Group double-booked (same day+period, 2+ different subjects) ────────
  const groupSlots = new Map<string, ScheduleEntry[]>()
  data.forEach(e => {
    const key = `${e.group}__${e.day}__${e.period}`
    if (!groupSlots.has(key)) groupSlots.set(key, [])
    groupSlots.get(key)!.push(e)
  })
  groupSlots.forEach((entries, key) => {
    const uniqueSubjects = [...new Set(entries.map(e => e.subject))]
    if (uniqueSubjects.length > 1) {
      const [group, day, period] = key.split('__')
      issues.push({
        id: makeId(),
        severity: 'error',
        type: 'group_conflict',
        message: `กลุ่ม ${groupNames[group] || group} มีวิชาซ้อนกัน วัน${day} คาบ ${period}`,
        affected: [group],
      })
    }
  })

  // ── 4. Missing data: no teacher ───────────────────────────────────────────
  const noTeacher = data.filter(e => !e.teacher || e.teacher.trim() === '')
  if (noTeacher.length > 0) {
    issues.push({
      id: makeId(),
      severity: 'error',
      type: 'missing_teacher',
      message: `พบ ${noTeacher.length} รายการที่ไม่มีอาจารย์`,
      affected: noTeacher.map(e => e.subject),
    })
  }

  // ── 5. Missing data: no room ──────────────────────────────────────────────
  const noRoom = data.filter(e => !e.room || e.room.trim() === '')
  if (noRoom.length > 0) {
    issues.push({
      id: makeId(),
      severity: 'error',
      type: 'missing_room',
      message: `พบ ${noRoom.length} รายการที่ไม่มีห้องเรียน`,
      affected: noRoom.map(e => e.subject),
    })
  }

  // ── 6. Warning: subjects with unusually many periods per week ─────────────
  const subjectPeriods = new Map<string, number>()
  data.forEach(e => {
    const key = `${e.group}__${e.subject}`
    subjectPeriods.set(key, (subjectPeriods.get(key) || 0) + 1)
  })
  subjectPeriods.forEach((count, key) => {
    if (count > 8) {
      const [group, subject] = key.split('__')
      issues.push({
        id: makeId(),
        severity: 'warning',
        type: 'heavy_load',
        message: `วิชา ${subjectNames[subject] || subject} ของกลุ่ม ${groupNames[group] || group} มี ${count} คาบ/สัปดาห์ (มากผิดปกติ)`,
        affected: [subject, group],
      })
    }
  })

  // ── 7. Warning: teacher with many periods ─────────────────────────────────
  const teacherLoad = new Map<string, number>()
  data.forEach(e => {
    teacherLoad.set(e.teacher, (teacherLoad.get(e.teacher) || 0) + 1)
  })
  teacherLoad.forEach((count, teacher) => {
    if (count > 20) {
      issues.push({
        id: makeId(),
        severity: 'warning',
        type: 'teacher_overload',
        message: `อาจารย์ ${teacherNames[teacher] || teacher} สอนรวม ${count} คาบ/สัปดาห์ (เกินเกณฑ์ปกติ)`,
        affected: [teacher],
      })
    }
  })

  // ── 8. Info: weekend classes ──────────────────────────────────────────────
  const weekend = data.filter(e => e.day === 'Sat' || e.day === 'Sun')
  if (weekend.length > 0) {
    const days = [...new Set(weekend.map(e => e.day))]
    issues.push({
      id: makeId(),
      severity: 'info',
      type: 'weekend_class',
      message: `มีการเรียนวันหยุดสุดสัปดาห์ ${weekend.length} คาบ (${days.join(', ')})`,
      affected: [...new Set(weekend.map(e => e.group))],
    })
  }

  // ── 9. Info: period 5 (break) used ────────────────────────────────────────
  const breakPeriod = data.filter(e => e.period === 5)
  if (breakPeriod.length > 0) {
    issues.push({
      id: makeId(),
      severity: 'info',
      type: 'break_period_used',
      message: `มีการจัดคาบเรียนในช่วงพัก (คาบ 5 / 12:00-13:00) จำนวน ${breakPeriod.length} รายการ`,
      affected: [...new Set(breakPeriod.map(e => e.group))],
    })
  }

  return issues
}

export interface ValidationSummary {
  errors: number
  warnings: number
  infos: number
  isValid: boolean
  score: number // 0-100
}

export function summarizeValidation(issues: ValidationIssue[]): ValidationSummary {
  const errors = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const infos = issues.filter(i => i.severity === 'info').length
  const score = Math.max(0, 100 - errors * 15 - warnings * 5 - infos * 1)
  return { errors, warnings, infos, isValid: errors === 0, score }
}
