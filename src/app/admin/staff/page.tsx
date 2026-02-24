'use client'
import { useState, useEffect } from 'react'

export default function AdminStaff() {
  const [staff, setStaff] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/staff').then(r => r.json()).then(setStaff)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const s = await res.json()
      setStaff(prev => [...prev, s])
      setForm({ name: '', email: '' })
    }
    setLoading(false)
  }

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !active }),
    })
    setStaff(prev => prev.map(s => s.id === id ? { ...s, is_active: !active } : s))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ลบพนักงาน IT คนนี้?')) return
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
    setStaff(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">จัดการ IT Staff</h1>
        <p className="text-slate-400 text-sm">อีเมลเหล่านี้จะได้รับการแจ้งเตือนเมื่อมีการแจ้งปัญหาใหม่</p>
      </div>

      <form onSubmit={handleAdd} className="card space-y-3">
        <h3 className="text-slate-300 text-sm font-semibold">เพิ่ม IT Staff</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">ชื่อ *</label>
            <input required className="input-field" placeholder="ชื่อ-นามสกุล" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Email *</label>
            <input required type="email" className="input-field" placeholder="it@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary text-sm">+ เพิ่ม</button>
      </form>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">ชื่อ</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs">Email</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium text-xs">สถานะ</th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s: any) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/3">
                <td className="px-5 py-3 text-white">{s.name}</td>
                <td className="px-4 py-3 text-slate-400">{s.email}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleToggle(s.id, s.is_active)}
                    className={`badge text-xs cursor-pointer ${s.is_active ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-slate-500/15 text-slate-500 border border-slate-500/25'}`}>
                    {s.is_active ? 'ใช้งาน' : 'ปิดการใช้งาน'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500/60 hover:text-red-400 text-xs">ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
