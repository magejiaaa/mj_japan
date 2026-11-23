import assert from "node:assert/strict"
import { test } from "node:test"
import { categoryMap } from "../src/lib/categoryMap"
import { calculateQuote } from "../src/lib/quote"
import { formatQuoteText, parseQuoteProducts } from "../src/lib/quoteText"
import { getCustomStoreKey, storeShippingConfig } from "../src/lib/storeConfig"
import type { OrderPlatform, ProductItem } from "../src/lib/types"

function product(id: string, fields: Partial<ProductItem> = {}): ProductItem {
  return { id, price: 1000, quantity: 1, category: "clothing", store: "free", color: "", url: "", ...fields }
}

function quote(products: ProductItem[], excludedIds = new Set<string>()) {
  return calculateQuote(products, excludedIds, 0.23, 0.175, categoryMap, storeShippingConfig)
}

test("allocated line prices are nonnegative and add up to each platform total", () => {
  const products = Array.from({ length: 16 }, (_, index) => product(String(index), { price: index === 15 ? 1 : 23 }))
  const { summary, items } = quote(products)
  assert.deepEqual(summary.platformPrices, { shopee: 2080, myship: 1771, iopen: 1817 })

  const platforms: OrderPlatform[] = ["shopee", "myship", "iopen"]
  for (const platform of platforms) {
    const amounts = Array.from(items.values(), ({ prices }) => prices[platform])
    const unit = platform === "shopee" ? 20 : 1
    assert(amounts.every((amount) => amount >= 0 && amount % unit === 0))
    assert.equal(amounts.reduce((total, amount) => total + amount, 0), summary.platformPrices[platform])
  }
})

test("excluded products stay out of the quote and each store is charged once", () => {
  const store = getCustomStoreKey("測試店家")
  const products = [
    product("excluded", { store, customShippingFee: 600 }),
    product("first", { store, customShippingFee: 300 }),
    product("second", { store, customShippingFee: 300 }),
  ]
  const excludedIds = new Set(["excluded"])
  for (const rows of [products, products.map((row) => ({ ...row, color: "藍色" }))]) {
    const result = quote(rows, excludedIds)
    assert.deepEqual([...result.items.keys()], ["first", "second"])
    assert.equal(result.summary.totalDomesticShippingJPY, 300)
    assert.equal(result.stores.get(store)?.domesticShippingJPY, 300)
    assert.equal(result.stores.get(store)?.storeTotal, 2000)
    assert.match(formatQuoteText(rows, result, "myship", 0.23), /日本國內運費: ¥300/)
  }
})

test("CAN SHOP applies its reduced fallback shipping fee from ¥6000", () => {
  assert.equal(quote([product("below", { store: "canshop", price: 5999 })]).summary.totalDomesticShippingJPY, 880)
  assert.equal(quote([product("at", { store: "canshop", price: 6000 })]).summary.totalDomesticShippingJPY, 330)
})

test("fixed store rates apply to both products and domestic shipping in mixed quotes", () => {
  const products = [
    product("zozo", { store: "ZOZOTOWN" }),
    product("can", { store: "canshop" }),
    product("regular", { store: "axesFemme" }),
  ]
  const result = calculateQuote(products, new Set(), 0.20, 0.175, categoryMap, storeShippingConfig)
  assert.equal(result.summary.totalTWD, 660)
  assert.equal(Math.round(result.summary.totalDomesticShippingTWD * 100), 43620)
  assert.equal(result.stores.get("ZOZOTOWN")?.exchangeRate, 0.23)
  assert.equal(result.stores.get("canshop")?.exchangeRate, 0.23)
  assert.equal(result.stores.get("axesFemme")?.exchangeRate, 0.20)

  const text = formatQuoteText(products, result, "myship", 0.20)
  assert.match(text, /匯率: 依各商品所列匯率換算/)
  assert.equal(text.match(/匯率: 1 日幣 = 0\.23 台幣/g)?.length, 2)
  assert.match(text, /匯率: 1 日幣 = 0\.20 台幣/)
  assert.deepEqual(parseQuoteProducts(text).map(({ store }) => store), ["ZOZOTOWN", "canshop", "axesFemme"])

  const fixedOnly = calculateQuote(products, new Set(["regular"]), 0.20, 0.175, categoryMap, storeShippingConfig)
  assert.match(formatQuoteText(products, fixedOnly, "myship", 0.20), /^匯率: 1 日幣 = 0\.23 台幣$/m)
})

test("export and import preserve the other category, quantities and custom shipping", () => {
  const store = getCustomStoreKey("測試店家")
  const products = [
    product("one", { store, customStoreName: "測試店家", customShippingFee: 300, category: "other", quantity: 2 }),
    product("two", { category: "other", color: "藍色\n尺寸 M", url: "https://example.com/2" }),
  ]
  const original = quote(products)
  const text = formatQuoteText(products, original, "iopen", 0.23)
  const imported = parseQuoteProducts(text.replace(/\n/g, "\r\n"))
  assert.deepEqual(imported.map(({ category }) => category), ["other", "other"])
  assert.equal(imported[0].customShippingFee, 300)
  assert.equal(imported[0].quantity, 2)
  assert.equal(imported[0].url, "")
  assert.match(imported[1].color, /^藍色\r?\n尺寸 M$/)
  assert.equal(original.summary.totalInternationalShipping, 200)
  assert.equal(Array.from(original.items.values()).reduce((sum, item) => sum + item.internationalShipping, 0), 200)
  assert.deepEqual(quote(imported.map((item, index) => ({ ...item, id: String(index) }))).summary, original.summary)
})

test("legacy numbered text can be imported without a header and invalid blocks are rejected", () => {
  const legacy = [
    "1. https://example.com/1",
    "   日本店家: CAN SHOP",
    "   價格: JPY 6,000",
    "   類別: 其他類別 NT$200 (1kg/件)",
    "訂單摘要:",
  ].join("\n")
  assert.deepEqual(parseQuoteProducts(legacy).map(({ category, price, quantity, store }) => ({ category, price, quantity, store })), [
    { category: "other", price: 6000, quantity: 1, store: "canshop" },
  ])
  assert.deepEqual(parseQuoteProducts("1. 缺少商品價格"), [])
  assert.deepEqual(parseQuoteProducts(legacy.replace("JPY 6,000", "JPY 6,000 數量: 0")), [])
})
