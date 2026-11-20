"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storeSelectOptions } from "@/lib/storeConfig"

export interface CustomStoreOption {
  key: string
  name: string
  customShippingFee?: number
}

interface StoreSelectorProps {
  id: string
  value: string
  onChange: (value: string) => void
  customStoreOptions?: CustomStoreOption[]
}

export default function StoreSelector({ id, value, onChange, customStoreOptions = [] }: StoreSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-11 border-[var(--border-input)] bg-[var(--bg-card)] text-base text-[var(--text-primary)] lg:h-10 lg:text-sm">
        <SelectValue placeholder="選擇店家" />
      </SelectTrigger>
      <SelectContent>
        {storeSelectOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.label}
          </SelectItem>
        ))}
        {customStoreOptions.map((option) => (
          <SelectItem key={option.key} value={option.key}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
