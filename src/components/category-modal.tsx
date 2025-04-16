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
      name: "透膚內搭小可愛",
      description: "這個分類適用於極為輕薄的衣物，例如內衣、細肩帶內搭或超輕質料的短T等。這類商品布料少、材質輕巧，幾乎不佔體積，適合單獨購買時節省運費。",
      weight: "0.3kg",
      freight: "80",
      examples: [
        {
          ex_name:"內衣",
          image: "https://cdn.grail.bz/images/goods/d/tu721/tu721_col_17.jpg"
        }, 
        {
          ex_name:"小可愛",
          image: "https://cdn.grail.bz/images/goods/d/dk1124/dk1124_v9.jpg"
        }, 
        {
          ex_name:"透膚內搭",
          image: "https://cdn.grail.bz/images/goods/d/gm622/gm622_v7.jpg"
        }
      ]
    },
    {
      id: "clothing",
      name: "薄款上下著",
      description: "屬於日常基本款的薄料衣物都適用於此分類，例如棉質或雪紡材質的上衣、裙子，以及薄長袖等。這個重量大多能涵蓋一般輕便穿搭，但不包含牛仔材質的裙子或厚棉質的上衣。",
      weight: "0.5kg",
      freight: "100",
      examples: [
        {
          ex_name:"短袖上衣",
          image: "https://rojita.itembox.design/product/034/000000003423/000000003423-03-l.jpg?t=20250404132342"
        }, 
        {
          ex_name:"短裙",
          image: "https://rojita.itembox.design/product/034/000000003422/000000003422-03-l.jpg?t=20250404132342"
        }, 
        {
          ex_name:"薄長裙",
          image: "https://cdn.grail.bz/images/goods/d/dk1092/dk1092_v1.jpg"
        }, 
        {
          ex_name:"長袖襯衫",
          image: "https://cdn.grail.bz/images/goods/d/dk1145/dk1145_v1.jpg"
        }, 
        {
          ex_name:"薄針織",
          image: "https://cdn.grail.bz/images/goods/d/an1509/an1509_v7.jpg"
        }, 
        {
          ex_name:"透膚長袖外搭",
          image: "https://cdn.grail.bz/images/goods/d/fo1905/fo1905_v1.jpg"
        }
      ]
    },
    {
      id: "coat",
      name: "厚上衣、洋裝",
      description: "這個分類主要包含稍有厚度與份量的衣物，例如長袖外套、針織衫、毛衣或厚棉材質的上衣，大多數洋裝也屬於這個範圍。若是鞋類，則如芭蕾舞鞋這種輕便鞋款通常也落在此重量內。",
      weight: "1kg",
      freight: "200",
      examples: [
        {
          ex_name:"長袖外套",
          image: "https://cdn.grail.bz/images/goods/d/tu1418/tu1418_v2.jpg"
        }, 
        {
          ex_name:"長袖外套",
          image: "https://acdcrag.com/cdn/shop/files/jr-481-122_0_600x.jpg?v=1687759668"
        },
        {
          ex_name:"厚棉長袖上衣",
          image: "https://c.imgz.jp/219/91946219/91946219b_b_14_500.jpg"
        }, 
        {
          ex_name:"針織",
          image: "https://cdn.grail.bz/images/goods/d/kz142/kz142_v2.jpg"
        }, 
        {
          ex_name:"毛衣",
          image: "https://c.imgz.jp/988/89172988/89172988b_51_d_500.jpg"
        }, 
        {
          ex_name:"洋裝",
          image: "https://c.imgz.jp/343/90158343/90158343b_b_11_500.jpg"
        }, 
        {
          ex_name:"套裝",
          image: "https://c.imgz.jp/214/91946214/91946214b_b_52_500.jpg"
        }, 
        {
          ex_name:"平底鞋",
          image: "https://cdn.grail.bz/images/goods/d/fa056/fa056_v9.jpg"
        }, 
        {
          ex_name:"拖鞋",
          image: "https://cdn.grail.bz/images/goods/d/gd1512/gd1512_col_11.jpg"
        }
      ]
    },
    {
      id: "jeans",
      name: "牛仔系列",
      description: "當商品的布料或版型較厚重時，會落在這個分類，例如牛仔長褲、牛仔外套、較有結構感的洋裝，或是布料雖然少但整體材質偏重的款式。這個重量也適合多層次設計或厚針織等冬季衣物。",
      weight: "1.5kg",
      freight: "300",
      examples: [
        {
          ex_name:"牛仔褲",
          image: "https://cdn.grail.bz/images/goods/d/cu532/cu532_v4.jpg"
        },
        {
          ex_name:"牛仔外套",
          image: "https://cdn.grail.bz/images/goods/d/fo1889/fo1889_v1.jpg"
        },
        {
          ex_name:"牛仔洋裝",
          image: "https://cdn.grail.bz/images/goods/d/tu1066/tu1066_v1.jpg"
        },
        {
          ex_name:"飛行外套",
          image: "https://classicalelf.shop/cdn/shop/files/002_11c1924f-6007-41b0-b56d-9dc2dd3665e3_900x.jpg?v=1741838125"
        }, 
        {
          ex_name:"皮外套",
          image: "https://cdn.grail.bz/images/goods/d/ze863/ze863_col_19.jpg"
        }, 
        {
          ex_name:"娃娃鞋",
          image: "https://cdn.grail.bz/images/goods/d/gd1373/gd1373_col_13.jpg"
        }
      ]
    },
    {
      id: "shoes",
      name: "鞋子",
      description: "這個分類主要涵蓋中高重量的鞋款與蓬鬆型冬季外套，例如鞋跟高度8公分以下的中跟鞋，或厚度與材積都偏大的保暖衣物。像是帶有毛領、剪裁較長、裙擺寬大的洋裝型外套，或是連帽的中綿羽絨風外套，即使長度偏短，由於填充量大與版型寬鬆，實際包裝後的材積仍會接近2公斤級別。這類商品通常無法完全壓縮，建議預估此分類運費較為穩妥。如鞋盒或衣物體積特別大，仍可能視情況拆盒或壓縮包裝出貨。",
      weight: "2kg",
      freight: "400",
      examples: [
        {
          ex_name:"樂福鞋",
          image: "https://cdn.grail.bz/images/goods/d/zr1205/zr1205_col_58.jpg"
        },
        {
          ex_name:"厚底鞋",
          image: "https://cdn.grail.bz/images/goods/d/fa001/fa001_col_11.jpg"
        },
        {
          ex_name:"跟鞋",
          image: "https://cdn.grail.bz/images/goods/d/gd1555/gd1555_u.jpg"
        }, 
        {
          ex_name:"毛領長版大衣",
          image: "https://rojita.itembox.design/product/031/000000003113/000000003113-01-l.jpg?t=20250404132342"
        }, 
        {
          ex_name:"鋪棉外套",
          image: "https://rojita.itembox.design/product/032/000000003220/000000003220-01-l.jpg?t=20250404132342"
        }
      ]
    },
    {
      id: "shortBoots",
      name: "短靴",
      description: "主要對應到較厚重或底跟偏高的鞋子，例如厚底鞋、8公分以上至10公分以下的高跟鞋，以及鞋底與筒長相加在20公分以下的短靴類。這些鞋款因結構與材質不同，整體重量較明顯偏高。",
      weight: "2.5kg",
      freight: "500",
      examples: [
        {
          ex_name:"厚底鞋",
          image: "https://rojita.itembox.design/product/020/000000002053/000000002053-01-l.jpg?t=20250404132342"
        }, 
        {
          ex_name:"短靴",
          image: "https://cdn.grail.bz/images/goods/d/ci383/ci383_col_11.jpg"
        }, 
        {
          ex_name:"高跟鞋",
          image: "https://cdn.grail.bz/images/goods/d/fa073/fa073_u.jpg"
        }
      ]
    },
    {
      id: "longBoots",
      name: "長靴",
      description: "這類為靴款中最重的一級，包括膝蓋附近長度的長靴或底跟與筒長合計超過20公分的設計。由於體積與重量都較大，運送時視情況可能不附鞋盒，以控制包裹體積。",
      weight: "3kg",
      freight: "600",
      examples: [
        {
          ex_name:"長筒靴",
          image: "https://cdn.grail.bz/images/goods/d/fa076/fa076_v11.jpg"
        }, 
        {
          ex_name:"超厚底鞋",
          image: "https://rojita.itembox.design/product/012/000000001280/000000001280-01-l.jpg?t=20250404132342"
        }, 
        {
          ex_name:"厚底靴",
          image: "https://cdn.grail.bz/images/goods/d/zr1278/zr1278_v1.jpg"
        }
      ]
    },
    {
      id: "other",
      name: "其他",
      description: "若商品不屬於上述分類，將以實際稱重計價，運費為1公斤200元，0.5kg為一個單位。若有特殊材質、包裝或尺寸，運費將依實際狀況調整，多退少補，請提供具體商品資訊以利估算。",
      weight: "1kg",
      freight: "200",
      examples: [
        {
          ex_name:"玩具",
          image: ""
        }, 
        {
          ex_name:"文具",
          image: ""
        }, 
        {
          ex_name:"家居用品",
          image: ""
        }, 
        {
          ex_name:"飾品",
          image: ""
        }, 
        {
          ex_name:"紀念品",
          image: ""
        }
      ]
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
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3 md:h-[433px]">
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <p className="text-sm">{category.description}</p>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">常見例子:</h4>
                      <ul className="grid grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-1 text-sm">
                        {category.examples.map((example, index) => (
                          <li key={index} className="flex flex-col items-center justify-center">
                            {example.image ? (
                              <Image
                                src={example.image}
                                alt={example.ex_name}
                                width={100}
                                height={100}
                                className="object-cover w-full aspect-square rounded-md"
                              />
                            ) : null}
                            {example.ex_name}
                          </li>
                        ))}
                      </ul>
                    </div>
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

