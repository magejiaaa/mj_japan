"use client"

import { useEffect, useRef, useState, type MouseEventHandler } from "react"
import { Check, ChevronDown, Copy, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { OrderPlatform, ProductItem } from "@/lib/types"
import { IOPEN_FEE_RATE, OTHER_CATEGORY_SHIPPING, SHOPEE_PRICE_STEP, SHOPEE_TAX_RATE, type Quote } from "@/lib/quote"
import { formatCurrency, formatQuoteText, platformNames } from "@/lib/quoteText"
import ShippingBreakdown from "@/components/shipping-breakdown"
import { FIXED_STORE_EXCHANGE_RATE, getProductStoreKey, getStoreName } from "@/lib/storeConfig"
import { getCategoryInfo } from "@/lib/categoryMap"
import QuoteSocialLinks from "@/components/quote-social-links"

interface CalculationResultProps {
  products: ProductItem[]
  quote: Quote
  selectedPlatform: OrderPlatform
  exchangeRate: number
  onToggleCheck: (id: string) => void
  viewingQuote: boolean
  onViewQuote: MouseEventHandler<HTMLAnchorElement>
}

const platforms = ["shopee", "myship", "iopen"] as const
const quoteAction = "bg-[var(--quote-action)] text-[var(--quote-action-text)] hover:bg-[var(--quote-action-hover)]"
const percent = new Intl.NumberFormat("zh-TW", { style: "percent", maximumFractionDigits: 4 })

function QuoteFormulaDialog({ shopeeRate }: { shopeeRate: number }) {
  const shopeeFee = percent.format(shopeeRate)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 shrink-0 px-2 text-xs text-[var(--quote-accent)] underline-offset-4 hover:bg-transparent hover:underline lg:h-8"
        >
          <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />
          計算公式
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] overflow-y-auto rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]">
        <DialogHeader className="pr-7 text-left">
          <DialogTitle>計算公式</DialogTitle>
          <DialogDescription>只計算已勾選且填了價格的商品。</DialogDescription>
        </DialogHeader>
        <section className="space-y-2 rounded-lg bg-[var(--color-primary-ultra-light)] p-4 text-sm leading-relaxed">
          <h3 className="font-semibold">估價成本（台幣）</h3>
          <p className="font-medium">商品金額 ＋ 日本國內運費 ＋ 國際運費</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>商品金額＝日圓單價 × 數量 × 店家匯率。ZOZOTOWN 和 CAN SHOP 固定用 {FIXED_STORE_EXCHANGE_RATE}，其他店家使用一般匯率。</li>
            <li>日本國內運費依各店小計和運費規則計算，同店只計一次，再以店家匯率換算。</li>
            <li>國際運費依商品類別的每件費用乘上數量。「其他類別」的商品合計 NT${OTHER_CATEGORY_SHIPPING}。</li>
          </ul>
        </section>
        <section className="space-y-2 text-sm leading-relaxed">
          <h3 className="font-semibold">平台估價</h3>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">蝦皮</dt>
              <dd>成本 ÷（100% − 手續費 {shopeeFee} − 稅金 {percent.format(SHOPEE_TAX_RATE)}），再向上取到 NT${SHOPEE_PRICE_STEP} 的倍數。</dd>
            </div>
            <div>
              <dt className="font-medium">賣貨便</dt>
              <dd>蝦皮估價 ÷（100% ＋ {shopeeFee}），再向上取整元。</dd>
            </div>
            <div>
              <dt className="font-medium">iopen mall</dt>
              <dd>賣貨便估價 ÷（100% − 金流手續費 {percent.format(IOPEN_FEE_RATE)}），再向上取整元。</dd>
            </div>
          </dl>
          <p className="text-[var(--text-secondary)]">賣貨便和 iopen mall 的台灣運費 NT$38 於平台結帳另計。</p>
        </section>
      </DialogContent>
    </Dialog>
  )
}

