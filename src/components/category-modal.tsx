"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { categoryMap } from "@/lib/categoryMap"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
}

type CategoryDescription = {
  description: string
  examples: Array<{
    name: string
    image: string
  }>
}

const descriptions: Record<string, CategoryDescription> = {
  underwear: {
    description: "薄款內衣褲、襪子、髮飾等小型輕量商品。",
    examples: [
      { name: "內衣褲", image: "/underwear.png" },
      { name: "小型配件", image: "/other.jpg" },
    ],
  },
  clothing: {
    description: "一般薄款衣物，例如上衣、襯衫、短裙、洋裝等。",
    examples: [
      { name: "薄款上下著", image: "/clothing.png" },
      { name: "洋裝", image: "/clothing.png" },
    ],
  },
  coat: {
    description: "較厚或較佔空間的衣物，例如毛衣、厚外套、厚裙。",
    examples: [
      { name: "厚外套", image: "/coat.png" },
      { name: "毛衣厚裙", image: "/coat.png" },
    ],
  },
  jeans: {
    description: "丹寧或厚磅布料的上下著。",
    examples: [
      { name: "牛仔褲", image: "/jeans.png" },
      { name: "牛仔裙", image: "/jeans.png" },
    ],
  },
  shoes: {
    description: "一般鞋款，若鞋盒較大可能會依實際運費調整。",
    examples: [
      { name: "鞋類", image: "/shoes.png" },
      { name: "厚底鞋", image: "/shoes.png" },
    ],
  },
  shortBoots: {
    description: "短靴或較高筒的鞋款。",
    examples: [
      { name: "短靴", image: "/shortBoots.png" },
      { name: "踝靴", image: "/shortBoots.png" },
    ],
  },
  longBoots: {
    description: "長靴、膝下靴等體積較大的鞋款。",
    examples: [
      { name: "長靴", image: "/longBoots.png" },
      { name: "膝下靴", image: "/longBoots.png" },
    ],
  },
  other: {
    description: "文具、小物、雜貨等無法歸類的商品。系統會先用固定估算，實際仍以回覆為準。",
    examples: [
      { name: "小物雜貨", image: "/other.jpg" },
      { name: "文具飾品", image: "/other.jpg" },
    ],
  },
}

export default function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState("clothing")

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  if (!isOpen) return null

  const categories = Object.entries(categoryMap).map(([id, info]) => ({
    id,
    ...info,
    ...descriptions[id],
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-card)] p-4">
          <h2 className="text-xl font-bold">類別說明</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[var(--color-primary-light)]">
            <X className="h-5 w-5" />
            <span className="sr-only">關閉</span>
          </Button>
        </div>

        <div className="p-4">
          <Tabs defaultValue="clothing" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid h-auto grid-cols-2 bg-[var(--color-primary-light)] md:grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-5">
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--color-primary-ultra-light)] p-5">
                  <h3 className="mb-3 text-lg font-bold">{category.name}</h3>
                  <p className="leading-7 text-[var(--text-secondary)]">{category.description}</p>

                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-md bg-white p-3 dark:bg-[var(--bg-card)]">
                      <p className="text-[var(--text-secondary)]">估算重量</p>
                      <p className="mt-1 font-bold">{category.weight}</p>
                    </div>
                    <div className="rounded-md bg-white p-3 dark:bg-[var(--bg-card)]">
                      <p className="text-[var(--text-secondary)]">國際運費</p>
                      <p className="mt-1 font-bold">{category.fee} 台幣 / 件</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-bold">常見範例</p>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {category.examples.map((example) => (
                        <li
                          key={`${category.id}-${example.name}`}
                          className="overflow-hidden rounded-md border border-[var(--border-default)] bg-white dark:bg-[var(--bg-card)]"
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={example.image}
                              alt={example.name}
                              fill
                              sizes="(min-width: 768px) 160px, 45vw"
                              className="object-cover"
                            />
                          </div>
                          <p className="px-3 py-2 text-center text-sm font-medium">{example.name}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
