'use client'

import Link from 'next/link'

type Problem = {
  id: string
  title: string
  symptoms: string
  category_name: string | null
  category_color: string | null
  tags: string[] | null
  views: number
  helpful_count: number
}

export default function AdminProblemsClient({ problems }: { problems: Problem[] }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">จัดการปัญหา IT</h1>
          <p className="text-slate-500 text-sm">{problems.length} ปัญหาทั้งหมด</p>
        </div>
        <Link href="/admin/problems/new" className="btn-primary">
          + เพิ่มปัญหาใหม่
        </Link>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">ชื่อปัญหา</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs">หมวดหมู่</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs">Tags</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Views</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">👍</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-medium line-clamp-1">{p.title}</div>
                    <div className="text-slate-600 text-xs line-clamp-1 mt-0.5">{p.symptoms}</div>
                  </td>

                  <td className="px-4 py-3">
                    {p.category_name ? (
                      <span
                        className="badge text-xs"
                        style={{
                          background: `${p.category_color}18`,
                          color: p.category_color!,
                          border: `1px solid ${p.category_color}30`
                        }}
                      >
                        {p.category_name}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.tags || []).slice(0, 3).map((t) => (
                        <span key={t} className="tag-chip text-[10px] px-1.5 py-0">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right text-slate-400">
                    {p.views.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right text-green-500/70">
                    {p.helpful_count}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DeleteButton id={p.id} title={p.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DeleteButton({ id, title }: { id: string; title: string }) {
  const handleDelete = async () => {
    if (!confirm(`ลบ "${title}" หรือไม่?`)) return
    const res = await fetch(`/api/admin/problems/${id}`, { method: 'DELETE' })
    if (res.ok) window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-500/60 hover:text-red-400 text-xs transition-colors"
    >
      ลบ
    </button>
  )
}