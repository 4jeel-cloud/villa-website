import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitizeEmail = (raw) => raw.trim().toLowerCase();

const KNOWN_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in",
  "outlook.com", "hotmail.com", "live.com", "icloud.com", "protonmail.com",
  "rediffmail.com", "zoho.com", "aol.com", "yandex.com", "mail.com",
]);

function suggestDomain(domain) {
  const d = domain.toLowerCase();
  let best = null, bestScore = Infinity;
  for (const known of KNOWN_DOMAINS) {
    if (d === known) return null;
    let dist = 0;
    if (d.startsWith(known.split(".")[0]) || known.startsWith(d.split(".")[0])) {
      dist = Math.abs(d.length - known.length);
    }
    if (dist > 0 && dist < bestScore) {
      const missing = known.includes(d.replace(/[^a-z0-9]/g, ""))
        || d.includes(known.replace(/[^a-z0-9]/g, ""));
      if (missing) { best = known; bestScore = dist; }
    }
    const parts = d.split(".");
    const knownParts = known.split(".");
    for (let i = 0; i < Math.min(parts.length, knownParts.length); i++) {
      const ld = parts[i].length, lk = knownParts[i].length;
      const edits = ld < lk ? lk - ld : ld - lk;
      if (edits < bestScore && edits <= 2) { best = known; bestScore = edits; }
    }
  }
  return best;
}

export default function AdminLoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("../firebase");
      await signInWithEmailAndPassword(auth, sanitizeEmail(email), password);
      onLogin();
    } catch (err) {
      console.error("Firebase login error:", err.code, err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (targetEmail) => {
    // Only call the backend — it generates the Firebase reset link via Admin SDK
    // and sends the branded email. Calling Firebase client SDK here too would
    // send a second (unbranded) reset email to the user.
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const res = await fetch(apiUrl + "/api/send-reset-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Failed to send reset email.");
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) { setError("Enter your email first."); return; }
    if (!EMAIL_RE.test(cleanEmail)) { setError("Enter a valid email address."); return; }
    const atIdx = cleanEmail.indexOf("@");
    if (atIdx > 0) {
      const domain = cleanEmail.slice(atIdx + 1);
      const suggestion = suggestDomain(domain);
      if (suggestion) {
        setError(`Did you mean @${suggestion}? Check your email address.`);
        return;
      }
    }
    setError("");
    setResetLoading(true);
    setCanResend(false);
    try {
      await sendResetEmail(cleanEmail);
      setResetSent(true);
      setTimeout(() => setCanResend(true), 10000);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResend = async () => {
    const cleanEmail = sanitizeEmail(email);
    setError("");
    setResetLoading(true);
    try {
      await sendResetEmail(cleanEmail);
      setCanResend(false);
      setTimeout(() => setCanResend(true), 10000);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 380, margin: "6rem auto" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Admin Login</h2>
      <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Sign in to access the booking dashboard.</p>
      <form className="form" onSubmit={handleSubmit}>
        <div className="formField">
          <label className="formLabel">Email</label>
          <input
            className="formInput"
            type="email"
            placeholder="admin@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            autoFocus
            required
          />
        </div>
        <div className="formField">
          <label className="formLabel">Password</label>
          <div style={{ position: "relative" }}>
            <input
              className="formInput"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: "#94a3b8", fontSize: 18, lineHeight: 1,
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 8, flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {resetSent ? (
            <>
              <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 500 }}>Reset link sent to {email}</span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Didn't receive it? Check spam folder</span>
              {canResend && (
                <button type="button" onClick={handleResend} disabled={resetLoading} style={{
                  background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: "0.75rem", color: "#06402B", fontWeight: 600, padding: "2px 0",
                  textDecoration: "underline", textUnderlineOffset: 2,
                }}>
                  {resetLoading ? "Sending…" : "Resend reset email"}
                </button>
              )}
            </>
          ) : (
            <button type="button" onClick={handleForgotPassword} disabled={resetLoading} style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: "0.8rem", color: "#06402B", fontWeight: 600, padding: "4px 0",
              textDecoration: "underline", textUnderlineOffset: 2,
            }}>
              {resetLoading ? "Sending…" : "Forgot Password?"}
            </button>
          )}
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        <button className="formSubmit" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </section>
  );
}

