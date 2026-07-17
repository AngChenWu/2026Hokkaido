# 2026 北海道手機行動手冊｜部署與 Google Sheet 串接

## 交付檔案

- `北海道交流團_手機行動手冊.html`：單一 HTML，可直接放到 GitHub Pages；CSS、JavaScript、完整手冊與圖片均已內嵌。
- `Google_Apps_Script_備註串接_Code.gs`：貼到 Google Sheet 的 Apps Script。
- `Google_Sheet_備註資料庫範本.xlsx`：可上傳 Google Drive 後轉為 Google Sheet，內含 Notes、ChangeLog、Itinerary、Settings 四個工作表。

## 1. GitHub Pages

1. 建立 GitHub repository。
2. 上傳 HTML；若要作為首頁，請將檔名改成 `index.html`。
3. Repository → Settings → Pages → 選擇要發布的 branch 與 root 資料夾。
4. 開啟 Pages 網址測試 iPhone、Samsung Fold 外螢幕與展開畫面。

> 重要：手冊含聯絡電話、生日、飲食習慣、住宿、車次等內部資料。部署前務必確認頁面存取範圍；前端密碼或隱藏按鈕無法防止有權取得 HTML 的人查看原始內容。

## 2. 建立 Google Sheet

1. 將 `Google_Sheet_備註資料庫範本.xlsx` 上傳 Google Drive，使用 Google 試算表開啟。
2. 開啟「擴充功能 → Apps Script」。
3. 清除預設程式，貼上 `Google_Apps_Script_備註串接_Code.gs` 全部內容。
4. 儲存並執行 `setupSheets()` 一次，完成授權。

### 工作表格式

- **Notes**：每個行程區塊只保留一筆最新版；`version` 是同步衝突判斷依據。
- **ChangeLog**：每次新增、附加或覆蓋都保留歷程。
- **Itinerary**：HTML 使用的 itemId、日期、時間與原始內容對照表。
- **Settings**：旅程識別與時區等設定。

## 3. 部署 GAS Web App

1. Apps Script 右上角「部署 → 新增部署作業」。
2. 類型選「網頁應用程式」。
3. 執行身分：建議選擇部署者／擁有者。
4. 存取權：依團隊帳號與使用情境設定；若手機未登入指定 Google 帳號，會無法讀寫。
5. 部署後複製 `/exec` 結尾的 Web App 網址。
6. 開啟 HTML →「設定」→ 貼上網址 → 填寫顯示名稱 →「儲存並同步」。

Apps Script Content Service 會把回應重新導向至 `script.googleusercontent.com` 的一次性網址，因此 HTTP 用戶端必須允許重新導向；本 HTML 的 `fetch` 已設定 follow redirect。

## 4. 衝突處理

每次上傳前，HTML 會先取得 Google Sheet 最新版本：

- 版本相同：直接儲存。
- 版本不同：顯示「目前最新版」與「你的內容」，並提供：
  - 下載最新版文字；
  - 載入最新版再編輯；
  - 新增在最新版後；
  - 覆蓋最新版。

GAS 儲存時會再以 `LockService` 鎖定及複核版本，避免兩支手機在同一瞬間寫入時互相覆蓋。

## 5. 日期邏輯

- 2026/7/20–7/25：依手機本地日期優先顯示當日行程。
- 2026/7/19、7/26，以及其他日期：顯示預設首頁。

## 6. 更新手冊內容

本版本將 Word 原始手冊完整內嵌在 HTML 中；若 Word 內容本身修改，仍需重新產生 HTML。旅途中僅變動的集合時間、入口、交通、臨時任務等，建議全部透過行程區塊的即時註解更新，不必重傳 HTML。
