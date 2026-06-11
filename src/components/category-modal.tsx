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
    description: "這個分類適用於極為輕薄的衣物，例如內衣、細肩帶內搭或超輕質料的短T等。這類商品布料少、材質輕巧，幾乎不佔體積，適合單獨購買時節省運費。",
    examples: [
      { name: "內衣褲", image: "/underwear.jpg" },
      {
        name:"小可愛",
        image: "/braTop.png"
      }, 
      { name: "配件", image: "/accessories.jpg" }, 
      {
        name:"透膚內搭",
        image: "/gm622_v7.jpg"
      }
    ],
  },
  clothing: {
    description: "屬於日常基本款的薄料衣物都適用於此分類，例如棉質或雪紡材質的上衣、裙子，以及薄長袖等。這個重量大多能涵蓋一般輕便穿搭，但不包含牛仔材質的裙子或厚棉質的上衣。",
    examples: [
      { 
        name: "短袖上衣", 
        image: "/000000003423-03-l.jpg" 
      }, 
      {
        name:"短裙",
        image: "/000000003422-03-l.jpg"
      }, 
      {
        name:"薄長裙",
        image: "/dk1092_v1.jpg"
      }, 
      {
        name:"長袖襯衫",
        image: "/dk1145_v1.jpg"
      }, 
      {
        name:"薄針織",
        image: "/an1509_v7.jpg"
      }, 
      {
        name:"透膚長袖外搭+小可愛",
        image: "/fo1905_v1.jpg"
      }
    ],
  },
  coat: {
    description: "這個分類主要包含稍有厚度與份量的衣物，例如長袖外套、針織衫、毛衣或厚棉材質的上衣，大多數洋裝也屬於這個範圍。若是鞋類，則如芭蕾舞鞋這種輕便鞋款通常也落在此重量內。",
    examples: [
      {
        name:"薄西裝外套",
        image: "/tu1418_v2.jpg"
      }, 
      {
        name:"長袖外套",
        image: "/jr-481-122_0_600x.jpg"
      },
      {
        name:"厚棉長袖上衣",
        image: "/91946219b_b_14_500.jpg"
      }, 
      {
        name:"針織",
        image: "/kz142_v2.jpg"
      }, 
      {
        name:"毛衣",
        image: "/89172988b_51_d_500.jpg"
      }, 
      {
        name:"洋裝",
        image: "/90158343b_b_11_500.jpg"
      }, 
      {
        name:"套裝",
        image: "/91946214b_b_52_500.jpg"
      }, 
      {
        name:"平底鞋",
        image: "/fa056_v9.jpg"
      }, 
      {
        name:"拖鞋",
        image: "/gd1512_col_11.jpg"
      }
    ],
  },
  jeans: {
    description: "當商品的布料或版型較厚重時，會落在這個分類，例如牛仔長褲、牛仔外套、較有結構感的洋裝，或是布料雖然少但整體材質偏重的款式。這個重量也適合多層次設計或厚針織等冬季衣物、4cm以下跟鞋。",
    examples: [
      {
        name:"牛仔褲",
        image: "/cu532_v4.jpg"
      },
      {
        name:"牛仔外套",
        image: "/fo1889_v1.jpg"
      },
      {
        name:"牛仔洋裝",
        image: "/tu1066_v1.jpg"
      },
      {
        name:"飛行外套",
        image: "/002_11c1924f-6007-41b0-b56d-9dc2dd3665e3_900x.jpg"
      }, 
      {
        name:"皮外套",
        image: "/ze863_col_19.jpg"
      }, 
      {
        name:"娃娃鞋",
        image: "/gd1373_col_13.jpg"
      }
    ],
  },
  shoes: {
    description: "這個分類主要涵蓋中高重量的鞋款與蓬鬆型冬季外套，例如鞋跟高度4-8公分的中跟鞋，或厚度與材積都偏大的保暖衣物。像是帶有毛領、剪裁較長、裙擺寬大的洋裝型外套，或是連帽的中綿羽絨風外套，即使長度偏短，由於填充量大與版型寬鬆，實際包裝後的材積仍會接近2公斤級別。這類商品通常無法完全壓縮，建議預估此分類運費較為穩妥。如鞋盒或衣物體積特別大，仍可能視情況拆盒或壓縮包裝出貨。",
    examples: [
      {
        name:"樂福鞋",
        image: "/zr1205_col_58.jpg"
      },
      {
        name:"厚底鞋",
        image: "/fa001_col_11.jpg"
      },
      {
        name:"跟鞋",
        image: "/gd1555_u.jpg"
      }, 
      {
        name:"毛領長版大衣",
        image: "/000000003113-01-l.jpg"
      }, 
      {
        name:"鋪棉外套",
        image: "/000000003220-01-l.jpg"
      }
    ],
  },
  shortBoots: {
    description: "主要對應到較厚重或底跟偏高的鞋子，例如厚底鞋、8公分以上至10公分以下的高跟鞋，以及鞋底與筒長相加在20公分以下的短靴類。這些鞋款因結構與材質不同，整體重量較明顯偏高。",
    examples: [
      {
        name:"厚底鞋",
        image: "/000000002053-01-l.jpg"
      }, 
      {
        name:"短靴",
        image: "/ci383_col_11.jpg"
      }, 
      {
        name:"高跟鞋",
        image: "/fa073_u.jpg"
      }
    ],
  },
  longBoots: {
    description: "這類為靴款中最重的一級，包括膝蓋附近長度的長靴或底跟與筒長合計超過20公分的設計。由於體積與重量都較大，運送時視情況可能不附鞋盒，以控制包裹體積。",
    examples: [
      {
        name:"長筒靴",
        image: "/fa076_v11.jpg"
      }, 
      {
        name:"超厚底鞋",
        image: "/000000001280-01-l.jpg"
      }, 
      {
        name:"厚底靴",
        image: "/zr1278_v1.jpg"
      }
    ],
  },
  other: {
    description: "若商品不屬於上述分類，將以實際稱重計價，運費為1公斤200元，0.5kg為一個單位。若有特殊材質、包裝或尺寸，運費將依實際狀況調整，多退少補，請提供具體商品資訊以利估算。",
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
