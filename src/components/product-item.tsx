"use client"

import { HelpCircle, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductItem as ProductItemType } from "@/lib/types"
import StoreSelector from "@/components/store-selector"

interface ProductItemProps {
  product: ProductItemType
  onRemove: () => void
  onChange: (product: ProductItemType) => void
  showRemoveButton: boolean
  onOpenCategoryModal: () => void
}

const inputClass = "border-[var(--border-input)] bg-white text-[var(--text-primary)] dark:bg-[var(--color-primary-ultra-light)]"

export default function ProductItem({
  product,
  onRemove,
  onChange,
  showRemoveButton,
  onOpenCategoryModal,
}: ProductItemProps) {
  const handleChange = (field: keyof ProductItemType, value: string | number) => {
    onChange({
      ...product,
      [field]: value,
    })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)] p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
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

          <div>
            <label htmlFor={`color-${product.id}`} className="mb-1 block text-sm font-medium">
              顏色尺寸
            </label>
            <Input
              id={`color-${product.id}`}
              type="text"
              placeholder="請輸入顏色尺寸"
              value={product.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor={`store-${product.id}`} className="mb-1 block text-sm font-medium">
              日本店家
            </label>
            <StoreSelector id={`store-${product.id}`} value={product.store} onChange={(value) => handleChange("store", value)} />
          </div>

          {product.store === "other" && (
            <div>
              <label htmlFor={`custom-shipping-${product.id}`} className="mb-1 block text-sm font-medium">
                自訂日本國內運費（日幣） <small className="text-[var(--text-muted)]">只計一次</small>
              </label>
              <Input
                id={`custom-shipping-${product.id}`}
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="請輸入運費"
                value={product.customShippingFee || ""}
                onChange={(e) => handleChange("customShippingFee", Number.parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`price-${product.id}`} className="mb-1 block text-sm font-medium">
                價格（日幣）
              </label>
              <Input
                id={`price-${product.id}`}
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="物品價格"
                value={product.price || ""}
                onChange={(e) => handleChange("price", Number.parseFloat(e.target.value) || 0)}
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

            <div>
              <div className="mb-1 flex items-center gap-1">
                <label htmlFor={`category-${product.id}`} className="block text-sm font-medium">
                  類別
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="h-5 w-5 p-0 text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--color-primary-hover)]"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span className="sr-only">查看類別說明</span>
                </Button>
              </div>
              <Select value={product.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger id={`category-${product.id}`} className={inputClass}>
                  <SelectValue placeholder="選擇類別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="underwear">薄款內衣褲</SelectItem>
                  <SelectItem value="clothing">薄款上下著</SelectItem>
                  <SelectItem value="coat">厚外套／毛衣／厚裙</SelectItem>
                  <SelectItem value="jeans">牛仔上下著</SelectItem>
                  <SelectItem value="shoes">鞋類</SelectItem>
                  <SelectItem value="shortBoots">短靴／厚底鞋</SelectItem>
                  <SelectItem value="longBoots">長靴</SelectItem>
                  <SelectItem value="other">其他類別</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showRemoveButton && (
          <div className="flex items-start justify-end">
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">刪除商品</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
