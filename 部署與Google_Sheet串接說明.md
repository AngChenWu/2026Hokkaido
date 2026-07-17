# 2026 北海道行動手冊｜GitHub Pages 部署說明

## 建議部署方式

1. 將本資料夾中的 `index.html` 上傳到 GitHub Repository 根目錄。
2. 到 Repository 的 **Settings → Pages**。
3. Source 選擇 **Deploy from a branch**，指定 `main` 與 `/root`。
4. 等候 GitHub Pages 產生網址。

`index.html` 已預設串接以下 GAS Web App：

`https://script.google.com/macros/s/AKfycbzf2wSoS5P0c12Hgq8S8z-8h3tpr15ZLpNCDexUGHVaewCNGFA3CgOFHlzIKUGF2A1S/exec`

## 本次版面與操作調整

- 日期選單改為手機三欄、寬螢幕六欄，不會再超出可點擊範圍。
- 官式拜會、參訪與餐飲使用不同卡片樣式；含青年提問或簡報者另有標記。
- 官式拜會的「行程細流」會併入同一張卡片完整顯示。
- Word 備註欄的文字顏色與螢光底色已帶入行程卡片。
- 旅程日期內會自動定位至目前時間點，亦可按「目前時段」重新定位。
- 移除首頁；底部導覽改為今日、行程、資料、搜尋。
- 設定頁新增返回按鈕，瀏覽器上一頁也可使用。
- 雲端同步改為背景局部更新，不會重建整個頁面、收合已展開內容或清除輸入草稿。
- 註解儲存改為一次 POST 直接進行版本衝突檢查，減少一次網路往返。

## 加速 GAS（建議）

網頁端已可直接使用目前 GAS 網址。若希望進一步縮短延遲，請將 `Google_Apps_Script_備註串接_Code.gs` 更新到原本 Apps Script 專案，然後：

1. 執行一次 `setupSheets()`。
2. 選擇 **部署 → 管理部署作業**。
3. 編輯原部署，版本選擇 **建立新版本**。
4. 執行身分選擇自己；存取權限依團隊需求設定。
5. 部署後 `/exec` 網址通常維持不變。

快速版不會在每次讀寫時重複設定工作表格式，並縮減試算表讀取範圍。

## 同步衝突

每筆註解均保有版本號。儲存時若 Google Sheet 已有較新版本，網頁會提供：下載最新版、載入最新版編輯、附加在最新版後、覆蓋最新版。

## 隱私提醒

HTML 內含聯絡電話、飲食、住宿、車次及工作分工等內部資訊。GitHub Pages 原則上可由網址公開存取，部署前請確認 Repository 與頁面公開範圍符合使用需求。
