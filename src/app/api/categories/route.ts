import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const categories = await sql`SELECT * FROM categories ORDER BY name`
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const { name, slug, description, color, icon } = await req.json()
  const [cat] = await sql`
    INSERT INTO categories (name, slug, description, color, icon)
    VALUES (${name}, ${slug}, ${description}, ${color || '#3B82F6'}, ${icon || 'folder'})
    RETURNING *
  `
  return NextResponse.json(cat)
}
