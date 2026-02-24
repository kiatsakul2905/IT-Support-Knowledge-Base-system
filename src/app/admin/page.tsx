import Link from 'next/link'
import sql from '@/lib/db'

async function getDashboardStats() {
  const [stats] = await sql`
    SELECT 
      (SELECT COUNT(*) FROM problems)::int as problems,
      (SELECT COUNT(*) FROM categories)::int as categories,
      (SELECT COUNT(*) FROM tags)::int as tags,
      (SELECT COUNT(*) FROM issue_reports WHERE status = 'open')::int as open_issues,
      (SELECT COUNT(*) FROM issue_reports WHERE status = 'in_progress')::int as in_progress,
      (SELECT COUNT(*) FROM issue_reports WHERE status = 'resolved')::int as resolved,
      (SELECT SUM(views) FROM problems)::int as total_views
  `
  return stats
}

async function getRecentIssues() {
  return await sql`
    SELECT ir.*, c.name as category_name
    FROM issue_reports ir
    LEFT JOIN categories c ON ir.category_id = c.id
    ORDER BY ir.created_at DESC
    LIMIT 10
  `
}

async function getTopProblems() {
  return await sql`
    SELECT p.id, p.title, p.views, p.helpful_count, c.name as category_name, c.color as category_color
    FROM problems p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.views DESC
    LIMIT 5
  `
}

const PRIORITY_STYLE: Record<string, string> = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
  critical: 'priority-critical',
}
const PRIORITY_TH: Record<string, string> = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง', critical: 'วิกฤต' }
const STATUS_STYLE: Record<string, string> = {
  open: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  in_progress: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  resolved: 'bg-green-500/15 text-green-400 border border-green-500/25',
  closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
}
const STATUS_TH: Record<string, string> = { open: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', resolved: 'แก้ไขแล้ว', closed: 'ปิด' }

export default async function AdminDashboard() {
  const [stats, recentIssues, topProblems] = await Promise.all([
    getDashboardStats(),
    getRecentIssues(),
    getTopProblems(),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">ภาพรวมระบบ IT Support Knowledge Base</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ปัญหาทั้งหมด', value: stats?.problems || 0, icon: '📋', color: '#818cf8', href: '/admin/problems' },
          { label: 'หมวดหมู่', value: stats?.categories || 0, icon: '📂', color: '#34d399', href: '/admin/categories' },
          { label: 'Tags', value: stats?.tags || 0, icon: '🏷', color: '#60a5fa', href: '/admin/tags' },
          { label: 'รอแก้ไข', value: stats?.open_issues || 0, icon: '🔔', color: '#fb923c', href: '/admin/issues' },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className="card glass-hover group">
            <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
            <div className="text-slate-500 text-xs flex items-center gap-1">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Issue status */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: 'รอดำเนินการ', v: stats?.open_issues || 0, c: '#60a5fa' },
          { l: 'กำลังดำเนินการ', v: stats?.in_progress || 0, c: '#fbbf24' },
          { l: 'แก้ไขแล้ว', v: stats?.resolved || 0, c: '#4ade80' },
        ].map(s => (
          <div key={s.l} className="card text-center">
            <div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-slate-500 text-xs mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent issues */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-200 font-semibold text-sm">การแจ้งปัญหาล่าสุด</h2>
            <Link href="/admin/issues" className="text-brand-400 text-xs hover:text-brand-300">ดูทั้งหมด →</Link>
          </div>
          <div className="space-y-2">
            {recentIssues.map((issue: any) => (
              <Link key={issue.id} href={`/admin/issues/${issue.id}`}
                className="flex items-start justify-between p-3 rounded-lg hover:bg-white/5 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{issue.title}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{issue.reporter_name} • {issue.reporter_department || '-'}</div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                  <span className={`badge text-xs ${PRIORITY_STYLE[issue.priority]}`}>{PRIORITY_TH[issue.priority]}</span>
                  <span className={`badge text-xs ${STATUS_STYLE[issue.status]}`}>{STATUS_TH[issue.status]}</span>
                </div>
              </Link>
            ))}
            {recentIssues.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">ไม่มีการแจ้งปัญหา</p>
            )}
          </div>
        </div>

        {/* Top problems */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-200 font-semibold text-sm">ปัญหายอดดูสูงสุด</h2>
            <Link href="/admin/problems" className="text-brand-400 text-xs hover:text-brand-300">จัดการ →</Link>
          </div>
          <div className="space-y-2">
            {topProblems.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 p-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                  style={{ background: i === 0 ? '#fbbf2420' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#fbbf24' : '#475569' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/problems/${p.id}`} className="text-white text-sm font-medium hover:text-brand-300 truncate block transition-colors">
                    {p.title}
                  </Link>
                  <div className="text-slate-500 text-xs">{p.views.toLocaleString()} views • 👍 {p.helpful_count}</div>
                </div>
                {p.category_name && (
                  <span className="badge text-xs shrink-0" style={{ background: `${p.category_color}18`, color: p.category_color, border: `1px solid ${p.category_color}30` }}>
                    {p.category_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/problems/new" className="btn-primary">+ เพิ่มปัญหาใหม่</Link>
        <Link href="/admin/categories" className="btn-secondary">จัดการหมวดหมู่</Link>
        <Link href="/admin/tags" className="btn-secondary">จัดการ Tags</Link>
        <Link href="/admin/staff" className="btn-secondary">จัดการ IT Staff</Link>
      </div>
    </div>
  )
}
