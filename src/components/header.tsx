"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  toggleDarkMode: () => void
  darkMode: boolean
}

export default function Header({ toggleDarkMode, darkMode }: HeaderProps) {
  const scrollToProcess = () => {
    document.getElementById("order-process")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <header className="px-4 pt-5">
      <div className="mb-4 flex items-center justify-end gap-3">
        <button
          className="rounded-md border border-[var(--text-primary)]/70 bg-white/80 px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:bg-[var(--bg-card)]"
          onClick={scrollToProcess}
          type="button"
        >
          (´•᎑•`)♡ 代購流程
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="text-[var(--text-primary)] hover:bg-[var(--color-primary-light)] dark:hover:bg-[var(--color-primary-light)]"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">切換深色模式</span>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <a
          href="https://www.instagram.com/mjj_japan?utm_source=ig_web_button_share_sheet"
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] transition hover:border-[var(--border-hover)]"
        >
          <span className="sr-only">秘境日本代購自助報價</span>
          <img
            className="w-full h-full object-cover"
            src="/banner.png"
            alt="秘境日本代購自助報價"
          />
        </a>

        <div className="grid gap-5">
          <section className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-6 leading-7 shadow-[var(--shadow-soft)]">
            <h2 className="mb-2 font-bold">無提供代購的網站：</h2>
            <ol className="mb-4 list-decimal space-y-1 pl-5">
              <li>yahoo購物jp</li>
              <li>mercari</li>
              <li>square-enix store</li>
            </ol>
            <p>有些品項在多平台有販售，可以找找樂天 jp 或 amazon</p>
          </section>

          <section className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)] p-6 text-[var(--notice)] shadow-[var(--shadow-soft)]">
            <p className="font-bold leading-7">
              zozotown、can online shop 匯率請依照 IG、粉絲專頁公告進行編輯！！（目前 0.23）
            </p>
          </section>
        </div>
      </div>
    </header>
  )
}
