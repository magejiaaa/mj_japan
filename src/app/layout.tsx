import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: '秘境自助報價',
  description: '協助用戶快速估算從日本購買商品的總費用',
  generator: '秘境日本代購',
  other: {
    'google-site-verification': 'LctgswFN5j-wK806zPBsuGYxy_hrpZmkP9DRlirlcYk'
  },
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
