"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import ExchangeRate from "@/components/exchange-rate"
import ProductForm from "@/components/product-form"
import CalculationResult from "@/components/calculation-result"
import CategoryModal from "@/components/category-modal"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import type { ProductItem, CalculationSummary } from "@/lib/types"

export default function Home() {
  const [exchangeRate, setExchangeRate] = useState<number>(0.23)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      url: "",
      store: "amazon",
      price: 0,
      quantity: 1,
      category: "clothing",
    },
  ])
  // 初始化 summary 状态，移除 serviceFee，添加新的价格字段
  const [summary, setSummary] = useState<CalculationSummary>({
    totalJPY: 0,
    totalTWD: 0,
    totalDomesticShippingJPY: 0,
    totalDomesticShippingTWD: 0,
    totalInternationalShipping: 0,
    shopeePrice: 0,
    otherPlatformPrice: 0,
    grandTotal: 0,
  })
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)

  // 獲取匯率
  const fetchExchangeRate = async () => {
    try {
      
      // FinMind 提供的匯率 API 端點
      const response = await fetch(
        'https://api.finmindtrade.com/api/v4/data?' + 
        new URLSearchParams({
          dataset: 'TaiwanExchangeRate',
          data_id: 'JPY',
          start_date: '2024-03-01'
        })
      )
      
      if (!response.ok) {
          throw new Error('Network response was not ok')
      }

      const data = await response.json()

      console.log(data)
      // 檢查是否有資料
      if (data.data && data.data.length > 0) {
          // 取得最新的匯率
          const latestRate = data.data[data.data.length - 1];
          // latestRate.cash_sell 無條件進到小數點第二位
          const rate = Math.ceil(latestRate.cash_sell * 100) / 100
          setExchangeRate(rate)
      }
      setLastUpdated(new Date())
    } catch (error) {
      console.error("無法獲取匯率:", error)
    }
  }

  // 當產品或匯率變化時計算總額
  useEffect(() => {
    calculateTotals()
  }, [products, exchangeRate])

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

  // 修改 calculateTotals 函数，移除服务费计算，添加新的价格计算
  const calculateTotals = () => {
    let totalJPY = 0
    let totalDomesticShippingJPY = 0
    let totalInternationalShipping = 0

    // 用於追踪已計算運費的店家
    const processedStores = new Set<string>()

    products.forEach((product) => {
      totalJPY += product.price * product.quantity

      // 計算日本國內運費（日幣）- 每個店家只計算一次
      if (!processedStores.has(product.store)) {
        let domesticShippingFee = 0
        switch (product.store) {
          case "free":
            domesticShippingFee = 0
            break
          case "GRL":
            domesticShippingFee = 0
            break
          case "ZOZOTOWN":
            domesticShippingFee = 660
            break
          case "yahoo":
            domesticShippingFee = 550
            break
          case "mercari":
            domesticShippingFee = 700
            break
          default:
            domesticShippingFee = 800
        }

        totalDomesticShippingJPY += domesticShippingFee
        processedStores.add(product.store)
      }

      // 計算國際運費（台幣）- 每件商品都要計算
      let internationalShippingPerItem = 0
      switch (product.category) {
        case "clothing":
          internationalShippingPerItem = 100
          break
        case "shoes":
          internationalShippingPerItem = 200
          break
        case "books":
          internationalShippingPerItem = 300
          break
        case "electronics":
          internationalShippingPerItem = 200
          break
        case "cosmetics":
          internationalShippingPerItem = 60
          break
        default:
          internationalShippingPerItem = 200
      }

      totalInternationalShipping += internationalShippingPerItem * product.quantity
    })

    const totalTWD = totalJPY * exchangeRate
    const totalDomesticShippingTWD = totalDomesticShippingJPY * exchangeRate
    const grandTotal = totalTWD + totalDomesticShippingTWD + totalInternationalShipping

    // 计算蝦皮价格 (总价/82.5%，取20的倍数)
    const rawShopeePrice = grandTotal / 0.825
    const shopeePrice = Math.ceil(rawShopeePrice / 20) * 20

    // 计算其他平台价格 (蝦皮价格/1.165)
    const otherPlatformPrice = Math.ceil(shopeePrice / 1.165)

    setSummary({
      totalJPY,
      totalTWD,
      totalDomesticShippingJPY,
      totalDomesticShippingTWD,
      totalInternationalShipping,
      shopeePrice,
      otherPlatformPrice,
      grandTotal,
    })
  }

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        url: "",
        store: "amazon",
        price: 0,
        quantity: 1,
        category: "clothing",
      },
    ])
  }

  const handleRemoveProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((product) => product.id !== id))
    }
  }

  const handleProductChange = (updatedProduct: ProductItem) => {
    setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
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
        <div className="min-h-screen bg-[#FADCD9] dark:bg-[#3D2A2D] text-[#F8F0E3]">
          <div className="container mx-auto px-4 py-8">
            <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

            <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                />
              </div>

              <div>
                <CalculationResult products={products} summary={summary} exchangeRate={exchangeRate} />
              </div>
            </main>

            <Footer />
          </div>
        </div>

        <CategoryModal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} darkMode={darkMode} />
      </div>
    </ThemeProvider>
  )
}

