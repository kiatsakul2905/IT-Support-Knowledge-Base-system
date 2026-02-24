'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProblemFormProps {
  problem?: any
  categories: any[]
  tags: any[]
}

export default function ProblemForm({ problem, categories, tags }: ProblemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>(problem?.tags || [])
  const [form, setForm] = useState({
    title: problem?.title || '',
    symptoms: problem?.symptoms || '',
    cause: problem?.cause || '',
    solution: problem?.solution || '',
    category_id: problem?.category_id || '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const toggleTag = (name: string) => {
    setSelectedTags(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, tags: selectedTags }
      const res = await fetch(
        problem ? `/api/admin/problems/${problem.id}` : '/api/admin/problems',
        {
          method: problem ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) throw new Error((await res.json()).error || 'เกิดข้อผิดพลาด')
      router.push('/admin/problems')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="card space-y-4">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">ชื่อปัญหา *</label>
          <input required className="input-field" placeholder="เช่น: คอมพิวเตอร์เปิดไม่ติด" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">หมวดหมู่</label>
          <select className="input-field" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            <option value="">ไม่ระบุ</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">อาการที่พบ *</label>
          <textarea required rows={3} className="input-field resize-y" placeholder="อธิบายอาการที่ผู้ใช้พบ..." value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">สาเหตุ *</label>
          <textarea required rows={3} className="input-field resize-y" placeholder="สาเหตุที่เป็นไปได้..." value={form.cause} onChange={e => set('cause', e.target.value)} />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">วิธีแก้ไข *</label>
          <textarea required rows={8} className="input-field resize-y font-mono text-xs" placeholder="ขั้นตอนการแก้ไข..." value={form.solution} onChange={e => set('solution', e.target.value)} />
        </div>
      </div>

      {/* Tags */}
      <div className="card">
        <label className="text-slate-400 text-xs mb-3 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <button
              type="button"
              key={t.name}
              onClick={() => toggleTag(t.name)}
              className={`tag-chip cursor-pointer transition-all ${selectedTags.includes(t.name) ? 'bg-brand-500/30 text-brand-300 border-brand-500/40' : ''}`}
            >
              #{t.name}
            </button>
          ))}
        </div>
        <div className="text-slate-600 text-xs mt-2">เลือก {selectedTags.length} tags</div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? 'กำลังบันทึก...' : problem ? '💾 บันทึกการแก้ไข' : '+ เพิ่มปัญหา'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">ยกเลิก</button>
      </div>
    </form>
  )
}
