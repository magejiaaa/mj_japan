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
  storeAmounts: Map<string, number>
}

export default function CalculationResult({ products, summary, exchangeRate, storeAmounts }: CalculationResultProps) {
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
      case "free":
        return "免運費"
      case "GRL":
        return "GRL"
      case "ZOZOTOWN":
        return "ZOZOTOWN"
      case "ROJITA":
        return "ROJITA"
      case "axesFemme":
        return "axes femme"
      default:
        return "其他"
    }
  }

  const getDomesticShippingFee = (store: string, storeTotal: number) => {
    // 判断是否达到免运费标准
    const isAmazonFreeShipping = store === "ROJITA" && storeTotal >= 10000
    const isRakutenFreeShipping = store === "rakuten" && storeTotal >= 4900

    if (store === "free" || isAmazonFreeShipping || isRakutenFreeShipping) {
      return 0
    }
    switch (store) {
      case "free":
        return 0
      case "GRL":
        return 0
      case "ZOZOTOWN":
        return 660
      case "ROJITA":
        return 650
      case "axesFemme":
        return 410
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
    // 添加选择的平台信息
    text += `下單平台: ${summary.selectedPlatform === "shopee" ? "蝦皮" : "其他平台"}\n\n`

    // 用於追踪已計算運費的店家
    const processedStores = new Map<string, { fee: number; products: string[]; total: number }>()

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
            fee: getDomesticShippingFee(product.store, storeAmounts.get(product.store) || 0),
            products: [`商品 #${index + 1}`],
            total: product.price * product.quantity,
          })
        } else {
          const storeInfo = processedStores.get(product.store)!
          storeInfo.products.push(`商品 #${index + 1}`)
          storeInfo.total += product.price * product.quantity
          processedStores.set(product.store, storeInfo)
        }

        text += `${index + 1}. ${product.url || "[未提供網址]"}\n`
        text += `   店家: ${storeName}\n`
        text += `   價格: ${formatCurrency(product.price, "JPY")} (${formatCurrency(twdPrice, "TWD")})\n`
        text += `   顏色尺寸: ${product.color}\n`
        text += `   類別: ${categoryInfo.name}\n`
        text += `   數量: ${product.quantity}\n`
        text += `   國際運費: ${formatCurrency(internationalShippingFee, "TWD")} (${categoryInfo.weight}/件)\n`
      }
    })

    // 添加店家運費信息
    text += "\n店家運費:\n"
    processedStores.forEach((info, store) => {
      const storeName = getStoreName(store)
      const domesticFee = info.fee
      const domesticFeeTWD = domesticFee * exchangeRate
      const storeTotal = info.total

      text += `${storeName}: ${formatCurrency(domesticFee, "JPY")} (${formatCurrency(domesticFeeTWD, "TWD")})\n`

      // 如果是免运费，添加说明
      if (domesticFee === 0) {
        if (store === "ROJITA" && storeTotal >= 10000) {
          text += `   已達ROJITA滿10,000日幣免運標準\n`
        } else if (store === "rakuten" && storeTotal >= 4900) {
          text += `   已達樂天滿4,900日幣免運標準\n`
        } else if (store === "free") {
          text += `   免日方運費\n`
        }
      }

      text += `   店家商品總額: ${formatCurrency(storeTotal, "JPY")}\n`
      text += `   包含商品: ${info.products.join(", ")}\n\n`
    })

    // 添加摘要
    text += "訂單摘要:\n"
    text += `商品總額: ${formatCurrency(summary.totalJPY, "JPY")} (${formatCurrency(summary.totalTWD, "TWD")})\n`
    text += `日本國內運費: ${formatCurrency(summary.totalDomesticShippingJPY, "JPY")} (${formatCurrency(summary.totalDomesticShippingTWD, "TWD")})\n`
    text += `國際運費: ${formatCurrency(summary.totalInternationalShipping, "TWD")}\n`
    text += `總計: ${formatCurrency(summary.grandTotal, "TWD")}\n`
    text += `蝦皮價格 (含手續費): ${formatCurrency(summary.shopeePrice, "TWD")}\n`
    text += `其他平台下單費用: ${formatCurrency(summary.otherPlatformPrice, "TWD")}\n`

    // 添加选择的平台的最终价格
    const finalPrice = summary.selectedPlatform === "shopee" ? summary.shopeePrice : summary.otherPlatformPrice

    text += `【${summary.selectedPlatform === "shopee" ? "蝦皮" : "其他平台"}】最終價格: ${formatCurrency(finalPrice, "TWD")}\n`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="bg-[#FADCD9] dark:bg-[#4D3A3D] border-none shadow-md">
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
              const storeTotal = storeAmounts.get(product.store) || 0
              const domesticShippingFee = getDomesticShippingFee(product.store, storeTotal)
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
                    <div>
                      <span className="text-black/60 dark:text-white/60">顏色尺寸:</span> {product.color}
                    </div>
                  </div>

                  <ShippingBreakdown
                    domesticShippingJPY={domesticShippingFee}
                    domesticShippingTWD={domesticShippingTWD}
                    internationalShipping={internationalShippingFee}
                    store={product.store}
                    storeTotal={storeTotal}
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
              {summary.totalDomesticShippingJPY === 0 && (
                <div className="text-green-600 dark:text-green-400 text-xs italic">*全部店家已達免運標準</div>
              )}
              <div className="flex justify-between">
                <span>國際運費 (台幣):</span>
                <span>{formatCurrency(summary.totalInternationalShipping, "TWD")}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#F8F0E3]/20">
                <span>總計:</span>
                <span>{formatCurrency(summary.grandTotal, "TWD")}</span>
              </div>
              {/* 显示两个平台的价格 */}
              <div className="mt-4 pt-2 border-t border-[#F8F0E3]/20">
                <div className="flex justify-between items-center">
                  <span className={summary.selectedPlatform === "shopee" ? "font-bold" : ""}>蝦皮價格 (含手續費):</span>
                  <span className={summary.selectedPlatform === "shopee" ? "font-bold" : ""}>
                    {formatCurrency(summary.shopeePrice, "TWD")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={summary.selectedPlatform === "other" ? "font-bold" : ""}>其他平台下單費用:</span>
                  <span className={summary.selectedPlatform === "other" ? "font-bold" : ""}>
                    {formatCurrency(summary.otherPlatformPrice, "TWD")}
                  </span>
                </div>
              </div>

              {/* 显示选择的平台 */}
              <div className="flex justify-between font-bold pt-2 mt-2 border-t border-[#F8F0E3]/20 text-[#F5B5B5] dark:text-[#F9F5EB]">
                <span>選擇下單平台:</span>
                <span>{summary.selectedPlatform === "shopee" ? "蝦皮" : "其他平台"}</span>
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

