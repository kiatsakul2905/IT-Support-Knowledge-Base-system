'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { v: 'open', l: 'รอดำเนินการ', c: '#60a5fa' },
  { v: 'in_progress', l: 'กำลังดำเนินการ', c: '#fbbf24' },
  { v: 'resolved', l: 'แก้ไขแล้ว', c: '#4ade80' },
  { v: 'closed', l: 'ปิด', c: '#94a3b8' },
]

export default function IssueStatusUpdate({ issueId, currentStatus }: { issueId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (newStatus: string) => {
    setLoading(true)
    await fetch(`/api/admin/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatus(newStatus)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="card">
      <h3 className="text-slate-300 text-sm font-semibold mb-3">อัพเดทสถานะ</h3>
      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map(s => (
          <button
            key={s.v}
            onClick={() => handleUpdate(s.v)}
            disabled={loading || status === s.v}
            className={`p-3 rounded-lg text-sm font-medium transition-all border ${
              status === s.v ? 'border-opacity-40' : 'border-white/5 hover:border-white/15 text-slate-500 hover:text-slate-300'
            }`}
            style={status === s.v ? { background: `${s.c}12`, borderColor: `${s.c}35`, color: s.c } : {}}
          >
            {status === s.v ? '✓ ' : ''}{s.l}
          </button>
        ))}
      </div>
    </div>
  )
}
