'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { supabase } from '@/lib/supabase'
import { Timeslot } from '@/types'
import { Clock, AlertCircle } from 'lucide-react'
import { DAYS_ORDER, DAY_LABELS } from '@/lib/api'

export default function TimeslotsPage() {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('timeslot').select('*').order('timeslot_id')
      setTimeslots((data as Timeslot[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  // Group by day
  const byDay: Record<string, Timeslot[]> = {}
  timeslots.forEach((t) => {
    const day = t.day || 'ไม่ระบุ'
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(t)
  })

  const orderedDays = [
    ...DAYS_ORDER.filter((d) => byDay[d]),
    ...Object.keys(byDay).filter((d) => !DAYS_ORDER.includes(d)),
  ]

  return (
    <PageWrapper
      title="ช่วงเวลาเรียน"
      subtitle={`${timeslots.length} ช่วงเวลา`}
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}
        </div>
      ) : timeslots.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#5a5a78' }} />
          <p style={{ color: '#9090b0' }}>ไม่พบข้อมูล</p>
        </div>
      ) : orderedDays.length > 0 ? (
        <div className="space-y-6">
          {orderedDays.map((day) => (
            <div key={day}
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(99,99,160,0.2)' }}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: 'rgba(0,245,212,0.05)', borderBottom: '1px solid rgba(99,99,160,0.15)' }}>
                <Clock size={14} style={{ color: '#00f5d4' }} />
                <span className="font-display font-semibold text-sm" style={{ color: '#00f5d4' }}>
                  {DAY_LABELS[day] || day}
                </span>
                <span className="text-xs ml-auto" style={{ color: '#5a5a78' }}>
                  {byDay[day].length} คาบ
                </span>
              </div>
              <div className="divide-y divide-[rgba(99,99,160,0.08)]">
                {byDay[day]
                  .sort((a, b) => (a.period || 0) - (b.period || 0))
                  .map((slot) => (
                    <div key={slot.timeslot_id}
                      className="flex items-center px-5 py-3 hover:bg-white/5 transition-colors">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm mr-4 flex-shrink-0"
                        style={{ background: 'rgba(67,97,238,0.15)', color: '#7b96ff' }}>
                        {slot.period}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#e8e8f0' }}>
                          คาบที่ {slot.period}
                        </p>
                        <p className="text-xs font-mono" style={{ color: '#5a5a78' }}>
                          {slot.start || '—'} – {slot.end || '—'}
                        </p>
                      </div>
                      <div className="ml-auto text-xs font-mono px-2 py-1 rounded"
                        style={{ background: 'rgba(255,255,255,0.03)', color: '#5a5a78', border: '1px solid rgba(255,255,255,0.06)' }}>
                        ID: {slot.timeslot_id}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(99,99,160,0.2)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(13,13,24,0.9)', borderBottom: '1px solid rgba(99,99,160,0.2)' }}>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>ID</th>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>วัน</th>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>คาบ</th>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>เวลาเริ่ม</th>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>เวลาสิ้นสุด</th>
              </tr>
            </thead>
            <tbody>
              {timeslots.map((slot, idx) => (
                <tr key={slot.timeslot_id}
                  style={{ background: idx % 2 === 0 ? 'rgba(13,13,24,0.5)' : 'rgba(13,13,24,0.3)', borderBottom: '1px solid rgba(99,99,160,0.08)' }}>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: '#4361ee' }}>{slot.timeslot_id}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: '#00f5d4' }}>{DAY_LABELS[slot.day || ''] || slot.day || '—'}</td>
                  <td className="px-5 py-3 text-sm font-mono" style={{ color: '#e8e8f0' }}>{slot.period || '—'}</td>
                  <td className="px-5 py-3 text-sm font-mono" style={{ color: '#9090b0' }}>{slot.start || '—'}</td>
                  <td className="px-5 py-3 text-sm font-mono" style={{ color: '#9090b0' }}>{slot.end || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  )
}
