export interface ScheduleEntry {
  group: string;
  subject: string;
  teacher: string;
  room: string;
  day: string;
  period: number;
}

export interface ScheduleResponse {
  status: string;
  message: string;
  schedule_data: ScheduleEntry[];
}

export interface Room {
  room_id: string;
  room_name: string | null;
  room_type: string | null;
}

export interface StudentGroup {
  group_id: string;
  group_name: string;
  student_count: number | null;
  advisor: string | null;
}

export interface Subject {
  subject_id: string;
  subject_name: string;
  theory: number;
  practice: number;
  credit: number;
}

export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  role: string | null;
}

export interface Timeslot {
  timeslot_id: number;
  day: string | null;
  period: number | null;
  start: string | null;
  end: string | null;
}

export interface DashboardStats {
  totalGroups: number;
  totalSubjects: number;
  totalTeachers: number;
  totalRooms: number;
  scheduleCount: number;
}

export interface SavedSchedule {
  id: string;
  name: string;
  createdAt: string;
  entryCount: number;
  status: string;
  data: ScheduleEntry[];
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  type: string;
  message: string;
  affected: string[];
}
