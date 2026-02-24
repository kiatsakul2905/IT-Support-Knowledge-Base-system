import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const tags = await sql`SELECT *, (SELECT COUNT(*) FROM problem_tags WHERE tag_id = tags.id)::int as usage_count FROM tags ORDER BY name`
  return NextResponse.json(tags)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const [tag] = await sql`
    INSERT INTO tags (name, slug) VALUES (${name}, ${slug})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING *
  `
  return NextResponse.json(tag)
}
