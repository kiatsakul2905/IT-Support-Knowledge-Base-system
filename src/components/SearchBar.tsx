'use client'
import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    params.delete('sort')
    startTransition(() => {
      router.push(`?${params}`)
    })
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-500">
          {isPending ? (
            <div className="w-4 h-4 border-2 border-brand-500/50 border-t-brand-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(value) }}
          placeholder="ค้นหาปัญหา เช่น wifi ไม่ติด, printer ไม่พิมพ์..."
          className="w-full pl-11 pr-24 py-3.5 rounded-xl text-sm transition-all duration-200 focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'rgba(68,81,246,0.5)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(68,81,246,0.1)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          onClick={() => handleSearch(value)}
          className="absolute right-2 btn-primary py-2 px-4 text-xs"
        >
          ค้นหา
        </button>
      </div>
      {value && (
        <button
          onClick={() => { setValue(''); handleSearch('') }}
          className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 mr-3 text-xs"
        >
          ✕
        </button>
      )}
    </div>
  )
}
