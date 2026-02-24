import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import sql from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { otp } = await req.json()

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้อง' }, { status: 400 })
    }

    // Find valid OTP in DB
    const [record] = await sql`
      SELECT * FROM admin_otp
      WHERE otp_code = ${otp}
        AND used = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (!record) {
      return NextResponse.json({ error: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 401 })
    }

    // Mark OTP as used
    await sql`UPDATE admin_otp SET used = true WHERE id = ${record.id}`

    // Clean up old OTPs
    await sql`DELETE FROM admin_otp WHERE expires_at < NOW() OR used = true`

    // Set auth cookie (24 hours)
    const cookieStore = cookies()
    cookieStore.set('admin_token', process.env.ADMIN_SECRET_KEY!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
