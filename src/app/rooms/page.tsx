'use client'
import { useState, useEffect } from 'react'
import PageWrapper from '@/components/PageWrapper'
import { supabase } from '@/lib/supabase'
import { Room } from '@/types'
import { DoorOpen, Search, AlertCircle, Building } from 'lucide-react'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('room').select('*').order('room_id')
      setRooms((data as Room[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const types = ['all', ...Array.from(new Set(rooms.map((r) => r.room_type || 'ไม่ระบุ'))).sort()]

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.room_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.room_name || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || (r.room_type || 'ไม่ระบุ') === typeFilter
    return matchSearch && matchType
  })

  const typeColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'lecture': { bg: 'rgba(67,97,238,0.1)', text: '#7b96ff', border: 'rgba(67,97,238,0.3)' },
    'lab': { bg: 'rgba(0,245,212,0.08)', text: '#00f5d4', border: 'rgba(0,245,212,0.25)' },
    'seminar': { bg: 'rgba(114,9,183,0.1)', text: '#c084fc', border: 'rgba(114,9,183,0.3)' },
  }

  function getRoomTypeColor(type: string | null) {
    const key = (type || '').toLowerCase()
    return typeColorMap[key] || { bg: 'rgba(99,99,160,0.1)', text: '#9090b0', border: 'rgba(99,99,160,0.3)' }
  }

  return (
    <PageWrapper
      title="ห้องเรียน"
      subtitle={`ทั้งหมด ${rooms.length} ห้อง`}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a5a78' }} />
          <input
            type="text"
            placeholder="ค้นหาห้องเรียน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(13,13,24,0.9)', border: '1px solid rgba(99,99,160,0.3)', color: '#e8e8f0' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: typeFilter === t ? 'rgba(0,245,212,0.15)' : 'rgba(13,13,24,0.8)',
                border: `1px solid ${typeFilter === t ? 'rgba(0,245,212,0.4)' : 'rgba(99,99,160,0.2)'}`,
                color: typeFilter === t ? '#00f5d4' : '#9090b0',
              }}
            >
              {t === 'all' ? 'ทั้งหมด' : t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => <div key={i} className="h-24 rounded-xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#5a5a78' }} />
          <p style={{ color: '#9090b0' }}>ไม่พบข้อมูล</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((room) => {
            const typeColor = getRoomTypeColor(room.room_type)
            return (
              <div
                key={room.room_id}
                className="card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <Building size={14} style={{ color: '#5a5a78' }} />
                  <span className="font-mono font-bold text-sm" style={{ color: '#00f5d4' }}>
                    {room.room_id}
                  </span>
                </div>
                {room.room_name && (
                  <p className="text-xs" style={{ color: '#9090b0' }}>{room.room_name}</p>
                )}
                {room.room_type && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-md self-start"
                    style={{ background: typeColor.bg, color: typeColor.text, border: `1px solid ${typeColor.border}` }}
                  >
                    {room.room_type}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
