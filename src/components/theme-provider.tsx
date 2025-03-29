'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // 添加一個狀態來追蹤是否已經在客戶端
  const [mounted, setMounted] = React.useState(false)

  // 使用 useEffect 確保只在客戶端執行後設置
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 如果未掛載（服務器渲染階段），返回一個不可見的主題提供者
  if (!mounted) {
    return <>{children}</>
  }

  // 客戶端掛載後，正常渲染
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}