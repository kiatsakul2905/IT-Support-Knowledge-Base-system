import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { title, symptoms, cause, solution, category_id, tags = [] } = await req.json()

    const [problem] = await sql`
      INSERT INTO problems (title, symptoms, cause, solution, category_id)
      VALUES (${title}, ${symptoms}, ${cause}, ${solution}, ${category_id || null})
      RETURNING *
    `

    // Handle tags
    for (const tagName of tags) {
      // Upsert tag
      const [tag] = await sql`
        INSERT INTO tags (name, slug) VALUES (${tagName}, ${tagName.toLowerCase().replace(/\s+/g, '-')})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
      await sql`
        INSERT INTO problem_tags (problem_id, tag_id) VALUES (${problem.id}, ${tag.id})
        ON CONFLICT DO NOTHING
      `
    }

    return NextResponse.json(problem)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
