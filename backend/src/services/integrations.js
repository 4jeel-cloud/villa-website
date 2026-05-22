const nodemailer = require("nodemailer");

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

async function sendBookingEmail({ to, subject, text, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Email] SMTP not configured, skipping:", to, subject);
    return;
  }
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"Creek View Villa" <${process.env.SMTP_USER}>`,
      replyTo: process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    console.log("[Email] Sent to", to, "messageId:", info.messageId);
  } catch (err) {
    console.error("[Email] Failed to", to, "—", err.message);
  }
}

module.exports = {
  sendBookingEmail,
};
