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
        <SelectItem value="free">免運費</SelectItem>
        <SelectItem value="GRL">GRL (通常免運)</SelectItem>
        <SelectItem value="ZOZOTOWN">ZOZOTOWN (660日幣)</SelectItem>
        <SelectItem value="ROJITA">ROJITA (650日幣)</SelectItem>
        <SelectItem value="axesFemme">axes femme (410日幣)</SelectItem>
        <SelectItem value="other">其他 (800日幣)</SelectItem>
      </SelectContent>
    </Select>
  )
}

