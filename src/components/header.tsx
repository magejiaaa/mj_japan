"use client"

import { Moon, Sun, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  toggleDarkMode: () => void
  darkMode: boolean
}

export default function Header({ toggleDarkMode, darkMode }: HeaderProps) {
  // 點擊按鈕跳轉到頁面最尾端
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    })
  }

  return (
    <header className="flex flex-wrap items-center justify-center text-center">
      <div className="relative w-full flex justify-center">
        <div className="px-4 w-full flex justify-between gap-2">
          <button className="border border-[var(--border-default)] hover:bg-[var(--color-primary-hover)]/20 p-2 w-max rounded-md text-sm" onClick={scrollToBottom}>!(•̀ᴗ•́)و ̑̑代購流程</button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-[var(--text-primary)] hover:bg-[var(--color-primary-hover)]/20 dark:hover:bg-[var(--color-primary-hover)]/50"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">切換深色模式</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 mb-2 w-1/2">
        <a href="https://www.instagram.com/mjj_japan?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">
          <h1 className="m-3 md:m-6 rounded-2xl overflow-hidden">
            <span className="hidden">秘境日本代購自助報價</span>
            <img className="h-[150px] md:h-[300px] object-cover" src="/banner.png" alt="" />
          </h1>
        </a>
      </div>
      <div className="w-1/2 p-4 text-left">
        <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-lg border border-[var(--border-default)] p-4 mb-4">
          無提供代購的網站：
          <ol className="list-decimal list-inside my-2">
            <li>yahoo購物jp</li>
            <li>mercari</li>
            <li>square-enix store</li>
          </ol>
          有些品項在多平台有販售，可以找找樂天jp或amazon
        </div>
        <p className="text-[#a42c2c] text-lg font-bold">zozotown、can online shop匯率請依照IG、粉絲專頁公告進行編輯‼️(目前0.23)</p>
      </div>
    </header>
  )
}

