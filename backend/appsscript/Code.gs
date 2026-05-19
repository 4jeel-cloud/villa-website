var SHEET_ID = '1AYc-Csr3mkS6n0cdGX_XVxwa1WkJVWECu9LjWwc0w0w';

// ===== Sheet name constants =====
var ROOMS_SHEET = 'Rooms';
var BOOKINGS_SHEET = 'Bookings';
var CANCELLED_SHEET = 'Cancelled';
var BLOCKS_SHEET = 'Blocks';

// ===== doGet — routes by ?action= param =====
function doGet(e) {
  try {
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
    ['r1','4 Rooms','Spacious 4-room villa perfect for large families and groups.',5000,8,
      '/carousel/DSC01117.webp, /carousel/DSC01115.webp'],
    ['r2','2 Rooms','Cozy 2-room stay ideal for couples and small families.',3500,4,
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

  // Send email alert separately — never block the sheet write if mail fails
  try {
    MailApp.sendEmail({
      to: 'ajeelajeel1010@gmail.com',
      subject: 'New Booking — ' + data.guestName,
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
      var row = rows[i].slice(); // copy the row

      // Find column positions
      var colMap = {};
      headers.forEach(function(h, j) { colMap[h] = j; });

      // Update cancellation fields in the copied row
      if (colMap['status'] !== undefined)             row[colMap['status']] = 'cancelled';
      if (colMap['cancelledAt'] !== undefined)        row[colMap['cancelledAt']] = data.cancelledAt || new Date().toISOString();
      if (colMap['cancelledBy'] !== undefined)        row[colMap['cancelledBy']] = data.cancelledBy || 'admin';
      if (colMap['cancellationReason'] !== undefined) row[colMap['cancellationReason']] = data.cancellationReason || 'Cancelled by admin';
      if (colMap['refundStatus'] !== undefined)       row[colMap['refundStatus']] = data.refundStatus || 'pending';

      // Append to Cancelled sheet
      cancelledSheet.appendRow(row);

      // Delete from Bookings sheet
      bookingSheet.deleteRow(i + 1);

      return { result: 'moved' };
    }
  }
  return { error: 'Booking not found: ' + data.bookingId };
}

// Keep updateBooking for any legacy calls
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

// ===== TEST — run this manually in Apps Script editor to verify sheet write =====
function testWrite() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log('Spreadsheet name: ' + ss.getName());
  Logger.log('All sheets: ' + ss.getSheets().map(function(s){ return s.getName(); }).join(', '));
  
  var sheet = ss.getSheetByName(BOOKINGS_SHEET);
  if (!sheet) {
    Logger.log('ERROR: Bookings sheet not found! Creating it...');
    initSheets();
    sheet = ss.getSheetByName(BOOKINGS_SHEET);
  }
  Logger.log('Bookings sheet found: ' + sheet.getName());
  Logger.log('Last row before write: ' + sheet.getLastRow());
  
  sheet.appendRow(['TEST-' + new Date().toISOString(), 'Test Name', '1234567890', 
    'test@test.com', '2', '4 Rooms', 'Family', '2026-06-01', '2026-06-02', 
    'Pending', 'test-id-123', 'r1', 'confirmed', 'guest', 'unpaid', '', '', '', '', '', '']);
  
  Logger.log('Last row after write: ' + sheet.getLastRow());
  Logger.log('SUCCESS — row written');
}
function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
