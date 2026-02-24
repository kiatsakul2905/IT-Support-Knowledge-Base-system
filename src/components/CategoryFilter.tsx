'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  color: string
  problem_count: number
}

export default function CategoryFilter({ categories, activeCategory }: { categories: Category[], activeCategory?: string }) {
  const searchParams = useSearchParams()

  const buildUrl = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    params.delete('sort')
    return `?${params}`
  }

  return (
    <div className="card sticky top-20">
      <h3 className="text-slate-300 font-semibold text-sm mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        หมวดหมู่
      </h3>
      <div className="space-y-1">
        <Link
          href={buildUrl()}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
            !activeCategory
              ? 'bg-brand-500/20 text-brand-300'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>ทั้งหมด</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${!activeCategory ? 'bg-brand-500/30 text-brand-300' : 'bg-white/5 text-slate-500'}`}>
            {categories.reduce((a, c) => a + c.problem_count, 0)}
          </span>
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={buildUrl(cat.slug)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
              activeCategory === cat.slug
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            style={activeCategory === cat.slug ? { background: `${cat.color}15`, color: cat.color } : {}}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
              <span>{cat.name}</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-slate-500">
              {cat.problem_count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
