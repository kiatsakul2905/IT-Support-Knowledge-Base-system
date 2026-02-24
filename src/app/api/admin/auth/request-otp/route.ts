import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import nodemailer from 'nodemailer'


// In-memory OTP store (use Redis in production for multi-instance)
// For Neon/serverless we store in DB
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 1. Check if the email exists and is active
    const [admin] = await sql`SELECT email FROM it_staff WHERE email = ${email} AND is_active = true`
    if (!admin) {
      return NextResponse.json({ error: 'ไม่พบอีเมลนี้ในระบบหรือบัญชีถูกปิดใช้งาน' }, { status: 401 })
    }

    // 2. Verify the shared ADMIN_PASSWORD
    if (password !== process.env.ADMIN_PASSWORD) {
      // Delay to prevent brute-force
      await new Promise(r => setTimeout(r, 1000))
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // 4. Store OTP in DB (upsert)
    await sql`
      INSERT INTO admin_otp (otp_code, expires_at, used)
      VALUES (${otp}, ${expiresAt.toISOString()}, false)
    `

    // 5. Send OTP email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `[IT Admin] รหัส OTP สำหรับเข้าสู่ระบบ: ${otp}`,
      text: `รหัส OTP ของคุณคือ ${otp} และจะหมดอายุใน 10 นาที`,
    })

    return NextResponse.json({ ok: true, message: 'OTP ถูกส่งไปยังอีเมลของคุณแล้ว' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 })
  }
}
