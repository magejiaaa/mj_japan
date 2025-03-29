"use client"

import { Trash2, HelpCircle } from "lucide-react"
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
    <div className="p-4 bg-[#F9F5EB] dark:bg-[#3D2A2D] rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-3">
          <div>
            <label htmlFor={`url-${product.id}`} className="block text-xs font-medium text-black dark:text-white mb-1">
              商品網址
            </label>
            <Input
              id={`url-${product.id}`}
              type="text"
              placeholder="貼上日本商品網址"
              value={product.url}
              onChange={(e) => handleChange("url", e.target.value)}
              className="bg-white dark:bg-[#2D1A1D] text-black dark:text-white"
            />
            <label htmlFor={`url-${product.id}`} className="block text-xs font-medium text-black dark:text-white mb-1 mt-2">
              顏色尺寸
            </label>
            <Input
              id={`color-${product.id}`}
              type="text"
              placeholder="請輸入顏色尺寸"
              value={product.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="bg-white dark:bg-[#2D1A1D] text-black dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor={`store-${product.id}`}
              className="block text-xs font-medium text-black dark:text-white mb-1"
            >
              日本店家
            </label>
            <StoreSelector
              id={`store-${product.id}`}
              value={product.store}
              onChange={(value) => handleChange("store", value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor={`price-${product.id}`}
                className="block text-xs font-medium text-black dark:text-white mb-1"
              >
                價格 (日幣)
              </label>
              <Input
                id={`price-${product.id}`}
                type="number"
                min="0"
                placeholder="0"
                value={product.price || ""}
                onChange={(e) => handleChange("price", Number.parseFloat(e.target.value) || 0)}
                className="bg-white dark:bg-[#2D1A1D] text-black dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor={`quantity-${product.id}`}
                className="block text-xs font-medium text-black dark:text-white mb-1"
              >
                數量
              </label>
              <Input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                max="100"
                value={product.quantity}
                onChange={(e) =>
                  handleChange("quantity", Math.min(100, Math.max(1, Number.parseInt(e.target.value) || 1)))
                }
                className="bg-white dark:bg-[#2D1A1D] text-black dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <label
                  htmlFor={`category-${product.id}`}
                  className="block text-xs font-medium text-black dark:text-white mb-1"
                >
                  類別
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="h-4 w-4 p-0 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-transparent"
                >
                  <HelpCircle className="h-3 w-3" />
                  <span className="sr-only">查看類別範例</span>
                </Button>
              </div>
              <Select value={product.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger
                  id={`category-${product.id}`}
                  className="bg-white dark:bg-[#2D1A1D] text-black dark:text-white"
                >
                  <SelectValue placeholder="選擇類別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">衣物</SelectItem>
                  <SelectItem value="shoes">鞋類</SelectItem>
                  <SelectItem value="books">書籍</SelectItem>
                  <SelectItem value="electronics">電子產品</SelectItem>
                  <SelectItem value="cosmetics">化妝品</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showRemoveButton && (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">移除項目</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

