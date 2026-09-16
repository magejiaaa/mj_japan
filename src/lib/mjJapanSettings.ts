import { applyCategoryRules } from "@/lib/categoryMap"
import { applyShippingRules } from "@/lib/storeConfig"

export interface MjJapanRemoteSettings {
  defaultRate?: number
  shopeeRate?: number
  defaultInternationalShipping?: number
}

interface MjJapanRulesResponse {
  settings?: MjJapanRemoteSettings
  rules?: {
    shippingRules?: Parameters<typeof applyShippingRules>[0]
    categoryRules?: Parameters<typeof applyCategoryRules>[0]
  }
}

const DEFAULT_RULES_URL = "http://localhost:3000/api/rules?target=mj_japan"

export async function loadMjJapanSettings(): Promise<MjJapanRemoteSettings | null> {
  const url = process.env.NEXT_PUBLIC_MJ_JAPAN_RULES_URL || DEFAULT_RULES_URL
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error("Unable to load mj_japan settings")

  const data = (await response.json()) as MjJapanRulesResponse
  if (data.rules?.categoryRules?.length) applyCategoryRules(data.rules.categoryRules)
  if (data.rules?.shippingRules?.length) applyShippingRules(data.rules.shippingRules)

  return data.settings || null
}
