'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { supabase } from '@/lib/supabase'
import { Teacher } from '@/types'
import { GraduationCap, Search, AlertCircle, UserCheck } from 'lucide-react'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('teacher').select('*').order('teacher_id')
      setTeachers((data as Teacher[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = teachers.filter(
    (t) =>
      t.teacher_name.toLowerCase().includes(search.toLowerCase()) ||
      t.teacher_id.toLowerCase().includes(search.toLowerCase()) ||
      (t.role || '').toLowerCase().includes(search.toLowerCase())
  )

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    professor: { bg: 'rgba(0,245,212,0.1)', text: '#00f5d4', border: 'rgba(0,245,212,0.3)' },
    lecturer: { bg: 'rgba(67,97,238,0.1)', text: '#7b96ff', border: 'rgba(67,97,238,0.3)' },
    instructor: { bg: 'rgba(114,9,183,0.1)', text: '#c084fc', border: 'rgba(114,9,183,0.3)' },
  }

  function getRoleColor(role: string | null) {
    const key = (role || '').toLowerCase()
    return roleColors[key] || { bg: 'rgba(99,99,160,0.1)', text: '#9090b0', border: 'rgba(99,99,160,0.3)' }
  }

  return (
    <PageWrapper
      title="อาจารย์"
      subtitle={`ทั้งหมด ${teachers.length} คน`}
    >
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a78' }} />
        <input
          type="text"
          placeholder="ค้นหาอาจารย์..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(13,13,24,0.9)',
            border: '1px solid rgba(99,99,160,0.3)',
            color: '#e8e8f0',
          }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#5a5a78' }} />
          <p style={{ color: '#9090b0' }}>ไม่พบข้อมูล</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((teacher) => {
            const roleColor = getRoleColor(teacher.role)
            return (
              <div
                key={teacher.teacher_id}
                className="card p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(67,97,238,0.15)', color: '#7b96ff', border: '1px solid rgba(67,97,238,0.3)' }}
                  >
                    {teacher.teacher_id.replace('T', '')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate" style={{ color: '#e8e8f0' }}>
                      {teacher.teacher_name}
                    </p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#5a5a78' }}>
                      {teacher.teacher_id}
                    </p>
                  </div>
                </div>
                {teacher.role && (
                  <div className="mt-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium"
                      style={{ background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}` }}
                    >
                      {teacher.role}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
