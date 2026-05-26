export interface StoreConfig {
  key: string;
  name: string;
  fee: number;
  freeThreshold: number;
  /** 顯示在下拉選單的標籤，不填則自動產生 */
  label?: string;
}

export const storeList: StoreConfig[] = [
  { key: "free", name: "免運費", fee: 0, freeThreshold: 0 },
  { key: "axesFemme", name: "axes femme", fee: 410, freeThreshold: 10000 },
  { key: "amavel", name: "Amavel", fee: 715, freeThreshold: 10000 },
  { key: "ACDC", name: "ACDC RAG", fee: 590, freeThreshold: 5500 },
  { key: "classicalElf", name: "Classical Elf", fee: 590, freeThreshold: 3980 },
  { key: "canshop", name: "CAN SHOP", fee: 880, freeThreshold: 6000, label: "CAN SHOP (未滿¥6000｜880日幣｜滿額¥330)" },
  { key: "dotST", name: "dot-st", fee: 385, freeThreshold: 5000 },
  { key: "GRL", name: "GRL", fee: 0, freeThreshold: 0, label: "GRL (通常免運)" },
  { key: "INGNI", name: "INGNI", fee: 550, freeThreshold: 4900 },
  { key: "lizlisa", name: "Liz Lisa", fee: 550, freeThreshold: 5500 },
  { key: "majesticlegon", name: "majestic legon", fee: 550, freeThreshold: 7500 },
  { key: "mycolor", name: "MyColor", fee: 660, freeThreshold: 10000 },
  { key: "mars", name: "Mars", fee: 710, freeThreshold: Infinity, label: "Mars (710日幣)" },
  { key: "pium", name: "pium", fee: 800, freeThreshold: Infinity, label: "pium (800日幣)" },
  { key: "palcloset", name: "PAL CLOSET", fee: 550, freeThreshold: 5000 },
  { key: "runway", name: "Runway Channel", fee: 330, freeThreshold: Infinity, label: "Runway Channel (330日幣)" },
  { key: "ROJITA", name: "ROJITA", fee: 650, freeThreshold: 10000 },
  { key: "stripe", name: "stripe club", fee: 600, freeThreshold: 6000 },
  { key: "ZOZOTOWN", name: "ZOZOTOWN", fee: 660, freeThreshold: Infinity, label: "ZOZOTOWN (660日幣)" },
  { key: "dreamvs", name: "夢展望", fee: 580, freeThreshold: 8000 },
  { key: "rakuten", name: "樂天Fashion", fee: 770, freeThreshold: 3980 },
  { key: "other", name: "其他", fee: 0, freeThreshold: Infinity, label: "自行輸入運費 (請勿添加商品，價格寫總價)" },
];

/** 產生下拉選單顯示文字 */
function buildLabel(store: StoreConfig): string {
  if (store.label) return store.label;
  if (store.fee === 0) return store.name;
  if (store.freeThreshold === Infinity) return `${store.name} (${store.fee}日幣)`;
  return `${store.name} (未滿¥${store.freeThreshold}｜${store.fee}日幣)`;
}

export const storeSelectOptions = storeList.map((s) => ({
  key: s.key,
  label: buildLabel(s),
}));

/** 對應原本的 storeShippingConfig */
export const storeShippingConfig: Record<string, { fee: number; freeThreshold: number }> = Object.fromEntries(
  [...storeList.map((s) => [s.key, { fee: s.fee, freeThreshold: s.freeThreshold }]),
  ["default", { fee: 0, freeThreshold: Infinity }]]
);

/** 對應原本的 storeNameMap */
export const storeNameMap: Record<string, string> = Object.fromEntries(
  storeList.map((s) => [s.key, s.name])
);

export function getStoreName(store: string): string {
  return storeNameMap[store] ?? storeNameMap["other"];
}

/** 計算店家國內運費（日幣） */
export function getDomesticShippingFee(store: string, storeTotal: number, customShippingFee?: number): number {
  if (store === "other") return customShippingFee ?? 0
  const config = storeShippingConfig[store] ?? storeShippingConfig.default
  if (store === "canshop" && storeTotal >= config.freeThreshold) return 330
  return storeTotal >= config.freeThreshold ? 0 : config.fee
}

export function getStoreKey(name: string): string | undefined {
  return storeList.find((s) => s.name === name)?.key;
}