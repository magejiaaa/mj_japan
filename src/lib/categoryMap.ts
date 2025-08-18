// 類別資訊映射
export interface CategoryInfo {
  weight: string;
  fee: number;
  name: string;
}

export const categoryMap: Record<string, CategoryInfo> = {
  underwear: { weight: "0.3kg", fee: 80, name: "單件透膚內搭" },
  clothing: { weight: "0.5kg", fee: 100, name: "薄款上下著" },
  coat: { weight: "1kg", fee: 200, name: "厚上衣、洋裝" },
  jeans: { weight: "1.5kg", fee: 300, name: "牛仔系列" },
  shoes: { weight: "2kg", fee: 400, name: "鞋子" },
  shortBoots: { weight: "2.5kg", fee: 500, name: "短靴" },
  longBoots: { weight: "3kg", fee: 600, name: "長靴" },
  other: { weight: "1kg", fee: 200, name: "其他、文具" },
};

export function getCategoryInfo(category: string): CategoryInfo {
  return categoryMap[category] || categoryMap.other;
}

export function getCategoryKey(name: string): string | undefined {
  // 反查 key
  const entry = Object.entries(categoryMap).find(([, v]) => v.name === name);
  return entry ? entry[0] : undefined;
}
