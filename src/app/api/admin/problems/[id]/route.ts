import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { title, symptoms, cause, solution, category_id, tags = [] } = await req.json()

    await sql`
      UPDATE problems 
      SET title=${title}, symptoms=${symptoms}, cause=${cause}, solution=${solution},
          category_id=${category_id || null}, updated_at=NOW()
      WHERE id=${params.id}
    `

    // Update tags
    await sql`DELETE FROM problem_tags WHERE problem_id = ${params.id}`
    for (const tagName of tags) {
      const [tag] = await sql`
        INSERT INTO tags (name, slug) VALUES (${tagName}, ${tagName.toLowerCase().replace(/\s+/g, '-')})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
      await sql`INSERT INTO problem_tags (problem_id, tag_id) VALUES (${params.id}, ${tag.id}) ON CONFLICT DO NOTHING`
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await sql`DELETE FROM problems WHERE id = ${params.id}`
  return NextResponse.json({ ok: true })
}
