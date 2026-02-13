'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { supabase } from '@/lib/supabase'
import { Subject } from '@/types'
import { BookOpen, Search, AlertCircle } from 'lucide-react'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'credit'>('name')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('subject').select('*').order('subject_id')
      setSubjects((data as Subject[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = subjects
    .filter(
      (s) =>
        s.subject_name.toLowerCase().includes(search.toLowerCase()) ||
        s.subject_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'credit') return b.credit - a.credit
      return a.subject_name.localeCompare(b.subject_name, 'th')
    })

  // Credit stats
  const creditGroups = [1, 2, 3, 4].map((c) => ({
    credit: c,
    count: subjects.filter((s) => s.credit === c).length,
  }))
  const totalCredits = subjects.reduce((sum, s) => sum + s.credit, 0)

  return (
    <PageWrapper
      title="วิชา"
      subtitle={`ทั้งหมด ${subjects.length} วิชา`}
    >
      {/* Credit summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {creditGroups.map(({ credit, count }) => (
          <div
            key={credit}
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(13,13,24,0.8)', border: '1px solid rgba(99,99,160,0.2)' }}
          >
            <p className="text-2xl font-display font-bold" style={{ color: '#00f5d4' }}>{count}</p>
            <p className="text-xs mt-1" style={{ color: '#9090b0' }}>{credit} หน่วยกิต</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a78' }} />
          <input
            type="text"
            placeholder="ค้นหาวิชา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(13,13,24,0.9)', border: '1px solid rgba(99,99,160,0.3)', color: '#e8e8f0' }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'credit')}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(13,13,24,0.9)', border: '1px solid rgba(99,99,160,0.3)', color: '#e8e8f0' }}
        >
          <option value="name">เรียงตามชื่อ</option>
          <option value="credit">เรียงตามหน่วยกิต</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#5a5a78' }} />
          <p style={{ color: '#9090b0' }}>ไม่พบข้อมูล</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(99,99,160,0.2)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(13,13,24,0.9)', borderBottom: '1px solid rgba(99,99,160,0.2)' }}>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>รหัสวิชา</th>
                <th className="text-left px-5 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>ชื่อวิชา</th>
                <th className="text-center px-4 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>ทฤษฎี</th>
                <th className="text-center px-4 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>ปฏิบัติ</th>
                <th className="text-center px-4 py-3 font-semibold text-xs" style={{ color: '#5a5a78' }}>หน่วยกิต</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((subject, idx) => (
                <tr
                  key={subject.subject_id}
                  style={{
                    background: idx % 2 === 0 ? 'rgba(13,13,24,0.5)' : 'rgba(13,13,24,0.3)',
                    borderBottom: '1px solid rgba(99,99,160,0.08)',
                  }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: '#4361ee' }}>
                    {subject.subject_id}
                  </td>
                  <td className="px-5 py-3 font-medium" style={{ color: '#e8e8f0' }}>
                    {subject.subject_name}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(67,97,238,0.1)', color: '#7b96ff' }}>
                      {subject.theory}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(0,245,212,0.08)', color: '#00f5d4' }}>
                      {subject.practice}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    <span className="px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#fcd34d' }}>
                      {subject.credit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  )
}
