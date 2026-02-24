import type { Metadata } from 'next'
import './globals.css' // Global styles for the app

export const metadata: Metadata = {
  title: 'IT Support Knowledge Base',
  description: 'ฐานความรู้สำหรับแก้ปัญหา IT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  )
}
