'use client'
import { useState, useEffect } from 'react'

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#3B82F6' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories(prev => [...prev, cat])
      setForm({ name: '', slug: '', description: '', color: '#3B82F6' })
      setMsg('เพิ่มหมวดหมู่สำเร็จ')
      setTimeout(() => setMsg(''), 3000)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบหมวดหมู่นี้หรือไม่?')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">จัดการหมวดหมู่</h1>
        <p className="text-slate-500 text-sm">{categories.length} หมวดหมู่</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="card space-y-4">
        <h3 className="text-slate-300 text-sm font-semibold">เพิ่มหมวดหมู่ใหม่</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">ชื่อ *</label>
            <input required className="input-field" placeholder="เช่น Hardware" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Slug</label>
            <input className="input-field" placeholder="hardware (auto)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">คำอธิบาย</label>
          <input className="input-field" placeholder="รายละเอียดหมวดหมู่" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-2 block">สี</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button type="button" key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white/50 scale-110' : ''}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        {msg && <div className="text-green-400 text-xs">✅ {msg}</div>}
        <button type="submit" disabled={loading} className="btn-primary">+ เพิ่มหมวดหมู่</button>
      </form>

      {/* List */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">หมวดหมู่</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs">Slug</th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">ปัญหา</th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: any) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/3">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                    <span className="text-white font-medium">{cat.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="tag-chip">{cat.slug}</span></td>
                <td className="px-4 py-3 text-right text-slate-400">{cat.problem_count || 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500/60 hover:text-red-400 text-xs transition-colors">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
