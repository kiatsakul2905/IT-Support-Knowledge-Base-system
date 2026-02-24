import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendIssueNotification } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { reporter_name, reporter_email, reporter_department, title, description, category_id, priority } = body

    if (!reporter_name || !reporter_email || !title || !description) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลที่จำเป็น' }, { status: 400 })
    }

    const [issue] = await sql`
      INSERT INTO issue_reports (reporter_name, reporter_email, reporter_department, title, description, category_id, priority)
      VALUES (
        ${reporter_name}, ${reporter_email}, ${reporter_department || null},
        ${title}, ${description},
        ${category_id || null},
        ${priority || 'medium'}
      )
      RETURNING *
    `

    // Get category name for email
    let category_name = ''
    if (category_id) {
      const [cat] = await sql`SELECT name FROM categories WHERE id = ${category_id}`
      category_name = cat?.name || ''
    }

    // Send email notification (non-blocking)
    sendIssueNotification({ ...issue, category_name }).catch(console.error)

    return NextResponse.json({ ok: true, id: issue.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
