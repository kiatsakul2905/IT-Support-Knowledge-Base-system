import sql from '@/lib/db'
import AdminProblemsClient from './AdminProblemsClient'

type Problem = {
  id: string
  title: string
  symptoms: string
  category_name: string | null
  category_color: string | null
  tags: string[] | null
  views: number
  helpful_count: number
}

async function getProblems(): Promise<Problem[]> {
  const rows = await sql`
    SELECT 
      p.id,
      p.title,
      p.symptoms,
      p.views,
      p.helpful_count,
      c.name as category_name,
      c.color as category_color,
      ARRAY_AGG(DISTINCT t.name) 
        FILTER (WHERE t.name IS NOT NULL) as tags
    FROM problems p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN problem_tags pt ON p.id = pt.problem_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id, c.name, c.color
    ORDER BY p.created_at DESC
  `

  return rows as Problem[]
}

export default async function Page() {
  const problems = await getProblems()
  return <AdminProblemsClient problems={problems} />
}