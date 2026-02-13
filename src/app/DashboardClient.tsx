'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PageWrapper from '@/components/PageWrapper'
import StatCard from '@/components/StatCard'
import {
  Users, BookOpen, GraduationCap, DoorOpen, Calendar,
  TrendingUp, RefreshCw, CheckCircle, AlertCircle
} from 'lucide-react'
import { DashboardStats, Teacher, Subject, StudentGroup, Room } from '@/types'

interface ActivityItem {
  id: string
  type: 'teacher' | 'subject' | 'group' | 'room'
  name: string
  detail: string
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalSubjects: 0,
    totalTeachers: 0,
    totalRooms: 0,
    scheduleCount: 0,
  })
  const [recentTeachers, setRecentTeachers] = useState<Teacher[]>([])
  const [recentSubjects, setRecentSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function fetchData() {
    setLoading(true)
    try {
      const [teachersRes, subjectsRes, groupsRes, roomsRes] = await Promise.all([
        supabase.from('teacher').select('*'),
        supabase.from('subject').select('*'),
        supabase.from('student_group').select('*'),
        supabase.from('room').select('*'),
      ])

      const teachers = (teachersRes.data as Teacher[]) || []
      const subjects = (subjectsRes.data as Subject[]) || []
      const groups = (groupsRes.data as StudentGroup[]) || []
      const rooms = (roomsRes.data as Room[]) || []

      setStats({
        totalTeachers: teachers.length,
        totalSubjects: subjects.length,
        totalGroups: groups.length,
        totalRooms: rooms.length,
        scheduleCount: 0,
      })

      setRecentTeachers(teachers.slice(0, 5))
      setRecentSubjects(subjects.slice(0, 5))
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Credit distribution
  const creditDist = [1, 2, 3, 4].map(c => ({
    credit: c,
    count: recentSubjects.filter(s => s.credit === c).length,
  }))

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="ภาพรวมระบบตารางเรียน"
      actions={
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs" style={{ color: '#5a5a78' }}>
              อัปเดต {lastUpdated.toLocaleTimeString('th-TH')}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(0, 245, 212, 0.1)',
              border: '1px solid rgba(0, 245, 212, 0.3)',
              color: '#00f5d4',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            รีเฟรช
          </button>
        </div>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="อาจารย์ทั้งหมด"
          value={stats.totalTeachers}
          subtitle="ในระบบ"
          icon={GraduationCap}
          color="cyan"
          loading={loading}
        />
        <StatCard
          title="วิชาทั้งหมด"
          value={stats.totalSubjects}
          subtitle="หลักสูตร"
          icon={BookOpen}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="กลุ่มเรียน"
          value={stats.totalGroups}
          subtitle="กลุ่มนักศึกษา"
          icon={Users}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="ห้องเรียน"
          value={stats.totalRooms}
          subtitle="ห้องทั้งหมด"
          icon={DoorOpen}
          color="green"
          loading={loading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Teachers */}
        <div
          className="rounded-xl p-5 lg:col-span-1"
          style={{
            background: 'rgba(13,13,24,0.8)',
            border: '1px solid rgba(99,99,160,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm" style={{ color: '#e8e8f0' }}>
              รายชื่ออาจารย์
            </h2>
            <GraduationCap size={16} style={{ color: '#5a5a78' }} />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg shimmer" />
              ))}
            </div>
          ) : recentTeachers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={24} className="mx-auto mb-2" style={{ color: '#5a5a78' }} />
              <p className="text-xs" style={{ color: '#5a5a78' }}>ไม่พบข้อมูล</p>
              <p className="text-xs mt-1" style={{ color: '#3a3a58' }}>ตรวจสอบการเชื่อมต่อ Supabase</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTeachers.map((teacher) => (
                <div
                  key={teacher.teacher_id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(67, 97, 238, 0.2)', color: '#7b96ff' }}
                  >
                    {teacher.teacher_id.replace('T', '')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>
                      {teacher.teacher_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#5a5a78' }}>
                      {teacher.role || 'อาจารย์'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Subjects */}
        <div
          className="rounded-xl p-5 lg:col-span-2"
          style={{
            background: 'rgba(13,13,24,0.8)',
            border: '1px solid rgba(99,99,160,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm" style={{ color: '#e8e8f0' }}>
              รายวิชา
            </h2>
            <BookOpen size={16} style={{ color: '#5a5a78' }} />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg shimmer" />
              ))}
            </div>
          ) : recentSubjects.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle size={24} className="mx-auto mb-2" style={{ color: '#5a5a78' }} />
              <p className="text-xs" style={{ color: '#5a5a78' }}>ไม่พบข้อมูล</p>
              <p className="text-xs mt-1" style={{ color: '#3a3a58' }}>ตรวจสอบการเชื่อมต่อ Supabase</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSubjects.map((subject) => (
                <div
                  key={subject.subject_id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: '#e8e8f0' }}>
                        {subject.subject_name}
                      </p>
                    </div>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#5a5a78' }}>
                      {subject.subject_id}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(67,97,238,0.15)', color: '#7b96ff' }}
                    >
                      {subject.theory}T
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(0,245,212,0.1)', color: '#00f5d4' }}
                    >
                      {subject.practice}P
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(255,214,10,0.1)', color: '#fcd34d' }}
                    >
                      {subject.credit}cr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="mt-6 rounded-xl p-4 flex items-center gap-3"
        style={{
          background: 'rgba(6,214,160,0.05)',
          border: '1px solid rgba(6,214,160,0.15)',
        }}>
        <CheckCircle size={16} style={{ color: '#06d6a0' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#06d6a0' }}>
            Supabase Connection
          </p>
          <p className="text-xs" style={{ color: '#5a5a78' }}>
            ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
