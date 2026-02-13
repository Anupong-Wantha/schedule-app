import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Schedule System | ระบบตารางเรียน',
  description: 'Academic Schedule Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="grid-bg min-h-screen">{children}</body>
    </html>
  )
}
