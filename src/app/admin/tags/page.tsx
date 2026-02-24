'use client'
import { useState, useEffect } from 'react'

export default function AdminTags() {
  const [tags, setTags] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tags').then(r => r.json()).then(setTags)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      const tag = await res.json()
      setTags(prev => [...prev, tag])
      setName('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
    setTags(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">จัดการ Tags</h1>
        <p className="text-slate-500 text-sm">{tags.length} tags</p>
      </div>

      <form onSubmit={handleAdd} className="card flex gap-3">
        <input
          className="input-field"
          placeholder="ชื่อ tag เช่น wifi, windows11"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">+ เพิ่ม</button>
      </form>

      <div className="card">
        <div className="flex flex-wrap gap-2">
          {tags.map((t: any) => (
            <div key={t.id} className="flex items-center gap-1.5 tag-chip pr-1">
              <span>#{t.name}</span>
              <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-1 text-[10px]">✕</button>
            </div>
          ))}
          {tags.length === 0 && <p className="text-slate-500 text-sm">ยังไม่มี tags</p>}
        </div>
      </div>
    </div>
  )
}
