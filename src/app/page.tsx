import Link from 'next/link'
import sql from '@/lib/db'
import SearchBar from '@/components/SearchBar'
import ProblemCard from '@/components/ProblemCard'
import CategoryFilter from '@/components/CategoryFilter'
import StatsBar from '@/components/StatsBar'

interface SearchParams {
  q?: string
  category?: string
  sort?: string
  tag?: string
}

type Problem = {
  id: string
  title: string
  symptoms: string
  solution: string
  views: number
  helpful_count: number
  not_helpful_count: number
  created_at: string
  category_name: string
  category_color: string
  category_slug: string
  tags: string[]
}

type Category = {
  id: string
  name: string
  slug: string
  color: string
  problem_count: number
}

type Stats = {
  total_problems: number
  total_categories: number
  total_views: number
  open_issues: number
}

async function getProblems(params: SearchParams): Promise<Problem[]> {
  const { q, category, sort = 'newest', tag } = params

  let query = `
    SELECT 
      p.id, p.title, p.symptoms, p.solution, p.views,
      p.helpful_count, p.not_helpful_count, p.created_at,
      c.name as category_name, c.color as category_color, c.slug as category_slug,
      ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
    FROM problems p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN problem_tags pt ON p.id = pt.problem_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE 1=1
  `

  const values: string[] = []
  let idx = 1

  if (q) {
    query += ` AND (
      p.title ILIKE $${idx} OR 
      p.symptoms ILIKE $${idx} OR 
      p.solution ILIKE $${idx}
    )`
    values.push(`%${q}%`)
    idx++
  }

  if (category) {
    query += ` AND c.slug = $${idx}`
    values.push(category)
    idx++
  }

  if (tag) {
    query += ` AND EXISTS (
      SELECT 1 FROM problem_tags pt2
      JOIN tags t2 ON pt2.tag_id = t2.id
      WHERE pt2.problem_id = p.id AND t2.slug = $${idx}
    )`
    values.push(tag)
    idx++
  }

  query += ' GROUP BY p.id, c.name, c.color, c.slug'

  const orderMap: Record<string, string> = {
    newest: 'p.created_at DESC',
    views: 'p.views DESC',
    helpful: 'p.helpful_count DESC',
  }

  query += ` ORDER BY ${orderMap[sort] || orderMap.newest}`
  query += ' LIMIT 50'

  const rows = await sql(query, values)

  return rows as Problem[]
}

async function getCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT 
      c.id,
      c.name,
      c.slug,
      c.color,
      COUNT(p.id)::int as problem_count
    FROM categories c
    LEFT JOIN problems p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name
  `
  return rows as Category[]
}

async function getStats(): Promise<Stats> {
  const rows = await sql`
    SELECT 
      (SELECT COUNT(*) FROM problems)::int as total_problems,
      (SELECT COUNT(*) FROM categories)::int as total_categories,
      (SELECT COALESCE(SUM(views),0) FROM problems)::int as total_views,
      (SELECT COUNT(*) FROM issue_reports WHERE status = 'open')::int as open_issues
  `
  return rows[0] as Stats
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [problems, categories, stats] = await Promise.all([
    getProblems(searchParams),
    getCategories(),
    getStats(),
  ])

  const activeCategory = searchParams.category
  const activeSort = searchParams.sort || 'newest'
  const searchQuery = searchParams.q || ''

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
              IT
            </div>
            <span className="font-semibold text-white text-sm hidden sm:block">
              Support KB
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/report" className="btn-secondary text-xs px-3 py-1.5">
              🚨 แจ้งปัญหา
            </Link>
            <Link href="/admin" className="btn-primary text-xs px-3 py-1.5">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ค้นหาวิธีแก้ปัญหา IT Support
        </h1>
        <SearchBar defaultValue={searchQuery} />
      </div>

      <StatsBar stats={stats} />

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
            />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">
                  {problems.length}
                </span>{' '}
                ปัญหา
              </div>
            </div>

            {problems.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                ไม่พบปัญหาที่ตรงกัน
              </div>
            ) : (
              <div className="grid gap-3">
                {problems.map((p) => (
                  <ProblemCard key={p.id} problem={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}