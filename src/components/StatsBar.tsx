export default function StatsBar({ stats }: { stats: any }) {
  const items = [
    { label: 'ปัญหาทั้งหมด', value: stats?.total_problems || 0, icon: '📋', color: '#818cf8' },
    { label: 'หมวดหมู่', value: stats?.total_categories || 0, icon: '📂', color: '#34d399' },
    { label: 'ยอดเข้าชมรวม', value: stats?.total_views || 0, icon: '👁', color: '#60a5fa' },
    { label: 'ปัญหาที่รอดำเนินการ', value: stats?.open_issues || 0, icon: '🔔', color: '#fb923c' },
  ]

  return (
    <div className="border-y border-white/5 mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {items.map(item => (
            <div key={item.label} className="py-4 px-6 text-center">
              <div className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value.toLocaleString()}
              </div>
              <div className="text-slate-500 text-xs mt-0.5">{item.icon} {item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
