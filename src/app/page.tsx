"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Facebook, Instagram } from "lucide-react"
import Header from "@/components/header"
import ExchangeRate from "@/components/exchange-rate"
import ProductForm from "@/components/product-form"
import CalculationResult from "@/components/calculation-result"
import CategoryModal from "@/components/category-modal"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import PlatformSelector from "@/components/platform-selector"
import { ThemeProvider } from "@/components/theme-provider"
import type { CalculationSummary, ProductItem } from "@/lib/types"
import { storeShippingConfig } from "@/lib/storeConfig"
import { getCategoryInfo } from "@/lib/categoryMap"

export default function Home() {
  const [exchangeRate, setExchangeRate] = useState<number>(0.23)
  const [lastUpdated, setLastUpdated] = useState<string>("-")
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      url: "",
      color: "",
      store: "free",
      price: 0,
      quantity: 1,
      category: "clothing",
    },
  ])
  const [summary, setSummary] = useState<CalculationSummary>({
    totalJPY: 0,
    totalTWD: 0,
    totalDomesticShippingJPY: 0,
    totalDomesticShippingTWD: 0,
    totalInternationalShipping: 0,
    shopeePrice: 0,
    otherPlatformPrice: 0,
    grandTotal: 0,
    selectedPlatform: "myship", // 默認賣貨便
  })
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)
  // 只計算勾選的價格(預設勾選)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const handleImportProducts = (imported: ProductItem[]) => {
    if (imported.length > 0) setProducts(imported)
  }

  const fetchExchangeRate = async () => {
    try {
      // FinMind 提供的匯率 API 端點
      const response = await fetch(
        "https://api.finmindtrade.com/api/v4/data?" +
          new URLSearchParams({
            dataset: "TaiwanExchangeRate",
            data_id: "JPY",
            start_date: "2025-03-01",
          }),
      )

      if (!response.ok) throw new Error("Network response was not ok")

      const data = await response.json()
      if (data.data?.length > 0) {
        const latestRate = data.data[data.data.length - 1]
        const rate = Math.ceil(latestRate.cash_sell * 100) / 100
        setExchangeRate(rate)
        setLastUpdated(latestRate.date)
      }
    } catch (error) {
      console.error("取得匯率失敗:", error)
    }
  }

  // 當產品或匯率變化時計算總額
  useEffect(() => {
    calculateTotals()
  }, [products, exchangeRate, summary.selectedPlatform, checkedIds])

  // 初始獲取匯率
  useEffect(() => {
    fetchExchangeRate()
    setDarkMode(localStorage.getItem("darkMode") === "true")
  }, [])

  // 當深色模式變化時更新localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])


  // 新增商品時自動打勾
  useEffect(() => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      products.forEach((p) => {
        if (p.price > 0 && !next.has(p.id)) next.add(p.id)
      })

      const productIds = new Set(products.map((p) => p.id))
      next.forEach((id) => {
        if (!productIds.has(id)) next.delete(id)
      })
      return next
    })
  }, [products])

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const calculateTotals = () => {
    // 只計算勾選的商品
    const filteredProducts = products.filter((p) => checkedIds.has(p.id))
    let totalJPY = 0
    let totalDomesticShippingJPY = 0
    let totalInternationalShipping = 0

    // 用於追踪已計算運費的店家和每家店的總金額
    const processedStores = new Map<string, number>()
    // 用於追蹤"其他"類別的商品，確保只計算一次國際運費
    const hasOtherCategory = filteredProducts.some((product) => product.category === "other" && product.price > 0)

    // 首先計算每家店的總金額
    filteredProducts.forEach((product) => {
      const productTotal = product.price * product.quantity
      totalJPY += productTotal

      // 累計每家店的總金額
      if (product.price <= 0) return
      processedStores.set(product.store, (processedStores.get(product.store) ?? 0) + productTotal)
    })

    processedStores.forEach((storeTotal, store) => {
      const config = storeShippingConfig[store] || storeShippingConfig.default

      if (store === "other") {
        // 對於"其他"店家，尋找該店家的第一個商品，使用其自訂運費
        const productWithCustomFee = filteredProducts.find((p) => p.store === "other")
        totalDomesticShippingJPY += productWithCustomFee?.customShippingFee || 0
      } else if (store === "canshop" && storeTotal >= config.freeThreshold) {
        totalDomesticShippingJPY += 330
      } else if (storeTotal < config.freeThreshold) {
        totalDomesticShippingJPY += config.fee
      }
    })

    if (hasOtherCategory) totalInternationalShipping += 200

    filteredProducts.forEach((product) => {
      if (product.category === "other" || product.price <= 0) return
      totalInternationalShipping += getCategoryInfo(product.category).fee * product.quantity
    })

    const totalTWD = totalJPY * exchangeRate
    const totalDomesticShippingTWD = totalDomesticShippingJPY * exchangeRate
    const grandTotal = totalTWD + totalDomesticShippingTWD + totalInternationalShipping
    const shopeePrice = Math.ceil(grandTotal / 0.815 / 20) * 20
    const otherPlatformPrice = Math.ceil(shopeePrice / 1.175)

    setSummary((prev) => ({
      totalJPY,
      totalTWD,
      totalDomesticShippingJPY,
      totalDomesticShippingTWD,
      totalInternationalShipping,
      shopeePrice,
      otherPlatformPrice,
      grandTotal,
      selectedPlatform: prev.selectedPlatform,
    }))
  }

  const handleAddProduct = () => {
    const lastProduct = products[products.length - 1]
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        url: "",
        color: "",
        store: lastProduct?.store || "free",
        price: 0,
        quantity: 1,
        category: "clothing",
        customShippingFee: 0,
      },
    ])

    setTimeout(() => {
      const productList = document.querySelector(window.innerWidth > 768 ? ".product-list" : ".product-list-box")
      productList?.scrollTo({ top: productList.scrollHeight, behavior: "smooth" })
    }, 0)
  }

  const handleRemoveProduct = (id: string) => {
    if (products.length > 1) setProducts(products.filter((product) => product.id !== id))
  }

  const handleProductChange = (updatedProduct: ProductItem) => {
    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
  }

  const handlePlatformChange = (platform: "shopee" | "iopen" | "myship") => {
    setSummary((prev) => ({
      ...prev,
      selectedPlatform: platform,
    }))
  }

  return (
    <ThemeProvider attribute="class" defaultTheme={darkMode ? "dark" : "light"}>
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
          <div className="mx-auto max-w-7xl">
            <Header toggleDarkMode={() => setDarkMode(!darkMode)} darkMode={darkMode} />

            <main className="mt-6 grid grid-cols-1 gap-6 px-4 lg:grid-cols-2">
              {/* 當前匯率 JP */}
              <ExchangeRate
                rate={exchangeRate}
                lastUpdated={lastUpdated}
                onRefresh={fetchExchangeRate}
                onRateChange={setExchangeRate}
              />
              <PlatformSelector selectedPlatform={summary.selectedPlatform} onPlatformChange={handlePlatformChange} />
              {/* 商品項目 */}
              <ProductForm
                products={products}
                onAddProduct={handleAddProduct}
                onRemoveProduct={handleRemoveProduct}
                onProductChange={handleProductChange}
                onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
                onImportProducts={handleImportProducts}
              />
              <CalculationResult
                products={products}
                summary={summary}
                exchangeRate={exchangeRate}
                storeAmounts={getStoreAmounts(products)}
                checkedIds={checkedIds}
                onToggleCheck={toggleCheck}
              />
              {/* 複製傳送 */}
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-light)] p-4 text-center shadow-[var(--shadow-soft)] lg:col-span-2 md:flex md:items-center md:justify-center md:gap-8">
                <p className="mb-3 font-bold text-[var(--color-primary-hover)] md:mb-0">複製後傳送至</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://www.instagram.com/mjj_japan?utm_source=ig_web_button_share_sheet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                  >
                    <Instagram />
                    Instagram
                  </a>
                  <a
                    href="https://www.facebook.com/mjJapan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-btn"
                  >
                    <Facebook />
                    Facebook
                  </a>
                </div>
              </div>

              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-4 right-4 rounded-full bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary-hover)]"
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

  function getStoreAmounts(items: ProductItem[]): Map<string, number> {
    const storeAmounts = new Map<string, number>()
    items.forEach((product) => {
      if (product.price <= 0) return
      storeAmounts.set(product.store, (storeAmounts.get(product.store) ?? 0) + product.price * product.quantity)
    })
    return storeAmounts
  }
}
