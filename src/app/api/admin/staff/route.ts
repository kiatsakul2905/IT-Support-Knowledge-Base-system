import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const staff = await sql`SELECT * FROM it_staff ORDER BY created_at`
  return NextResponse.json(staff)
}

export async function POST(req: Request) {
  const { name, email } = await req.json()
  const [s] = await sql`INSERT INTO it_staff (name, email) VALUES (${name}, ${email}) RETURNING *`
  return NextResponse.json(s)
}
