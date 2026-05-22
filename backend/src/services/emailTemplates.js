function guestConfirmation({ guestName, roomName, checkIn, checkOut, guests }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Inter,Segoe UI,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="background:#059669;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">Creek View Villa</h1>
          <p style="margin:8px 0 0;color:#d1fae5;font-size:14px">Padinjarathara, Wayanad</p>
        </td></tr>
        <tr><td style="background:#fff;border-radius:0 0 12px 12px;padding:32px 24px;box-shadow:0 4px 16px rgba(0,0,0,0.06)">
          <h2 style="margin:0 0 20px;color:#0f172a;font-size:20px">Hi ${guestName},</h2>
          <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
            Your reservation at <strong>Creek View Villa</strong> is confirmed. We look forward to hosting you!
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:20px">
            <tr><td style="padding:4px 0"><strong style="color:#059669;font-size:13px">ROOM</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${roomName}</td></tr>
            <tr><td style="padding:4px 0"><strong style="color:#059669;font-size:13px">CHECK-IN</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${checkIn}</td></tr>
            <tr><td style="padding:4px 0"><strong style="color:#059669;font-size:13px">CHECK-OUT</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${checkOut}</td></tr>
            <tr><td style="padding:4px 0"><strong style="color:#059669;font-size:13px">GUESTS</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${guests || "—"}</td></tr>
          </table>
          <p style="margin:0 0 4px;color:#475569;font-size:14px;line-height:1.6">
            <strong>📍 Location:</strong> Padinjarathara, Wayanad, Kerala
          </p>
          <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6">
            If you have any questions before your stay, just reply to this email or call us.
          </p>
          <p style="margin:0;color:#64748b;font-size:13px">
            Warm regards,<br>
            <strong style="color:#059669">Creek View Villa Team</strong>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function managerAlert({ guestName, roomName, checkIn, checkOut }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Inter,Segoe UI,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="background:#dc2626;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">New Booking Alert</h1>
        </td></tr>
        <tr><td style="background:#fff;border-radius:0 0 12px 12px;padding:32px 24px;box-shadow:0 4px 16px rgba(0,0,0,0.06)">
          <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">
            A new booking has been received from <strong>${guestName}</strong>.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;padding:16px;margin-bottom:20px">
            <tr><td style="padding:4px 0"><strong style="color:#dc2626;font-size:13px">GUEST</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${guestName}</td></tr>
            <tr><td style="padding:4px 0"><strong style="color:#dc2626;font-size:13px">ROOM</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${roomName}</td></tr>
            <tr><td style="padding:4px 0"><strong style="color:#dc2626;font-size:13px">CHECK-IN</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${checkIn}</td></tr>
            <tr><td style="padding:4px 0"><strong style="color:#dc2626;font-size:13px">CHECK-OUT</strong></td><td style="padding:4px 0;text-align:right;color:#0f172a;font-size:14px">${checkOut}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cancellation({ guestName, roomName, reason }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Inter,Segoe UI,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="background:#f59e0b;border-radius:12px 12px 0 0;padding:32px 24px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">Booking Cancelled</h1>
        </td></tr>
        <tr><td style="background:#fff;border-radius:0 0 12px 12px;padding:32px 24px;box-shadow:0 4px 16px rgba(0,0,0,0.06)">
          <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px">Hi ${guestName},</h2>
          <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">
            Your booking for <strong>${roomName}</strong> at Creek View Villa has been cancelled.
          </p>
          ${reason ? `<p style="margin:0;color:#64748b;font-size:14px">Reason: ${reason}</p>` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { guestConfirmation, managerAlert, cancellation };
