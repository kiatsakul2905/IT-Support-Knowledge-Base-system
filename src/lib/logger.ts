import fs from 'fs'
import path from 'path'

const logFilePath = path.join(process.cwd(), 'logs', 'admin-actions.log')

export async function logAdminAction(adminEmail: string, action: string) {
  const timestamp = new Date().toISOString()
  const logEntry = { timestamp, adminEmail, action }

  // ส่ง log ไปยัง API หรือฐานข้อมูล
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry),
  })
}