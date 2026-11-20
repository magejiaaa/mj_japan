"use client"

import { HelpCircle, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductItem as ProductItemType } from "@/lib/types"
import { categoryMap, getCategoryInfo } from "@/lib/categoryMap"
import StoreSelector, { type CustomStoreOption } from "@/components/store-selector"
import { getCustomStoreKey, isCustomStoreKey } from "@/lib/storeConfig"

interface ProductItemProps {
  product: ProductItemType
  index: number
  onRemove: () => void
  onChange: (product: ProductItemType) => void
  showRemoveButton: boolean
  onOpenCategoryModal: () => void
  customStoreOptions: CustomStoreOption[]
}

const inputClass = "h-11 border-[var(--border-input)] bg-[var(--bg-card)] text-base text-[var(--text-primary)] lg:h-10 lg:text-sm"

export default function ProductItem({
  product,
  index,
  onRemove,
  onChange,
  showRemoveButton,
  onOpenCategoryModal,
  customStoreOptions,
}: ProductItemProps) {
  const isCustomStore = product.store === "other" || isCustomStoreKey(product.store)

  const handleChange = (field: keyof ProductItemType, value: string | number) => {
    onChange({
      ...product,
      [field]: value,
    })
  }

  const handleStoreChange = (value: string) => {
    const customStore = customStoreOptions.find((option) => option.key === value)
    onChange({
      ...product,
      store: value,
      customStoreName: customStore?.name ?? (value === "other" ? "" : product.customStoreName),
      customShippingFee: customStore?.customShippingFee ?? (value === "other" ? 0 : undefined),
    })
  }

  const handleCustomStoreNameChange = (name: string) => {
    onChange({
      ...product,
      store: getCustomStoreKey(name),
      customStoreName: name,
    })
  }

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] lg:bg-[var(--color-primary-ultra-light)]">
      <div className="flex min-h-11 items-center justify-between gap-2 bg-[var(--color-primary-light)] px-4 text-[var(--quote-accent)]">
        <h3 className="text-sm font-bold">商品 {index + 1}</h3>
        {showRemoveButton && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="size-10 text-[var(--quote-accent)] hover:bg-[var(--color-primary-ultra-light)]" aria-label={`刪除商品 ${index + 1}`}>
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <label htmlFor={`store-${product.id}`} className="mb-1 block text-sm font-medium">
            日本店家
          </label>
          <StoreSelector
            id={`store-${product.id}`}
            value={product.store}
            onChange={handleStoreChange}
            customStoreOptions={customStoreOptions}
          />
        </div>

        {isCustomStore && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`custom-store-name-${product.id}`} className="mb-1 block text-sm font-medium">
                其他店家名稱
              </label>
              <Input
                id={`custom-store-name-${product.id}`}
                type="text"
                placeholder="請輸入店名"
                value={product.customStoreName || ""}
                onChange={(e) => handleCustomStoreNameChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor={`custom-shipping-${product.id}`} className="mb-1 block text-sm font-medium">
                該店日本國內運費（日幣） <small className="text-[var(--text-muted)]">同店只計一次</small>
              </label>
              <Input
                id={`custom-shipping-${product.id}`}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="請輸入運費"
                value={product.customShippingFee || ""}
                onChange={(e) => handleChange("customShippingFee", Math.max(0, Number.parseFloat(e.target.value) || 0))}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor={`url-${product.id}`} className="mb-1 block text-sm font-medium">
            商品網址
          </label>
          <Input
            id={`url-${product.id}`}
            type="text"
            placeholder="貼上日本商品網址"
            value={product.url}
            onChange={(e) => handleChange("url", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-end gap-3">
          <div>
            <label htmlFor={`price-${product.id}`} className="mb-1 block text-sm font-medium">
              價格（日圓）
            </label>
            <Input
              id={`price-${product.id}`}
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="物品價格"
              value={product.price || ""}
              onChange={(e) => handleChange("price", Math.max(0, Number.parseFloat(e.target.value) || 0))}
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-1">
              <label htmlFor={`category-${product.id}`} className="block text-sm font-medium">
                類別
              </label>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={onOpenCategoryModal}
                className="h-8 px-2 text-xs text-[var(--quote-accent)] underline-offset-4 hover:bg-transparent hover:underline"
              >
                <HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />
                類別說明
              </Button>
            </div>
            <Select value={product.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger id={`category-${product.id}`} className={inputClass}>
                <SelectValue placeholder="選擇類別" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryMap).map(([key, { name }]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
                {!categoryMap.other && <SelectItem value="other">{getCategoryInfo("other").name}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-end gap-3">
          <div>
            <label htmlFor={`color-${product.id}`} className="mb-1 block text-sm font-medium">
              顏色尺寸
            </label>
            <Input
              id={`color-${product.id}`}
              type="text"
              placeholder="例：米白／M"
              value={product.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`quantity-${product.id}`} className="mb-1 block text-sm font-medium">
              數量
            </label>
            <Input
              id={`quantity-${product.id}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              value={product.quantity}
              onChange={(e) => handleChange("quantity", Math.min(100, Math.max(1, Number.parseInt(e.target.value) || 1)))}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
