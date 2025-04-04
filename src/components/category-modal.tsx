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
      id: "underwear",
      name: "單件透膚內搭",
      description: "非常輕的衣服、內衣等。重量約0.3kg，國際運費為80元/件。",
      examples: ["內衣", "小可愛", "透膚內搭"],
      image: "/underwear.png",
    },
    {
      id: "clothing",
      name: "薄款上下著",
      description: "一般棉質或雪紡上下著基本上都可以選，薄長袖也包含在內，牛仔裙、厚棉長袖上衣除外。重量約0.5kg，國際運費為100元/件。",
      examples: ["短袖T恤", "短裙", "薄長裙", "長袖襯衫", "薄針織", "短裙", "透膚長袖外搭"],
      image: "/clothing.png",
    },
    {
      id: "coat",
      name: "厚上衣、洋裝",
      description: "長袖外套、長袖針織、厚棉長袖上衣跟毛衣基本上都屬於此類，大部分洋裝也是，除了少數比較重工的洋裝外。有些比較輕的鞋子，比如芭蕾舞鞋。重量約1kg，國際運費為200元/雙。",
      examples: ["長袖外套", "厚棉長袖上衣", "針織", "毛衣", "洋裝", "涼鞋", "拖鞋"],
      image: "/coat.png",
    },
    {
      id: "jeans",
      name: "牛仔系列",
      description: "牛仔長褲、外套為此類，短裙或布料較少的衣服可以選1kg的。重量約1.5kg，國際運費為300元/本。",
      examples: ["牛仔褲", "牛仔外套"],
      image: "/jeans.png",
    },
    {
      id: "shoes",
      name: "鞋子",
      description: "5cm跟以內的鞋子。重量約2kg，國際運費為400元/件。",
      examples: ["樂福鞋", "娃娃鞋", "厚底鞋", "鬆糕鞋", "跟鞋"],
      image: "/shoes.png",
    },
    {
      id: "shortBoots",
      name: "短靴",
      description: "包括厚底鞋，5cm以上10cm以下跟鞋，底跟與筒長相加20cm以下。視鞋盒大小有可能會去掉鞋盒運送。重量約2.5kg，國際運費為500元/件。",
      examples: ["厚底鞋", "短靴"],
      image: "/shortBoots.png",
    },
    {
      id: "longBoots",
      name: "長靴",
      description: "膝蓋附近的靴子、底跟與筒長相加20cm以上。視鞋盒大小有可能會去掉鞋盒運送。重量約3kg，國際運費為600元/件。",
      examples: ["長筒靴", "超厚底鞋"],
      image: "/longBoots.png",
    },
    {
      id: "other",
      name: "其他",
      description: "不屬於上述類別的其他商品。重量1kg國際運費為200元。運費會依照實際重量計算，多退少補。",
      examples: ["玩具", "文具", "家居用品", "飾品", "紀念品"],
      image: "/other.jpg",
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
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4 bg-[#F5B5B5]/30 dark:bg-[#4D3A3D] h-auto">
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
                        {category.id === "underwear"
                          ? "0.3kg"
                          : category.id === "clothing"
                            ? "0.5kg"
                            : category.id === "coat"
                              ? "1kg"
                              : category.id === "jeans"
                                ? "1.5kg"
                                : category.id === "shoes"
                                  ? "2kg"
                                  : category.id === "shortBoots"
                                    ? "2.5kg"
                                    : category.id === "longBoots"
                                      ? "3kg"
                                    : "1kg"}
                      </p>
                      <p>
                        國際運費:{" "}
                        {category.id === "underwear"
                          ? "80"
                          : category.id === "clothing"
                            ? "100"
                            : category.id === "coat"
                              ? "200"
                              : category.id === "jeans"
                                ? "300"
                                : category.id === "shoes"
                                  ? "400"
                                  : category.id === "shortBoots"
                                    ? "500"
                                    : category.id === "longBoots"
                                      ? "600"
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

