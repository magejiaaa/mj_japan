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
import { storeShippingConfig, getDomesticShippingFee } from "@/lib/storeConfig"
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
  const [itemPrices, setItemPrices] = useState<Map<string, { shopeePrice: number; otherPrice: number }>>(new Map())
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
            start_date: "2026-03-01",
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

    // 根據每家店的總金額計算國內運費
    processedStores.forEach((storeTotal, store) => {
      const customFee = store === "other"
        ? filteredProducts.find((p) => p.store === "other")?.customShippingFee
        : undefined
      totalDomesticShippingJPY += getDomesticShippingFee(store, storeTotal, customFee)
    })

    if (hasOtherCategory) totalInternationalShipping += 200

    filteredProducts.forEach((product) => {
      if (product.category === "other" || product.price <= 0) return
      totalInternationalShipping += getCategoryInfo(product.category).fee * product.quantity
    })

    const totalTWD = totalJPY * exchangeRate
    const totalDomesticShippingTWD = totalDomesticShippingJPY * exchangeRate
    const grandTotal = totalTWD + totalDomesticShippingTWD + totalInternationalShipping
    // 計算蝦皮價格 (總價/81.5%，取20的倍數)
    // 蝦皮手續費6%(成交) + 2.5%(金流) + 6%(免運) + 預購(3%) = 17.5%
    // 小規模人營業稅1%
    const shopeePrice = Math.ceil(grandTotal / 0.815 / 20) * 20
    // 計算其他平台價格 (蝦皮價格/1.175)
    const otherPlatformPrice = Math.ceil(shopeePrice / 1.175)

    // 計算每個商品的分攤價格
    const newItemPrices = new Map<string, { shopeePrice: number; otherPrice: number }>()

    // 先算每個 store 的總金額，用來分攤國內運費
    const storeTotalMap = new Map<string, number>()
    filteredProducts.forEach((product) => {
      if (product.price <= 0) return
      const amt = product.price * product.quantity
      storeTotalMap.set(product.store, (storeTotalMap.get(product.store) || 0) + amt)
    })
    // 計算「其他」類別商品的總數量，用來分攤 200 元固定運費
    const otherCategoryProducts = filteredProducts.filter((p) => p.category === "other" && p.price > 0)
    const totalOtherQuantity = otherCategoryProducts.reduce((sum, p) => sum + p.quantity, 0)

    // 第一輪：計算每個商品的未進位小計（用來決定分攤比例）
    const itemSubtotals = new Map<string, number>()
    filteredProducts.forEach((product) => {
      if (product.price <= 0) return

      // 1. 商品成本（台幣）
      const itemCostTWD = product.price * product.quantity * exchangeRate

      // 2. 分攤國內運費（按該店的商品金額比例）
      const storeTotal = storeTotalMap.get(product.store) || 0
      const storeDomesticShippingJPY = getDomesticShippingFee(product.store, storeTotal, product.customShippingFee)
      const itemStoreProportion = storeTotal > 0 ? (product.price * product.quantity) / storeTotal : 0
      const itemDomesticShippingTWD = storeDomesticShippingJPY * exchangeRate * itemStoreProportion

      // 3. 國際運費：「其他」類別固定 200 元依數量比例分攤，其他類別按件計算
      let itemIntlShipping: number
      if (product.category === "other") {
        itemIntlShipping = totalOtherQuantity > 0 ? (200 * product.quantity) / totalOtherQuantity : 0
      } else {
        const intlShippingPerItem = getCategoryInfo(product.category).fee
        itemIntlShipping = intlShippingPerItem * product.quantity
      }

      itemSubtotals.set(product.id, itemCostTWD + itemDomesticShippingTWD + itemIntlShipping)
    })

    // 第二輪：依各商品小計佔 grandTotal 的比例，從已進位的總價反推各商品售價
    // 最後一件商品補足差額，確保加總 = 總價，消除進位誤差
    const validProducts = filteredProducts.filter((p) => p.price > 0)
    let remainingShopee = shopeePrice
    let remainingOther = otherPlatformPrice
    validProducts.forEach((product, idx) => {
      const subtotal = itemSubtotals.get(product.id) ?? 0
      const isLast = idx === validProducts.length - 1

      let itemShopeePrice: number
      let itemOtherPrice: number

      if (isLast) {
        // 最後一件直接用剩餘差額，確保加總精確
        itemShopeePrice = remainingShopee
        itemOtherPrice = remainingOther
      } else {
        // 按比例分攤，取最近的 20 倍數（蝦皮）或整數（其他）
        const proportion = grandTotal > 0 ? subtotal / grandTotal : 0
        itemShopeePrice = Math.round((shopeePrice * proportion) / 20) * 20
        itemOtherPrice = Math.round(otherPlatformPrice * proportion)
        remainingShopee -= itemShopeePrice
        remainingOther -= itemOtherPrice
      }
      newItemPrices.set(product.id, {
        shopeePrice: itemShopeePrice,
        otherPrice: itemOtherPrice,
      })
    })
    setItemPrices(newItemPrices)

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
        customShippingFee: 0, // 新增自訂運費字段
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
                itemPrices={itemPrices}
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

  function getStoreAmounts(products: ProductItem[]): Map<string, number> {
    const map = new Map<string, number>()
    products.forEach((p) => {
      if (p.price <= 0) return
      map.set(p.store, (map.get(p.store) ?? 0) + p.price * p.quantity)
    })
    return map
  }
}
