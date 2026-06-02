async function sendBookingEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY || "";
  if (!apiKey) {
    console.log("[Email] No BREVO_API_KEY configured, skipping:", to, subject);
    return;
  }
  try {
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
      console.error("[Email] Failed to", to, "—", res.status, errText.slice(0, 500));
      throw new Error(`Brevo API error ${res.status}: ${errText.slice(0, 200)}`);
    }
  } catch (err) {
    console.error("[Email] Failed to", to, "—", err.message);
    throw err;
  }
}

module.exports = {
  sendBookingEmail,
};
