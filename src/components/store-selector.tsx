"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StoreSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
}

export default function StoreSelector({ id, value, onChange }: StoreSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="bg-white dark:bg-[#2D1A1D] text-black dark:text-white">
        <SelectValue placeholder="選擇店家" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="amazon">Amazon Japan (500日幣/件)</SelectItem>
        <SelectItem value="rakuten">樂天 Rakuten (600日幣/件)</SelectItem>
        <SelectItem value="yahoo">Yahoo Japan (550日幣/件)</SelectItem>
        <SelectItem value="mercari">Mercari (700日幣/件)</SelectItem>
        <SelectItem value="other">其他 (800日幣/件)</SelectItem>
      </SelectContent>
    </Select>
  )
}

