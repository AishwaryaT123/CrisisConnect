import { useState } from "react";
import type { SyntheticEvent } from "react";
import { registerUser } from "../../services/auth/auth.service";

interface SignupProps {
  onSignupSuccess: () => void;
  onLoginClick: () => void;
}

const Signup = ({
  onSignupSuccess,
  onLoginClick,
}: SignupProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!name || !email || !password) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name,
        email,
        password,
        phone,
      });

      console.log(
        "Registration successful:",
        response
      );

      onSignupSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Registration failed";

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
          Create Account
        </h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: "25px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Create your CrisisConnect citizen account
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

          {/* Name */}

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
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
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

          {/* Phone */}

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
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
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
              placeholder="Create a password"
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

          {/* Signup Button */}

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
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* Login */}

        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          Already have an account?{" "}

          <button
            type="button"
            onClick={onLoginClick}
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
            Sign In
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

export default Signup;