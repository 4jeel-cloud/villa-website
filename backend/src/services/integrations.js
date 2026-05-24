const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY || "re_xxxxxxxxx");

async function sendBookingEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] No RESEND_API_KEY configured, skipping:", to, subject);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "Creek View Villa <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[Email] Failed to", to, "—", error);
    } else {
      console.log("[Email] Sent to", to, "id:", data?.id);
    }
  } catch (err) {
    console.error("[Email] Failed to", to, "—", err.message);
  }
}

module.exports = {
  sendBookingEmail,
};
