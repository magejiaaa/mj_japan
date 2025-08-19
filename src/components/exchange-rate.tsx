"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExchangeRateProps {
  rate: number
  lastUpdated: string
  onRefresh: () => void
  onRateChange: (rate: number) => void
}

export default function ExchangeRate({ rate, lastUpdated, onRefresh, onRateChange }: ExchangeRateProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRate, setEditedRate] = useState(rate.toString())

  const handleEditToggle = () => {
    if (isEditing) {
      // 保存編輯後的匯率
      const newRate = Number.parseFloat(editedRate)
      if (!isNaN(newRate) && newRate > 0) {
        onRateChange(newRate)
      } else {
        // 如果無效則重置為原始值
        setEditedRate(rate.toString())
      }
    }
    setIsEditing(!isEditing)
  }

  return (
    <Card className="bg-[#FADCD9] dark:bg-[#4D3A3D] border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>當前匯率 🇯🇵</span>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="text-[#4D3A3D] hover:text-[#4D3A3D] hover:bg-[#F5B5B5]/20 dark:hover:bg-[#3D2A2D]/50"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">刷新匯率</span>
          </Button> */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold">1 日幣 =</div>
          {isEditing ? (
            <Input
              type="number"
              value={editedRate}
              onChange={(e) => setEditedRate(e.target.value)}
              step="0.0001"
              min="0.0001"
              className="w-24 bg-[#F9F5EB] dark:bg-[#3D2A2D] text-black dark:text-white"
            />
          ) : (
            <div className="text-xl font-bold">{rate.toFixed(2)} 台幣</div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            className="ml-2 bg-[#F9F5EB] dark:bg-[#3D2A2D] text-black dark:text-white border-[#F8F0E3]/30"
          >
            {isEditing ? "保存" : "編輯"}
          </Button>
        </div>
        <div className="text-xs mt-2 opacity-70 leading-5">
          最後更新: {lastUpdated} <br />
          每日下午16:00自動更新收盤價，更新有延遲，如未更新可手動編輯匯率
          <p className="text-[#a42c2c] text-lg font-bold">‼️zozotown、can online shop匯率請依照IG公告進行編輯‼️</p>
        </div>
      </CardContent>
    </Card>
  )
}

