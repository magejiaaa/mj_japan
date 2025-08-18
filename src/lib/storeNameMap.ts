// 店家名稱映射
export const storeNameMap: Record<string, string> = {
  free: "免運費",
  GRL: "GRL",
  ZOZOTOWN: "ZOZOTOWN",
  ROJITA: "ROJITA",
  axesFemme: "axes femme",
  amavel: "Amavel",
  dreamvs: "夢展望",
  INGNI: "INGNI",
  classicalElf: "Classical Elf",
  runway: "Runway Channel",
  ACDC: "ACDC RAG",
  dotST: "dot-st",
  stripe: "stripe club",
  canshop: "canshop",
  majesticlegon: "majestic legon",
  rakuten: "樂天Fashion",
  other: "其他",
};

export function getStoreName(store: string): string {
  return storeNameMap[store] || storeNameMap.other;
}

export function getStoreKey(name: string): string | undefined {
  // 反查 key
  const entry = Object.entries(storeNameMap).find(([, v]) => v === name);
  return entry ? entry[0] : undefined;
}
