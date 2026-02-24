import { notFound } from 'next/navigation'
import sql from '@/lib/db'
import ProblemForm from '@/components/ProblemForm'

export default async function EditProblem({ params }: { params: { id: string } }) {
  const [[problem], categories, tags] = await Promise.all([
    sql`
      SELECT p.*, ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM problems p
      LEFT JOIN problem_tags pt ON p.id = pt.problem_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = ${params.id}
      GROUP BY p.id
    `,
    sql`SELECT * FROM categories ORDER BY name`,
    sql`SELECT * FROM tags ORDER BY name`,
  ])

  if (!problem) notFound()

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">แก้ไขปัญหา</h1>
        <p className="text-slate-500 text-sm truncate">{problem.title}</p>
      </div>
      <ProblemForm problem={problem} categories={categories as any[]} tags={tags as any[]} />
    </div>
  )
}
