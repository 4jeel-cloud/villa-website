const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: "creekviewvilla@gmail.com",
    pass: process.env.BREVO_API_KEY || process.env.SMTP_PASS || "",
  },
});

async function sendBookingEmail({ to, subject, html }) {
  if (!transporter.options.auth.pass) {
    console.log("[Email] No SMTP password configured, skipping:", to, subject);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: '"Creek View Villa" <creekviewvilla@gmail.com>',
      to,
      subject,
      html,
    });
    console.log("[Email] Sent to", to, "id:", info.messageId);
  } catch (err) {
    console.error("[Email] Failed to", to, "—", err.message);
  }
}

module.exports = {
  sendBookingEmail,
};
