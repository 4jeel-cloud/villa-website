async function sendBookingEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY || "";
  if (!apiKey) {
    console.log("[Email] No BREVO_API_KEY configured, skipping:", to, subject);
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Creek View Villa", email: "creekviewvilla@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    console.log("[Email] Sent to", to, "id:", data.messageId);
  } else {
    const errText = await res.text();
    // Throw only — caller decides whether to log. No double-logging.
    throw new Error(`[Email] Brevo ${res.status} sending to ${to}: ${errText.slice(0, 200)}`);
  }
}

module.exports = {
  sendBookingEmail,
};
