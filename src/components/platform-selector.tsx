"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrderPlatform } from "@/lib/types"

interface PlatformSelectorProps {
  selectedPlatform: OrderPlatform
  onPlatformChange: (platform: OrderPlatform) => void
}

const platforms = [
  { value: "shopee", label: "蝦皮（手續費 17.5%）" },
  { value: "myship", label: "賣貨便（台灣運費 +$38）" },
  { value: "iopen", label: "iopen mall（手續費 2.5% 台灣運費 +$38｜可領免運券）" },
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
          onValueChange={(value) => onPlatformChange(value as OrderPlatform)}
          aria-label="選擇下單平台"
          className="gap-1 lg:pt-2"
        >
          {platforms.map((platform) => (
            <Label key={platform.value} htmlFor={platform.value} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 leading-snug text-[var(--text-primary)] ${selectedPlatform === platform.value ? "bg-[var(--color-primary-light)]" : "hover:bg-[var(--color-primary-ultra-light)]"}`}>
              <RadioGroupItem value={platform.value} id={platform.value} className="size-5 shrink-0 border-[var(--quote-accent)] text-[var(--quote-accent)]" />
                {platform.label}
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
