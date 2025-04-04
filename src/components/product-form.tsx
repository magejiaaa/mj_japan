"use client"

import { Plus } from "lucide-react"
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
          <Button
            onClick={onAddProduct}
            size="sm"
            className="bg-[#F9F5EB] hover:bg-[#F9F5EB]/80 text-black dark:bg-[#3D2A2D] dark:hover:bg-[#3D2A2D]/80 dark:text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加商品
          </Button>
        </CardTitle>
      </CardHeader>
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

