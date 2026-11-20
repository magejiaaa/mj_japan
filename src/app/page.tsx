"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import Header from "@/components/header"
import ExchangeRate from "@/components/exchange-rate"
import ProductForm from "@/components/product-form"
import CalculationResult from "@/components/calculation-result"
import CategoryModal from "@/components/category-modal"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import PlatformSelector from "@/components/platform-selector"
import { ThemeProvider } from "@/components/theme-provider"
import type { OrderPlatform, ProductItem } from "@/lib/types"
import { applyShippingRules, getProductStoreKey, isCustomStoreKey, storeShippingConfig } from "@/lib/storeConfig"
import { applyCategoryRules, categoryMap } from "@/lib/categoryMap"
import { loadMjJapanSettings, type MjJapanRemoteSettings } from "@/lib/mjJapanSettings"
import { calculateQuote } from "@/lib/quote"
import { readQuoteDraft, saveQuoteDraft } from "@/lib/quoteDraft"
import type { ImportedProduct } from "@/lib/quoteText"
import { useQuoteNavigation } from "@/hooks/use-quote-navigation"
import QuoteSocialLinks from "@/components/quote-social-links"

function createProductId() {
  return Array.from(crypto.getRandomValues(new Uint32Array(3))).join("-")
}

export default function Home() {
  const [exchangeRate, setExchangeRate] = useState<number>(0.23)
  const [lastUpdated, setLastUpdated] = useState<string>("-")
  const [remoteSettings, setRemoteSettings] = useState<MjJapanRemoteSettings>({})
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      url: "",
      color: "",
      store: "free",
      customStoreName: "",
      price: 0,
      quantity: 1,
      category: "clothing",
    },
  ])
  const [selectedPlatform, setSelectedPlatform] = useState<OrderPlatform>("myship")
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const addedProductId = useRef<string | null>(null)
  const { viewingQuote, onViewQuote } = useQuoteNavigation()
  // 有價格的商品預設納入估價，只記錄手動取消勾選的項目。
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())
  const quote = useMemo(() => {
    const shopeeRate = Number(remoteSettings.shopeeRate ?? 0.175)
    return calculateQuote(products, excludedIds, exchangeRate, shopeeRate, categoryMap, storeShippingConfig)
  }, [products, excludedIds, exchangeRate, remoteSettings])

  useEffect(() => {
    const saved = readQuoteDraft()
    if (saved) {
      setProducts(saved.products)
      setExcludedIds(new Set(saved.excludedIds))
      setSelectedPlatform(saved.selectedPlatform)
    }
    setDraftLoaded(true)
  }, [])

  useEffect(() => {
    if (draftLoaded) saveQuoteDraft({ products, excludedIds: Array.from(excludedIds), selectedPlatform })
  }, [draftLoaded, products, excludedIds, selectedPlatform])

  useEffect(() => {
    if (addedProductId.current === null) return
    const field = document.getElementById(`url-${addedProductId.current}`)
    addedProductId.current = null
    field?.focus({ preventScroll: true })
    field?.scrollIntoView({ block: "center" })
  }, [products])

  const handleImportProducts = (imported: ImportedProduct[]) => {
    if (imported.length === 0) return
    setProducts(imported.map((product) => ({ ...product, id: createProductId() })))
    setExcludedIds(new Set())
  }

  const fetchExchangeRate = async (): Promise<boolean> => {
    try {
      const taipeiDateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date())
      const { year, month, day } = Object.fromEntries(taipeiDateParts.map(({ type, value }) => [type, value]))
      const endDate = `${year}-${month}-${day}`
      // 含今天共五個日曆日，以 UTC 日期運算避免受瀏覽器時區影響。
      const startDay = new Date(`${endDate}T00:00:00Z`)
      startDay.setUTCDate(startDay.getUTCDate() - 4)
      const startDate = startDay.toISOString().slice(0, 10)

      // FinMind 提供的匯率 API 端點
      const response = await fetch(
        "https://api.finmindtrade.com/api/v4/data?" +
          new URLSearchParams({
            dataset: "TaiwanExchangeRate",
            data_id: "JPY",
            start_date: startDate,
            end_date: endDate,
          }),
      )

      if (!response.ok) throw new Error("Network response was not ok")

      const { data }: { data?: Array<{ date: string; cash_sell: number }> } = await response.json()
      if (data?.length) {
        const latestRate = data.reduce((latest, entry) => (entry.date >= latest.date ? entry : latest))
        const rate = Math.ceil(latestRate.cash_sell * 100) / 100
        setExchangeRate(rate)
        setLastUpdated(latestRate.date)
        return true
      }
    } catch (error) {
      console.error("取得匯率失敗:", error)
    }

    return false
  }

  // 同時取得匯率和後台規則，沒有即時匯率時才採用後台預設值。
  useEffect(() => {
    const initializeSettings = async () => {
      const [settingsResult, exchangeRateResult] = await Promise.allSettled([
        loadMjJapanSettings(),
        fetchExchangeRate(),
      ])

      if (settingsResult.status === "rejected") {
        console.error("取得後台設定失敗，使用本地預設:", settingsResult.reason)
        return
      }

      const { settings = {}, rules } = settingsResult.value
      if (rules?.categoryRules?.length) applyCategoryRules(rules.categoryRules)
      if (rules?.shippingRules?.length) applyShippingRules(rules.shippingRules)
      setRemoteSettings(settings)

      const hasLiveExchangeRate = exchangeRateResult.status === "fulfilled" && exchangeRateResult.value
      const defaultRate = Number(settings.defaultRate)
      if (!hasLiveExchangeRate && Number.isFinite(defaultRate) && defaultRate > 0) {
        setExchangeRate(defaultRate)
      }
    }

    initializeSettings()
    setDarkMode(localStorage.getItem("darkMode") === "true")
  }, [])

  // 深色模式變更時，將偏好儲存在瀏覽器。
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])

  const toggleCheck = (id: string) => {
    setExcludedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddProduct = () => {
    const id = createProductId()
    addedProductId.current = id
    setProducts((current) => {
      const lastProduct = current[current.length - 1]
      return [...current, {
        id,
        url: "",
        color: "",
        store: lastProduct?.store || "free",
        customStoreName: lastProduct?.customStoreName || "",
        price: 0,
        quantity: 1,
        category: "clothing",
        customShippingFee: lastProduct?.customShippingFee ?? 0,
      }]
    })
  }

  const handleRemoveProduct = (id: string) => {
    if (products.length <= 1) return
    setProducts(products.filter((product) => product.id !== id))
    if (excludedIds.has(id)) toggleCheck(id)
  }

  const handleProductChange = (updatedProduct: ProductItem) => {
    const currentProduct = products.find((product) => product.id === updatedProduct.id)
    const previousStoreKey = currentProduct ? getProductStoreKey(currentProduct) : updatedProduct.store
    const nextStoreKey = getProductStoreKey(updatedProduct)
    const syncCustomStore = isCustomStoreKey(previousStoreKey) && isCustomStoreKey(nextStoreKey)

    setProducts(products.map((product) => {
      if (product.id === updatedProduct.id) return updatedProduct
      if (!syncCustomStore || getProductStoreKey(product) !== previousStoreKey) return product

      return {
        ...product,
        store: nextStoreKey,
        customStoreName: updatedProduct.customStoreName,
        customShippingFee: updatedProduct.customShippingFee,
      }
    }))
  }

  return (
    <ThemeProvider attribute="class" forcedTheme={darkMode ? "dark" : "light"}>
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="min-h-screen bg-[var(--bg-page)] pb-40 text-[var(--text-primary)] lg:pb-0">
          <div className="mx-auto max-w-7xl">
            <Header toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />

            <main className="mt-6 grid grid-cols-1 gap-6 px-4 lg:grid-cols-2">
              <div className="lg:col-start-1 lg:row-start-1">
                <ExchangeRate
                  rate={exchangeRate}
                  lastUpdated={lastUpdated}
                  onRefresh={fetchExchangeRate}
                  onRateChange={setExchangeRate}
                />
              </div>

              <section id="products" aria-label="商品項目" className="order-1 scroll-mt-4 lg:col-start-1 lg:row-start-2">
                <ProductForm
                  products={products}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                  onProductChange={handleProductChange}
                  onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
                  onImportProducts={handleImportProducts}
                />
              </section>

              <section id="quote" tabIndex={-1} aria-label="平台估價" className="order-2 scroll-mt-4 space-y-4 outline-none lg:contents lg:space-y-0">
                <div className="lg:col-start-2 lg:row-start-1">
                  <PlatformSelector selectedPlatform={selectedPlatform} onPlatformChange={setSelectedPlatform} />
                </div>
                <div className="lg:col-start-2 lg:row-start-2">
                  <CalculationResult
                    products={products}
                    quote={quote}
                    selectedPlatform={selectedPlatform}
                    exchangeRate={exchangeRate}
                    onToggleCheck={toggleCheck}
                    viewingQuote={viewingQuote}
                    onViewQuote={onViewQuote}
                  />
                </div>
              </section>

              <div className="hidden rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-light)] p-4 text-center shadow-[var(--shadow-soft)] lg:col-span-2 lg:row-start-3 lg:flex lg:items-center lg:justify-center lg:gap-8">
                <p className="font-bold text-[var(--quote-accent)]">複製後傳送至</p>
                <QuoteSocialLinks className="flex flex-wrap justify-center gap-4" />
              </div>

              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="返回頁首"
                className="fixed bottom-4 right-4 hidden rounded-full bg-[var(--quote-action)] text-[var(--quote-action-text)] shadow-lg hover:bg-[var(--quote-action-hover)] lg:inline-flex"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </main>

            <Footer />
          </div>
        </div>

        <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} darkMode={darkMode} />
      </div>
    </ThemeProvider>
  )
}
