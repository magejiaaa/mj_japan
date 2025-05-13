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
    <header className="flex flex-col items-center justify-center text-center bg-[#F9F5EB] dark:bg-[#3D2A2D] pt-8 text-[#3D2A2D] dark:text-[#F8F0E3] rounded-b-2xl shadow-lg">
      <div className="relative w-full flex justify-center">
        <div className="absolute px-4 right-0 top-1/2 -translate-y-1/2 w-full md:w-auto flex justify-between md:justify-center gap-2">
          <button className="border border-[#3D2A2D] hover:bg-[#F5B5B5]/20 p-2 w-max rounded-md text-sm" onClick={scrollToBottom}>!(•̀ᴗ•́)و ̑̑代購流程</button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-[#3D2A2D] hover:bg-[#F5B5B5]/20 dark:hover:bg-[#3D2A2D]/50"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">切換深色模式</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 mb-2">
        <a href="https://www.instagram.com/mjj_japan?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">
          <h1 className="m-3 md:m-6 rounded-2xl overflow-hidden">
            <span className="hidden">秘境日本代購自助報價</span>
            <img className="h-[150px] md:h-[300px] object-cover" src="/banner.png" alt="" />
          </h1>
        </a>
      </div>
    </header>
  )
}