export default function CalculationResult({
  products,
  quote,
  selectedPlatform,
  exchangeRate,
  onToggleCheck,
  viewingQuote,
  onViewQuote,
}: CalculationResultProps) {
  const [copiedQuote, setCopiedQuote] = useState<{ quote: Quote; platform: OrderPlatform } | null>(null)
  const [manualText, setManualText] = useState("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const copiedStatus = useRef<HTMLParagraphElement>(null)
  const { summary, items, stores } = quote
  const platformName = platformNames[selectedPlatform]
  const finalPrice = summary.platformPrices[selectedPlatform]
  const mobilePrice = `NT$${finalPrice.toLocaleString("zh-TW")}`
  const selectedCount = products.reduce((count, product) => count + (items.has(product.id) ? product.quantity : 0), 0)
  const hasPricedProducts = products.some((product) => product.price > 0)
  const copied = copiedQuote?.quote === quote && copiedQuote.platform === selectedPlatform

  useEffect(() => {
    if (copied && viewingQuote) copiedStatus.current?.focus({ preventScroll: true })
  }, [copied, viewingQuote])

  const copyToClipboard = async () => {
    if (items.size === 0) return
    const text = formatQuoteText(products, quote, selectedPlatform, exchangeRate)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedQuote({ quote, platform: selectedPlatform })
    } catch {
      setManualText(text)
    }
  }

  return (
    <>
      <Card className="border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
        <CardContent className="space-y-5 p-4 lg:space-y-4 lg:p-6">
          <section className="rounded-lg bg-[var(--color-primary-ultra-light)] p-4 lg:bg-transparent lg:p-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold lg:text-xl lg:font-semibold">
                  <span className="lg:hidden">平台估價</span>
                  <span className="hidden lg:inline">計算結果</span>
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)] lg:hidden">{platformName}</p>
              </div>
              <QuoteFormulaDialog shopeeRate={quote.shopeeRate} />
            </div>
            <div className="lg:hidden">
              {items.size > 0 ? (
                <p className="my-2 break-all text-4xl font-bold tracking-tight text-[var(--quote-accent)]">{mobilePrice}</p>
              ) : (
                <p className="my-3 text-sm text-[var(--text-secondary)]">{hasPricedProducts ? "請勾選要估價的商品" : "填寫商品價格後，就會顯示估價"}</p>
              )}
              {selectedPlatform !== "myship" && <p className="text-sm text-[var(--text-secondary)]">{selectedPlatform === "iopen" ? "已含 2.5% 手續費" : "已含蝦皮手續費"}</p>}
              {selectedPlatform !== "shopee" && (
                <p className="mt-2 border-t border-[var(--border-default)] pt-2 text-sm">台灣運費 NT$38 於平台結帳另計{selectedPlatform === "iopen" && "，可用免運券"}</p>
              )}
            </div>
          </section>
          <div className="space-y-5 lg:space-y-6">
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
                    className="block cursor-pointer rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2.5 lg:bg-[var(--color-primary-ultra-light)] lg:p-3"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox aria-label={`商品 ${index + 1} 納入估價`} checked={isChecked} onCheckedChange={() => onToggleCheck(product.id)} className="mt-0.5 size-5 border-[var(--quote-accent)] data-[state=checked]:bg-[var(--quote-action)] data-[state=checked]:text-[var(--quote-action-text)]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="text-sm font-medium">商品 {index + 1}</div>
                          <div className="text-sm font-semibold lg:hidden">{formatCurrency(product.price, "JPY")}{product.quantity > 1 && ` × ${product.quantity}`}</div>
                          <div className="hidden text-xs text-[var(--text-secondary)] lg:block">
                            {storeName} | {categoryInfo.name} ({categoryInfo.weight})
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-[var(--text-secondary)] lg:hidden">{categoryInfo.name} · {storeName}</div>
                        <div className="mt-2 hidden truncate text-xs text-[var(--text-secondary)] lg:block">{product.url || "[尚未填寫網址]"}</div>
                        <div className="mt-2 hidden grid-cols-2 gap-2 text-sm lg:grid">
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
                          <div className="mt-3 hidden grid-cols-3 gap-2 border-t border-[var(--border-default)] pt-3 text-xs lg:grid">
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

            <Button type="button" variant="outline" aria-expanded={detailsOpen} aria-controls="quote-fees" onClick={() => setDetailsOpen(!detailsOpen)} className="h-11 w-full justify-between border-[var(--border-default)] bg-[var(--color-primary-light)] text-[var(--quote-accent)] lg:hidden">
              {detailsOpen ? "收合費用明細" : "查看費用明細"}
              <ChevronDown aria-hidden="true" className={detailsOpen ? "rotate-180" : undefined} />
            </Button>

            <section id="quote-fees" className={`${detailsOpen ? "block" : "hidden"} border-t border-[var(--border-default)] pt-5 lg:block`}>
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
                  <span>平台估價：</span>
                  <span>{formatCurrency(finalPrice, "TWD")}</span>
                </div>
              </div>
            </section>

            <Button onClick={copyToClipboard} disabled={items.size === 0} className={`${quoteAction} hidden w-full lg:inline-flex`}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "已複製報價" : "複製報價"}
            </Button>

            <p className="hidden leading-7 lg:block">
              本網站只提供計算價格並複製的功能，無法下單！
              <br />
              需要將複製的內容貼到 IG/FB 訊息欄，感謝配合
            </p>
          </div>
        </CardContent>
      </Card>
      <aside aria-label="手機估價操作" className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-default)] bg-[var(--bg-card)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(72,28,44,0.14)] lg:hidden">
        {viewingQuote && copied ? (
          <div className="mx-auto max-w-xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p ref={copiedStatus} tabIndex={-1} role="status" className="flex items-center gap-2 font-bold outline-none">
                <Check aria-hidden="true" className="size-4 text-[var(--quote-accent)]" /> 已複製報價
              </p>
              <Button type="button" variant="ghost" onClick={copyToClipboard} className="h-8 px-2 text-xs text-[var(--quote-accent)]">
                再複製
              </Button>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">貼到 Instagram 或 Facebook 訊息即可</p>
            <QuoteSocialLinks className="grid grid-cols-2 gap-2" />
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-secondary)]">已選 {selectedCount} 件</p>
              <p className="break-all text-2xl font-bold leading-tight text-[var(--quote-accent)]">{items.size > 0 ? mobilePrice : "—"}</p>
            </div>
            {viewingQuote ? (
              <Button disabled={items.size === 0} onClick={copyToClipboard} className={`${quoteAction} h-11 shrink-0 px-5`}>
                <Copy aria-hidden="true" className="size-4" /> 複製報價
              </Button>
            ) : (
              <Button asChild className={`${quoteAction} h-11 shrink-0 px-5`}>
                <a href="#quote" onClick={onViewQuote}>查看估價</a>
              </Button>
            )}
          </div>
        )}
      </aside>

      <Dialog open={manualText !== ""} onOpenChange={(open) => { if (!open) setManualText("") }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]">
          <DialogHeader>
            <DialogTitle>手動複製報價</DialogTitle>
            <DialogDescription>瀏覽器無法自動複製，請選取下方文字，再貼到 Instagram 或 Facebook 訊息。</DialogDescription>
          </DialogHeader>
          <Textarea aria-label="報價文字" readOnly value={manualText} rows={7} onFocus={(event) => event.currentTarget.select()} />
          <QuoteSocialLinks className="grid grid-cols-2 gap-2" />
        </DialogContent>
      </Dialog>
    </>
  )
}
