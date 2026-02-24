-- IT Support Knowledge Base - Neon PostgreSQL Schema
-- Run this in your Neon SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(300) NOT NULL,
  symptoms TEXT NOT NULL,
  cause TEXT NOT NULL,
  solution TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem-Tags junction table
CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (problem_id, tag_id)
);

-- IT Staff emails (for notifications)
CREATE TABLE IF NOT EXISTS it_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User issue reports
CREATE TABLE IF NOT EXISTS issue_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_name VARCHAR(100) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  reporter_department VARCHAR(100),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES it_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings (helpful/not helpful per session)
CREATE TABLE IF NOT EXISTS problem_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  session_id VARCHAR(100) NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(problem_id, session_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category_id);
CREATE INDEX IF NOT EXISTS idx_problems_created ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_views ON problems(views DESC);
CREATE INDEX IF NOT EXISTS idx_problem_tags_problem ON problem_tags(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_tags_tag ON problem_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports(status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_created ON issue_reports(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_problems_fts ON problems 
  USING GIN(to_tsvector('english', title || ' ' || symptoms || ' ' || cause || ' ' || solution));

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issue_reports_updated_at BEFORE UPDATE ON issue_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA - Sample categories, tags, IT staff, problems
-- ============================================================

INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Hardware', 'hardware', 'ปัญหาเกี่ยวกับอุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์', '#EF4444', 'cpu'),
  ('Software', 'software', 'ปัญหาเกี่ยวกับโปรแกรมและซอฟต์แวร์', '#3B82F6', 'code'),
  ('Network', 'network', 'ปัญหาเกี่ยวกับเครือข่ายและอินเทอร์เน็ต', '#10B981', 'wifi'),
  ('Printer', 'printer', 'ปัญหาเกี่ยวกับเครื่องพิมพ์', '#F59E0B', 'printer'),
  ('Email', 'email', 'ปัญหาเกี่ยวกับอีเมลและการสื่อสาร', '#8B5CF6', 'mail'),
  ('Security', 'security', 'ปัญหาด้านความปลอดภัยและไวรัส', '#DC2626', 'shield')
ON CONFLICT DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('windows11', 'windows11'), ('windows10', 'windows10'), ('wifi', 'wifi'),
  ('printer', 'printer'), ('outlook', 'outlook'), ('excel', 'excel'),
  ('word', 'word'), ('vpn', 'vpn'), ('bluetooth', 'bluetooth'),
  ('slow', 'slow'), ('crash', 'crash'), ('virus', 'virus'),
  ('password', 'password'), ('driver', 'driver'), ('update', 'update')
ON CONFLICT DO NOTHING;

INSERT INTO it_staff (name, email) VALUES
  ('IT Support Team', 'it-support@company.com'),
  ('Network Admin', 'network@company.com'),
  ('System Admin', 'sysadmin@company.com')
ON CONFLICT DO NOTHING;

-- Sample problems
WITH cat AS (SELECT id, slug FROM categories)
INSERT INTO problems (title, symptoms, cause, solution, category_id) VALUES
(
  'คอมพิวเตอร์ทำงานช้ามากหรือค้าง',
  'เครื่องทำงานช้า, โปรแกรมเปิดนานผิดปกติ, หน้าจอค้าง, CPU usage สูง 100%',
  'RAM ไม่เพียงพอ, มีโปรแกรม startup มากเกินไป, มัลแวร์, HDD เก่าหรือเต็ม',
  '1. เปิด Task Manager (Ctrl+Shift+Esc) ตรวจสอบโปรแกรมที่ใช้ CPU/RAM สูง
2. ปิดโปรแกรมที่ไม่จำเป็น
3. ตรวจสอบ Startup Programs: Task Manager > Startup tab > Disable ที่ไม่จำเป็น
4. Run Disk Cleanup: พิมพ์ "Disk Cleanup" ใน Start Menu
5. สแกนไวรัสด้วย Windows Defender
6. หาก HDD เต็ม ให้ย้ายไฟล์ไปที่อื่นหรือลบไฟล์ที่ไม่ต้องการ
7. พิจารณาเพิ่ม RAM หากยังช้าอยู่',
  (SELECT id FROM cat WHERE slug = 'hardware')
),
(
  'ไม่สามารถเชื่อมต่อ WiFi ได้',
  'WiFi ไม่แสดงในรายการ, เชื่อมต่อแล้วแต่ไม่มีอินเทอร์เน็ต, สัญญาณขาดๆ หายๆ',
  'Driver WiFi มีปัญหา, IP conflict, Router มีปัญหา, DNS ไม่ถูกต้อง',
  '1. ลอง Restart เครื่องและ Router ก่อน
2. Windows Settings > Network & Internet > ลืม WiFi แล้วเชื่อมต่อใหม่
3. เปิด Command Prompt (Admin) รัน:
   - ipconfig /release
   - ipconfig /flushdns
   - ipconfig /renew
4. อัพเดต WiFi Driver: Device Manager > Network Adapters
5. Reset Network Settings: netsh int ip reset
6. ตรวจสอบว่า IP ซ้ำกับเครื่องอื่นหรือไม่',
  (SELECT id FROM cat WHERE slug = 'network')
),
(
  'เครื่องพิมพ์ไม่พิมพ์งาน',
  'ส่งงานพิมพ์แล้วไม่มีอะไรออกมา, Print queue ค้าง, Printer offline',
  'Print spooler service หยุดทำงาน, ไดรเวอร์มีปัญหา, กระดาษติด, หมึกหมด',
  '1. ตรวจสอบสถานะเครื่องพิมพ์บนหน้าจอเครื่องพิมพ์
2. ตรวจสอบกระดาษและหมึกพิมพ์
3. Clear Print Queue: Settings > Printers > Open Queue > Cancel All
4. Restart Print Spooler:
   - เปิด Services (services.msc)
   - หา Print Spooler > Stop > Start
5. ลบและติดตั้ง Driver ใหม่
6. ทดสอบ Print Test Page จาก Printer Properties',
  (SELECT id FROM cat WHERE slug = 'printer')
),
(
  'Outlook ไม่สามารถรับ/ส่งอีเมลได้',
  'อีเมลค้างใน Outbox, ไม่มีอีเมลใหม่เข้า, Error "Cannot connect to server"',
  'รหัสผ่านหมดอายุ, การตั้งค่า Server ผิด, Firewall บล็อก, Offline Mode เปิดอยู่',
  '1. ตรวจสอบว่า Outlook ไม่ได้อยู่ใน Work Offline mode (Send/Receive tab)
2. ตรวจสอบ Internet connection
3. ตรวจสอบรหัสผ่านอีเมล (อาจหมดอายุ)
4. File > Account Settings > ทดสอบ Account Settings
5. ลอง Repair Office: Control Panel > Programs > Office > Repair
6. ตรวจสอบ Firewall ว่าบล็อก Outlook หรือไม่
7. ล้าง Outlook Cache: ปิด Outlook แล้วลบไฟล์ .ost',
  (SELECT id FROM cat WHERE slug = 'email')
);

-- Link tags to problems
WITH p1 AS (SELECT id FROM problems WHERE title LIKE 'คอมพิวเตอร์ทำงานช้า%'),
     p2 AS (SELECT id FROM problems WHERE title LIKE 'ไม่สามารถเชื่อมต่อ WiFi%'),
     p3 AS (SELECT id FROM problems WHERE title LIKE 'เครื่องพิมพ์%'),
     p4 AS (SELECT id FROM problems WHERE title LIKE 'Outlook%'),
     t_slow AS (SELECT id FROM tags WHERE slug = 'slow'),
     t_wifi AS (SELECT id FROM tags WHERE slug = 'wifi'),
     t_printer AS (SELECT id FROM tags WHERE slug = 'printer'),
     t_outlook AS (SELECT id FROM tags WHERE slug = 'outlook'),
     t_w11 AS (SELECT id FROM tags WHERE slug = 'windows11')
INSERT INTO problem_tags (problem_id, tag_id)
SELECT p1.id, t_slow.id FROM p1, t_slow
UNION ALL SELECT p1.id, t_w11.id FROM p1, t_w11
UNION ALL SELECT p2.id, t_wifi.id FROM p2, t_wifi
UNION ALL SELECT p3.id, t_printer.id FROM p3, t_printer
UNION ALL SELECT p4.id, t_outlook.id FROM p4, t_outlook
ON CONFLICT DO NOTHING;
