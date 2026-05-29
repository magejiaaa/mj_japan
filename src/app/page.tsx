"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import ExchangeRate from "@/components/exchange-rate"
import ProductForm from "@/components/product-form"
import CalculationResult from "@/components/calculation-result"
import CategoryModal from "@/components/category-modal"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import PlatformSelector from "@/components/platform-selector"
import { ThemeProvider } from "@/components/theme-provider"
import type { ProductItem, CalculationSummary } from "@/lib/types"
import { Instagram, Facebook, ArrowUp } from "lucide-react"
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
  const handleImportProducts = (imported: ProductItem[]) => {
    setProducts(imported);
  };
  // 初始化 summary 狀態
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

  // 獲取匯率
  const fetchExchangeRate = async () => {
    try {
      
      // FinMind 提供的匯率 API 端點
      const response = await fetch(
        'https://api.finmindtrade.com/api/v4/data?' + 
        new URLSearchParams({
          dataset: 'TaiwanExchangeRate',
          data_id: 'JPY',
          start_date: '2026-03-01'
        })
      )
      
      if (!response.ok) {
          throw new Error('Network response was not ok')
      }

      const data = await response.json()

      // 檢查是否有資料
      if (data.data && data.data.length > 0) {
          // 取得最新的匯率
          const latestRate = data.data[data.data.length - 1];
          // latestRate.cash_sell 無條件進到小數點第二位
          const rate = Math.ceil(latestRate.cash_sell * 100) / 100
          setExchangeRate(rate)
      }
      setLastUpdated(data.data[data.data.length - 1].date)
    } catch (error) {
      console.error("無法獲取匯率:", error)
    }
  }

  // 當產品或匯率變化時計算總額
  useEffect(() => {
    calculateTotals()
  }, [products, exchangeRate, summary.selectedPlatform, checkedIds])

  // 初始獲取匯率
  useEffect(() => {
    fetchExchangeRate()

    // 檢查保存的深色模式偏好
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
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
        if (p.price > 0 && !next.has(p.id)) {
          next.add(p.id)
        }
      })
      // 移除已刪除商品的 id
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
      if (processedStores.has(product.store)) {
        processedStores.set(product.store, processedStores.get(product.store)! + productTotal)
      } else {
        processedStores.set(product.store, productTotal)
      }
    })
    
    // 根據每家店的總金額計算國內運費
    processedStores.forEach((storeTotal, store) => {
      const customFee = store === "other"
        ? filteredProducts.find((p) => p.store === "other")?.customShippingFee
        : undefined
      totalDomesticShippingJPY += getDomesticShippingFee(store, storeTotal, customFee)
    })

    // 計算國際運費（台幣）- 每件商品都要計算，但"其他"類別只計算一次
    if (hasOtherCategory) {
      // 若有"其他"類別的商品，直接加上200元固定運費
      totalInternationalShipping += 200
    }
    filteredProducts.forEach((product) => {
      // 跳過"其他"類別的商品，因為已經計算過了
      if (product.category === "other") return
      if (product.price <= 0) return

      const internationalShippingPerItem = getCategoryInfo(product.category).fee
      totalInternationalShipping += internationalShippingPerItem * product.quantity
    })

    const totalTWD = totalJPY * exchangeRate
    const totalDomesticShippingTWD = totalDomesticShippingJPY * exchangeRate
    const grandTotal = totalTWD + totalDomesticShippingTWD + totalInternationalShipping

    // 計算蝦皮價格 (總價/81.5%，取20的倍數)
    // 蝦皮手續費6%(成交) + 2.5%(金流) + 6%(免運) + 預購(3%) = 17.5%
    // 小規模人營業稅1%
    const rawShopeePrice = grandTotal / 0.815
    const shopeePrice = Math.ceil(rawShopeePrice / 20) * 20

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

    setSummary({
      totalJPY,
      totalTWD,
      totalDomesticShippingJPY,
      totalDomesticShippingTWD,
      totalInternationalShipping,
      shopeePrice,
      otherPlatformPrice,
      grandTotal,
      selectedPlatform: summary.selectedPlatform,
    })
  }

  const handleAddProduct = () => {
    // 新增的商品store取上一個商品的store
    const lastProduct = products[products.length - 1]
      ? products[products.length - 1].store
      : "free"
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        url: "",
        color: "",
        store: lastProduct,
        price: 0,
        quantity: 1,
        category: "clothing",
        customShippingFee: 0, // 新增自訂運費字段
      },
    ])
    // 滾動至新增的商品，手機版不需要
    if (window.innerWidth > 768) {
      setTimeout(() => {
        const productList = document.querySelector(".product-list")
        if (productList) {
          productList.scrollTop = productList.scrollHeight
        }
      }, 0)
    } else {
      // 手機版滾動至.product-list-box最底部的位置
      setTimeout(() => {
        const productListBox = document.querySelector(".product-list-box")
        if (productListBox) {
          const rect = productListBox.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          window.scrollTo({
            top: rect.top + scrollTop + productListBox.scrollHeight - 560,
            behavior: "smooth", // 平滑滾動
          })
        }
      }, 0)
    }
  }

  const handleRemoveProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((product) => product.id !== id))
    }
  }

  const handleProductChange = (updatedProduct: ProductItem) => {
    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
  }

  const handlePlatformChange = (platform: "shopee" | "iopen" | "myship") => {
    setSummary({
      ...summary,
      selectedPlatform: platform,
    })
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true)
  }

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme={darkMode ? "dark" : "light"}>
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="min-h-screen bg-[#F5B5B5] dark:bg-[#3D2A2D] text-[#F8F0E3]">
          <div className="container mx-auto px-0 pb-8">
            <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

            <main className="mt-8 px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ExchangeRate
                  rate={exchangeRate}
                  lastUpdated={lastUpdated}
                  onRefresh={fetchExchangeRate}
                  onRateChange={setExchangeRate}
                />

                <ProductForm
                  products={products}
                  onAddProduct={handleAddProduct}
                  onRemoveProduct={handleRemoveProduct}
                  onProductChange={handleProductChange}
                  onOpenCategoryModal={openCategoryModal}
                  onImportProducts={handleImportProducts}
                />
              </div>

              <div className="space-y-6">
                <PlatformSelector selectedPlatform={summary.selectedPlatform} onPlatformChange={handlePlatformChange} />
                <CalculationResult
                  products={products}
                  summary={summary}
                  exchangeRate={exchangeRate}
                  storeAmounts={getStoreAmounts(products)}
                  checkedIds={checkedIds}
                  onToggleCheck={toggleCheck}
                  itemPrices={itemPrices}
                />

                <div className="flex justify-center items-center gap-2 mt-8">
                  <p>複製後傳送至</p>
                  <a href="https://www.instagram.com/mjj_japan?utm_source=ig_web_button_share_sheet" target="_blank" className="social-link-btn">
                    <Instagram />Instagram
                  </a>
                  <a href="https://www.facebook.com/mjJapan/" target="_blank" className="social-link-btn">
                    <Facebook />Facebook
                  </a>
                </div>
              </div>

              {/* scroll to top */}
              <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="bg-[#F9F5EB] hover:bg-[#F9F5EB]/80 text-black dark:bg-[#3D2A2D] dark:hover:bg-[#3D2A2D]/80 dark:text-white rounded-full fixed bottom-4 right-4">
                <ArrowUp className="h-4 w-4" />
              </Button>
            </main>

            <Footer />
          </div>
        </div>

        <CategoryModal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} darkMode={darkMode} />
      </div>
    </ThemeProvider>
  )

  // 輔助函數：取得每個店家的總金額
  function getStoreAmounts(products: ProductItem[]): Map<string, number> {
    const map = new Map<string, number>()
    products.forEach((p) => {
      if (p.price <= 0) return
      map.set(p.store, (map.get(p.store) ?? 0) + p.price * p.quantity)
    })
    return map
  }
}

