"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface ShippingBreakdownProps {
  domesticShippingJPY: number
  domesticShippingTWD: number
  internationalShipping: number
  store: string
  storeTotal: number
  isCustomShipping?: boolean
  isOtherCategory?: boolean
}

export default function ShippingBreakdown({
  domesticShippingJPY,
  domesticShippingTWD,
  internationalShipping,
  store,
  storeTotal,
  isCustomShipping,
  isOtherCategory,
}: ShippingBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left py-1 hover:bg-black/5 dark:hover:bg-white/5 rounded"
      >
        <span className="font-medium">運費明細</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-black/60 dark:text-white/60" />
        ) : (
          <ChevronDown className="h-4 w-4 text-black/60 dark:text-white/60" />
        )}
      </button>

      {isExpanded && (
        <div className="pl-2 pt-1 space-y-1 text-xs border-l-2 border-[#F5B5B5] dark:border-[#5D4A4D] mt-1">
          <div className="flex justify-between">
            <span className="text-black/60 dark:text-white/60">日本國內運費:</span>
            <span>
              {formatCurrency(domesticShippingJPY, "JPY")} ({formatCurrency(domesticShippingTWD, "TWD")})
            </span>
          </div>
          {isCustomShipping && <div className="text-blue-600 dark:text-blue-400 text-[10px] italic">*自定義運費</div>}
          {store !== "free" && !isCustomShipping && (
            <div className="text-black/50 dark:text-white/50 text-[10px] italic">*同一店家只計算一次運費</div>
          )}
          <div className="flex justify-between">
            <span className="text-black/60 dark:text-white/60">國際運費:</span>
            <span>{formatCurrency(internationalShipping, "TWD")}</span>
          </div>

          {/* 显示"其他"类别固定运费提示 */}
          {isOtherCategory && (
            <div className="text-black/50 dark:text-white/50 text-[10px] italic">*"其他"類別固定運費200元</div>
          )}
          <div className="flex justify-between font-medium pt-1">
            <span className="text-black/80 dark:text-white/80">運費總計:</span>
            <span>{formatCurrency(domesticShippingTWD + internationalShipping, "TWD")}</span>
          </div>

          {/* 显示店家商品总额 */}
          <div className="flex justify-between pt-1 text-black/60 dark:text-white/60">
            <span>店家商品總額:</span>
            <span>{formatCurrency(storeTotal, "JPY")}</span>
          </div>
        </div>
      )}
    </div>
  )
}

