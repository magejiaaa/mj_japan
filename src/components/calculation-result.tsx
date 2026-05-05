"use client"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldLabel,
} from "@/components/ui/field"
import type { ProductItem, CalculationSummary } from "@/lib/types"
import { useState, useEffect } from "react"
import ShippingBreakdown from "@/components/shipping-breakdown"
import { storeShippingConfig } from "@/lib/storeShippingConfig"
import { getStoreName } from "@/lib/storeNameMap"
import { getCategoryInfo } from "@/lib/categoryMap"

interface CalculationResultProps {
  products: ProductItem[]
  summary: CalculationSummary
  exchangeRate: number
  storeAmounts: Map<string, number>
  checkedIds: Set<string>
  onToggleCheck: (id: string) => void
}

export default function CalculationResult({ products, summary, exchangeRate, storeAmounts, checkedIds, onToggleCheck }: CalculationResultProps) {
  const [copied, setCopied] = useState(false)
  // 只取打勾的商品
  const checkedProducts = products.filter((p) => p.price > 0 && checkedIds.has(p.id))

  const getDomesticShippingFee = (store: string, storeTotal: number) => {
    const config = storeShippingConfig[store] || storeShippingConfig.default
    // 如果是canshop達免運標準，則運費330日幣
    if (store === "canshop" && storeTotal >= config.freeThreshold) {
      return 330;
    } else {
      // 如果是其他店家達免運標準，則運費0日幣
      return storeTotal >= config.freeThreshold ? 0 : config.fee;
    }
  };

  // 計算國際運費，"其他"類別只計算一次固定200元
  const getInternationalShippingFee = (product: ProductItem, otherCategoryProcessed: boolean) => {
    if (product.category === "other") {
      // 如果是"其他"類別且已經處理過，返回0
      if (otherCategoryProcessed) {
        return 0
      }
      // 否則回傳固定200元，不考慮數量
      return 200
    }

    // 其他類別正常計算
    const categoryInfo = getCategoryInfo(product.category)
    return categoryInfo.fee * product.quantity
  }
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: currency === "JPY" ? "JPY" : "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getShopName = (store: string) => {
    switch (store) {
      case "shopee":
        return "蝦皮"
      case "myship":
        return "賣貨便"
      case "iopen":
        return "iopen mall"
      default:
        return "其他平台"
    }
  }
  const copyToClipboard = () => {
    // 只複製打勾的商品
    if (checkedProducts.length === 0) {
      alert("請至少勾選一項商品")
      return
    }

    let text = "===== 秘境好物分享訂單 =====\n\n"

    // 添加匯率訊息
    text += `匯率: 1 日幣 = ${exchangeRate.toFixed(2)} 台幣\n\n`
    // 添加選擇的平台訊息
    text += `下單平台: ${getShopName(summary.selectedPlatform)}\n`

    // 用於追踪已計算運費的店家
    const processedStores = new Map<string, { fee: number; products: string[]; total: number }>()
    // 用於追蹤"其他"類別是否已處理
    let otherCategoryProcessed = false
    // 添加產品詳情
    text += "商品:\n"
    checkedProducts.forEach((product, index) => {
      if (product.price > 0) {
        const categoryInfo = getCategoryInfo(product.category)
        const storeName = getStoreName(product.store)
        const internationalShippingFee = getInternationalShippingFee(product, otherCategoryProcessed)
        
        // 如果是"其他"類別且有運費，標記為已處理
        if (product.category === "other" && internationalShippingFee > 0) {
          otherCategoryProcessed = true
        }
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
        text += `   價格: ${formatCurrency(product.price, "JPY")}\n`
        text += `   顏色尺寸: ${product.color}\n`
        text += `   類別: ${categoryInfo.name}\n`
        text += `   數量: ${product.quantity}\n`
        // 對於"其他"類別，特別說明國際運費
        if (product.category === "other") {
          text += `   國際運費: ${formatCurrency(internationalShippingFee, "TWD")} (固定運費)\n`
        } else {
          text += `   國際運費: ${formatCurrency(internationalShippingFee, "TWD")} (${categoryInfo.weight}/件)\n`
        }
      }
    })

    // 添加摘要
    text += "訂單摘要:\n"
    text += `商品總額: ${formatCurrency(summary.totalJPY, "JPY")} (${formatCurrency(summary.totalTWD, "TWD")})\n`
    text += `日本國內運費: ${formatCurrency(summary.totalDomesticShippingJPY, "JPY")} (${formatCurrency(summary.totalDomesticShippingTWD, "TWD")})\n`
    text += `國際運費: ${formatCurrency(summary.totalInternationalShipping, "TWD")}\n`

    // 添加選擇的平台的最終價格
    const finalPrice = summary.selectedPlatform === "shopee" ? summary.shopeePrice : summary.otherPlatformPrice

    text += `【${summary.selectedPlatform === "shopee" ? "蝦皮" : "賣貨便、iopen"}】最終價格: ${formatCurrency(finalPrice, "TWD")}\n`

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
            {products[0].price <= 0 && (
              <div className="text-sm text-black/60 dark:text-white/60">尚無商品資料</div>
            )}
            {products.map((product, index) => {
              if (product.price <= 0) return null

              const categoryInfo = getCategoryInfo(product.category)
              const storeName = getStoreName(product.store)

              // 計算此商品佔總額的比例，分配最終價格
              const productSubtotalTWD = product.price * product.quantity * exchangeRate
              const proportion = summary.totalTWD > 0 ? productSubtotalTWD / summary.totalTWD : 0
              const allocatedShopeePrice = Math.round(summary.shopeePrice * proportion)
              const allocatedOtherPrice = Math.round(summary.otherPlatformPrice * proportion)

              const isChecked = checkedIds.has(product.id)

              return (
                <FieldLabel key={product.id} className="bg-[#F9F5EB] dark:bg-[#3D2A2D] rounded-md">
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleCheck(product.id)}
                    ></Checkbox>
                    <FieldContent>
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-black dark:text-white">
                        商品 #{index + 1}
                      </div>
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
                        <span className="text-black/60 dark:text-white/60">數量:</span> {product.quantity}
                      </div>
                      <div>
                        <span className="text-black/60 dark:text-white/60">顏色尺寸:</span> {product.color}
                      </div>
                    </div>

                    {/* 分攤後的最終單品價格 */}
                    {isChecked && (
                    <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
                      <div className={summary.selectedPlatform === "shopee" ? "font-bold text-[#f36060] dark:text-[#F9F5EB]" : "text-black/70 dark:text-white/70"}>
                        <div>蝦皮單價:</div>
                        <div>{formatCurrency(allocatedShopeePrice, "TWD")}</div>
                      </div>
                      <div className={["myship", "iopen"].includes(summary.selectedPlatform) ? "font-bold text-[#f36060] dark:text-[#F9F5EB]" : "text-black/70 dark:text-white/70"}>
                        <div>賣貨便、iopen單價:</div>
                        <div>{formatCurrency(allocatedOtherPrice, "TWD")}</div>
                      </div>
                    </div>
                    )}
                    </FieldContent>
                  </Field>
                </FieldLabel>
              )
            })}
          </div>

          <div className="border-t border-[#F8F0E3]/20">
            <h3 className="font-medium mb-3">訂單摘要</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>商品總額 (日幣):</span>
                <span>{formatCurrency(summary.totalJPY, "JPY")}</span>
              </div>
              <div className="flex justify-between">
                <span>日本國內運費 (日幣):</span>
                <span>{formatCurrency(summary.totalDomesticShippingJPY, "JPY")}</span>
              </div>
              
              {/* 依店家顯示運費明細 */}
              {Array.from(storeAmounts.entries()).map(([store, storeTotal]) => {
                const storeProducts = products.filter((p) => p.store === store && p.price > 0)
                if (storeProducts.length === 0) return null
                const firstProduct = storeProducts[0]

                // 如果有自訂運費，直接使用自訂運費
                const customFee = firstProduct.customShippingFee
                const domesticShippingFee = (store === "other" && customFee !== undefined)
                  ? customFee
                  : getDomesticShippingFee(store, storeTotal)
                const domesticShippingTWD = domesticShippingFee * exchangeRate

                return (
                  <ShippingBreakdown
                    key={store}
                    domesticShippingJPY={domesticShippingFee}
                    domesticShippingTWD={domesticShippingTWD}
                    store={store}
                    storeTotal={storeTotal}
                    isCustomShipping={store === "other" && firstProduct.customShippingFee !== undefined}
                    isOtherCategory={firstProduct.category === "other"}
                  />
                )
              })}
              {summary.totalDomesticShippingJPY === 0 && (
                <div className="text-green-600 dark:text-green-400 text-xs italic">*全部店家已達免運標準</div>
              )}
              <div className="flex justify-between">
                <span>國際運費 (台幣):</span>
                <span>{formatCurrency(summary.totalInternationalShipping, "TWD")}</span>
              </div>
              {products.some((p) => p.category === "other" && p.price > 0) && (
                <div className="text-xs italic">*"其他"類別商品國際運費固定為200元，多退少補</div>
              )}
              {/* 顯示兩個平台的價格 */}
              <h3 className="font-medium mt-4 mb-3 border-t border-[#F8F0E3]/20 pt-2">
                含稅下單價格 
                <span className="text-xs text-black/60 dark:text-white/60">包含營業稅、關稅與包材費用</span>
              </h3>
              <div className="flex justify-between items-center">
                <span className={summary.selectedPlatform === "shopee" ? "font-bold text-base" : ""}>
                  蝦皮價格 (含手續費):
                </span>
                <span className={summary.selectedPlatform === "shopee" ? "font-bold text-base" : ""}>
                  {formatCurrency(summary.shopeePrice, "TWD")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={["myship", "iopen"].includes(summary.selectedPlatform) ? "font-bold text-base" : ""}>
                  賣貨便、iopen下單費用:
                </span>
                <span className={["myship", "iopen"].includes(summary.selectedPlatform) ? "font-bold text-base" : ""}>
                  {formatCurrency(summary.otherPlatformPrice, "TWD")}
                </span>
              </div>

              {/* 顯示選擇的平台 */}
              <div className="flex justify-between font-bold pt-2 mt-2 border-t border-[#F8F0E3]/20 text-[#a42c2c] dark:text-[#F9F5EB]">
                <span>選擇下單平台:</span>
                <span>{getShopName(summary.selectedPlatform)}</span>
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
          <p>本網站只提供計算價格並複製的功能，無法下單！<br/>
          需要將複製的內容貼到IG/FB訊息欄，感謝配合🫡</p>
        </div>
      </CardContent>
    </Card>
  )
}