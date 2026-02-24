import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await sql`DELETE FROM tags WHERE id = ${params.id}`
  return NextResponse.json({ ok: true })
}
