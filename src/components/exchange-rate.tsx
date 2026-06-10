"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExchangeRateProps {
  rate: number
  lastUpdated: string
  onRefresh: () => void
  onRateChange: (rate: number) => void
}

export default function ExchangeRate({ rate, lastUpdated, onRateChange }: ExchangeRateProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedRate, setEditedRate] = useState(rate.toString())

  useEffect(() => {
    setEditedRate(rate.toString())
  }, [rate])

  const handleEditToggle = () => {
    if (isEditing) {
      const newRate = Number.parseFloat(editedRate)
      if (!Number.isNaN(newRate) && newRate > 0) onRateChange(newRate)
      else setEditedRate(rate.toString())
    }
    setIsEditing(!isEditing)
  }

  return (
    <Card className="border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">當前匯率 JP</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-2xl font-bold">1 日幣 =</div>
          {isEditing ? (
            <Input
              type="number"
              value={editedRate}
              onChange={(e) => setEditedRate(e.target.value)}
              step="0.0001"
              min="0.0001"
              className="w-28 border-[var(--border-input)] bg-white dark:bg-[var(--color-primary-ultra-light)]"
            />
          ) : (
            <div className="text-2xl font-bold">{rate.toFixed(2)} 台幣</div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            className="border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--color-primary-light)]"
          >
            {isEditing ? "儲存" : "編輯"}
          </Button>
        </div>
        <div className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          <p>最後更新日：{lastUpdated}</p>
          <p>每日下午 16:00 自動更新收盤價（台灣銀行現金匯率），更新有延遲，如未更新可手動編輯匯率</p>
        </div>
      </CardContent>
    </Card>
  )
}
