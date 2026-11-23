import { categoryMap, getCategoryInfo, getCategoryKey } from "@/lib/categoryMap"
import type { Quote } from "@/lib/quote"
import { getCustomStoreKey, getStoreKey, getStoreName } from "@/lib/storeConfig"
import type { OrderPlatform, ProductItem } from "@/lib/types"

export const platformNames: Record<OrderPlatform, string> = {
  shopee: "蝦皮",
  myship: "賣貨便",
  iopen: "iopen mall",
}

const currencyFormats = {
  JPY: new Intl.NumberFormat("zh-TW", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }),
  TWD: new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }),
}

export function formatCurrency(amount: number, currency: keyof typeof currencyFormats): string {
  return currencyFormats[currency].format(amount)
}

/** 直接使用估價結果產生可貼回網站的訂單文字。 */
export function formatQuoteText(products: readonly ProductItem[], quote: Quote, platform: OrderPlatform, exchangeRate: number): string {
  const platformName = platformNames[platform]
  const { summary, items, stores } = quote
  const rates = new Set(Array.from(stores.values(), (store) => store.exchangeRate))
  const hasMixedRates = rates.size > 1
  const rate = rates.values().next().value ?? exchangeRate
  const lines = [
    "===== 秘境日本代購估價資料 =====", "",
    hasMixedRates ? "匯率: 依各商品所列匯率換算" : `匯率: 1 日幣 = ${rate.toFixed(2)} 台幣`,
    `下單平台: ${platformName}`, "", "商品:",
  ]
  let index = 0
  for (const product of products) {
    const item = items.get(product.id)
    if (!item) continue
    const store = stores.get(item.store)!
    const category = getCategoryInfo(product.category)
    lines.push(
      `${++index}. ${product.url || "[尚未填寫網址]"}`,
      `   店家: ${getStoreName(store.store, store.customStoreName)}`,
      `   價格: ${formatCurrency(product.price, "JPY")}  數量: ${product.quantity}`,
      `   顏色尺寸: ${product.color || "-"}`,
      `   類別: ${category.name} ${formatCurrency(item.internationalShipping, "TWD")} (${category.weight}/件)`,
    )
    if (hasMixedRates) lines.push(`   匯率: 1 日幣 = ${store.exchangeRate.toFixed(2)} 台幣`)
    if (store.isCustomShipping) lines.push(`   日本國內運費: ${formatCurrency(store.domesticShippingJPY, "JPY")}`)
    lines.push(`   【${platformName}單品價】: ${formatCurrency(item.prices[platform], "TWD")}`, "")
  }
  lines.push(
    "訂單摘要:",
    `商品總額: ${formatCurrency(summary.totalJPY, "JPY")}`,
    `日本國內運費: ${formatCurrency(summary.totalDomesticShippingJPY, "JPY")}`,
    `國際運費: ${formatCurrency(summary.totalInternationalShipping, "TWD")}`,
    `平台總價: ${formatCurrency(summary.platformPrices[platform], "TWD")}`, "",
  )
  return lines.join("\n")
}

export type ImportedProduct = Omit<ProductItem, "id">

/** 讀取新舊報價中的商品區塊，商品識別碼在實際匯入時才建立。 */
export function parseQuoteProducts(text: string): ImportedProduct[] {
  const itemText = text.split(/^\s*訂單摘要[:：]/m, 1)[0]
  const starts = Array.from(itemText.matchAll(/^[ \t]*\d+\.[ \t]+/gm), (match) => match.index)
  const blocks = starts.map((start, index) => itemText.slice(start, starts[index + 1]))
  const products: ImportedProduct[] = []

  for (const block of blocks) {
    const url = block.match(/^[ \t]*\d+\.[ \t]+([^\r\n]*)/)?.[1].trim()
    const storeName = block.match(/^[ \t]*(?:日本店家|店家):[ \t]*(.*)/m)?.[1].trim() ?? ""
    const priceText = block.match(/^[ \t]*價格:[ \t]*(?:[¥￥]|JPY|日幣)?[ \t]*([\d,]+)(?=[ \t\r\n]|$)/im)?.[1]
    const quantityText = block.match(/數量:[ \t]*(\d+)(?=[ \t\r\n]|$)/)?.[1]
    const color = block.match(/^[ \t]*顏色尺寸:[ \t]*([\s\S]*?)\r?\n[ \t]*類別:/m)?.[1].trim()
    const categoryText = block.match(/^[ \t]*類別:[ \t]*(.*)/m)?.[1].trim() ?? ""
    // 類別欄也包含國際運費與重量，先移除附加資訊，再比對名稱。
    const categoryName = categoryText.replace(/\s+(?:NT\$|\$)\s*[\d,]+.*$/, "").replace(/\s*\([^()]*\/件\)$/, "").trim()
    const category = getCategoryKey(categoryName)
      ?? Object.keys(categoryMap).find((key) => categoryText.startsWith(categoryMap[key].name))
      ?? "clothing"
    const shippingText = block.match(/^[ \t]*日本國內運費:[ \t]*(?:[¥￥]|JPY|日幣)?[ \t]*([\d,]+)(?=[ \t\r\n]|$)/im)?.[1]
    const price = Number(priceText?.replace(/,/g, ""))
    const quantity = Number(quantityText ?? 1)
    const customShippingFee = Number(shippingText?.replace(/,/g, "") ?? 0)
    // 任一商品缺少有效金額時停止匯入，避免以不完整的清單覆蓋目前商品。
    if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(quantity) || quantity < 1 || !Number.isFinite(customShippingFee)) return []

    const knownStore = getStoreKey(storeName)
    const customStoreName = knownStore ? undefined : storeName || undefined
    products.push({
      url: url === "[尚未填寫網址]" ? "" : url ?? "",
      store: knownStore ?? (customStoreName ? getCustomStoreKey(customStoreName) : "free"),
      customStoreName,
      price,
      quantity,
      color: color === "-" ? "" : color ?? "",
      category,
      customShippingFee,
    })
  }
  return products
}
