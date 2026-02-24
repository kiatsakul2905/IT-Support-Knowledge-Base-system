import nodemailer from 'nodemailer'
import sql from './db'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendIssueNotification(issue: {
  id: string
  reporter_name: string
  reporter_email: string
    reporter_department: string | null
  title: string
  description: string
  priority: string
  category_name?: string
}) {
  // Fetch all active IT staff emails
  const staff = (await sql`SELECT email, name FROM it_staff WHERE is_active = true`) as { email: string; name: string }[]
  if (!staff.length) return

  const priorityColors: Record<string, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  }
  const priorityTH: Record<string, string> = {
    low: 'ต่ำ',
    medium: 'กลาง',
    high: 'สูง',
    critical: 'วิกฤต',
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; background: #f3f4f6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: #1e1b4b; padding: 24px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🛠 แจ้งปัญหา IT ใหม่</h1>
      <p style="color: #a5b4fc; margin: 8px 0 0; font-size: 14px;">IT Support Knowledge Base</p>
    </div>
    <div style="padding: 32px;">
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 18px;">${issue.title}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 140px;">ผู้แจ้ง</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${issue.reporter_name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">อีเมล</td>
            <td style="padding: 6px 0; color: #3b82f6; font-size: 14px;">${issue.reporter_email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">แผนก</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${issue.reporter_department || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">หมวดหมู่</td>
            <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${issue.category_name || 'ไม่ระบุ'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">ความเร่งด่วน</td>
            <td style="padding: 6px 0;">
              <span style="background: ${priorityColors[issue.priority]}20; color: ${priorityColors[issue.priority]}; padding: 2px 10px; border-radius: 999px; font-size: 13px; font-weight: 600;">
                ${priorityTH[issue.priority] || issue.priority}
              </span>
            </td>
          </tr>
        </table>
      </div>
      <div>
        <h3 style="color: #374151; font-size: 15px; margin: 0 0 8px;">รายละเอียดปัญหา</h3>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0; background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #4451f6;">${issue.description.replace(/\n/g, '<br>')}</p>
      </div>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/issues/${issue.id}" 
           style="background: #4451f6; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          ดูรายละเอียดใน Admin Panel →
        </a>
      </div>
    </div>
    <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">IT Support Knowledge Base | แจ้งเตือนอัตโนมัติ</p>
    </div>
  </div>
</body>
</html>
`

  const emails = staff.map(s => s.email).join(', ')
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: emails,
    subject: `[IT Support] ปัญหาใหม่: ${issue.title} [${priorityTH[issue.priority]}]`,
    html: emailHtml,
  })
}
