import { ScheduleEntry } from '@/types'
import { DAY_LABELS } from './api'

const PERIOD_TIMES: Record<number, string> = {
  1: '08:00-09:00', 2: '09:00-10:00', 3: '10:00-11:00', 4: '11:00-12:00',
  5: '12:00-13:00', 6: '13:00-14:00', 7: '14:00-15:00', 8: '15:00-16:00',
  9: '16:00-17:00', 10: '17:00-18:00', 11: '18:00-19:00', 12: '19:00-20:00',
}

// ─── CSV ──────────────────────────────────────────────────────────────────────
export function exportCSV(
  data: ScheduleEntry[],
  subjectNames: Record<string, string>,
  teacherNames: Record<string, string>,
  groupNames: Record<string, string>,
  filename = 'schedule'
) {
  const header = ['กลุ่ม', 'ชื่อกลุ่ม', 'รหัสวิชา', 'ชื่อวิชา', 'รหัสอาจารย์', 'ชื่ออาจารย์', 'ห้อง', 'วัน', 'คาบ', 'เวลา']
  const rows = data.map(e => [
    e.group,
    groupNames[e.group] || e.group,
    e.subject,
    subjectNames[e.subject] || e.subject,
    e.teacher,
    teacherNames[e.teacher] || e.teacher,
    e.room,
    DAY_LABELS[e.day] || e.day,
    String(e.period),
    PERIOD_TIMES[e.period] || '',
  ])

  const csvContent = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '\uFEFF' // UTF-8 BOM for Thai characters in Excel
  downloadBlob(new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
}

// ─── Excel (XLSX via SheetJS CDN) ────────────────────────────────────────────
export async function exportExcel(
  data: ScheduleEntry[],
  subjectNames: Record<string, string>,
  teacherNames: Record<string, string>,
  groupNames: Record<string, string>,
  filename = 'schedule'
) {
  // Dynamically load SheetJS
  const XLSX = await loadXLSX()

  const header = ['กลุ่ม', 'ชื่อกลุ่ม', 'รหัสวิชา', 'ชื่อวิชา', 'รหัสอาจารย์', 'ชื่ออาจารย์', 'ห้อง', 'วัน', 'คาบ', 'เวลา']
  const rows = data.map(e => [
    e.group,
    groupNames[e.group] || e.group,
    e.subject,
    subjectNames[e.subject] || e.subject,
    e.teacher,
    teacherNames[e.teacher] || e.teacher,
    e.room,
    DAY_LABELS[e.day] || e.day,
    e.period,
    PERIOD_TIMES[e.period] || '',
  ])

  const wb = XLSX.utils.book_new()

  // Sheet 1: Raw data
  const ws1 = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws1['!cols'] = header.map((_, i) => ({ wch: [10, 20, 14, 30, 12, 25, 10, 10, 6, 14][i] || 14 }))
  XLSX.utils.book_append_sheet(wb, ws1, 'ตารางเรียนทั้งหมด')

  // Sheet per group
  const groups = [...new Set(data.map(e => e.group))].sort()
  for (const grp of groups) {
    const grpData = data.filter(e => e.group === grp)
    const grpRows = grpData.map(e => [
      e.subject,
      subjectNames[e.subject] || e.subject,
      e.teacher,
      teacherNames[e.teacher] || e.teacher,
      e.room,
      DAY_LABELS[e.day] || e.day,
      e.period,
      PERIOD_TIMES[e.period] || '',
    ])
    const grpHeader = ['รหัสวิชา', 'ชื่อวิชา', 'รหัสอาจารย์', 'ชื่ออาจารย์', 'ห้อง', 'วัน', 'คาบ', 'เวลา']
    const ws = XLSX.utils.aoa_to_sheet([grpHeader, ...grpRows])
    ws['!cols'] = grpHeader.map((_, i) => ({ wch: [14, 30, 12, 25, 10, 10, 6, 14][i] || 14 }))
    const sheetName = (groupNames[grp] || grp).slice(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ─── PDF (print-to-PDF via browser) ─────────────────────────────────────────
export function exportPDF(groupTitle: string) {
  const style = document.createElement('style')
  style.id = '__pdf_print_style__'
  style.textContent = `
    @media print {
      body > * { display: none !important; }
      #__pdf_print_area__ { display: block !important; }
      @page { size: A4 landscape; margin: 10mm; }
    }
  `
  document.head.appendChild(style)

  const printArea = document.getElementById('schedule-print-area')
  if (!printArea) { window.print(); return }

  const clone = printArea.cloneNode(true) as HTMLElement
  clone.id = '__pdf_print_area__'
  clone.style.display = 'block'
  clone.style.color = '#000'
  clone.style.background = '#fff'
  document.body.appendChild(clone)

  window.print()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(clone)
    document.head.removeChild(style)
  }, 1000)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function loadXLSX() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).XLSX) return (window as any).XLSX
  return new Promise<any>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    script.onload = () => resolve((window as any).XLSX)
    script.onerror = reject
    document.head.appendChild(script)
  })
}
