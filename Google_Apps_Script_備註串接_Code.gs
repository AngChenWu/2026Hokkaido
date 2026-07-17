/**
 * 2026 北海道行動手冊｜Google Sheet 即時註解 API
 * 使用方式：在 Google Sheet 中開啟「擴充功能 → Apps Script」，貼上本檔全部內容。
 * 先執行 setupSheets() 一次，再部署為 Web App。
 */
const SHEET_NOTES = 'Notes';
const SHEET_HISTORY = 'ChangeLog';
const SHEET_ITINERARY = 'Itinerary';
const DEFAULT_TRIP_ID = 'hokkaido-2026-staff';

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_NOTES, ['tripId','itemId','date','time','title','note','version','updatedAt','updatedBy']);
  ensureSheet_(ss, SHEET_HISTORY, ['timestamp','tripId','itemId','action','oldVersion','newVersion','oldNote','newNote','updatedBy']);
  ensureSheet_(ss, SHEET_ITINERARY, ['tripId','itemId','date','day','time','title','detail','defaultRemark']);
  return '設定完成';
}

function doGet(e) {
  try {
    setupSheets();
    const p = (e && e.parameter) || {};
    const action = p.action || 'ping';
    const tripId = p.tripId || DEFAULT_TRIP_ID;
    if (action === 'ping') return json_({ok:true, message:'GAS API 正常', serverTime:new Date().toISOString()});
    if (action === 'list') return json_({ok:true, notes:listNotes_(tripId), serverTime:new Date().toISOString()});
    if (action === 'get') return json_({ok:true, note:getNote_(tripId, required_(p.itemId,'itemId')), serverTime:new Date().toISOString()});
    return json_({ok:false, error:'未知 action：'+action});
  } catch (err) {
    return json_({ok:false, error:String(err && err.message || err)});
  }
}

function doPost(e) {
  try {
    setupSheets();
    const p = parsePost_(e);
    const action = p.action || 'save';
    if (action !== 'save') return json_({ok:false, error:'POST 僅支援 save'});
    return json_(saveNote_(p));
  } catch (err) {
    return json_({ok:false, error:String(err && err.message || err)});
  }
}

function saveNote_(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const tripId = p.tripId || DEFAULT_TRIP_ID;
    const itemId = required_(p.itemId,'itemId');
    const expectedVersion = Number(p.expectedVersion || 0);
    const mode = p.mode || 'normal'; // normal | append | overwrite
    const incoming = String(p.note || '').slice(0, 30000);
    const updatedBy = String(p.updatedBy || '未署名').slice(0, 100);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NOTES);
    const found = findRow_(sheet, tripId, itemId);
    const current = found ? rowToNote_(found.values) : emptyNote_(tripId,itemId,p);

    if (mode === 'normal' && Number(current.version || 0) !== expectedVersion) {
      return {ok:true, conflict:true, current:current};
    }
    // overwrite/append 仍要求使用者以剛取得的最新版版本操作；若又被更新，繼續回報衝突。
    if ((mode === 'overwrite' || mode === 'append') && Number(current.version || 0) !== expectedVersion) {
      return {ok:true, conflict:true, current:current};
    }

    let nextText = incoming;
    if (mode === 'append' && current.note) {
      const divider = '\n\n--- ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Taipei', 'yyyy/MM/dd HH:mm') + '・' + updatedBy + ' ---\n';
      nextText = current.note + divider + incoming;
    }
    const now = new Date().toISOString();
    const nextVersion = Number(current.version || 0) + 1;
    const row = [tripId,itemId,String(p.date||current.date||''),String(p.time||current.time||''),String(p.title||current.title||''),nextText,nextVersion,now,updatedBy];
    if (found) sheet.getRange(found.row,1,1,row.length).setValues([row]); else sheet.appendRow(row);

    const action = found ? mode : 'create';
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_HISTORY).appendRow([
      now,tripId,itemId,action,Number(current.version||0),nextVersion,current.note||'',nextText,updatedBy
    ]);
    return {ok:true, conflict:false, note:rowToNote_(row)};
  } finally {
    lock.releaseLock();
  }
}

function listNotes_(tripId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NOTES);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  return values.slice(1).filter(r => String(r[0]) === String(tripId) && r[1]).map(rowToNote_);
}

function getNote_(tripId,itemId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NOTES);
  const found = findRow_(sheet,tripId,itemId);
  return found ? rowToNote_(found.values) : {tripId:tripId,itemId:itemId,note:'',version:0,updatedAt:'',updatedBy:''};
}

function findRow_(sheet, tripId, itemId) {
  const values = sheet.getDataRange().getValues();
  for (let i=1;i<values.length;i++) {
    if (String(values[i][0])===String(tripId) && String(values[i][1])===String(itemId)) return {row:i+1,values:values[i]};
  }
  return null;
}

function rowToNote_(r) {
  return {tripId:String(r[0]||''),itemId:String(r[1]||''),date:String(r[2]||''),time:String(r[3]||''),title:String(r[4]||''),note:String(r[5]||''),version:Number(r[6]||0),updatedAt:String(r[7]||''),updatedBy:String(r[8]||'')};
}
function emptyNote_(tripId,itemId,p){return {tripId:tripId,itemId:itemId,date:String(p.date||''),time:String(p.time||''),title:String(p.title||''),note:'',version:0,updatedAt:'',updatedBy:''};}
function parsePost_(e){if(!e)return {};if(e.parameter && Object.keys(e.parameter).length)return e.parameter;try{return JSON.parse(e.postData.contents||'{}')}catch(_){return {}}}
function ensureSheet_(ss,name,headers){let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(sh.getLastRow()===0)sh.getRange(1,1,1,headers.length).setValues([headers]);const range=sh.getRange(1,1,1,headers.length);range.setFontWeight('bold').setBackground('#1769aa').setFontColor('#ffffff');sh.setFrozenRows(1);return sh;}
function required_(v,n){if(v===undefined||v===null||String(v).trim()==='')throw new Error('缺少必要欄位：'+n);return String(v)}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
