"use client"

import React from "react"
import { HelpCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import ProductItem from "@/components/product-item"
import type { ProductItem as ProductItemType } from "@/lib/types"
import { getCustomStoreKey, isCustomStoreKey, normalizeCustomStoreName } from "@/lib/storeConfig"
import { parseQuoteProducts, type ImportedProduct } from "@/lib/quoteText"

interface ProductFormProps {
  products: ProductItemType[]
  onAddProduct: () => void
  onRemoveProduct: (id: string) => void
  onProductChange: (product: ProductItemType) => void
  onOpenCategoryModal: () => void
  onImportProducts: (imported: ImportedProduct[]) => void
}

export default function ProductForm({
  products,
  onAddProduct,
  onRemoveProduct,
  onProductChange,
  onOpenCategoryModal,
  onImportProducts,
}: ProductFormProps) {
  const [importText, setImportText] = React.useState("")
  const customStoreOptions = React.useMemo(() => {
    const map = new Map<string, { name: string; customShippingFee?: number }>()

    products.forEach((product) => {
      const name = normalizeCustomStoreName(product.customStoreName || "")
      if (!name) return
      const key = getCustomStoreKey(name)
      map.set(key, {
        name,
        customShippingFee: product.customShippingFee ?? map.get(key)?.customShippingFee,
      })
    })

    return Array.from(map, ([key, option]) => ({ key, ...option }))
  }, [products])

  const imported = parseQuoteProducts(importText)
  const importValid = importText.trim().length > 0 && imported.length > 0

  const handleImport = () => {
    if (!importValid) return
    onImportProducts(imported)
    setImportText("")
  }

  return (
    <Card className="border-[var(--border-default)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>商品項目</span>
          <Button
            onClick={onAddProduct}
            size="sm"
            className="bg-[var(--color-primary-light)] text-[var(--color-primary-hover)] hover:bg-[var(--color-primary)] hover:text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            新增商品
          </Button>
        </CardTitle>
      </CardHeader>

      <ul className="mb-5 list-disc space-y-2 px-8 text-sm leading-6 text-[var(--text-primary)]">
        <li>若日本店家選擇「自行輸入運費」，請填寫該店的總金額即可</li>
        <li>若為文具、小物等商品，不需要選一填寫，金額可先填略估回來估算運費，之後再透過 IG 告知各項品項</li>
        <li>
          不知道類別什麼類別可點擊下方 <HelpCircle className="inline-block h-3.5 w-3.5" /> 圖示
        </li>
      </ul>

      <CardContent className="product-list-box space-y-4">
        <div className="product-list space-y-4 overflow-y-auto md:max-h-[430px]">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onRemove={() => onRemoveProduct(product.id)}
              onChange={onProductChange}
              showRemoveButton={products.length > 1}
              onOpenCategoryModal={onOpenCategoryModal}
              customStoreOptions={customStoreOptions.filter((option) => option.key !== product.store || isCustomStoreKey(product.store))}
            />
          ))}
        </div>

        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)] p-4">
          <label className="mb-2 block text-sm font-medium">貼上一鍵複製的估價內容即可匯入商品</label>
          <Textarea
            className="min-h-[105px] border-[var(--border-input)] bg-white text-[var(--text-primary)] dark:bg-[var(--bg-card)]"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={4}
          placeholder="僅可辨識本網站匯出的商品資料…"
          />
          {importText && !importValid && <p className="mt-2 text-sm text-red-500">無法辨識貼上的商品資料，請確認格式</p>}
          {importValid && (
            <Button
              onClick={handleImport}
              className="mt-3 w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
            >
              匯入 {imported.length} 筆商品
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
