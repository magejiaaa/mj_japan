"use client"

import React from "react"
import { HelpCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import ProductItem from "@/components/product-item"
import type { ProductItem as ProductItemType } from "@/lib/types"
import { getCustomStoreKey, getStoreKey, isCustomStoreKey, normalizeCustomStoreName } from "@/lib/storeConfig"
import { categoryMap, getCategoryKey } from "@/lib/categoryMap"

interface ProductFormProps {
  products: ProductItemType[]
  onAddProduct: () => void
  onRemoveProduct: (id: string) => void
  onProductChange: (product: ProductItemType) => void
  onOpenCategoryModal: () => void
  onImportProducts: (imported: ProductItemType[]) => void
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

  function parseProductData(text: string): ProductItemType[] {
    const items: string[] = []
    let currentItem: string[] = []

    text.split(/\r?\n/).forEach((line) => {
      if (/^\s*訂單摘要:/.test(line)) {
        if (currentItem.length > 0) items.push(currentItem.join("\n"))
        currentItem = []
        return
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        if (currentItem.length > 0) items.push(currentItem.join("\n"))
        currentItem = [line]
        return
      }

      if (currentItem.length > 0) currentItem.push(line)
    })

    if (currentItem.length > 0) items.push(currentItem.join("\n"))

    const parseAmount = (value: string | undefined) => (value ? Number(value.replace(/,/g, "")) : 0)

    return items.map((item) => {
      const urlMatch = item.match(/^\s*\d+\.\s*([^\n]+)/m)
      const storeMatch = item.match(/(?:日本店家|店家):\s*(.*)/)
      const priceMatch = item.match(/價格:\s*(?:[¥￥]|JPY|日幣)?\s*([\d,]+)/i)
      const colorMatch = item.match(/顏色尺寸:\s*([\s\S]*?)\n\s*類別:/)
      const categoryMatch = item.match(/類別:\s*(.*)/)
      const quantityMatch = item.match(/數量:\s*(\d+)/)
      const shippingMatch = item.match(/日本國內運費:\s*(?:[¥￥]|JPY|日幣)?\s*([\d,]+)/i)
      const categoryText = categoryMatch?.[1]?.trim() || ""
      const categoryName =
        Object.values(categoryMap)
          .map((category) => category.name)
          .find((name) => categoryText.startsWith(name)) || categoryText.replace(/\s+(?:NT\$|\$)\s*[\d,]+.*$/, "").trim()

      const storeName = storeMatch?.[1]?.trim() || ""
      const knownStoreKey = storeName ? getStoreKey(storeName) : undefined
      const customStoreName = knownStoreKey ? undefined : storeName

      return {
        id: Math.random().toString(36).slice(2),
        url: urlMatch?.[1]?.trim() || "",
        store: knownStoreKey || (customStoreName ? getCustomStoreKey(customStoreName) : "free"),
        customStoreName,
        price: parseAmount(priceMatch?.[1]),
        color: colorMatch?.[1]?.trim() || "",
        category: categoryName ? getCategoryKey(categoryName) || "clothing" : "clothing",
        quantity: quantityMatch?.[1] ? Number(quantityMatch[1]) : 1,
        customShippingFee: parseAmount(shippingMatch?.[1]),
      }
    })
  }

  const imported = parseProductData(importText)
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
            添加商品
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
          <label className="mb-2 block text-sm font-medium">本網站一鍵複製的內容可貼上此區塊進行導入</label>
          <Textarea
            className="min-h-[105px] border-[var(--border-input)] bg-white text-[var(--text-primary)] dark:bg-[var(--bg-card)]"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={4}
            placeholder="僅可辨識本網站導出的商品資料..."
          />
          {importText && !importValid && <p className="mt-2 text-sm text-red-500">無法辨識貼上的商品資料，請確認格式</p>}
          {importValid && (
            <Button
              onClick={handleImport}
              className="mt-3 w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
            >
              導入 {imported.length} 筆商品
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
