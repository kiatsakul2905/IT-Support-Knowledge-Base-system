import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { is_active } = await req.json()
  await sql`UPDATE it_staff SET is_active=${is_active} WHERE id=${params.id}`
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await sql`DELETE FROM it_staff WHERE id=${params.id}`
  return NextResponse.json({ ok: true })
}
