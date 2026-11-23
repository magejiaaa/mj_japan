"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FIXED_STORE_EXCHANGE_RATE } from "@/lib/storeConfig"

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
  const unavailableStores = (
    <>
      <h2 className="mb-2 font-bold">無提供代購的網站</h2>
      <ul className="mb-3 list-disc space-y-1 pl-5">
        <li>Yahoo! 購物日本</li>
        <li>Mercari</li>
      </ul>
      <p>同一商品也可以到樂天日本或 Amazon 找找看。</p>
    </>
  )
  const storeRateNotice = `ZOZOTOWN、CAN ONLINE SHOP 自動使用固定匯率 ${FIXED_STORE_EXCHANGE_RATE}。`

  return (
    <header className="px-4 pt-4 lg:pt-5">
      <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-[var(--color-primary-light)] px-3 py-1 lg:mb-4 lg:justify-end lg:gap-3 lg:bg-transparent lg:p-0">
        <h1 className="text-lg font-bold text-[var(--quote-accent)] lg:hidden">秘境日本代購</h1>
        <button
          className="hidden rounded-md border border-[var(--text-primary)]/70 bg-white/80 px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] dark:bg-[var(--bg-card)] lg:block"
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

      <details className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-sm lg:hidden">
        <summary className="cursor-pointer px-3 py-2.5 font-medium text-[var(--quote-accent)]">代購須知</summary>
        <div className="space-y-3 border-t border-[var(--border-default)] p-3">
          <section>{unavailableStores}</section>
          <p className="text-[var(--text-secondary)]">{storeRateNotice}</p>
          <a href="#order-process" className="inline-block font-semibold text-[var(--quote-accent)] underline">查看代購流程</a>
        </div>
      </details>

      <div className="hidden gap-5 lg:grid lg:grid-cols-[1.35fr_1fr]">
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
            {unavailableStores}
          </section>

          <section className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)] p-6 text-[var(--notice)] shadow-[var(--shadow-soft)]">
            <p className="font-bold leading-7">
              {storeRateNotice}
            </p>
          </section>
        </div>
      </div>
    </header>
  )
}
