"use client"

import { Plus, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProductItem from "@/components/product-item"
import type { ProductItem as ProductItemType } from "@/lib/types"
import React from "react"
import { getStoreKey } from "@/lib/storeNameMap"
import { getCategoryKey } from "@/lib/categoryMap"

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
  const [importText, setImportText] = React.useState("");

  function parseProductData(text: string) {
    // 只抓商品: 之後、店家運費: 之前
    const match = text.match(/商品:\s*\n([\s\S]*?)店家運費:/);
    const productSection = match ? match[1] : "";
    if (!productSection) return [];
    // 以商品編號分割
    
    const items = productSection.match(/\d+\.\s*[\s\S]*?(?=(\n\d+\.|$))/g) || [];
    return items.map(item => {
      // 取商品編號後的文字作為 url
      const urlMatch = item.match(/\d+\.\s*([^\n]+)/);
      const storeMatch = item.match(/店家:\s*(.*)/);
      const storeKey = storeMatch ? getStoreKey(storeMatch[1].trim()) : undefined;
      const priceMatch = item.match(/價格:\s*¥([\d,]+)/);
      const price = priceMatch?.[1] ? Number(priceMatch[1].replace(/,/g, "")) : 0;
      const colorMatch = item.match(/顏色尺寸:\s*(.*)/);
      const categoryMatch = item.match(/類別:\s*(.*)/);
      const categoryKey = categoryMatch ? getCategoryKey(categoryMatch[1].trim()) : undefined;
      const quantityMatch = item.match(/數量:\s*(\d+)/);
      const shippingMatch = item.match(/國際運費:\s*\$(\d+)/);
      console.log(storeKey);

      return {
        id: Math.random().toString(36).slice(2),
        url: urlMatch?.[1]?.trim() || "",
        store: storeKey,
        price,
        color: colorMatch?.[1]?.trim() || "",
        category: categoryKey,
        quantity: quantityMatch?.[1] ? Number(quantityMatch[1]) : 1,
        customShippingFee: shippingMatch?.[1] ? Number(shippingMatch[1]) : 0,
      };
    });
  }

  const handleImport = () => {
    const imported = parseProductData(importText);
    onImportProducts(imported);
    setImportText("");
  };

  return (
    <Card className="bg-[#FADCD9] dark:bg-[#4D3A3D] border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>商品項目</span>
          <Button
            onClick={onAddProduct}
            size="sm"
            className="bg-[#F9F5EB] hover:bg-[#F9F5EB]/80 text-black dark:bg-[#3D2A2D] dark:hover:bg-[#3D2A2D]/80 dark:text-white"
            disabled={products.some((product) => product.store === "other")}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加商品
          </Button>
        </CardTitle>
      </CardHeader>
      {/* 導入商品資料區塊 */}
      <div className="mt-4">
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          rows={6}
          className="w-full border p-2"
          placeholder="貼上商品資料..."
        />
        <Button
          onClick={handleImport}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          導入
        </Button>
      </div>
      <ul className="pl-10 pr-6 mb-2 text-sm text-[#a42c2c] dark:text-gray-400 list-disc">
        <li>若日本店家選擇「自行輸入運費」，請填寫該店的總金額即可，並請單獨計算，不要與其他店家合併。</li>
        <li>若產品類別選擇「其他」，將預設先計算 1kg 的運費，後續多退少補。<br />若是文具、小物等商品，不需要逐一填寫，金額可先填寫總價來估算運費，之後再透過 IG 告知各項品項即可。</li>
        <li>類別說明可點擊下方 <HelpCircle className="h-3 w-3 inline-block" /> 圖示</li>
      </ul>
      <CardContent className="product-list-box">
        <div className="space-y-4 md:max-h-[400px] overflow-y-auto product-list">
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

