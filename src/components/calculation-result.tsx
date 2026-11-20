"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { OrderPlatform, ProductItem } from "@/lib/types"
import type { Quote } from "@/lib/quote"
import { formatCurrency, formatQuoteText, platformNames } from "@/lib/quoteText"
import ShippingBreakdown from "@/components/shipping-breakdown"
import { getProductStoreKey, getStoreName } from "@/lib/storeConfig"
import { getCategoryInfo } from "@/lib/categoryMap"

interface CalculationResultProps {
  products: ProductItem[]
  quote: Quote
  selectedPlatform: OrderPlatform
  exchangeRate: number
  onToggleCheck: (id: string) => void
}

const platforms = ["shopee", "myship", "iopen"] as const
export default function CalculationResult({
  products,
  quote,
  selectedPlatform,
  exchangeRate,
  onToggleCheck,
}: CalculationResultProps) {
  const [copied, setCopied] = useState(false)
  const { summary, items, stores } = quote
  const platformName = platformNames[selectedPlatform]
  const finalPrice = summary.platformPrices[selectedPlatform]

  const copyToClipboard = () => {
    if (items.size === 0) {
      alert("請選擇至少一個商品")
      return
    }

    const text = formatQuoteText(products, quote, selectedPlatform, exchangeRate)

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
              const storeName = getStoreName(getProductStoreKey(product), product.customStoreName)
              const priceInfo = items.get(product.id)?.prices
              const isChecked = items.has(product.id)

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
                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--border-default)] pt-3 text-xs">
                          {platforms.map((platform) => (
                            <div key={platform} className={selectedPlatform === platform ? "font-bold text-[var(--color-primary-hover)]" : "text-[var(--text-secondary)]"}>
                              <div>{platformNames[platform]}估價：</div>
                              <div>{formatCurrency(priceInfo?.[platform] ?? 0, "TWD")}</div>
                            </div>
                          ))}
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

              {Array.from(stores.values(), ({ store, customStoreName, ...shipping }) => (
                <ShippingBreakdown
                  key={store}
                  storeName={getStoreName(store, customStoreName)}
                  {...shipping}
                />
              ))}

              {items.size > 0 && summary.totalDomesticShippingJPY === 0 && <div className="text-xs italic text-green-600">*全館店家已達免運標準</div>}

              <div className="flex justify-between gap-4">
                <span>國際運費（台幣）：</span>
                <span>{formatCurrency(summary.totalInternationalShipping, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 font-bold">
                <span>蝦皮價值（含手續費）：</span>
                <span>{formatCurrency(summary.platformPrices.shopee, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 text-base font-bold">
                <span>賣貨便下單費用：</span>
                <span>{formatCurrency(summary.platformPrices.myship, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 text-base font-bold">
                <span>iopen mall 下單費用（含手續費）：</span>
                <span>{formatCurrency(summary.platformPrices.iopen, "TWD")}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3 font-bold text-[var(--color-primary-hover)]">
                <span>選擇下單平台：</span>
                <span>{platformName}</span>
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
