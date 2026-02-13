# SchedSys — ระบบตารางเรียน

Frontend Next.js สำหรับระบบจัดตารางเรียนอัตโนมัติ พร้อม Dashboard จาก Supabase

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS 3**
- **Supabase** (PostgreSQL database)
- **Bun** (package manager & runtime)
- **TypeScript**

## Setup

### 1. ติดตั้ง Dependencies

```bash
bun install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` จาก template:

```bash
cp .env.local.example .env.local
```

แก้ไขค่าใน `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. รัน Development Server

```bash
bun dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### 4. Build Production

```bash
bun run build
bun start
```

## Pages

| Path | Description |
|------|-------------|
| `/` | Dashboard - ภาพรวมระบบ |
| `/schedule` | ตารางเรียน - Generate และดูตาราง |
| `/teachers` | รายชื่ออาจารย์ |
| `/groups` | กลุ่มเรียน |
| `/subjects` | รายวิชา |
| `/rooms` | ห้องเรียน |
| `/timeslots` | ช่วงเวลาเรียน |

## API Integration

### Generate Schedule

```
POST http://127.0.0.1:8000/api/v1/schedule/generate
```

ปุ่ม "Generate Schedule" ใน `/schedule` จะเรียก API นี้และแสดงผลตารางเรียนอัตโนมัติ

## Supabase Tables

ระบบต้องการ tables ต่อไปนี้:

- `teacher` - ข้อมูลอาจารย์
- `subject` - ข้อมูลวิชา
- `student_group` - ข้อมูลกลุ่มเรียน
- `room` - ข้อมูลห้องเรียน
- `timeslot` - ช่วงเวลาเรียน
- `register` - การลงทะเบียน
- `teach` - อาจารย์ที่สอนวิชา
