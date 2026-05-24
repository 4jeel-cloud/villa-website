function confirmationEmail({ name, room, checkin, checkout, nights, guests, phone }) {
  return `
  <div style="background:#F5F7F5;padding:24px;font-family:Inter,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #D8E4D8">

    <div style="background:#1C3A28;padding:32px;text-align:center">
      <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#A8C8B0;margin:0 0 10px">Creek View Villa</p>
      <h1 style="font-size:26px;font-weight:300;color:#ffffff;margin:0 0 4px;line-height:1.2">
        Your stay is <em>confirmed</em>
      </h1>
      <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0 0 14px">We look forward to welcoming you</p>
      <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:0.08em;color:#A8C8B0;border:1px solid rgba(168,200,176,0.3);background:rgba(168,200,176,0.15)">
        Booking confirmed
      </span>
    </div>

    <div style="padding:28px 32px">
      <p style="font-size:17px;font-weight:300;color:#1C3A28;margin:0 0 6px">Dear ${name},</p>
      <p style="font-size:13px;color:#5A6A5A;line-height:1.7;margin:0 0 20px">
        Thank you for choosing Creek View Villa. We are delighted to welcome you 
        and have reserved your room. Here are your booking details.
      </p>

      <div style="background:#F5F9F5;border:1px solid #C8DCC8;border-radius:8px;overflow:hidden;margin-bottom:20px">
        <div style="padding:12px 18px;border-bottom:1px solid #C8DCC8;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:#5A8A6A">
          Reservation details
        </div>
        ${[
          ['Total stay', `${nights} night${nights > 1 ? 's' : ''}`],
          ['Room', room],
          ['Check-in', `${checkin} — 2:00 PM`],
          ['Check-out', `${checkout} — 11:00 AM`],
          ['Guests', `${guests} guest${guests > 1 ? 's' : ''}`],
        ].map(([label, val], i, arr) => `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:${i < arr.length - 1 ? '1px solid #E8F0E8' : 'none'}">
          <tr>
            <td style="padding:16px 20px;font-size:13px;color:#7A9A7A">${label}</td>
            <td style="padding:16px 20px;font-size:13px;font-weight:500;color:#1C3A28;text-align:right;white-space:nowrap">${val}</td>
          </tr>
        </table>`).join('')}
      </div>

      <hr style="border:none;border-top:1px solid #D8E4D8;margin:0 0 20px">
      <p style="font-size:13px;color:#5A6A5A;margin:0;line-height:1.7">
        For any questions, reach us at 
        <strong style="color:#1C3A28">+91 95442 42879</strong> 
        or reply to this email.
      </p>
    </div>

    <div style="padding:20px 32px;border-top:1px solid #D8E4D8;text-align:center">
      <p style="font-size:14px;font-weight:300;font-style:italic;color:#1C3A28;margin:0 0 4px">Creek View Villa</p>
      <p style="font-size:11px;color:#9AB09A;line-height:1.8;margin:0">
        Panthipoyil, Padinjarathara, Wayanad, Kerala 673575<br>
        creekviewvilla@gmail.com · +91 95442 42879
      </p>
    </div>

  </div>
  </div>`;
}

