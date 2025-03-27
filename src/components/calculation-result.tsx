"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductItem, CalculationSummary } from "@/lib/types"
import { useState } from "react"
import ShippingBreakdown from "@/components/shipping-breakdown"

interface CalculationResultProps {
  products: ProductItem[]
  summary: CalculationSummary
  exchangeRate: number
}

export default function CalculationResult({ products, summary, exchangeRate }: CalculationResultProps) {
  const [copied, setCopied] = useState(false)

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "clothing":
        return { weight: "0.5kg", fee: 100, name: "衣物" }
      case "shoes":
        return { weight: "1kg", fee: 200, name: "鞋類" }
      case "books":
        return { weight: "1.5kg", fee: 300, name: "書籍" }
      case "electronics":
        return { weight: "1kg", fee: 200, name: "電子產品" }
      case "cosmetics":
        return { weight: "0.3kg", fee: 60, name: "化妝品" }
      default:
        return { weight: "1kg", fee: 200, name: "其他" }
    }
  }

  const getStoreName = (store: string) => {
    switch (store) {
      case "amazon":
        return "Amazon Japan"
      case "rakuten":
        return "樂天 Rakuten"
      case "yahoo":
        return "Yahoo Japan"
      case "mercari":
        return "Mercari"
      default:
        return "其他"
    }
  }

  const getDomesticShippingFee = (store: string) => {
    switch (store) {
      case "amazon":
        return 500
      case "rakuten":
        return 600
      case "yahoo":
        return 550
      case "mercari":
        return 700
      default:
        return 800
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: currency === "JPY" ? "JPY" : "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const copyToClipboard = () => {
    let text = "===== 秘境好物分享訂單 =====\n\n"

    // 添加匯率信息
    text += `匯率: 1 日幣 = ${exchangeRate.toFixed(4)} 台幣\n\n`

    // 用於追踪已計算運費的店家
    const processedStores = new Map<string, { fee: number; products: string[] }>()

    // 添加產品詳情
    text += "商品:\n"
    products.forEach((product, index) => {
      if (product.price > 0) {
        const categoryInfo = getCategoryInfo(product.category)
        const storeName = getStoreName(product.store)
        const internationalShippingFee = categoryInfo.fee * product.quantity
        const twdPrice = product.price * exchangeRate

        // 收集每個店家的商品
        if (!processedStores.has(product.store)) {
          processedStores.set(product.store, {
            fee: getDomesticShippingFee(product.store),
            products: [`商品 #${index + 1}`],
          })
        } else {
          processedStores.get(product.store)?.products.push(`商品 #${index + 1}`)
        }

        text += `${index + 1}. ${product.url || "[未提供網址]"}\n`
        text += `   店家: ${storeName}\n`
        text += `   價格: ${formatCurrency(product.price, "JPY")} (${formatCurrency(twdPrice, "TWD")})\n`
        text += `   類別: ${categoryInfo.name}\n`
        text += `   數量: ${product.quantity}\n`
        text += `   國際運費: ${formatCurrency(internationalShippingFee, "TWD")} (${categoryInfo.weight}/件)\n\n`
      }
    })

    // 添加店家運費信息
    text += "店家運費:\n"
    processedStores.forEach((info, store) => {
      const storeName = getStoreName(store)
      const domesticFee = info.fee
      const domesticFeeTWD = domesticFee * exchangeRate
      text += `${storeName}: ${formatCurrency(domesticFee, "JPY")} (${formatCurrency(domesticFeeTWD, "TWD")})\n`
      text += `   包含商品: ${info.products.join(", ")}\n\n`
    })

    // 添加摘要
    text += "訂單摘要:\n"
    text += `商品總額: ${formatCurrency(summary.totalJPY, "JPY")} (${formatCurrency(summary.totalTWD, "TWD")})\n`
    text += `日本國內運費: ${formatCurrency(summary.totalDomesticShippingJPY, "JPY")} (${formatCurrency(summary.totalDomesticShippingTWD, "TWD")})\n`
    text += `國際運費: ${formatCurrency(summary.totalInternationalShipping, "TWD")}\n`
    text += `服務費 (8%): ${formatCurrency(summary.serviceFee, "TWD")}\n`
    text += `總計: ${formatCurrency(summary.grandTotal, "TWD")}\n`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="bg-[#F5B5B5] dark:bg-[#4D3A3D] border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">計算結果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">商品詳情</h3>
            {products.map((product, index) => {
              if (product.price <= 0) return null

              const categoryInfo = getCategoryInfo(product.category)
              const storeName = getStoreName(product.store)
              const domesticShippingFee = getDomesticShippingFee(product.store)
              const twdPrice = product.price * exchangeRate
              const domesticShippingTWD = domesticShippingFee * exchangeRate
              const internationalShippingFee = categoryInfo.fee * product.quantity

              return (
                <div key={product.id} className="p-3 bg-[#F9F5EB] dark:bg-[#3D2A2D] rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium text-black dark:text-white">商品 #{index + 1}</div>
                    <div className="text-xs text-black/60 dark:text-white/60">
                      {storeName} | {categoryInfo.name} ({categoryInfo.weight})
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-black/80 dark:text-white/80 truncate">
                    {product.url || "[未提供網址]"}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-black dark:text-white">
                    <div>
                      <span className="text-black/60 dark:text-white/60">價格:</span>{" "}
                      {formatCurrency(product.price, "JPY")}
                    </div>
                    <div>
                      <span className="text-black/60 dark:text-white/60">台幣:</span> {formatCurrency(twdPrice, "TWD")}
                    </div>
                    <div>
                      <span className="text-black/60 dark:text-white/60">數量:</span> {product.quantity}
                    </div>
                  </div>

                  <ShippingBreakdown
                    domesticShippingJPY={domesticShippingFee * product.quantity}
                    domesticShippingTWD={domesticShippingTWD * product.quantity}
                    internationalShipping={internationalShippingFee}
                  />
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-[#F8F0E3]/20">
            <h3 className="font-medium mb-3">訂單摘要</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>商品總額 (日幣):</span>
                <span>{formatCurrency(summary.totalJPY, "JPY")}</span>
              </div>
              <div className="flex justify-between">
                <span>商品總額 (台幣):</span>
                <span>{formatCurrency(summary.totalTWD, "TWD")}</span>
              </div>
              <div className="flex justify-between">
                <span>日本國內運費 (日幣):</span>
                <span>{formatCurrency(summary.totalDomesticShippingJPY, "JPY")}</span>
              </div>
              <div className="flex justify-between">
                <span>日本國內運費 (台幣):</span>
                <span>{formatCurrency(summary.totalDomesticShippingTWD, "TWD")}</span>
              </div>
              <div className="flex justify-between">
                <span>國際運費 (台幣):</span>
                <span>{formatCurrency(summary.totalInternationalShipping, "TWD")}</span>
              </div>
              <div className="flex justify-between">
                <span>服務費 (8%):</span>
                <span>{formatCurrency(summary.serviceFee, "TWD")}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#F8F0E3]/20">
                <span>總計:</span>
                <span>{formatCurrency(summary.grandTotal, "TWD")}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={copyToClipboard}
            className="w-full bg-[#F9F5EB] hover:bg-[#F9F5EB]/80 text-black dark:bg-[#3D2A2D] dark:hover:bg-[#3D2A2D]/80 dark:text-white"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "已複製到剪貼簿！" : "一鍵複製"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

