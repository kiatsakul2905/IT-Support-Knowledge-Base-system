import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendIssueNotification } from '@/lib/email'

type Issue = {
  id: string
  reporter_name: string
  reporter_email: string
  reporter_department: string | null
  title: string
  description: string
  category_id: string | null
  priority: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      reporter_name,
      reporter_email,
      reporter_department,
      title,
      description,
      category_id,
      priority
    } = body

    if (!reporter_name || !reporter_email || !title || !description) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น' },
        { status: 400 }
      )
    }

    const rows = await sql`
      INSERT INTO issue_reports (
        reporter_name,
        reporter_email,
        reporter_department,
        title,
        description,
        category_id,
        priority
      )
      VALUES (
        ${reporter_name},
        ${reporter_email},
        ${reporter_department || null},
        ${title},
        ${description},
        ${category_id || null},
        ${priority || 'medium'}
      )
      RETURNING *
    `

    const issue = rows[0] as Issue

    // Get category name
    let category_name = ''
    if (category_id) {
      const catRows = await sql`
        SELECT name FROM categories WHERE id = ${category_id}
      `
      category_name = catRows[0]?.name || ''
    }

    // Non-blocking email
    sendIssueNotification({
      ...issue,
      category_name
    }).catch(console.error)

    return NextResponse.json({ ok: true, id: issue.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' },
      { status: 500 }
    )
  }
}