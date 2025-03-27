export interface ProductItem {
  id: string
  url: string
  store: string
  price: number
  quantity: number
  category: string
}

export interface CalculationSummary {
  totalJPY: number
  totalTWD: number
  totalDomesticShippingJPY: number
  totalDomesticShippingTWD: number
  totalInternationalShipping: number
  serviceFee: number
  grandTotal: number
}

