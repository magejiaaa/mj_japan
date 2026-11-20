import { useEffect, useState, type MouseEvent } from "react"

const quoteHash = "#quote"

export function useQuoteNavigation() {
  const [viewingQuote, setViewingQuote] = useState(false)

  useEffect(() => {
    const syncHash = () => setViewingQuote(window.location.hash === quoteHash)
    syncHash()
    window.addEventListener("hashchange", syncHash)
    window.addEventListener("popstate", syncHash)
    return () => {
      window.removeEventListener("hashchange", syncHash)
      window.removeEventListener("popstate", syncHash)
    }
  }, [])

  const onViewQuote = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (window.location.hash !== quoteHash) {
      // 保留目前的頁內歷史紀錄，讓瀏覽器上一頁還原表單的捲動位置。
      history.pushState(history.state, "", quoteHash)
    }
    setViewingQuote(true)
    const quoteSection = document.getElementById(quoteHash.slice(1))
    quoteSection?.focus({ preventScroll: true })
    quoteSection?.scrollIntoView({ block: "start" })
  }

  return { viewingQuote, onViewQuote }
}
