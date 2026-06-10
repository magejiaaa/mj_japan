"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storeSelectOptions } from "@/lib/storeConfig"

interface StoreSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
}

export default function StoreSelector({ id, value, onChange }: StoreSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="border-[var(--border-input)] bg-white text-[var(--text-primary)] dark:bg-[var(--color-primary-ultra-light)]">
        <SelectValue placeholder="選擇店家" />
      </SelectTrigger>
      <SelectContent>
        {storeSelectOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
