export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import sql from '@/lib/db'

const PRIORITY_STYLE: Record<string, string> = {
  low: 'priority-low', medium: 'priority-medium', high: 'priority-high', critical: 'priority-critical',
}
const PRIORITY_TH: Record<string, string> = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง', critical: 'วิกฤต' }
const STATUS_STYLE: Record<string, string> = {
  open: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  in_progress: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  resolved: 'bg-green-500/15 text-green-400 border border-green-500/25',
  closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
}
const STATUS_TH: Record<string, string> = { open: 'รอดำเนินการ', in_progress: 'กำลังดำเนินการ', resolved: 'แก้ไขแล้ว', closed: 'ปิด' }

async function getIssues() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const res = await fetch('http://localhost:3000/api/debug/issues', { cache: 'no-store' })
      if (!res.ok) return []
      const body = await res.json()
      return body.issues || []
    } catch (err) {
      console.error('getIssues fetch dev error', err)
      return []
    }
  }

  return await sql`
    SELECT ir.*, c.name as category_name
    FROM issue_reports ir
    LEFT JOIN categories c ON ir.category_id = c.id
    ORDER BY 
      CASE ir.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
      ir.created_at DESC
  `
}

export default async function AdminIssues() {
  const issues = await getIssues()
  console.log('AdminIssues - fetched issues count:', Array.isArray(issues) ? issues.length : typeof issues)
  try {
    console.log('AdminIssues - sample:', JSON.stringify((Array.isArray(issues) ? issues.slice(0,3) : issues)))
  } catch (e) {
    console.log('AdminIssues - sample log failed', String(e))
  }
  console.log('AdminIssues - DATABASE_URL prefix:', typeof process.env.DATABASE_URL === 'string' ? process.env.DATABASE_URL.slice(0,40) : String(process.env.DATABASE_URL))

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">การแจ้งปัญหาจากผู้ใช้</h1>
        <p className="text-slate-500 text-sm">{issues.length} การแจ้งปัญหา</p>
      </div>

      <div className="grid gap-3">
        {issues.map((issue: any) => (
          <Link key={issue.id} href={`/admin/issues/${issue.id}`}>
            <div className="card glass-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`badge text-xs ${PRIORITY_STYLE[issue.priority]}`}>{PRIORITY_TH[issue.priority]}</span>
                    <span className={`badge text-xs ${STATUS_STYLE[issue.status]}`}>{STATUS_TH[issue.status]}</span>
                    {issue.category_name && <span className="text-slate-500 text-xs">{issue.category_name}</span>}
                  </div>
                  <h3 className="text-white font-medium text-sm">{issue.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-1">{issue.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-slate-300 text-xs font-medium">{issue.reporter_name}</div>
                  <div className="text-slate-600 text-xs">{issue.reporter_department || '-'}</div>
                  <div className="text-slate-600 text-xs mt-1">
                    {format(new Date(issue.created_at), 'd MMM yy', { locale: th })}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {issues.length === 0 && (
          <div className="card text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">📭</div>
            ไม่มีการแจ้งปัญหา
          </div>
        )}
      </div>
    </div>
  )
}
