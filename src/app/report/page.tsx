'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PRIORITIES = [
  { v: 'low', l: 'ต่ำ', desc: 'ใช้งานได้แต่มีปัญหาเล็กน้อย', color: '#22c55e' },
  { v: 'medium', l: 'กลาง', desc: 'ส่งผลต่อการทำงานบ้าง', color: '#f59e0b' },
  { v: 'high', l: 'สูง', desc: 'ทำงานได้ยาก หรือข้อมูลสูญหาย', color: '#ef4444' },
  { v: 'critical', l: 'วิกฤต', desc: 'ทำงานไม่ได้เลย ระบบล่ม', color: '#dc2626' },
]

export default function ReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    reporter_name: '',
    reporter_email: '',
    reporter_department: '',
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
  })
  const [categories, setCategories] = useState<any[]>([])

  useState(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'เกิดข้อผิดพลาด')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] grid-bg flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-12 animate-slide-up">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">แจ้งปัญหาสำเร็จ!</h2>
          <p className="text-slate-400 text-sm mb-6">ทีม IT ได้รับการแจ้งเตือนทางอีเมลแล้ว<br />จะติดต่อกลับโดยเร็ว</p>
          <Link href="/" className="btn-primary inline-block">กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] grid-bg">
      <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-slate-300 text-sm">แจ้งปัญหา IT</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚨</div>
          <h1 className="text-2xl font-bold text-white mb-2">แจ้งปัญหา IT</h1>
          <p className="text-slate-400 text-sm">กรอกรายละเอียดปัญหา ทีม IT จะได้รับการแจ้งเตือนทางอีเมลทันที</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reporter info */}
          <div className="card space-y-4">
            <h3 className="text-slate-300 text-sm font-semibold border-b border-white/5 pb-3">ข้อมูลผู้แจ้ง</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">ชื่อ-นามสกุล *</label>
                <input required className="input-field" placeholder="ชื่อ นามสกุล" value={form.reporter_name} onChange={e => set('reporter_name', e.target.value)} />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">อีเมล *</label>
                <input required type="email" className="input-field" placeholder="email@company.com" value={form.reporter_email} onChange={e => set('reporter_email', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">แผนก</label>
              <input className="input-field" placeholder="แผนกบัญชี, ฝ่ายขาย..." value={form.reporter_department} onChange={e => set('reporter_department', e.target.value)} />
            </div>
          </div>

          {/* Problem info */}
          <div className="card space-y-4">
            <h3 className="text-slate-300 text-sm font-semibold border-b border-white/5 pb-3">รายละเอียดปัญหา</h3>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">หัวข้อปัญหา *</label>
              <input required className="input-field" placeholder="เช่น: WiFi ไม่ติดที่ชั้น 3" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">หมวดหมู่</label>
                <select className="input-field" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">รายละเอียด *</label>
              <textarea
                required
                rows={5}
                className="input-field resize-none"
                placeholder="อธิบายปัญหาที่พบ, อาการที่เกิดขึ้น, เครื่องที่มีปัญหา..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="card">
            <h3 className="text-slate-300 text-sm font-semibold mb-3">ระดับความเร่งด่วน</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map(p => (
                <button
                  type="button"
                  key={p.v}
                  onClick={() => set('priority', p.v)}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    form.priority === p.v
                      ? 'border-opacity-50'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                  style={form.priority === p.v
                    ? { background: `${p.color}10`, borderColor: `${p.color}40` }
                    : {}
                  }
                >
                  <div className="font-medium text-sm" style={{ color: form.priority === p.v ? p.color : '#94a3b8' }}>{p.l}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                กำลังส่ง...
              </span>
            ) : '📨 ส่งการแจ้งปัญหา'}
          </button>
        </form>
      </div>
    </div>
  )
}
