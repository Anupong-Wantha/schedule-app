# 🚀 คู่มือ Deploy — SchedSys

## สารบัญ
- [Deploy Frontend (Next.js)](#-deploy-frontend-nextjs)
- [Deploy Backend (FastAPI/Python)](#-deploy-backend-fastapipython)
- [การตั้งค่า Supabase](#️-การตั้งค่า-supabase)
- [ตัวเลือก Deploy แบบต่าง ๆ](#-ตัวเลือก-deploy)

---

## 🎨 Deploy Frontend (Next.js)

### ตัวเลือกที่ 1: Vercel (แนะนำ — ฟรี + ง่ายที่สุด)

```bash
# 1. ติดตั้ง Vercel CLI
bun add -g vercel

# 2. Build ก่อน deploy (ตรวจ error)
bun run build

# 3. Deploy
vercel

# 4. ตั้งค่า Environment Variables ใน Vercel Dashboard
#    Settings → Environment Variables → Add:
#    NEXT_PUBLIC_SUPABASE_URL  = https://xxx.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
#    NEXT_PUBLIC_API_URL = https://your-backend.com
```

**หรือใช้ GitHub Integration:**
1. Push โค้ดขึ้น GitHub
2. ไปที่ vercel.com → New Project → Import Git Repository
3. ตั้งค่า Environment Variables
4. Click Deploy ✅

---

### ตัวเลือกที่ 2: Netlify

```bash
# Build command
bun run build

# Publish directory
.next

# ตั้งค่า netlify.toml
[build]
  command = "bun run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

### ตัวเลือกที่ 3: Self-hosted (VPS/Ubuntu)

```bash
# 1. Install Node.js & Bun บน server
curl -fsSL https://bun.sh/install | bash

# 2. Clone โปรเจกต์
git clone https://github.com/your/schedule-app.git
cd schedule-app

# 3. ติดตั้ง dependencies
bun install

# 4. สร้างไฟล์ .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://your-backend.com
EOF

# 5. Build
bun run build

# 6. Start (production)
bun start
# Server จะรันที่ port 3000

# 7. ใช้ PM2 ให้รันตลอด
npm install -g pm2
pm2 start "bun start" --name schedule-frontend
pm2 save
pm2 startup
```

**Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### ตัวเลือกที่ 4: Docker (Frontend)

```dockerfile
# Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build & run
docker build -t schedule-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  -e NEXT_PUBLIC_API_URL=https://your-backend.com \
  schedule-frontend
```

---

## 🐍 Deploy Backend (FastAPI/Python)

### ตัวเลือกที่ 1: Railway (แนะนำ — ฟรี tier มี)

```bash
# 1. ติดตั้ง Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init project
railway init

# 4. Deploy
railway up

# 5. ตั้งค่า Environment Variables ใน Railway Dashboard
#    PORT=8000
#    DATABASE_URL=...
```

---

### ตัวเลือกที่ 2: Render (ฟรี tier + ง่าย)

1. ไปที่ render.com → New → Web Service
2. Connect GitHub repository
3. ตั้งค่า:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables
5. Deploy ✅

---

### ตัวเลือกที่ 3: Self-hosted (Ubuntu VPS)

```bash
# 1. ติดตั้ง Python + dependencies
sudo apt update
sudo apt install python3 python3-pip python3-venv -y

# 2. Clone โปรเจกต์
git clone https://github.com/your/schedule-backend.git
cd schedule-backend

# 3. สร้าง virtual environment
python3 -m venv venv
source venv/bin/activate

# 4. ติดตั้ง dependencies
pip install -r requirements.txt

# 5. ตั้งค่า .env
cat > .env << EOF
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
EOF

# 6. Test run
uvicorn main:app --host 0.0.0.0 --port 8000

# 7. ใช้ PM2 หรือ systemd
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name schedule-backend
pm2 save
```

**systemd service:**
```ini
# /etc/systemd/system/schedule-backend.service
[Unit]
Description=Schedule Backend API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/schedule-backend
Environment="PATH=/home/ubuntu/schedule-backend/venv/bin"
ExecStart=/home/ubuntu/schedule-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable schedule-backend
sudo systemctl start schedule-backend
```

**Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # CORS headers (ถ้า backend ยังไม่จัดการ)
        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
```

---

### ตัวเลือกที่ 4: Docker (Backend)

```dockerfile
# Dockerfile.backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Docker Compose (Frontend + Backend รวมกัน)

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./schedule-backend
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    restart: unless-stopped

  frontend:
    build:
      context: ./schedule-app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🗄️ การตั้งค่า Supabase

### 1. สร้าง Supabase Project

1. ไปที่ supabase.com → New Project
2. ตั้งชื่อ project และ database password
3. เลือก region ที่ใกล้ที่สุด (Singapore สำหรับไทย)

### 2. สร้าง Tables (SQL Editor)

```sql
-- Teacher
CREATE TABLE teacher (
  teacher_id VARCHAR PRIMARY KEY,
  teacher_name TEXT NOT NULL,
  role TEXT
);

-- Subject
CREATE TABLE subject (
  subject_id VARCHAR PRIMARY KEY,
  subject_name TEXT NOT NULL,
  theory INTEGER DEFAULT 0,
  practice INTEGER DEFAULT 0,
  credit INTEGER DEFAULT 0
);

-- Student Group
CREATE TABLE student_group (
  group_id VARCHAR PRIMARY KEY,
  group_name TEXT NOT NULL,
  student_count INTEGER,
  advisor TEXT
);

-- Room
CREATE TABLE room (
  room_id VARCHAR PRIMARY KEY,
  room_name TEXT,
  room_type TEXT
);

-- Timeslot
CREATE TABLE timeslot (
  timeslot_id SERIAL PRIMARY KEY,
  day VARCHAR,
  period INTEGER,
  start TIME,
  "end" TIME
);

-- Register (group-subject)
CREATE TABLE register (
  group_id VARCHAR REFERENCES student_group(group_id),
  subject_id VARCHAR REFERENCES subject(subject_id),
  PRIMARY KEY (group_id, subject_id)
);

-- Teach (teacher-subject)
CREATE TABLE teach (
  teacher_id VARCHAR REFERENCES teacher(teacher_id),
  subject_id VARCHAR REFERENCES subject(subject_id),
  PRIMARY KEY (teacher_id, subject_id)
);
```

### 3. ตั้งค่า Row Level Security (RLS)

```sql
-- Allow read-only access (สำหรับ frontend)
ALTER TABLE teacher ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON teacher FOR SELECT USING (true);

ALTER TABLE subject ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON subject FOR SELECT USING (true);

ALTER TABLE student_group ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON student_group FOR SELECT USING (true);

ALTER TABLE room ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON room FOR SELECT USING (true);

ALTER TABLE timeslot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON timeslot FOR SELECT USING (true);
```

### 4. หา API Keys

ไปที่ Settings → API:
- **URL:** `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔧 ตัวเลือก Deploy

| | Vercel | Render | Railway | Self-hosted |
|---|---|---|---|---|
| ราคา | ฟรี (hobby) | ฟรี (spin-down) | $5/month | VPS ~$5/month |
| ความง่าย | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| ความเร็ว | เร็วมาก | ปานกลาง | ดี | ขึ้นกับ VPS |
| Custom domain | ✅ | ✅ | ✅ | ✅ |
| SSL | อัตโนมัติ | อัตโนมัติ | อัตโนมัติ | ต้องตั้งเอง |
| เหมาะกับ | Frontend | Full-stack | Full-stack | Production |

### 🎯 คำแนะนำสำหรับเริ่มต้น

```
Frontend  → Vercel       (ฟรี, deploy จาก GitHub อัตโนมัติ)
Backend   → Render       (ฟรี tier, deploy Python ได้ง่าย)
Database  → Supabase     (ฟรี tier, PostgreSQL managed)
```

---

## ✅ Checklist ก่อน Go-Live

- [ ] ตั้งค่า Environment Variables ครบ
- [ ] ทดสอบ CORS ระหว่าง frontend ↔ backend
- [ ] เปิด Row Level Security ใน Supabase
- [ ] ใช้ HTTPS (SSL certificate)
- [ ] ตั้งค่า custom domain
- [ ] ทดสอบ Generate Schedule ใน production
- [ ] ทดสอบ Export CSV/Excel/PDF
