import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      SELECT ir.*, c.name as category_name
      FROM issue_reports ir
      LEFT JOIN categories c ON ir.category_id = c.id
      ORDER BY ir.created_at DESC
      LIMIT 50
    `
    return NextResponse.json({ ok: true, issues: rows })
  } catch (err) {
    console.error('debug/issues error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
