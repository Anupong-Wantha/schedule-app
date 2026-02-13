'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import ScheduleTable from '@/components/ScheduleTable'
import ValidationPanel from '@/components/ValidationPanel'
import { supabase } from '@/lib/supabase'
import { SavedSchedule, Subject, Teacher, StudentGroup } from '@/types'
import { getSavedSchedules, deleteSchedule, renameSchedule, clearHistory } from '@/lib/history'
import {
  History, Eye, Trash2, Edit3, CheckCircle2, AlertCircle,
  Calendar, Clock, FileText, Inbox, ShieldCheck, Download, RotateCcw
} from 'lucide-react'
import { exportCSV, exportExcel, exportPDF } from '@/lib/export'

export default function HistoryPage() {
  const [saved, setSaved] = useState<SavedSchedule[]>([])
  const [selected, setSelected] = useState<SavedSchedule | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [subjects, setSubjects] = useState<Record<string, string>>({})
  const [teachers, setTeachers] = useState<Record<string, string>>({})
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [activeTab, setActiveTab] = useState<'table' | 'validation'>('table')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    setSaved(getSavedSchedules())

    async function loadMeta() {
      const [s, t, g] = await Promise.all([
        supabase.from('subject').select('subject_id, subject_name'),
        supabase.from('teacher').select('teacher_id, teacher_name'),
        supabase.from('student_group').select('*'),
      ])
      const sm: Record<string, string> = {}
      ;(s.data as Subject[] || []).forEach(x => { sm[x.subject_id] = x.subject_name })
      setSubjects(sm)
      const tm: Record<string, string> = {}
      ;(t.data as Teacher[] || []).forEach(x => { tm[x.teacher_id] = x.teacher_name })
      setTeachers(tm)
      setGroups((g.data as StudentGroup[]) || [])
    }
    loadMeta()
  }, [])

  const groupNames: Record<string, string> = {}
  groups.forEach(g => { groupNames[g.group_id] = g.group_name })

  function handleDelete(id: string) {
    deleteSchedule(id)
    setSaved(getSavedSchedules())
    if (selected?.id === id) setSelected(null)
  }

  function handleRename(id: string) {
    renameSchedule(id, renameVal)
    setSaved(getSavedSchedules())
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, name: renameVal } : null)
    }
    setRenaming(null)
  }

  function handleClearAll() {
    clearHistory()
    setSaved([])
    setSelected(null)
    setConfirmClear(false)
  }

  const scheduleGroups = selected ? [...new Set(selected.data.map(e => e.group))].sort() : []

  async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    if (!selected) return
    setExporting(true)
    const fname = selected.name.replace(/[^a-zA-Z0-9ก-๙]/g, '_').slice(0, 40)
    try {
      if (format === 'csv') exportCSV(selected.data, subjects, teachers, groupNames, fname)
      else if (format === 'xlsx') await exportExcel(selected.data, subjects, teachers, groupNames, fname)
      else exportPDF(selected.name)
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageWrapper
      title="ประวัติตารางเรียน"
      subtitle={`${saved.length} ตารางที่บันทึกไว้`}
      actions={
        saved.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#ef4444' }}>ยืนยันลบทั้งหมด?</span>
              <button onClick={handleClearAll}
                className="px-3 py-1.5 rounded text-xs font-medium"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                ยืนยัน
              </button>
              <button onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded text-xs" style={{ color: '#5a5a78' }}>
                ยกเลิก
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <RotateCcw size={12} /> ล้างประวัติ
            </button>
          )
        )
      }
    >
      <div className="flex gap-6 h-[calc(100vh-140px)]">
        {/* ── Left panel: list ────────────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {saved.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 rounded-xl"
              style={{ border: '1px dashed rgba(99,99,160,0.2)' }}>
              <Inbox size={32} className="mb-3" style={{ color: '#5a5a78' }} />
              <p className="text-sm" style={{ color: '#9090b0' }}>ยังไม่มีตารางที่บันทึก</p>
              <p className="text-xs mt-1" style={{ color: '#5a5a78' }}>สร้างตารางจากหน้า Schedule</p>
            </div>
          ) : (
            saved.map(s => (
              <div
                key={s.id}
                onClick={() => { setSelected(s); setSelectedGroup('all') }}
                className="rounded-xl p-3.5 cursor-pointer transition-all"
                style={{
                  background: selected?.id === s.id ? 'rgba(0,245,212,0.08)' : 'rgba(13,13,24,0.8)',
                  border: `1px solid ${selected?.id === s.id ? 'rgba(0,245,212,0.35)' : 'rgba(99,99,160,0.2)'}`,
                }}
              >
                {renaming === s.id ? (
                  <div className="flex gap-2 mb-2" onClick={e => e.stopPropagation()}>
                    <input
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(s.id)}
                      autoFocus
                      className="flex-1 text-xs rounded px-2 py-1 outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#e8e8f0', border: '1px solid rgba(0,245,212,0.4)' }}
                    />
                    <button onClick={() => handleRename(s.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'rgba(0,245,212,0.15)', color: '#00f5d4' }}>
                      ✓
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: '#e8e8f0' }}>
                      {s.name}
                    </p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setRenaming(s.id); setRenameVal(s.name) }}
                        className="p-1 rounded hover:bg-white/10 transition-colors" style={{ color: '#5a5a78' }}>
                        <Edit3 size={11} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(s.id) }}
                        className="p-1 rounded hover:bg-red-500/20 transition-colors" style={{ color: '#5a5a78' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs" style={{ color: '#5a5a78' }}>
                  <span className="flex items-center gap-1">
                    <FileText size={10} /> {s.entryCount} รายการ
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(s.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                    {' '}
                    {new Date(s.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: s.status.includes('OPTIMAL') ? 'rgba(6,214,160,0.12)' : 'rgba(245,158,11,0.1)',
                      color: s.status.includes('OPTIMAL') ? '#06d6a0' : '#f59e0b',
                    }}>
                    {s.status.includes('OPTIMAL') ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                    {s.status.replace('Schedule found (', '').replace(')', '')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right panel: detail ─────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl"
              style={{ border: '1px dashed rgba(99,99,160,0.2)' }}>
              <Eye size={32} className="mb-3" style={{ color: '#5a5a78' }} />
              <p className="text-sm" style={{ color: '#9090b0' }}>เลือกตารางจากรายการซ้ายมือ</p>
            </div>
          ) : (
            <>
              {/* Detail header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-display font-bold text-base" style={{ color: '#e8e8f0' }}>{selected.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#5a5a78' }}>
                    {new Date(selected.createdAt).toLocaleString('th-TH')} · {selected.entryCount} รายการ
                  </p>
                </div>

                {/* Export buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#5a5a78' }}>Export:</span>
                  {(['csv', 'xlsx', 'pdf'] as const).map(fmt => (
                    <button key={fmt} onClick={() => handleExport(fmt)} disabled={exporting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                      style={{
                        background: fmt === 'xlsx' ? 'rgba(6,214,160,0.1)' : fmt === 'pdf' ? 'rgba(239,68,68,0.1)' : 'rgba(67,97,238,0.1)',
                        border: `1px solid ${fmt === 'xlsx' ? 'rgba(6,214,160,0.3)' : fmt === 'pdf' ? 'rgba(239,68,68,0.3)' : 'rgba(67,97,238,0.3)'}`,
                        color: fmt === 'xlsx' ? '#06d6a0' : fmt === 'pdf' ? '#ef4444' : '#7b96ff',
                      }}>
                      <Download size={11} />
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl self-start"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,99,160,0.15)' }}>
                {[
                  { id: 'table', label: 'ตารางเรียน', icon: Calendar },
                  { id: 'validation', label: 'ตรวจสอบ', icon: ShieldCheck },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id as typeof activeTab)}
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

              {/* Tab content */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'table' ? (
                  <>
                    {/* Group filter */}
                    <div className="flex items-center gap-2 mb-4">
                      <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: 'rgba(13,13,24,0.9)', border: '1px solid rgba(99,99,160,0.3)', color: '#e8e8f0' }}>
                        <option value="all">ทุกกลุ่ม</option>
                        {scheduleGroups.map(g => (
                          <option key={g} value={g}>{groupNames[g] || g}</option>
                        ))}
                      </select>
                    </div>

                    {selectedGroup === 'all' ? (
                      <div className="space-y-8" id="schedule-print-area">
                        {scheduleGroups.map(grp => (
                          <div key={grp} className="rounded-xl overflow-hidden"
                            style={{ border: '1px solid rgba(99,99,160,0.25)', background: 'rgba(10,10,20,0.6)' }}>
                            <div className="px-5 py-2.5 text-center font-semibold text-sm"
                              style={{ background: 'rgba(0,245,212,0.06)', borderBottom: '1px solid rgba(99,99,160,0.25)', color: '#e8e8f0' }}>
                              ตารางเรียน: {groupNames[grp] || grp}
                            </div>
                            <div className="p-4">
                              <ScheduleTable data={selected.data} filterGroup={grp}
                                subjectNames={subjects} teacherNames={teachers} groupNames={groupNames} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(99,99,160,0.25)', background: 'rgba(10,10,20,0.6)' }}>
                        <div className="px-5 py-2.5 text-center font-semibold text-sm"
                          style={{ background: 'rgba(0,245,212,0.06)', borderBottom: '1px solid rgba(99,99,160,0.25)', color: '#e8e8f0' }}>
                          ตารางเรียน: {groupNames[selectedGroup] || selectedGroup}
                        </div>
                        <div className="p-4">
                          <ScheduleTable data={selected.data} filterGroup={selectedGroup}
                            subjectNames={subjects} teacherNames={teachers} groupNames={groupNames} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <ValidationPanel data={selected.data} subjectNames={subjects}
                    teacherNames={teachers} groupNames={groupNames} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
