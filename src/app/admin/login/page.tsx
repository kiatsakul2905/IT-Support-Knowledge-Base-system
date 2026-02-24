'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Step = 'password' | 'otp' | 'loading'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'

  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: ตรวจสอบรหัสผ่าน + ส่ง OTP ไปยัง email IT
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Include email in the request
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'รหัสผ่านหรืออีเมลไม่ถูกต้อง')
      setEmail(data.email)
      setStep('otp')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: ยืนยัน OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'รหัส OTP ไม่ถูกต้อง')
      router.push(from)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    setOtp('')
    try {
      await fetch('/api/admin/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] grid-bg flex items-center justify-center px-4">
      {/* Glow */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #4451f6 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
            style={{ boxShadow: '0 0 40px rgba(68,81,246,0.4)' }}>
            IT
          </div>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">IT Support Knowledge Base</p>
        </div>

        {/* Card */}
        <div className="card" style={{ borderColor: 'rgba(68,81,246,0.2)' }}>
          {step === 'password' && (
            <>
              <div className="mb-5">
                <h2 className="text-white font-semibold text-sm">🔐 เข้าสู่ระบบ</h2>
                <p className="text-slate-500 text-xs mt-1">กรอกอีเมลและรหัสผ่าน Admin</p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">อีเมล</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    className="input-field"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">รหัสผ่าน</label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    ⚠️ {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="btn-primary w-full py-2.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังตรวจสอบ...
                    </span>
                  ) : 'ถัดไป →'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => { setStep('password'); setError(''); setOtp('') }}
                    className="text-slate-500 hover:text-white transition-colors">
                    ←
                  </button>
                  <h2 className="text-white font-semibold text-sm">📧 ยืนยัน OTP</h2>
                </div>
                <p className="text-slate-500 text-xs">
                  ระบบส่งรหัส OTP ไปที่อีเมล IT Staff แล้ว
                </p>
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
                  📬 {email}
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">รหัส OTP (6 หลัก)</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    className="input-field text-center text-2xl font-mono tracking-[0.5em] py-3"
                    placeholder="000000"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <p className="text-slate-600 text-xs mt-1.5 text-center">รหัสมีอายุ 10 นาที</p>
                </div>
                {error && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    ⚠️ {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full py-2.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังยืนยัน...
                    </span>
                  ) : '✅ ยืนยัน OTP'}
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full text-slate-500 hover:text-slate-300 text-xs transition-colors py-1"
                >
                  ส่ง OTP ใหม่อีกครั้ง
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-slate-600 text-xs text-center mt-4">
          IT Support Knowledge Base • Admin Only
        </p>
      </div>
    </div>
  )
}
