'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/problems', label: 'ปัญหา', icon: '📋' },
  { href: '/admin/issues', label: 'การแจ้งปัญหา', icon: '🔔' },
  { href: '/admin/categories', label: 'หมวดหมู่', icon: '📂' },
  { href: '/admin/tags', label: 'Tags', icon: '🏷' },
  { href: '/admin/staff', label: 'IT Staff', icon: '👥' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    if (!confirm('ออกจากระบบ Admin?')) return
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="border-b border-white/5 sticky top-0 z-50" style={{ background: 'rgba(10,10,26,0.92)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-1">
          <Link href="/" className="shrink-0 flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center text-white font-bold text-xs">IT</div>
            <span className="text-slate-400 text-xs hidden sm:block">Admin</span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto flex-1">
            {navItems.map(item => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    active ? 'bg-brand-500/15 text-brand-300' : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="shrink-0 ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:block">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
