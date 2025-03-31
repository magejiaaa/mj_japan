"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlatformSelectorProps {
  selectedPlatform: "shopee" | "other"
  onPlatformChange: (platform: "shopee" | "other") => void
}

export default function PlatformSelector({ selectedPlatform, onPlatformChange }: PlatformSelectorProps) {
  return (
    <Card className="bg-[#FADCD9] dark:bg-[#4D3A3D] border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">選擇下單平台</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedPlatform}
          onValueChange={(value) => onPlatformChange(value as "shopee" | "other")}
          className="flex flex-col space-y-2 p-4 bg-[#F9F5EB] dark:bg-[#3D2A2D] rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="shopee" id="shopee" className="text-[#F5B5B5] border-[#F5B5B5]" />
            <Label htmlFor="shopee" className="text-black dark:text-white cursor-pointer">
              蝦皮 (手續費 17.5%)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="myship" id="myship" className="text-[#F5B5B5] border-[#F5B5B5]" />
            <Label htmlFor="myship" className="text-black dark:text-white cursor-pointer">
              賣貨便 (台灣運費+$38)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="iopen" id="iopen" className="text-[#F5B5B5] border-[#F5B5B5]" />
            <Label htmlFor="iopen" className="text-black dark:text-white cursor-pointer">
              iopen mall (台灣運費+$38｜可領免運券)
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

