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
  const [exchangeRate, setExchangeRate] = useState<number>(0.22)
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
  const [summary, setSummary] = useState<CalculationSummary>({
    totalJPY: 0,
    totalTWD: 0,
    totalDomesticShippingJPY: 0,
    totalDomesticShippingTWD: 0,
    totalInternationalShipping: 0,
    serviceFee: 0,
    grandTotal: 0,
  })
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false)

  // 獲取匯率
  const fetchExchangeRate = async () => {
    try {
      // 在實際應用中，您會從真實的API獲取
      // 為了演示目的，我們將模擬一個帶有輕微隨機變化的獲取
      const newRate = 0.22
      setExchangeRate(Number.parseFloat(newRate.toFixed(4)))
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

  // 修改 calculateTotals 函數，使同一店家的運費只計算一次
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
          case "amazon":
            domesticShippingFee = 500
            break
          case "rakuten":
            domesticShippingFee = 600
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
    const serviceFee = totalJPY * 0.08 * exchangeRate // 8% 服務費
    const grandTotal = totalTWD + totalDomesticShippingTWD + totalInternationalShipping + serviceFee

    setSummary({
      totalJPY,
      totalTWD,
      totalDomesticShippingJPY,
      totalDomesticShippingTWD,
      totalInternationalShipping,
      serviceFee,
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

