-- เพิ่ม table admin_otp สำหรับเก็บ OTP login
-- รัน SQL นี้ใน Neon SQL Editor (เพิ่มเติมจาก schema.sql เดิม)

CREATE TABLE IF NOT EXISTS admin_otp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index เพื่อค้นหา OTP เร็ว
CREATE INDEX IF NOT EXISTS idx_admin_otp_code ON admin_otp(otp_code, used, expires_at);
