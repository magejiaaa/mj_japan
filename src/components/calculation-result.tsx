"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { CalculationSummary, ProductItem } from "@/lib/types"
import ShippingBreakdown from "@/components/shipping-breakdown"
import { getStoreName, storeShippingConfig, getDomesticShippingFee } from "@/lib/storeConfig"
import { getCategoryInfo } from "@/lib/categoryMap"

interface CalculationResultProps {
  products: ProductItem[]
  summary: CalculationSummary
  exchangeRate: number
  storeAmounts: Map<string, number>
  checkedIds: Set<string>
  onToggleCheck: (id: string) => void
  itemPrices: Map<string, { shopeePrice: number; otherPrice: number }>
}

const platformNameMap = {
  shopee: "蝦皮",
  myship: "賣貨便",
  iopen: "iopen mall",
}

export default function CalculationResult({
  products,
  summary,
  exchangeRate,
  storeAmounts,
  checkedIds,
  onToggleCheck,
  itemPrices,
}: CalculationResultProps) {
  const [copied, setCopied] = useState(false)
  const checkedProducts = products.filter((product) => product.price > 0 && checkedIds.has(product.id))

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: currency === "JPY" ? "JPY" : "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getDomesticShippingFee = (store: string, storeTotal: number) => {
    const config = storeShippingConfig[store] || storeShippingConfig.default
    if (store === "canshop" && storeTotal >= config.freeThreshold) return 330
    return storeTotal >= config.freeThreshold ? 0 : config.fee
  }

  const getInternationalShippingFee = (product: ProductItem, otherCategoryProcessed: boolean) => {
    if (product.category === "other") return otherCategoryProcessed ? 0 : 200
    return getCategoryInfo(product.category).fee * product.quantity
  }

  const copyToClipboard = () => {
    if (checkedProducts.length === 0) {
      alert("請選擇至少一個商品")
      return
    }

    let otherCategoryProcessed = false
    let text = "===== 秘境日本代購估價資料 =====\n\n"
    text += `匯率: 1 日幣 = ${exchangeRate.toFixed(2)} 台幣\n`
    text += `下單平台: ${platformNameMap[summary.selectedPlatform]}\n\n`
    text += "商品:\n"

    checkedProducts.forEach((product, index) => {
      const categoryInfo = getCategoryInfo(product.category)
      const storeName = getStoreName(product.store)
      const internationalShippingFee = getInternationalShippingFee(product, otherCategoryProcessed)
      if (product.category === "other" && internationalShippingFee > 0) otherCategoryProcessed = true

      text += `${index + 1}. ${product.url || "[尚未填寫網址]"}\n`
      text += `   店家: ${storeName}\n`
      text += `   價格: ${formatCurrency(product.price, "JPY")}\n`
      text += `   顏色尺寸: ${product.color || "-"}\n`
      text += `   類別: ${categoryInfo.name}\n`
      text += `   數量: ${product.quantity}\n`
      if (product.store === "other") text += `   日本國內運費: ${formatCurrency(product.customShippingFee || 0, "JPY")}\n`
      text += `   國際運費: ${formatCurrency(internationalShippingFee, "TWD")} (${categoryInfo.weight}/件)\n`
      // 加入分攤單品價格
      const priceInfo = itemPrices.get(product.id)
      if (priceInfo) {
        if (summary.selectedPlatform === "shopee") {
          text += `   【蝦皮單品價】: ${formatCurrency(priceInfo.shopeePrice, "TWD")}\n\n`
        } else {
          text += `   【賣貨便/iopen單品價】: ${formatCurrency(priceInfo.otherPrice, "TWD")}\n\n`
        }
      }
    })

    text += "訂單摘要:\n"
    text += `商品總額: ${formatCurrency(summary.totalJPY, "JPY")} (${formatCurrency(summary.totalTWD, "TWD")})\n`
    text += `日本國內運費: ${formatCurrency(summary.totalDomesticShippingJPY, "JPY")} (${formatCurrency(summary.totalDomesticShippingTWD, "TWD")})\n`
    text += `國際運費: ${formatCurrency(summary.totalInternationalShipping, "TWD")}\n`
    text += `平台總價: ${formatCurrency(summary.selectedPlatform === "shopee" ? summary.shopeePrice : summary.otherPlatformPrice, "TWD")}\n`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const finalPrice = summary.selectedPlatform === "shopee" ? summary.shopeePrice : summary.otherPlatformPrice

  return (
    <Card className="border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">計算結果</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="font-bold">商品詳情</h3>
            {products.every((product) => product.price <= 0) && <div className="text-sm text-[var(--text-secondary)]">尚無商品資料</div>}

            {products.map((product, index) => {
              if (product.price <= 0) return null
              const categoryInfo = getCategoryInfo(product.category)
              const storeName = getStoreName(product.store)
              const priceInfo = itemPrices.get(product.id)
              const allocatedShopeePrice = priceInfo?.shopeePrice ?? 0
              const allocatedOtherPrice = priceInfo?.otherPrice ?? 0
              const isChecked = checkedIds.has(product.id)

              return (
                <label
                  key={product.id}
                  className="block cursor-pointer rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)] p-3"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isChecked} onCheckedChange={() => onToggleCheck(product.id)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="font-medium">商品 #{index + 1}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {storeName} | {categoryInfo.name} ({categoryInfo.weight})
                        </div>
                      </div>
                      <div className="mt-2 truncate text-xs text-[var(--text-secondary)]">{product.url || "[尚未填寫網址]"}</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">價格：</span>
                          {formatCurrency(product.price, "JPY")}
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">數量：</span>
                          {product.quantity}
                        </div>
                        <div className="col-span-2">
                          <span className="text-[var(--text-secondary)]">顏色尺寸：</span>
                          {product.color || "-"}
                        </div>
                      </div>

                      {isChecked && (
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border-default)] pt-3 text-xs">
                          <div className={summary.selectedPlatform === "shopee" ? "font-bold text-[var(--color-primary-hover)]" : "text-[var(--text-secondary)]"}>
                            <div>蝦皮估價：</div>
                            <div>{formatCurrency(allocatedShopeePrice, "TWD")}</div>
                          </div>
                          <div className={["myship", "iopen"].includes(summary.selectedPlatform) ? "font-bold text-[var(--color-primary-hover)]" : "text-[var(--text-secondary)]"}>
                            <div>賣貨便、iopen 估價：</div>
                            <div>{formatCurrency(allocatedOtherPrice, "TWD")}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
          </section>

          <section className="border-t border-[var(--border-default)] pt-5">
            <h3 className="mb-4 font-bold">訂單摘要</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span>商品總額（日幣）：</span>
                <span>{formatCurrency(summary.totalJPY, "JPY")}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>日本國內運費（日幣）：</span>
                <span>{formatCurrency(summary.totalDomesticShippingJPY, "JPY")}</span>
              </div>

              {Array.from(storeAmounts.entries()).map(([store, storeTotal]) => {
                const storeProducts = products.filter((product) => product.store === store && product.price > 0)
                if (storeProducts.length === 0) return null
                const firstProduct = storeProducts[0]
                const domesticShippingFee =
                  store === "other" && firstProduct.customShippingFee !== undefined
                    ? firstProduct.customShippingFee
                    : getDomesticShippingFee(store, storeTotal)

                return (
                  <ShippingBreakdown
                    key={store}
                    domesticShippingJPY={domesticShippingFee}
                    domesticShippingTWD={domesticShippingFee * exchangeRate}
                    store={store}
                    storeTotal={storeTotal}
                    isCustomShipping={store === "other" && firstProduct.customShippingFee !== undefined}
                  />
                )
              })}

              {summary.totalDomesticShippingJPY === 0 && <div className="text-xs italic text-green-600">*全館店家已達免運標準</div>}

              <div className="flex justify-between gap-4">
                <span>國際運費（台幣）：</span>
                <span>{formatCurrency(summary.totalInternationalShipping, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 font-bold">
                <span>蝦皮價值（含手續費）：</span>
                <span>{formatCurrency(summary.shopeePrice, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 text-base font-bold">
                <span>賣貨便、iopen 下單費用：</span>
                <span>{formatCurrency(summary.otherPlatformPrice, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 font-bold text-[var(--color-primary-hover)]">
                <span>選擇下單平台：</span>
                <span>{platformNameMap[summary.selectedPlatform]}</span>
              </div>
              <div className="flex justify-between gap-4 text-lg font-bold">
                <span>應付金額：</span>
                <span>{formatCurrency(finalPrice, "TWD")}</span>
              </div>
            </div>
          </section>

          <Button onClick={copyToClipboard} className="w-full bg-[var(--color-primary-light)] text-[var(--color-primary-hover)] hover:bg-[var(--color-primary)] hover:text-white">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "已複製" : "一鍵複製"}
          </Button>

          <p className="leading-7">
            本網站只提供計算價格並複製的功能，無法下單！
            <br />
            需要將複製的內容貼到 IG/FB 訊息欄，感謝配合
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
