import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import sql from '@/lib/db'
import RatingButtons from '@/components/RatingButtons'

async function getProblem(id: string) {
  const [problem] = await sql`
    SELECT 
      p.*,
      c.name as category_name, c.color as category_color,
      ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
    FROM problems p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN problem_tags pt ON p.id = pt.problem_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ${id}
    GROUP BY p.id, c.name, c.color
  `
  if (!problem) return null

  // Increment view count
  await sql`UPDATE problems SET views = views + 1 WHERE id = ${id}`

  return problem
}

async function getRelatedProblems(problem: any) {
  return await sql`
    SELECT p.id, p.title, p.views, c.name as category_name, c.color as category_color
    FROM problems p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id != ${problem.id}
      AND p.category_id = ${problem.category_id}
    ORDER BY p.views DESC
    LIMIT 4
  `
}

export default async function ProblemPage({ params }: { params: { id: string } }) {
  const problem = await getProblem(params.id)
  if (!problem) notFound()

  const related = await getRelatedProblems(problem)

  const totalRatings = problem.helpful_count + problem.not_helpful_count
  const helpfulPct = totalRatings > 0 ? Math.round((problem.helpful_count / totalRatings) * 100) : null

  return (
    <div className="min-h-screen bg-[#0a0a1a] grid-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-slate-400 text-sm truncate">{problem.title}</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div className="card animate-slide-up">
              <div className="flex items-center gap-2 mb-3">
                {problem.category_name && (
                  <span className="badge text-xs" style={{ background: `${problem.category_color}18`, color: problem.category_color, border: `1px solid ${problem.category_color}30` }}>
                    {problem.category_name}
                  </span>
                )}
                <span className="text-slate-600 text-xs">#{problem.id.slice(0,8)}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-3">{problem.title}</h1>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {problem.views.toLocaleString()} ครั้ง
                </span>
                <span>📅 {format(new Date(problem.created_at), 'd MMMM yyyy', { locale: th })}</span>
              </div>
              {/* Tags */}
              {problem.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {problem.tags.map((tag: string) => (
                    <Link key={tag} href={`/?tag=${tag}`} className="tag-chip">#{tag}</Link>
                  ))}
                </div>
              )}
            </div>

            {/* Symptoms */}
            <Section icon="🔴" title="อาการที่พบ" color="#ef4444">
              <div className="prose-dark whitespace-pre-wrap text-sm">{problem.symptoms}</div>
            </Section>

            {/* Cause */}
            <Section icon="🟡" title="สาเหตุ" color="#f59e0b">
              <div className="prose-dark whitespace-pre-wrap text-sm">{problem.cause}</div>
            </Section>

            {/* Solution */}
            <Section icon="🟢" title="วิธีแก้ไข" color="#22c55e">
              <div className="prose-dark whitespace-pre-wrap text-sm font-mono text-xs leading-7">{problem.solution}</div>
            </Section>

            {/* Rating */}
            <div className="card">
              <p className="text-slate-300 text-sm font-medium mb-3 text-center">วิธีแก้ปัญหานี้ช่วยคุณได้หรือไม่?</p>
              <RatingButtons problemId={problem.id} helpful={problem.helpful_count} notHelpful={problem.not_helpful_count} />
              {helpfulPct !== null && (
                <div className="mt-3 text-center text-xs text-slate-500">
                  {totalRatings} คนให้คะแนน • <span className="text-green-400">{helpfulPct}%</span> บอกว่าช่วยได้
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Related */}
            {related.length > 0 && (
              <div className="card">
                <h3 className="text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <span>🔁</span> ปัญหาที่เกี่ยวข้อง
                </h3>
                <div className="space-y-2">
                  {related.map((r: any) => (
                    <Link key={r.id} href={`/problems/${r.id}`}
                      className="block p-3 rounded-lg text-sm text-slate-400 hover:text-white transition-all hover:bg-white/5">
                      <div className="font-medium line-clamp-2 mb-1">{r.title}</div>
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {r.views}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Report new issue CTA */}
            <div className="card" style={{ background: 'rgba(68,81,246,0.08)', borderColor: 'rgba(68,81,246,0.2)' }}>
              <div className="text-center">
                <div className="text-2xl mb-2">🚨</div>
                <p className="text-slate-300 text-sm font-medium mb-1">ยังแก้ปัญหาไม่ได้?</p>
                <p className="text-slate-500 text-xs mb-3">แจ้งปัญหาให้ทีม IT ช่วยเหลือ</p>
                <Link href="/report" className="btn-primary text-xs w-full text-center block">
                  แจ้งปัญหา IT
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="card animate-slide-up">
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color }}>
        <span>{icon}</span> {title}
      </h2>
      <div className="border-t border-white/5 pt-3">
        {children}
      </div>
    </div>
  )
}
