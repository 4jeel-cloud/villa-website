import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) {
      setError("Invalid or expired reset link.");
    }
  }, [mode, oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { confirmPasswordReset } = await import("firebase/auth");
      const { auth } = await import("../firebase");
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err) {
      if (err.code === "auth/expired-action-code") {
        setError("This reset link has expired. Request a new one.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Invalid reset link. Request a new one.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode || mode !== "resetPassword") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F5F7F5", padding: 24, fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 400, width: "100%", background: "#fff", borderRadius: 12,
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)", overflow: "hidden",
        }}>
          <div style={{ background: "#1A2A3A", padding: 32, textAlign: "center" }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 32, color: "#7AB0C8" }} />
            <h1 style={{ fontSize: 22, fontWeight: 300, color: "#fff", margin: "12px 0 0" }}>
              Invalid Link
            </h1>
          </div>
          <div style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "#5A6A6A", fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/admin" style={{
              display: "inline-block", background: "#1A2A3A", color: "#fff", padding: "12px 24px",
              borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 500,
            }}>
              Back to Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F5F7F5", padding: 24, fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 400, width: "100%", background: "#fff", borderRadius: 12,
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)", overflow: "hidden",
        }}>
          <div style={{ background: "#1A2A3A", padding: 32, textAlign: "center" }}>
            <i className="ti ti-circle-check" style={{ fontSize: 36, color: "#5BB87A" }} />
            <h1 style={{ fontSize: 22, fontWeight: 300, color: "#fff", margin: "12px 0 0" }}>
              Password Reset
            </h1>
          </div>
          <div style={{ padding: 32, textAlign: "center" }}>
            <p style={{ color: "#2A3A3A", fontSize: 15, fontWeight: 500, margin: "0 0 8px" }}>
              Password updated successfully!
            </p>
            <p style={{ color: "#5A6A6A", fontSize: 13, lineHeight: 1.7, margin: "0 0 24px" }}>
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link to="/admin" style={{
              display: "inline-block", background: "#1A2A3A", color: "#fff", padding: "12px 24px",
              borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 500,
            }}>
              <i className="ti ti-arrow-left" style={{ marginRight: 6 }} />Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#F5F7F5", padding: 24, fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: 400, width: "100%", background: "#fff", borderRadius: 12,
        boxShadow: "0 2px 20px rgba(0,0,0,0.08)", overflow: "hidden",
      }}>
        <div style={{ background: "#1A2A3A", padding: 32, textAlign: "center" }}>
          <i className="ti ti-key" style={{ fontSize: 32, color: "#7AB0C8" }} />
          <h1 style={{ fontSize: 22, fontWeight: 300, color: "#fff", margin: "12px 0 0" }}>
            Set new password
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "8px 0 0" }}>
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 500, color: "#3A4A4A",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              New password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                required
                minLength={6}
                autoFocus
                style={{
                  width: "100%", padding: "12px 44px 12px 14px", border: "1px solid #D0D8D8",
                  borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#5B8DB8"}
                onBlur={(e) => e.target.style.borderColor = "#D0D8D8"}
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
                <i className={"ti ti-" + (showPassword ? "eye-off" : "eye")} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 500, color: "#3A4A4A",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: "100%", padding: "12px 14px", border: "1px solid #D0D8D8",
                borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#5B8DB8"}
              onBlur={(e) => e.target.style.borderColor = "#D0D8D8"}
            />
          </div>

          {error && (
            <p style={{
              color: "#D94A4A", fontSize: 13, margin: "0 0 16px", padding: "10px 14px",
              background: "#FDF0F0", borderRadius: 8, border: "1px solid #F0D8D8",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <i className="ti ti-alert-circle" style={{ fontSize: 16, flexShrink: 0 }} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px 24px", background: "#1A2A3A", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit", transition: "background 0.2s", letterSpacing: "0.02em",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#2A3A4A")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#1A2A3A")}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <i className="ti ti-loader" style={{ animation: "spin 1s linear infinite" }} />
                Resetting password…
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

