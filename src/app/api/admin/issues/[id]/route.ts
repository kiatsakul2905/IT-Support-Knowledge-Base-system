import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json()
  await sql`UPDATE issue_reports SET status=${status}, updated_at=NOW() WHERE id=${params.id}`
  return NextResponse.json({ ok: true })
}
