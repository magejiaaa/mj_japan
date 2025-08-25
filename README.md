主要功能
--
1. 商品計算與展示
- `calculation-result.tsx`、`product-form.tsx`、`product-item.tsx`：提供商品資料輸入、計算結果顯示，可能包含價格、匯率、運費等計算。

2. 平台與商店選擇
- `platform-selector.tsx`、`store-selector.tsx`：讓使用者選擇購物平台或商店，並根據選擇調整計算邏輯。

3. 分類與運費設定
- `category-modal.tsx`、`shipping-breakdown.tsx`：商品分類選擇、運費細項分解，協助使用者了解不同商品的運費計算方式。

4. 匯率與金額換算
- `exchange-rate.tsx`：提供匯率查詢與金額換算功能，支援跨國購物。

5. UI 元件與主題
- `ui/` 資料夾：包含大量自訂 UI 元件（按鈕、表單、對話框、選單、分頁、提示等），提升使用者體驗。
- `theme-provider.tsx`：主題切換或主題管理。

6. 公用函式與資料
- `lib/` 資料夾：包含商品分類、商店名稱、運費設定、型別定義與工具函式，支援主要功能邏輯。

7. 其他輔助功能
- `footer.tsx`、`header.tsx`：頁首與頁尾元件。
- `hooks/`：自訂 React hooks，例如行動裝置偵測、提示訊息。

8. 靜態資源
- public：商品圖片、佔位圖、LOGO 等靜態檔案。
