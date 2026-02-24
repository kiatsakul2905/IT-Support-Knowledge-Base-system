import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import sql from '@/lib/db'
import IssueStatusUpdate from '@/components/IssueStatusUpdate'

const PRIORITY_TH: Record<string, string> = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง', critical: 'วิกฤต' }
const PRIORITY_COLOR: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' }

export default async function IssueDetail({ params }: { params: { id: string } }) {
  const [issue] = await sql`
    SELECT ir.*, c.name as category_name
    FROM issue_reports ir
    LEFT JOIN categories c ON ir.category_id = c.id
    WHERE ir.id = ${params.id}
  `
  if (!issue) notFound()

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/admin/issues" className="text-slate-500 hover:text-white transition-colors text-sm flex items-center gap-1.5">
          ← กลับ
        </Link>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-white">{issue.title}</h1>
          <span className="badge text-xs shrink-0" style={{ background: `${PRIORITY_COLOR[issue.priority]}18`, color: PRIORITY_COLOR[issue.priority], border: `1px solid ${PRIORITY_COLOR[issue.priority]}30` }}>
            {PRIORITY_TH[issue.priority]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-white/3">
          <div>
            <div className="text-slate-500 text-xs mb-0.5">ผู้แจ้ง</div>
            <div className="text-white text-sm font-medium">{issue.reporter_name}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">อีเมล</div>
            <a href={`mailto:${issue.reporter_email}`} className="text-brand-400 text-sm hover:text-brand-300">{issue.reporter_email}</a>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">แผนก</div>
            <div className="text-white text-sm">{issue.reporter_department || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">หมวดหมู่</div>
            <div className="text-white text-sm">{issue.category_name || '-'}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-0.5">วันที่แจ้ง</div>
            <div className="text-white text-sm">{format(new Date(issue.created_at), 'd MMMM yyyy HH:mm', { locale: th })}</div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <div className="text-slate-400 text-xs mb-2">รายละเอียดปัญหา</div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{issue.description}</p>
        </div>
      </div>

      <IssueStatusUpdate issueId={issue.id} currentStatus={issue.status} />
    </div>
  )
}
