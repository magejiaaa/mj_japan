export interface ProductItem {
  id: string
  url: string
  store: string
  price: number
  quantity: number
  category: string
  color: string
  customShippingFee?: number // 新增自定义运费字段
}

export interface CalculationSummary {
  totalJPY: number
  totalTWD: number
  totalDomesticShippingJPY: number
  totalDomesticShippingTWD: number
  totalInternationalShipping: number
  shopeePrice: number
  otherPlatformPrice: number
  grandTotal: number
  selectedPlatform: "shopee" | "iopen" | "myship"
}

