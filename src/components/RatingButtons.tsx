'use client'
import { useState, useEffect } from 'react'

export default function RatingButtons({ problemId, helpful, notHelpful }: {
  problemId: string
  helpful: number
  notHelpful: number
}) {
  const [voted, setVoted] = useState<boolean | null>(null)
  const [counts, setCounts] = useState({ helpful, notHelpful })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`rating_${problemId}`)
    if (stored !== null) setVoted(stored === 'true')
  }, [problemId])

  const handleVote = async (isHelpful: boolean) => {
    if (voted !== null || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, isHelpful }),
      })
      if (res.ok) {
        setVoted(isHelpful)
        setCounts(prev => isHelpful
          ? { ...prev, helpful: prev.helpful + 1 }
          : { ...prev, notHelpful: prev.notHelpful + 1 }
        )
        localStorage.setItem(`rating_${problemId}`, String(isHelpful))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={() => handleVote(true)}
        disabled={voted !== null || loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
          voted === true
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : voted !== null
            ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500'
            : 'glass glass-hover text-slate-300 hover:text-green-400 hover:border-green-500/30'
        }`}
      >
        👍 ช่วยได้
        <span className="badge text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
          {counts.helpful}
        </span>
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={voted !== null || loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
          voted === false
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : voted !== null
            ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500'
            : 'glass glass-hover text-slate-300 hover:text-red-400 hover:border-red-500/30'
        }`}
      >
        👎 ไม่ช่วย
        <span className="badge text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          {counts.notHelpful}
        </span>
      </button>
    </div>
  )
}
