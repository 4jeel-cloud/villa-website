import { useState } from "react";

export default function AdminLoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("../firebase");
      await signInWithEmailAndPassword(auth, email, password);
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
          <input
            className="formInput"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            required
          />
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        <button className="formSubmit" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </section>
  );
}
