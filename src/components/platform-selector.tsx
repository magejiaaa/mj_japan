"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlatformSelectorProps {
  selectedPlatform: "shopee" | "iopen" | "myship"
  onPlatformChange: (platform: "shopee" | "iopen" | "myship") => void
}

const platforms = [
  { value: "shopee", label: "蝦皮（手續費 17.5%）" },
  { value: "myship", label: "賣貨便（台灣運費 +$38）" },
  { value: "iopen", label: "iopen mall（台灣運費 +$38｜可領免運券）" },
] as const

export default function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <Card className="border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">選擇下單平台</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPlatform}
          onValueChange={(value) => onPlatformChange(value as "shopee" | "iopen" | "myship")}
          className="space-y-4 pt-4"
        >
          {platforms.map((platform) => (
            <div key={platform.value} className="flex items-center space-x-3">
              <RadioGroupItem value={platform.value} id={platform.value} className="border-[var(--color-primary)] text-[var(--color-primary)]" />
              <Label htmlFor={platform.value} className="cursor-pointer text-[var(--text-primary)]">
                {platform.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
