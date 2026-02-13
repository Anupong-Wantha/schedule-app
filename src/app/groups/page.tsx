'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { supabase } from '@/lib/supabase'
import { StudentGroup } from '@/types'
import { Users, Search, AlertCircle, User } from 'lucide-react'

export default function GroupsPage() {
  const [groups, setGroups] = useState<StudentGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('student_group').select('*').order('group_id')
      setGroups((data as StudentGroup[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = groups.filter(
    (g) =>
      g.group_name.toLowerCase().includes(search.toLowerCase()) ||
      g.group_id.toLowerCase().includes(search.toLowerCase()) ||
      (g.advisor || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalStudents = groups.reduce((sum, g) => sum + (g.student_count || 0), 0)

  return (
    <PageWrapper
      title="กลุ่มเรียน"
      subtitle={`${groups.length} กลุ่ม · ${totalStudents} นักศึกษา`}
    >
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a78' }} />
        <input
          type="text"
          placeholder="ค้นหากลุ่มเรียน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(13,13,24,0.9)', border: '1px solid rgba(99,99,160,0.3)', color: '#e8e8f0' }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#5a5a78' }} />
          <p style={{ color: '#9090b0' }}>ไม่พบข้อมูล</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <div
              key={group.group_id}
              className="card p-5 group-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(114,9,183,0.15)', border: '1px solid rgba(114,9,183,0.3)' }}
                  >
                    <Users size={18} style={{ color: '#c084fc' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#e8e8f0' }}>
                      {group.group_name}
                    </p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#5a5a78' }}>
                      {group.group_id}
                    </p>
                  </div>
                </div>
                {group.student_count != null && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.2)' }}
                  >
                    <User size={12} style={{ color: '#00f5d4' }} />
                    <span className="text-xs font-mono font-bold" style={{ color: '#00f5d4' }}>
                      {group.student_count}
                    </span>
                  </div>
                )}
              </div>
              {group.advisor && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(99,99,160,0.15)' }}>
                  <p className="text-xs" style={{ color: '#9090b0' }}>
                    <span style={{ color: '#5a5a78' }}>ที่ปรึกษา: </span>
                    {group.advisor}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
