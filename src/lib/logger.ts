export async function logAdminAction(adminEmail: string, action: string) {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, adminEmail, action }

  // Build an absolute URL so server-side fetch works (Vercel, local dev, etc.)
  const base = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`)

  const url = new URL('/api/logs', base).toString()

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    })
  } catch (err) {
    // don't throw in production flow; fallback to console
    // (optional) you can also write to a file when running locally
    // console.error('logAdminAction failed', err)
  }
}