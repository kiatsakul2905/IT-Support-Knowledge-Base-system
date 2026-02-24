# 🛠 IT Support Knowledge Base

ระบบฐานความรู้ IT Support สร้างด้วย **Next.js 14** + **Neon PostgreSQL**

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd it-support-kb
npm install
```

### 2. Setup Neon Database
1. ไปที่ [neon.tech](https://neon.tech) → สร้าง Project ใหม่
2. Copy Connection String
3. เปิด **SQL Editor** → วาง SQL จากไฟล์ `schema.sql` → Run

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
# แก้ไขค่าใน .env.local
```

ตัวแปรที่ต้องกรอก:
```env
DATABASE_URL="postgresql://..."     # จาก Neon Dashboard
ADMIN_PASSWORD="your-password"      # รหัสผ่าน Admin
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"     # Gmail App Password
SMTP_FROM="IT Support <your@gmail.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Development
```bash
npm run dev
# เปิด http://localhost:3000
```

---

## 📧 Gmail SMTP Setup
1. เปิด [Google Account](https://myaccount.google.com)
2. Security → 2-Step Verification (เปิด)
3. App passwords → สร้าง App Password สำหรับ "Mail"
4. Copy 16-char password ใส่ `SMTP_PASS`

---

## ☁️ Deploy บน Vercel (แนะนำ)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# ตั้งค่า Environment Variables บน Vercel Dashboard
# Settings → Environment Variables → เพิ่มทุกค่าจาก .env.example
```

**Vercel Dashboard URL**: `https://vercel.com/your-team/your-project/settings/environment-variables`

---

## ☁️ Deploy บน Cloudflare Pages
```bash
# Install adapter
npm install -D @cloudflare/next-on-pages

# Build
npx @cloudflare/next-on-pages

# Deploy via Cloudflare Pages Dashboard:
# 1. Connect GitHub repo
# 2. Framework: Next.js
# 3. Build command: npx @cloudflare/next-on-pages
# 4. Output directory: .vercel/output/static
# 5. Add Environment Variables
```

> ⚠️ **หมายเหตุ**: Cloudflare Pages มีข้อจำกัดด้าน Node.js runtime  
> แนะนำให้ใช้ **Vercel** สำหรับ compatibility เต็มรูปแบบ

---

## 📁 Project Structure
```
src/
├── app/
│   ├── page.tsx              # หน้าหลัก (ค้นหา)
│   ├── problems/[id]/        # หน้ารายละเอียดปัญหา
│   ├── report/               # แจ้งปัญหา
│   ├── admin/
│   │   ├── page.tsx          # Dashboard
│   │   ├── problems/         # จัดการปัญหา
│   │   ├── issues/           # ดูการแจ้งปัญหา
│   │   ├── categories/       # จัดการหมวดหมู่
│   │   ├── tags/             # จัดการ Tags
│   │   └── staff/            # จัดการ IT Staff
│   └── api/
│       ├── categories/       # GET categories
│       ├── rate/             # POST rating
│       ├── report/           # POST issue report
│       └── admin/            # Admin CRUD APIs
├── components/               # React components
└── lib/
    ├── db.ts                 # Neon connection
    └── email.ts              # Nodemailer SMTP
```

---

## 🎯 Features
- ✅ ค้นหาปัญหา (Full-text search)
- ✅ แยกหมวดหมู่ + กรอง
- ✅ Tag system
- ✅ Rating (ช่วยได้/ไม่ช่วย)
- ✅ View count
- ✅ Related problems
- ✅ Filter & Sort
- ✅ แจ้งปัญหา + Email notification ทีม IT
- ✅ Admin: เพิ่ม/แก้ไข/ลบปัญหา
- ✅ Admin: จัดการหมวดหมู่, tags, IT staff
- ✅ Admin: Dashboard + ติดตาม issues
