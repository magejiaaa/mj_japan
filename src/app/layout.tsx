import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: '秘境自助報價',
  description: 'Created with v0',
  generator: '秘境日本代購',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <Analytics/>
      <body>{children}</body>
    </html>
  )
}
