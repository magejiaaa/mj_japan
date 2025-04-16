"use client"

import { Plus, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProductItem from "@/components/product-item"
import type { ProductItem as ProductItemType } from "@/lib/types"

interface ProductFormProps {
  products: ProductItemType[]
  onAddProduct: () => void
  onRemoveProduct: (id: string) => void
  onProductChange: (product: ProductItemType) => void
  onOpenCategoryModal: () => void
}

export default function ProductForm({
  products,
  onAddProduct,
  onRemoveProduct,
  onProductChange,
  onOpenCategoryModal,
}: ProductFormProps) {
  return (
    <Card className="bg-[#FADCD9] dark:bg-[#4D3A3D] border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>商品項目</span>
          {/* 如果日本店家選擇"other"就禁用添加商品 */}
          <Button
            onClick={onAddProduct}
            size="sm"
            className="bg-[#F9F5EB] hover:bg-[#F9F5EB]/80 text-black dark:bg-[#3D2A2D] dark:hover:bg-[#3D2A2D]/80 dark:text-white"
            disabled={products.some((product) => product.store === "other")} // 禁用添加商品按鈕
          >
            <Plus className="h-4 w-4 mr-1" />
            添加商品
          </Button>
        </CardTitle>
      </CardHeader>
      <ul className="pl-10 pr-6 mb-2 text-sm text-[#a42c2c] dark:text-gray-400 list-disc">
      <li>若日本店家選擇「自行輸入運費」，請填寫該店的總金額即可，並請單獨計算，不要與其他店家合併。</li>
      <li>若產品類別選擇「其他」，將預設先計算 1kg 的運費，後續多退少補。<br />若是文具、小物等商品，不需要逐一填寫，金額可先填寫總價來估算運費，之後再透過 IG 告知各項品項即可。</li>
      <li>類別說明可點擊下方 <HelpCircle className="h-3 w-3 inline-block" /> 圖示</li>
      </ul>
      <CardContent>
        <div className="space-y-4 md:max-h-[400px] overflow-y-auto">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onRemove={() => onRemoveProduct(product.id)}
              onChange={onProductChange}
              showRemoveButton={products.length > 1}
              onOpenCategoryModal={onOpenCategoryModal}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

