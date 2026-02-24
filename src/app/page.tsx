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

async function getProblems(params: SearchParams) {
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
      p.solution ILIKE $${idx} OR
      to_tsvector('english', p.title || ' ' || p.symptoms || ' ' || p.solution) @@ plainto_tsquery('english', $${idx+1})
    )`
    values.push(`%${q}%`, q)
    idx += 2
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

  return await sql(query, values)
}

async function getCategories() {
  return await sql`
    SELECT c.*, COUNT(p.id)::int as problem_count
    FROM categories c
    LEFT JOIN problems p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name
  `
}

async function getStats() {
  const [stats] = await sql`
    SELECT 
      (SELECT COUNT(*) FROM problems)::int as total_problems,
      (SELECT COUNT(*) FROM categories)::int as total_categories,
      (SELECT SUM(views) FROM problems)::int as total_views,
      (SELECT COUNT(*) FROM issue_reports WHERE status = 'open')::int as open_issues
  `
  return stats
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const [problems, categories, stats] = await Promise.all([
    getProblems(searchParams),
    getCategories(),
    getStats(),
  ])

  const activeCategory = searchParams.category
  const activeSort = searchParams.sort || 'newest'
  const searchQuery = searchParams.q || ''

  return (
    <div className="min-h-screen bg-[#0a0a1a] grid-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
              IT
            </div>
            <span className="font-semibold text-white text-sm hidden sm:block">Support KB</span>
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

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, #4451f6 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative">
          <div className="inline-flex items-center gap-2 badge mb-4" style={{ background: 'rgba(68,81,246,0.15)', color: '#818cf8', border: '1px solid rgba(68,81,246,0.25)' }}>
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Knowledge Base
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            ค้นหาวิธีแก้ปัญหา<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #4451f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IT Support</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">ฐานความรู้สำหรับแก้ปัญหาคอมพิวเตอร์และระบบ IT ของบริษัท</p>
          <SearchBar defaultValue={searchQuery} />
        </div>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <CategoryFilter categories={categories} activeCategory={activeCategory} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="text-sm text-slate-400">
                {searchQuery && <span>ผลการค้นหา "<span className="text-white font-medium">{searchQuery}</span>" — </span>}
                <span className="text-slate-300 font-medium">{problems.length}</span> ปัญหา
              </div>
              <div className="flex items-center gap-1">
                {[
                  { v: 'newest', l: 'ล่าสุด' },
                  { v: 'views', l: 'ยอดดู' },
                  { v: 'helpful', l: 'มีประโยชน์' },
                ].map(opt => {
                  const params = new URLSearchParams({ ...searchParams, sort: opt.v })
                  return (
                    <Link
                      key={opt.v}
                      href={`?${params}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeSort === opt.v
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {opt.l}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Problems grid */}
            {problems.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-400 text-lg">ไม่พบปัญหาที่ตรงกัน</p>
                <p className="text-slate-500 text-sm mt-2">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
                <Link href="/report" className="btn-primary inline-flex mt-6 text-sm">
                  แจ้งปัญหาใหม่
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {problems.map((p: any) => (
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
