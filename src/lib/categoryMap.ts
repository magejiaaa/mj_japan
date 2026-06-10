export interface CategoryInfo {
  weight: string
  fee: number
  name: string
}

export const categoryMap: Record<string, CategoryInfo> = {
  underwear: { weight: "0.3kg", fee: 80, name: "透膚內搭" },
  clothing: { weight: "0.5kg", fee: 100, name: "薄款上、下著" },
  coat: { weight: "1kg", fee: 200, name: "厚外套／毛衣／厚裙" },
  jeans: { weight: "1.5kg", fee: 300, name: "牛仔上下著" },
  shoes: { weight: "2kg", fee: 400, name: "鞋類" },
  shortBoots: { weight: "2.5kg", fee: 500, name: "短靴／厚底鞋" },
  longBoots: { weight: "3kg", fee: 600, name: "長靴" },
  other: { weight: "1kg", fee: 200, name: "其他類別" },
}

export function getCategoryInfo(category: string): CategoryInfo {
  return categoryMap[category] || categoryMap.other
}

export function getCategoryKey(name: string): string | undefined {
  return Object.entries(categoryMap).find(([, value]) => value.name === name)?.[0]
}
