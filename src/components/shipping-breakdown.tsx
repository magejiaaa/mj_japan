"use client"

import { formatCurrency } from "@/lib/quoteText"

interface ShippingBreakdownProps {
  domesticShippingJPY: number
  domesticShippingTWD: number
  storeName: string
  storeTotal: number
  isCustomShipping?: boolean
}

export default function ShippingBreakdown({
  domesticShippingJPY,
  domesticShippingTWD,
  storeName,
  storeTotal,
  isCustomShipping,
}: ShippingBreakdownProps) {
  return (
    <div className="mt-2 border-l-2 border-[var(--color-primary)] pl-3 text-xs text-[var(--text-secondary)]">
      <div className="flex justify-between gap-4">
        <span>
          {storeName}
          {isCustomShipping && <span className="ml-1 text-[10px] italic text-[var(--color-primary-hover)]">*自訂運費</span>}
        </span>
        <span>
          {formatCurrency(domesticShippingJPY, "JPY")} ({formatCurrency(domesticShippingTWD, "TWD")})
        </span>
      </div>
      <div className="mt-1 flex justify-between gap-4">
        <span>店家商品總額：</span>
        <span>{formatCurrency(storeTotal, "JPY")}</span>
      </div>
    </div>
  )
}
