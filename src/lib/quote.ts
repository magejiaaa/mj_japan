import { getCategoryInfo } from "@/lib/categoryMap"
import { getDomesticShippingFee, getProductStoreKey, isCustomStoreKey } from "@/lib/storeConfig"
import type { CalculationSummary, PlatformPrices, ProductItem } from "@/lib/types"

type StoreQuote = {
  store: string
  customStoreName?: string
  storeTotal: number
  domesticShippingJPY: number
  domesticShippingTWD: number
  isCustomShipping: boolean
}

export type Quote = {
  summary: CalculationSummary
  stores: Map<string, StoreQuote>
  items: Map<string, { store: string; internationalShipping: number; prices: PlatformPrices }>
}

const OTHER_CATEGORY_SHIPPING = 200

/** 依勾選的商品與當前規則產生估價，供畫面和複製文字共用。 */
export function calculateQuote(
  products: readonly ProductItem[],
  excludedIds: ReadonlySet<string>,
  exchangeRate: number,
  shopeeRate: number,
  categoryRules: NonNullable<Parameters<typeof getCategoryInfo>[1]>,
  shippingRules: Parameters<typeof getDomesticShippingFee>[3],
): Quote {
  const selectedProducts = products.filter(({ id, price }) => price > 0 && !excludedIds.has(id))
  const storeGroups = new Map<string, { total: number; firstProduct: ProductItem }>()
  let totalJPY = 0
  let totalOtherQuantity = 0

  // 先累計各店商品金額，才能依整間店的金額判斷是否達到運費門檻。
  const lines = selectedProducts.map((product) => {
    const store = getProductStoreKey(product)
    const amountJPY = product.price * product.quantity
    const group = storeGroups.get(store)
    if (group) group.total += amountJPY
    else storeGroups.set(store, { total: amountJPY, firstProduct: product })

    totalJPY += amountJPY
    if (product.category === "other") totalOtherQuantity += product.quantity
    return { product, store, amountJPY }
  })

  const stores: Quote["stores"] = new Map()
  let totalDomesticShippingJPY = 0
  for (const [store, { total, firstProduct }] of storeGroups) {
    // 自訂運費採用該店第一筆勾選商品的設定，同店只計一次。
    const domesticShippingJPY = getDomesticShippingFee(store, total, firstProduct.customShippingFee, shippingRules)
    totalDomesticShippingJPY += domesticShippingJPY
    stores.set(store, {
      store,
      customStoreName: firstProduct.customStoreName,
      storeTotal: total,
      domesticShippingJPY,
      domesticShippingTWD: domesticShippingJPY * exchangeRate,
      isCustomShipping: store === "other" || isCustomStoreKey(store) || shippingRules[store]?.specialRule === "custom",
    })
  }

  let totalInternationalShipping = 0
  let otherQuantitySoFar = 0
  const itemCosts = lines.map(({ product, store, amountJPY }) => {
    const storeQuote = stores.get(store)!
    // 按商品金額占該店小計的比例分攤日本國內運費。
    const domesticShare = storeQuote.domesticShippingTWD * (amountJPY / storeQuote.storeTotal)
    let internationalShipping: number
    if (product.category === "other") {
      // 依數量分攤固定運費，讓各商品顯示的整元金額加總恰好為 200 元。
      const previousShare = Math.round(OTHER_CATEGORY_SHIPPING * otherQuantitySoFar / totalOtherQuantity)
      otherQuantitySoFar += product.quantity
      internationalShipping = Math.round(OTHER_CATEGORY_SHIPPING * otherQuantitySoFar / totalOtherQuantity) - previousShare
    } else {
      internationalShipping = getCategoryInfo(product.category, categoryRules).fee * product.quantity
    }
    totalInternationalShipping += internationalShipping
    return { id: product.id, store, internationalShipping, cost: amountJPY * exchangeRate + domesticShare + internationalShipping }
  })

  const totalTWD = totalJPY * exchangeRate
  const totalDomesticShippingTWD = totalDomesticShippingJPY * exchangeRate
  const grandTotal = totalTWD + totalDomesticShippingTWD + totalInternationalShipping

  // 平台報價依序沿用蝦皮與賣貨便公式，再從賣貨便報價反推含金流手續費的 iopen mall 報價。
  const shopeeTaxRate = 0.01
  const iopenFeeRate = 0.025
  const shopeePrice = Math.ceil(grandTotal / Math.max(1 - shopeeRate - shopeeTaxRate, 0.01) / 20) * 20
  const myshipPrice = Math.ceil(shopeePrice / (1 + shopeeRate))
  const platformPrices = {
    shopee: shopeePrice,
    myship: myshipPrice,
    iopen: Math.ceil(myshipPrice / (1 - iopenFeeRate)),
  }

  const items: Quote["items"] = new Map()
  let cumulativeCost = 0
  let allocated: PlatformPrices = { shopee: 0, myship: 0, iopen: 0 }
  itemCosts.forEach(({ id, store, internationalShipping, cost }, index) => {
    cumulativeCost += cost
    const share = grandTotal > 0 ? Math.min(cumulativeCost / grandTotal, 1) : 0
    // 累計金額先四捨五入，再扣除已分配的金額，避免最後一件分到負數。
    const target = index === itemCosts.length - 1 ? platformPrices : {
      shopee: Math.round(platformPrices.shopee / 20 * share) * 20,
      myship: Math.round(platformPrices.myship * share),
      iopen: Math.round(platformPrices.iopen * share),
    }
    items.set(id, {
      store,
      internationalShipping,
      prices: {
        shopee: target.shopee - allocated.shopee,
        myship: target.myship - allocated.myship,
        iopen: target.iopen - allocated.iopen,
      },
    })
    allocated = target
  })

  return {
    summary: { totalJPY, totalTWD, totalDomesticShippingJPY, totalDomesticShippingTWD, totalInternationalShipping, platformPrices, grandTotal },
    stores,
    items,
  }
}
