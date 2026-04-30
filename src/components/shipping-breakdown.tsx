"use client"
interface ShippingBreakdownProps {
  domesticShippingJPY: number
  domesticShippingTWD: number
  store: string
  storeTotal: number
  isCustomShipping?: boolean
  isOtherCategory?: boolean
}

export default function ShippingBreakdown({
  domesticShippingJPY,
  domesticShippingTWD,
  store,
  storeTotal,
  isCustomShipping,
  isOtherCategory,
}: ShippingBreakdownProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: currency === "JPY" ? "JPY" : "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="mt-2 text-sm text-black dark:text-white">
      <div className="pl-2 pt-1 space-y-1 text-xs border-l-2 border-[#F5B5B5] dark:border-[#5D4A4D] mt-1">
        <div className="flex justify-between">
          <span className="text-black/60 dark:text-white/60">
            {store}
            {isCustomShipping && <span className="text-blue-600 dark:text-blue-400 text-[10px] ml-1 italic">*自定義運費</span>}
          </span>
          <span>
            {formatCurrency(domesticShippingJPY, "JPY")} ({formatCurrency(domesticShippingTWD, "TWD")})
          </span>
        </div>
        {store !== "free" && !isCustomShipping && (
          <div className="text-black/50 dark:text-white/50 text-[10px] italic">*同一店家只計算一次運費</div>
        )}

        {/* 顯示店家商品總額 */}
        <div className="flex justify-between pt-1 text-black/60 dark:text-white/60">
          <span>店家商品總額:</span>
          <span>{formatCurrency(storeTotal, "JPY")}</span>
        </div>
      </div>
    </div>
  )
}

