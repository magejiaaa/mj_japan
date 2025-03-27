"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
}

export default function CategoryModal({ isOpen, onClose, darkMode }: CategoryModalProps) {
  const [activeTab, setActiveTab] = useState("clothing")

  // 當模態窗口打開時，禁止背景滾動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // 按ESC鍵關閉模態窗口
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose])

  // 如果模態窗口未打開，則不渲染
  if (!isOpen) return null

  const categories = [
    {
      id: "clothing",
      name: "衣物",
      description: "包括上衣、褲子、裙子、外套等各種服裝。重量約0.5kg，國際運費為100元/件。",
      examples: ["T恤", "襯衫", "連衣裙", "牛仔褲", "外套"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "shoes",
      name: "鞋類",
      description: "包括各種鞋子，如運動鞋、皮鞋、靴子等。重量約1kg，國際運費為200元/雙。",
      examples: ["運動鞋", "皮鞋", "靴子", "涼鞋", "拖鞋"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "books",
      name: "書籍",
      description: "包括書籍、雜誌、漫畫等印刷品。重量約1.5kg，國際運費為300元/本。",
      examples: ["小說", "漫畫", "雜誌", "教科書", "藝術書"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "electronics",
      name: "電子產品",
      description: "包括各種電子設備和配件。重量約1kg，國際運費為200元/件。",
      examples: ["耳機", "手機配件", "相機配件", "小型電器", "充電器"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "cosmetics",
      name: "化妝品",
      description: "包括各種美妝產品和護膚品。重量約0.3kg，國際運費為60元/件。",
      examples: ["面霜", "精華液", "面膜", "彩妝品", "香水"],
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "other",
      name: "其他",
      description: "不屬於上述類別的其他商品。重量約1kg，國際運費為200元/件。",
      examples: ["玩具", "文具", "家居用品", "飾品", "紀念品"],
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-lg shadow-xl ${
          darkMode ? "bg-[#3D2A2D] text-[#F8F0E3]" : "bg-[#F9F5EB] text-black"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[#F8F0E3]/20 bg-inherit">
          <h2 className="text-xl font-bold">產品分類範例</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`hover:bg-${darkMode ? "[#4D3A3D]" : "[#F5B5B5]/20"}`}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">關閉</span>
          </Button>
        </div>

        <div className="p-4">
          <Tabs defaultValue="clothing" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 bg-[#F5B5B5]/30 dark:bg-[#4D3A3D]">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-[#F5B5B5] dark:data-[state=active]:bg-[#5D4A4D]"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="rounded-md overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={`${category.name}範例`}
                        width={300}
                        height={200}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <div className="text-sm opacity-70">
                      <p>
                        重量:{" "}
                        {category.id === "clothing"
                          ? "0.5kg"
                          : category.id === "shoes"
                            ? "1kg"
                            : category.id === "books"
                              ? "1.5kg"
                              : category.id === "electronics"
                                ? "1kg"
                                : category.id === "cosmetics"
                                  ? "0.3kg"
                                  : "1kg"}
                      </p>
                      <p>
                        國際運費:{" "}
                        {category.id === "clothing"
                          ? "100"
                          : category.id === "shoes"
                            ? "200"
                            : category.id === "books"
                              ? "300"
                              : category.id === "electronics"
                                ? "200"
                                : category.id === "cosmetics"
                                  ? "60"
                                  : "200"}{" "}
                        元/件
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <p className="text-sm">{category.description}</p>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">常見例子:</h4>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {category.examples.map((example, index) => (
                          <li key={index} className="list-disc list-inside">
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
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

