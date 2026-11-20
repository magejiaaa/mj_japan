import type { OrderPlatform, ProductItem } from "@/lib/types"

const storageKey = "mj-japan-quote-draft-v1"

type QuoteDraft = {
  products: ProductItem[]
  excludedIds: string[]
  selectedPlatform: OrderPlatform
}

export function readQuoteDraft(): QuoteDraft | null {
  try {
    const saved = sessionStorage.getItem(storageKey)
    if (!saved) return null
    const draft: QuoteDraft | null = JSON.parse(saved)
    if (!draft || !Array.isArray(draft.products) || draft.products.length === 0 || !Array.isArray(draft.excludedIds)) return null
    if (!["shopee", "myship", "iopen"].includes(draft.selectedPlatform)) return null
    if (!draft.products.every(isDraftProduct) || !draft.excludedIds.every((id) => typeof id === "string")) return null
    return draft
  } catch {
    return null
  }
}

function isDraftProduct(product: ProductItem) {
  return product && [product.id, product.store, product.category, product.url, product.color].every((value) => typeof value === "string")
    && Number.isFinite(product.price) && product.price >= 0
    && Number.isSafeInteger(product.quantity) && product.quantity > 0
    && (product.customStoreName === undefined || typeof product.customStoreName === "string")
    && (product.customShippingFee === undefined || Number.isFinite(product.customShippingFee))
}

export function saveQuoteDraft(draft: QuoteDraft) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(draft))
  } catch {
    // 瀏覽器停用儲存時，仍可在此頁繼續編輯與估價。
  }
}
