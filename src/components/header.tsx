"use client"

import { Moon, Sun, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  toggleDarkMode: () => void
  darkMode: boolean
}

export default function Header({ toggleDarkMode, darkMode }: HeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center text-center">
      <div className="relative w-full flex justify-center">
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="text-[#F8F0E3] hover:text-[#F8F0E3] hover:bg-[#F5B5B5]/20 dark:hover:bg-[#3D2A2D]/50"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">切換深色模式</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 mb-2">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="relative">
            秘境
            <Star className="absolute -top-4 -right-6 w-4 h-4 text-[#F8F0E3] opacity-70" />
          </span>
        </h1>
        <p className="text-lg mt-1 opacity-90">日本代購自助報價</p>
      </div>

      <div className="w-24 h-1 bg-[#F8F0E3]/30 rounded-full mt-2"></div>
    </header>
  )
}

