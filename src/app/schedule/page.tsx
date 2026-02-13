'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import ScheduleTable from '@/components/ScheduleTable'
import ValidationPanel from '@/components/ValidationPanel'
import { supabase } from '@/lib/supabase'
import { ScheduleEntry, Subject, Teacher, StudentGroup } from '@/types'
import { generateSchedule } from '@/lib/api'
import { saveSchedule } from '@/lib/history'
import { exportCSV, exportExcel, exportPDF } from '@/lib/export'
import {
  Zap, Loader2, CheckCircle2, AlertCircle, Filter,
  Printer, Download, ShieldCheck, Calendar, ChevronDown
} from 'lucide-react'

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([])
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [subjects, setSubjects] = useState<Record<string, string>>({})
  const [teachers, setTeachers] = useState<Record<string, string>>({})
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'table' | 'validation'>('table')
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    async function loadMeta() {
      const [s, t, g] = await Promise.all([
        supabase.from('subject').select('subject_id, subject_name'),
        supabase.from('teacher').select('teacher_id, teacher_name'),
        supabase.from('student_group').select('*'),
      ])
      const sm: Record<string, string> = {}
      ;(s.data as Subject[] || []).forEach((x: Subject) => { sm[x.subject_id] = x.subject_name })
      setSubjects(sm)
      const tm: Record<string, string> = {}
      ;(t.data as Teacher[] || []).forEach((x: Teacher) => { tm[x.teacher_id] = x.teacher_name })
      setTeachers(tm)
      setGroups((g.data as StudentGroup[]) || [])
    }
    loadMeta()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    setStatus(null)
    try {
      const result = await generateSchedule()
      setScheduleData(result.schedule_data)
      setStatus({ type: 'success', message: result.message })
      saveSchedule(result.schedule_data, result.message)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถสร้างตารางได้'
      setStatus({ type: 'error', message })
    } finally {
      setGenerating(false)
    }
  }

  async function handleExport(fmt: 'csv' | 'xlsx' | 'pdf') {
    setExporting(true)
    setShowExportMenu(false)
    const fname = `schedule_${new Date().toISOString().slice(0, 10)}`
    try {
      if (fmt === 'csv') exportCSV(scheduleData, subjects, teachers, groupNames, fname)
      else if (fmt === 'xlsx') await exportExcel(scheduleData, subjects, teachers, groupNames, fname)
      else exportPDF('ตารางเรียน')
    } finally {
      setExporting(false)
    }
  }

  const scheduleGroups = [...new Set(scheduleData.map(e => e.group))].sort()
  const groupNames: Record<string, string> = {}
  groups.forEach(g => { groupNames[g.group_id] = g.group_name })

  return (
    <PageWrapper
      title="ตารางเรียน"
      subtitle="สร้างและจัดการตารางเรียน"
      actions={
        <div className="flex items-center gap-2">
          {scheduleData.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowExportMenu(v => !v)} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'rgba(99,99,160,0.12)', border: '1px solid rgba(99,99,160,0.3)', color: '#9090b0' }}>
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Export <ChevronDown size={12} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 min-w-[160px]"
                  style={{ background: 'rgba(10,10,22,0.98)', border: '1px solid rgba(99,99,160,0.35)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  {([
                    { fmt: 'csv', label: 'CSV', color: '#7b96ff', desc: 'plain text' },
                    { fmt: 'xlsx', label: 'Excel', color: '#06d6a0', desc: 'หลายชีท/กลุ่ม' },
                    { fmt: 'pdf', label: 'PDF', color: '#ef4444', desc: 'พิมพ์/บันทึก' },
                  ] as const).map(({ fmt, label, color, desc }) => (
                    <button key={fmt} onClick={() => handleExport(fmt)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left">
                      <span className="font-mono font-bold text-xs w-12 px-1.5 py-0.5 rounded text-center"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>{label}</span>
                      <span style={{ color: '#9090b0' }}>{desc}</span>
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(99,99,160,0.2)' }}>
                    <button onClick={() => { setShowExportMenu(false); window.print() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left">
                      <Printer size={14} style={{ color: '#9090b0' }} />
                      <span style={{ color: '#9090b0' }}>พิมพ์</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: generating ? 'rgba(0,245,212,0.1)' : 'linear-gradient(135deg, #00f5d4, #4361ee)',
              color: generating ? '#00f5d4' : '#000',
              border: '1px solid rgba(0,245,212,0.3)',
              cursor: generating ? 'not-allowed' : 'pointer',
            }}>
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {generating ? 'กำลังสร้าง...' : 'Generate Schedule'}
          </button>
        </div>
      }
    >
      {showExportMenu && <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />}

      {status && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: status.type === 'success' ? 'rgba(6,214,160,0.08)' : 'rgba(239,35,60,0.08)',
            border: `1px solid ${status.type === 'success' ? 'rgba(6,214,160,0.3)' : 'rgba(239,35,60,0.3)'}`,
            color: status.type === 'success' ? '#06d6a0' : '#ef4444',
          }}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {status.message}
          <span className="ml-auto font-mono text-xs opacity-60">{scheduleData.length} รายการ · บันทึกแล้ว</span>
        </div>
      )}

      {scheduleData.length === 0 && !generating && (
        <div className="text-center py-20 rounded-xl"
          style={{ background: 'rgba(13,13,24,0.5)', border: '1px dashed rgba(99,99,160,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.2)' }}>
            <Zap size={28} style={{ color: '#00f5d4' }} />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#e8e8f0' }}>ยังไม่มีตารางเรียน</h3>
          <p className="text-sm mb-6" style={{ color: '#5a5a78' }}>กดปุ่ม Generate Schedule เพื่อสร้างตารางเรียนอัตโนมัติ</p>
          <button onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00f5d4, #4361ee)', color: '#000' }}>
            <Zap size={16} /> สร้างตารางเรียน
          </button>
        </div>
      )}

      {generating && (
        <div className="text-center py-20">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#00f5d4' }} />
          <p className="text-sm" style={{ color: '#9090b0' }}>กำลังสร้างตารางเรียน...</p>
          <p className="text-xs mt-1" style={{ color: '#5a5a78' }}>อาจใช้เวลาสักครู่</p>
        </div>
      )}

      {scheduleData.length > 0 && !generating && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,99,160,0.15)' }}>
              {([
                { id: 'table', label: 'ตารางเรียน', icon: Calendar },
                { id: 'validation', label: 'ตรวจสอบ', icon: ShieldCheck },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === id ? 'rgba(0,245,212,0.12)' : 'transparent',
                    color: activeTab === id ? '#00f5d4' : '#9090b0',
                    border: activeTab === id ? '1px solid rgba(0,245,212,0.3)' : '1px solid transparent',
                  }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {activeTab === 'table' && (
              <>
                <div className="flex items-center gap-2 ml-2">
                  <Filter size={13} style={{ color: '#5a5a78' }} />
                  <span className="text-sm" style={{ color: '#9090b0' }}>กลุ่ม:</span>
                </div>
                <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm font-medium outline-none"
                  style={{ background: 'rgba(13,13,24,0.9)', border: '1px solid rgba(99,99,160,0.3)', color: '#e8e8f0' }}>
                  <option value="all">ทุกกลุ่ม</option>
                  {scheduleGroups.map(g => <option key={g} value={g}>{groupNames[g] || g}</option>)}
                </select>
                <span className="text-xs font-mono px-2 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#5a5a78' }}>
                  {selectedGroup === 'all' ? scheduleData.length : scheduleData.filter(e => e.group === selectedGroup).length} รายการ
                </span>
              </>
            )}
          </div>

          {activeTab === 'table' && (
            <div id="schedule-print-area">
              {selectedGroup === 'all' ? (
                <div className="space-y-10">
                  {scheduleGroups.map(grp => (
                    <div key={grp} className="rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(99,99,160,0.25)', background: 'rgba(10,10,20,0.6)' }}>
                      <div className="px-5 py-3 text-center font-display font-bold text-sm"
                        style={{ background: 'rgba(0,245,212,0.06)', borderBottom: '1px solid rgba(99,99,160,0.25)', color: '#e8e8f0', letterSpacing: '0.02em' }}>
                        ตารางเรียน: {groupNames[grp] || grp}
                        <span className="ml-3 text-xs font-mono font-normal" style={{ color: '#5a5a78' }}>({grp})</span>
                      </div>
                      <div className="p-4">
                        <ScheduleTable data={scheduleData} filterGroup={grp}
                          subjectNames={subjects} teacherNames={teachers} groupNames={groupNames} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(99,99,160,0.25)', background: 'rgba(10,10,20,0.6)' }}>
                  <div className="px-5 py-3 text-center font-display font-bold text-sm"
                    style={{ background: 'rgba(0,245,212,0.06)', borderBottom: '1px solid rgba(99,99,160,0.25)', color: '#e8e8f0', letterSpacing: '0.02em' }}>
                    ตารางเรียน: {groupNames[selectedGroup] || selectedGroup}
                  </div>
                  <div className="p-4">
                    <ScheduleTable data={scheduleData} filterGroup={selectedGroup}
                      subjectNames={subjects} teacherNames={teachers} groupNames={groupNames} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <ValidationPanel data={scheduleData} subjectNames={subjects}
              teacherNames={teachers} groupNames={groupNames} />
          )}
        </>
      )}
    </PageWrapper>
  )
}
