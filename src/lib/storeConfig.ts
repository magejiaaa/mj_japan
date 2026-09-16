export interface StoreConfig {
  key: string
  name: string
  fee: number
  freeThreshold: number
  label?: string
  specialRule?: string
}

export const storeList: StoreConfig[] = [
  { key: "free", name: "免運費", fee: 0, freeThreshold: 0 },
  { key: "axesFemme", name: "axes femme", fee: 410, freeThreshold: 10000 },
  { key: "amavel", name: "Amavel", fee: 715, freeThreshold: 10000 },
  { key: "ACDC", name: "ACDC RAG", fee: 590, freeThreshold: 5500 },
  { key: "classicalElf", name: "Classical Elf", fee: 590, freeThreshold: 3980 },
  { key: "canshop", name: "CAN SHOP", fee: 880, freeThreshold: 6000, label: "CAN SHOP (未滿¥6000｜880日幣｜滿額¥330)" },
  { key: "dotST", name: "dot-st", fee: 385, freeThreshold: 5000 },
  { key: "GRL", name: "GRL", fee: 0, freeThreshold: 0, label: "GRL (通常免運)" },
  { key: "INGNI", name: "INGNI", fee: 550, freeThreshold: 4900 },
  { key: "lizlisa", name: "Liz Lisa", fee: 550, freeThreshold: 5500 },
  { key: "majesticlegon", name: "majestic legon", fee: 550, freeThreshold: 7500 },
  { key: "mycolor", name: "MyColor", fee: 660, freeThreshold: 10000 },
  { key: "mars", name: "Mars", fee: 710, freeThreshold: Infinity, label: "Mars (710 日幣)" },
  { key: "pium", name: "pium", fee: 800, freeThreshold: Infinity, label: "pium (800 日幣)" },
  { key: "palcloset", name: "PAL CLOSET", fee: 550, freeThreshold: 5000 },
  { key: "runway", name: "Runway Channel", fee: 330, freeThreshold: Infinity, label: "Runway Channel (330 日幣)" },
  { key: "ROJITA", name: "ROJITA", fee: 650, freeThreshold: 10000 },
  { key: "stripe", name: "stripe club", fee: 600, freeThreshold: 6000 },
  { key: "ZOZOTOWN", name: "ZOZOTOWN", fee: 660, freeThreshold: Infinity, label: "ZOZOTOWN (660 日幣)" },
  { key: "dreamvs", name: "夢展望", fee: 580, freeThreshold: 8000 },
  { key: "rakuten", name: "樂天 Fashion", fee: 770, freeThreshold: 3980 },
  { key: "other", name: "其他", fee: 0, freeThreshold: Infinity, label: "其他（新增自訂店家）" },
]

function buildLabel(store: StoreConfig): string {
  if (store.label) return store.label
  if (store.fee === 0) return store.name
  if (store.freeThreshold === Infinity) return `${store.name} (${store.fee} 日幣)`
  return `${store.name} (滿 ${store.freeThreshold} 免運，未滿 ${store.fee} 日幣)`
}

export const storeSelectOptions = storeList.map((store) => ({
  key: store.key,
  label: buildLabel(store),
}))

export const storeShippingConfig: Record<string, { fee: number; freeThreshold: number; specialRule?: string }> = Object.fromEntries([
  ...storeList.map((store) => [store.key, { fee: store.fee, freeThreshold: store.freeThreshold }]),
  ["default", { fee: 0, freeThreshold: Infinity }],
])

export const storeNameMap: Record<string, string> = Object.fromEntries(storeList.map((store) => [store.key, store.name]))

export const CUSTOM_STORE_PREFIX = "custom:"

export function normalizeCustomStoreName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

export function getCustomStoreKey(name: string): string {
  const normalized = normalizeCustomStoreName(name)
  return normalized ? `${CUSTOM_STORE_PREFIX}${encodeURIComponent(normalized.toLocaleLowerCase())}` : "other"
}

export function isCustomStoreKey(store: string): boolean {
  return store.startsWith(CUSTOM_STORE_PREFIX)
}

export function getStoreName(store: string, customStoreName?: string): string {
  if (isCustomStoreKey(store)) {
    const normalized = normalizeCustomStoreName(customStoreName || "")
    if (normalized) return normalized
    return decodeURIComponent(store.slice(CUSTOM_STORE_PREFIX.length))
  }
  return storeNameMap[store] ?? storeNameMap.other
}

/** 計算店家國內運費（日幣） */
export function getDomesticShippingFee(store: string, storeTotal: number, customShippingFee?: number): number {
  if (store === "other" || isCustomStoreKey(store)) return customShippingFee ?? 0
  const config = storeShippingConfig[store] ?? storeShippingConfig.default
  if (config.specialRule === "custom") return customShippingFee ?? 0
  if (config.specialRule === "canshop_330_after_threshold" && storeTotal >= config.freeThreshold) return 330
  return storeTotal >= config.freeThreshold ? 0 : config.fee
}

export function getStoreKey(name: string): string | undefined {
  return storeList.find((store) => store.name === name)?.key
}

export function applyShippingRules(rules: Array<{
  key: string
  name: string
  fee?: number
  freeThreshold?: number | null
  specialRule?: string
}>) {
  if (!Array.isArray(rules) || rules.length === 0) return

  const nextStores = rules.map((rule) => ({
    key: rule.key,
    name: rule.name,
    fee: Number(rule.fee || 0),
    freeThreshold: rule.freeThreshold == null ? Infinity : Number(rule.freeThreshold),
    specialRule: rule.specialRule || "none",
  }))

  storeList.splice(0, storeList.length, ...nextStores)
  storeSelectOptions.splice(0, storeSelectOptions.length, ...storeList.map((store) => ({
    key: store.key,
    label: buildLabel(store),
  })))

  Object.keys(storeShippingConfig).forEach((key) => delete storeShippingConfig[key])
  storeList.forEach((store) => {
    storeShippingConfig[store.key] = {
      fee: store.fee,
      freeThreshold: store.freeThreshold,
      specialRule: store.specialRule,
    }
  })
  storeShippingConfig.default = { fee: 0, freeThreshold: Infinity, specialRule: "none" }

  Object.keys(storeNameMap).forEach((key) => delete storeNameMap[key])
  storeList.forEach((store) => {
    storeNameMap[store.key] = store.name
  })
}
