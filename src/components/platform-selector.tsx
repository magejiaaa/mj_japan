"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface PlatformSelectorProps {
  selectedPlatform: "shopee" | "other"
  onPlatformChange: (platform: "shopee" | "other") => void
}

export default function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <div className="bg-[#F9F5EB] dark:bg-[#3D2A2D] p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-black dark:text-white mb-3">選擇下單平台</h3>

      <RadioGroup
        value={selectedPlatform}
        onValueChange={(value) => onPlatformChange(value as "shopee" | "other")}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="shopee" id="shopee" className="text-[#F5B5B5] border-[#F5B5B5]" />
          <Label htmlFor="shopee" className="text-black dark:text-white cursor-pointer">
            蝦皮 (手續費 17.5%)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="other" id="other" className="text-[#F5B5B5] border-[#F5B5B5]" />
          <Label htmlFor="other" className="text-black dark:text-white cursor-pointer">
            其他平台 (手續費 16.5%)
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}