function cancellationEmail({ name, room, checkin, checkout }) {
  return `
  <div style="background:#F7F5F5;padding:24px;font-family:Inter,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #E4D8D8">

    <div style="background:#2C1C1C;padding:32px;text-align:center">
      <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#C8A8A8;margin:0 0 10px">Creek View Villa</p>
      <h1 style="font-size:26px;font-weight:300;color:#ffffff;margin:0 0 4px;line-height:1.2">
        Your booking has <em>been cancelled</em>
      </h1>
      <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0 0 14px">We hope to welcome you another time</p>
      <span style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:500;letter-spacing:0.08em;color:#C8A8A8;border:1px solid rgba(200,168,168,0.3);background:rgba(200,168,168,0.15)">
        Booking cancelled
      </span>
    </div>

    <div style="padding:28px 32px">
      <p style="font-size:17px;font-weight:300;color:#3A1C1C;margin:0 0 6px">Dear ${name},</p>
      <p style="font-size:13px;color:#6A5A5A;line-height:1.7;margin:0 0 20px">
        We are sorry to see you go. Your booking has been successfully cancelled 
        as requested. Here is a summary of the cancelled reservation.
      </p>

      <div style="background:#F9F5F5;border:1px solid #DCC8C8;border-radius:8px;overflow:hidden;margin-bottom:20px">
        <div style="padding:12px 18px;border-bottom:1px solid #DCC8C8;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:#8A5A5A">
          Cancelled reservation
        </div>
        ${[
          ['Room', room],
          ['Check-in', checkin],
          ['Check-out', checkout],
        ].map(([label, val], i, arr) => `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:${i < arr.length - 1 ? '1px solid #F0E8E8' : 'none'}">
          <tr>
            <td style="padding:16px 20px;font-size:13px;color:#9A7A7A">${label}</td>
            <td style="padding:16px 20px;font-size:13px;font-weight:500;color:#3A1C1C;text-align:right;white-space:nowrap;text-decoration:line-through">${val}</td>
          </tr>
        </table>`).join('')}
      </div>

      <a href="https://villa-website-drt.pages.dev/" style="display:block;text-align:center;background:#3A1C1C;color:#ffffff;padding:13px 24px;border-radius:4px;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;margin-bottom:20px">
        Book again
      </a>

      <hr style="border:none;border-top:1px solid #E4D8D8;margin:0 0 20px">
      <p style="font-size:13px;color:#6A5A5A;margin:0;line-height:1.7">
        We hope to welcome you another time. Reach us at 
        <strong style="color:#3A1C1C">+91 95442 42879</strong> for any assistance.
      </p>
    </div>

    <div style="padding:20px 32px;border-top:1px solid #E4D8D8;text-align:center">
      <p style="font-size:14px;font-weight:300;font-style:italic;color:#3A1C1C;margin:0 0 4px">Creek View Villa</p>
      <p style="font-size:11px;color:#B09A9A;line-height:1.8;margin:0">
        Panthipoyil, Padinjarathara, Wayanad, Kerala 673575<br>
        creekviewvilla@gmail.com · +91 95442 42879
      </p>
    </div>

  </div>
  </div>`;
}

function managerAlert({ guestName, roomName, checkIn, checkOut }) {
  return `
  <div style="background:#F5F7F5;padding:24px;font-family:Inter,Helvetica,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #D8E4D8">

    <div style="background:#7AB890;padding:28px;text-align:center">
      <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#ffffff;margin:0 0 10px">Creek View Villa</p>
      <h1 style="font-size:22px;font-weight:300;color:#ffffff;margin:0">New booking received</h1>
    </div>

    <div style="padding:28px 32px">
      <p style="font-size:15px;color:#1C3A28;margin:0 0 16px">
        A new booking has been placed by <strong>${guestName}</strong>.
      </p>

      <div style="background:#F5F9F5;border:1px solid #C8DCC8;border-radius:8px;overflow:hidden;margin-bottom:16px">
        <div style="padding:12px 18px;border-bottom:1px solid #C8DCC8;font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:#5A8A6A">
          Booking details
        </div>
        ${[
          ['Guest', guestName],
          ['Room', roomName],
          ['Check-in', checkIn],
          ['Check-out', checkOut],
        ].map(([label, val], i, arr) => `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-bottom:${i < arr.length - 1 ? '1px solid #E8F0E8' : 'none'}">
          <tr>
            <td style="padding:16px 20px;font-size:13px;color:#7A9A7A">${label}</td>
            <td style="padding:16px 20px;font-size:13px;font-weight:500;color:#1C3A28;text-align:right;white-space:nowrap">${val}</td>
          </tr>
        </table>`).join('')}
      </div>
    </div>

  </div>
  </div>`;
}

module.exports = { confirmationEmail, cancellationEmail, managerAlert };
