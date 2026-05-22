async function sendBookingEmail({ to, subject, text, html }) {
  const apiKey = process.env.SENDGRID_API_KEY || process.env.SMTP_PASS;
  if (!apiKey) {
    console.log("[Email] No API key configured, skipping:", to, subject);
    return;
  }
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "creekviewvilla@gmail.com", name: "Creek View Villa" },
        reply_to: { email: "creekviewvilla@gmail.com" },
        subject,
        content: [
          { type: "text/plain", value: text || "" },
          { type: "text/html", value: html || "" },
        ],
      }),
    });
    if (res.ok) {
      console.log("[Email] Sent to", to, "status:", res.status);
    } else {
      const errText = await res.text();
      console.error("[Email] Failed to", to, "—", res.status, errText.slice(0, 200));
    }
  } catch (err) {
    console.error("[Email] Failed to", to, "—", err.message);
  }
}

module.exports = {
  sendBookingEmail,
};
