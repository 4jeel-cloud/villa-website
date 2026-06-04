// SHEET_ID is loaded from Script Properties — set it via:
// Apps Script editor → Project Settings → Script Properties → add SHEET_ID
// This keeps the spreadsheet ID out of source control.
var SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';

// ===== Secret token — loaded from env, NOT hardcoded =====
// Set APPS_SCRIPT_TOKEN in your .env (backend) and in the Apps Script project properties
// (File → Project properties → Script properties → add APPS_SCRIPT_TOKEN)
var SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('APPS_SCRIPT_TOKEN') || '';

// ===== Sheet name constants =====
var ROOMS_SHEET     = 'Rooms';
var BOOKINGS_SHEET  = 'Bookings';
var CANCELLED_SHEET = 'Cancelled';
var BLOCKS_SHEET    = 'Blocks';

// ===== Auth helper =====
function isAuthorized(e) {
  var token = (e && e.parameter && e.parameter.token) ? e.parameter.token : '';
  return token === SECRET_TOKEN;
}

function isAuthorizedPost(data) {
  return data && data.token === SECRET_TOKEN;
}

// ===== doGet — routes by ?action= param =====
function doGet(e) {
  try {
    if (!isAuthorized(e)) return jsonOutput({ error: 'Unauthorized' });
    var action = e && e.parameter && e.parameter.action ? e.parameter.action : '';
    if (action === 'initSheets') return jsonOutput(initSheets());
    if (action === 'getRooms')   return jsonOutput(getRows(ROOMS_SHEET));
    if (action === 'getBookings') return jsonOutput(getRows(BOOKINGS_SHEET));
    if (action === 'getBlocks')  return jsonOutput(getRows(BLOCKS_SHEET));
    return jsonOutput({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}

// ===== doPost — routes by payload.action =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (!isAuthorizedPost(data)) return jsonOutput({ error: 'Unauthorized' });
    var action = data.action || '';

    if (action === 'appendBooking') return jsonOutput(appendBooking(data));
    if (action === 'updateBooking') return jsonOutput(updateBooking(data));
    if (action === 'cancelBooking') return jsonOutput(cancelBooking(data));
    if (action === 'appendBlock')   return jsonOutput(appendBlock(data));
    if (action === 'updateRoom')    return jsonOutput(updateRoom(data));

    return jsonOutput({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOutput({ error: err.message });
  }
}

// ===== initSheets — creates tabs and seeds default rooms if missing =====
function initSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  ensureSheet(ss, ROOMS_SHEET, [
    'id','name','description','basePrice','capacity','images'
  ], [
    ['r1','4 Rooms','Spacious 4-room villa perfect for large families and groups.',12000,16,
      '/carousel/DSC01117.webp, /carousel/DSC01115.webp'],
    ['r2','2 Rooms','Cozy 2-room stay ideal for couples and small families.',6000,8,
      '/carousel/DSC01077.webp, /carousel/IMG_0969.webp']
  ]);

  ensureSheet(ss, BOOKINGS_SHEET, [
    'Timestamp','Full name','Phone number','Email','Number of guests',
    'Room type','Guest type','Check-in date','Check-out date','Amount received',
    'bookingId','roomId','status','createdBy','paymentStatus',
    'razorpayOrderId','razorpayPaymentId',
    'cancelledAt','cancelledBy','cancellationReason','refundStatus'
  ], []);

  ensureSheet(ss, CANCELLED_SHEET, [
    'Timestamp','Full name','Phone number','Email','Number of guests',
    'Room type','Guest type','Check-in date','Check-out date','Amount received',
    'bookingId','roomId','status','createdBy','paymentStatus',
    'cancelledAt','cancelledBy','cancellationReason','refundStatus'
  ], []);

  ensureSheet(ss, BLOCKS_SHEET, [
    'id','roomId','roomName','startDate','endDate','reason'
  ], []);

  return { result: 'ok' };
}

function ensureSheet(ss, name, headers, seedRows) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    seedRows.forEach(function(row) { sheet.appendRow(row); });
  }
  return sheet;
}

