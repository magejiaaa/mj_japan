export interface ProductItem {
  id: string
  url: string
  store: string
  customStoreName?: string
  price: number
  quantity: number
  category: string
  color: string
  customShippingFee?: number // 新增自定义运费字段
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
  selectedPlatform: OrderPlatform
}

