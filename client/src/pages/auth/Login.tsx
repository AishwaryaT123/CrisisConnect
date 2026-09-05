import { useState } from "react";
import type { SyntheticEvent } from "react";
import { loginUser } from "../../services/auth/auth.service";

interface LoginProps {
  onLoginSuccess: () => void;
  onSignupClick: () => void;
}

const Login = ({
  onLoginSuccess,
  onSignupClick,
}: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      console.log("Login successful:", response);

      onLoginSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a, #1e3a5f)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "40px",
          boxSizing: "border-box",
          boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Logo */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "10px",
            }}
          >
            🚨
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "30px",
            }}
          >
            CrisisConnect
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Emergency Response Platform
          </p>
        </div>

        {/* Heading */}

        <h2
          style={{
            marginBottom: "6px",
            color: "#1e293b",
            fontSize: "22px",
          }}
        >
          Welcome Back
        </h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: "25px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Sign in to your CrisisConnect account
        </p>

        {/* Error */}

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}

        <form onSubmit={handleSubmit}>

          {/* Email */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#334155",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={{
                width: "100%",
                padding: "13px 14px",
                boxSizing: "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "9px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Password */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "7px",
                color: "#334155",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={{
                width: "100%",
                padding: "13px 14px",
                boxSizing: "border-box",
                border:
                  "1px solid #cbd5e1",
                borderRadius: "9px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "9px",
              background: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              transition:
                "background 0.2s ease",
            }}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        {/* Signup */}

        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          Don't have an account?{" "}

          <button
            type="button"
            onClick={onSignupClick}
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0,
              fontSize: "14px",
            }}
          >
            Create Account
          </button>
        </div>

        {/* Footer */}

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          Secure Emergency Response System
        </div>
      </div>
    </div>
  );
};

export default Login;