// ===== Generic row reader =====
function getRows(sheetName) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i] : ''; });
    return obj;
  });
}

// ===== Bookings =====
function appendBooking(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(BOOKINGS_SHEET);
  sheet.appendRow([
    data.createdAt,
    data.guestName,
    data.guestPhone,
    data.guestEmail,
    data.guests,
    data.roomName,
    data.guestType,
    data.checkIn,
    data.checkOut,
    data.amount || 'Pending',
    data.bookingId,
    data.roomId,
    data.status,
    data.createdBy,
    data.paymentStatus,
    data.razorpayOrderId || '',
    data.razorpayPaymentId || '',
    '', '', '', ''
  ]);

  // Send email alert — non-blocking
  // Set MANAGER_EMAIL in Script Properties to override
  var alertEmail = PropertiesService.getScriptProperties().getProperty('MANAGER_EMAIL') || 'manager@homestay.local';
  try {
    MailApp.sendEmail({
      to: alertEmail,
      subject: 'New Booking \u2014 ' + data.guestName,
      body: 'Room: ' + data.roomName +
            '\nCheck-in: ' + data.checkIn +
            '\nCheck-out: ' + data.checkOut +
            '\nGuests: ' + data.guests +
            '\nPhone: ' + data.guestPhone
    });
  } catch (mailErr) {
    Logger.log('Mail failed (non-fatal): ' + mailErr.message);
  }

  return { result: 'success' };
}

function cancelBooking(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var bookingSheet = ss.getSheetByName(BOOKINGS_SHEET);
  var cancelledSheet = ss.getSheetByName(CANCELLED_SHEET);
  if (!cancelledSheet) {
    initSheets();
    cancelledSheet = ss.getSheetByName(CANCELLED_SHEET);
  }

  var rows = bookingSheet.getDataRange().getValues();
  var headers = rows[0];
  var idCol = headers.indexOf('bookingId');
  if (idCol === -1) return { error: 'bookingId column not found' };

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][idCol]) === String(data.bookingId)) {
      var row = rows[i].slice();
      var colMap = {};
      headers.forEach(function(h, j) { colMap[h] = j; });

      if (colMap['status'] !== undefined)             row[colMap['status']] = 'cancelled';
      if (colMap['cancelledAt'] !== undefined)        row[colMap['cancelledAt']] = data.cancelledAt || new Date().toISOString();
      if (colMap['cancelledBy'] !== undefined)        row[colMap['cancelledBy']] = data.cancelledBy || 'admin';
      if (colMap['cancellationReason'] !== undefined) row[colMap['cancellationReason']] = data.cancellationReason || 'Cancelled by admin';
      if (colMap['refundStatus'] !== undefined)       row[colMap['refundStatus']] = data.refundStatus || 'pending';

      cancelledSheet.appendRow(row);
      bookingSheet.deleteRow(i + 1);
      return { result: 'moved' };
    }
  }
  return { error: 'Booking not found: ' + data.bookingId };
}

// Legacy alias
function updateBooking(data) {
  return cancelBooking(data);
}

// ===== Blocks =====
function appendBlock(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(BLOCKS_SHEET);
  sheet.appendRow([data.id, data.roomId, data.roomName, data.startDate, data.endDate, data.reason || '']);
  return { result: 'success' };
}

// ===== Rooms =====
function updateRoom(data) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(ROOMS_SHEET);
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idCol = headers.indexOf('id');
  if (idCol === -1) return { error: 'id column not found' };

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === data.id) {
      var colMap = {};
      headers.forEach(function(h, j) { colMap[h] = j + 1; });
      if (data.basePrice !== undefined) sheet.getRange(i + 1, colMap['basePrice']).setValue(data.basePrice);
      if (data.images !== undefined)    sheet.getRange(i + 1, colMap['images']).setValue(data.images);
      return { result: 'updated' };
    }
  }
  return { error: 'Room not found: ' + data.id };
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
