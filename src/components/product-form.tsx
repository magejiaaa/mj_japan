"use client"

import React from "react"
import { ChevronDown, HelpCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [importOpen, setImportOpen] = React.useState(false)
  const [confirmImport, setConfirmImport] = React.useState(false)
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
  const hasExistingProducts = products.length > 1 || products.some((product) => (
    product.price > 0 || product.url.trim() || product.color.trim() || product.store !== "free"
    || product.category !== "clothing" || product.quantity !== 1
  ))

  const handleImport = () => {
    if (!importValid) return
    onImportProducts(imported)
    setImportText("")
    setConfirmImport(false)
  }

  return (
    <Card className="border-transparent bg-transparent shadow-none lg:border-[var(--border-default)] lg:bg-[var(--bg-card)] lg:shadow-[var(--shadow-soft)]">
      <CardHeader className="px-0 pb-3 pt-0 lg:px-6 lg:pt-6">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>商品項目</span>
          <Button
            onClick={onAddProduct}
            size="sm"
            className="hidden bg-[var(--quote-action)] text-[var(--quote-action-text)] hover:bg-[var(--quote-action-hover)] lg:inline-flex"
          >
            <Plus className="mr-1 h-4 w-4" />
            新增商品
          </Button>
        </CardTitle>
      </CardHeader>

      <ul className="mb-5 hidden list-disc space-y-2 px-8 text-sm leading-6 text-[var(--text-primary)] lg:block">
        <li>若日本店家選擇「自行輸入運費」，請填寫該店的總金額即可</li>
        <li>若為文具、小物等商品，不需要選一填寫，金額可先填略估回來估算運費，之後再透過 IG 告知各項品項</li>
        <li>
          可點擊 <HelpCircle className="inline-block h-3.5 w-3.5" /> 查看類別說明
        </li>
      </ul>

      <CardContent className="space-y-3 px-0 pb-0 lg:space-y-4 lg:px-6 lg:pb-6">
        <div className="space-y-4 lg:max-h-[430px] lg:overflow-y-auto">
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
              onRemove={() => onRemoveProduct(product.id)}
              onChange={onProductChange}
              showRemoveButton={products.length > 1}
              onOpenCategoryModal={onOpenCategoryModal}
              customStoreOptions={customStoreOptions.filter((option) => option.key !== product.store || isCustomStoreKey(product.store))}
            />
          ))}
        </div>

        <Button type="button" variant="outline" onClick={onAddProduct} className="h-11 w-full border-[var(--quote-accent)] bg-[var(--bg-card)] text-[var(--quote-accent)] hover:bg-[var(--color-primary-light)] lg:hidden">
          <Plus aria-hidden="true" className="size-4" /> 新增商品
        </Button>

        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)]">
          <Button type="button" variant="ghost" aria-expanded={importOpen} aria-controls="quote-import" onClick={() => setImportOpen(!importOpen)} className="h-11 w-full justify-between px-4 font-semibold hover:bg-[var(--color-primary-light)] lg:hidden">
            貼上報價匯入
            <ChevronDown aria-hidden="true" className={importOpen ? "rotate-180" : undefined} />
          </Button>
          <div id="quote-import" className={`${importOpen ? "block" : "hidden"} p-4 lg:block`}>
            <label htmlFor="quote-import-text" className="mb-2 block text-sm font-medium">貼上一鍵複製的估價內容即可匯入商品</label>
            <Textarea
              id="quote-import-text"
              className="min-h-[105px] border-[var(--border-input)] bg-white text-[var(--text-primary)] dark:bg-[var(--bg-card)]"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={4}
              placeholder="僅可辨識本網站匯出的商品資料…"
            />
            {importText && !importValid && <p className="mt-2 text-sm text-red-500">無法辨識貼上的商品資料，請確認格式</p>}
            {importValid && (
              <Button
                onClick={() => hasExistingProducts ? setConfirmImport(true) : handleImport()}
                className="mt-3 w-full bg-[var(--quote-action)] text-[var(--quote-action-text)] hover:bg-[var(--quote-action-hover)]"
              >
                匯入 {imported.length} 筆商品
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={confirmImport} onOpenChange={setConfirmImport}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)]">
          <DialogHeader>
            <DialogTitle>取代目前的商品清單？</DialogTitle>
            <DialogDescription>匯入的 {imported.length} 筆商品會取代目前的商品與勾選狀態。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmImport(false)}>保留目前商品</Button>
            <Button type="button" onClick={handleImport} className="bg-[var(--quote-action)] text-[var(--quote-action-text)] hover:bg-[var(--quote-action-hover)]">取代並匯入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
