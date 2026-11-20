export interface ProductItem {
  id: string
  url: string
  store: string
  customStoreName?: string
  price: number
  quantity: number
  category: string
  color: string
  /** 同一店家的日本國內運費（日圓），整筆訂單只計一次。 */
  customShippingFee?: number
}

export type OrderPlatform = "shopee" | "myship" | "iopen"

export type PlatformPrices = Record<OrderPlatform, number>

export interface CalculationSummary {
  totalJPY: number
  totalTWD: number
  totalDomesticShippingJPY: number
  totalDomesticShippingTWD: number
  totalInternationalShipping: number
  platformPrices: PlatformPrices
  grandTotal: number
}

