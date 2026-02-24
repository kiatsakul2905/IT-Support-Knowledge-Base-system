import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'

interface Problem {
  id: string
  title: string
  symptoms: string
  solution: string
  views: number
  helpful_count: number
  not_helpful_count: number
  created_at: string
  category_name?: string
  category_color?: string
  category_slug?: string
  tags?: string[]
}

export default function ProblemCard({ problem: p }: { problem: Problem }) {
  const totalRatings = p.helpful_count + p.not_helpful_count
  const helpfulPct = totalRatings > 0 ? Math.round((p.helpful_count / totalRatings) * 100) : null

  return (
    <Link href={`/problems/${p.id}`}>
      <div className="glass glass-hover rounded-xl p-5 group cursor-pointer animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Category + Title */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {p.category_name && (
                <span
                  className="badge text-xs"
                  style={{
                    background: `${p.category_color}18`,
                    color: p.category_color,
                    border: `1px solid ${p.category_color}30`,
                  }}
                >
                  {p.category_name}
                </span>
              )}
              <h3 className="text-white font-semibold text-sm group-hover:text-brand-300 transition-colors line-clamp-1">
                {p.title}
              </h3>
            </div>

            {/* Symptoms preview */}
            <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
              {p.symptoms}
            </p>

            {/* Tags */}
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {p.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="tag-chip">#{tag}</span>
                ))}
                {p.tags.length > 4 && (
                  <span className="tag-chip">+{p.tags.length - 4}</span>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="shrink-0 flex flex-col items-end gap-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{p.views.toLocaleString()}</span>
            </div>
            {helpfulPct !== null && (
              <div className="flex items-center gap-1 text-green-500/70">
                <span>👍</span>
                <span>{helpfulPct}%</span>
              </div>
            )}
            <div className="text-slate-600 text-[10px]">
              {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: th })}
            </div>
          </div>
        </div>

        {/* Helpful progress bar */}
        {helpfulPct !== null && (
          <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all"
              style={{ width: `${helpfulPct}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  )
}
