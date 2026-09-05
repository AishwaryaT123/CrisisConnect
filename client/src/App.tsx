import { useEffect, useState } from "react";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotificationBell from "./components/notification/NotificationBell";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";

import {
  getCurrentUser,
  isAuthenticated,
  logoutUser,
  getMe,
} from "./services/auth/auth.service";


function App() {
  const [authenticated, setAuthenticated] =
    useState(isAuthenticated());

  const [showSignup, setShowSignup] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [user, setUser] =
    useState(getCurrentUser());

  // =====================================================
  // VERIFY AUTHENTICATION ON APP START
  // =====================================================

  useEffect(() => {
    const verifyAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthenticated(false);
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await getMe();

        console.log(
          "Authentication verification:",
          response
        );

        if (response.success && response.user) {
          /*
           * /auth/me confirms that the JWT is valid.
           *
           * The complete user information is already
           * stored in localStorage after login.
           */
          const storedUser = getCurrentUser();

          if (storedUser) {
            setUser(storedUser);
            setAuthenticated(true);
          } else {
            logoutUser();
            setAuthenticated(false);
            setUser(null);
          }
        } else {
          logoutUser();
          setAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        logoutUser();
        setAuthenticated(false);
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuthentication();
  }, []);

  // =====================================================
  // LOGIN SUCCESS
  // =====================================================

  const handleLoginSuccess = () => {
    const currentUser = getCurrentUser();

    setUser(currentUser);
    setAuthenticated(true);
    setShowSignup(false);
  };

  // =====================================================
  // SIGNUP SUCCESS
  // =====================================================

  const handleSignupSuccess = () => {
    const currentUser = getCurrentUser();

    setUser(currentUser);
    setAuthenticated(true);
    setShowSignup(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logoutUser();

    setAuthenticated(false);
    setUser(null);
    setShowSignup(false);
  };

  // =====================================================
  // AUTH CHECK LOADING
  // =====================================================

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "15px",
            }}
          >
            🚨
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            CrisisConnect
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOGIN / SIGNUP
  // =====================================================

  if (!authenticated) {
    if (showSignup) {
      return (
        <Signup
          onSignupSuccess={
            handleSignupSuccess
          }
          onLoginClick={() =>
            setShowSignup(false)
          }
        />
      );
    }

    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }
        onSignupClick={() =>
          setShowSignup(true)
        }
      />
    );
  }

  // =====================================================
  // USER VALIDATION
  // =====================================================

  if (!user) {
    logoutUser();

    return (
      <Login
        onLoginSuccess={
          handleLoginSuccess
        }
        onSignupClick={() =>
          setShowSignup(true)
        }
      />
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          height: "72px",
          padding: "0 30px",
          background: "#111827",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Logo */}

        <h1
          style={{
            margin: 0,
            fontSize: "28px",
          }}
        >
          CrisisConnect
        </h1>

        {/* RIGHT SIDE */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Notification */}

          <NotificationBell
            userId={user.id}
          />

          {/* User */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {user.name}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#cbd5e1",
                }}
              >
                {user.role}
              </div>
            </div>

            {/* Logout */}

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 14px",
                border:
                  "1px solid #475569",
                borderRadius: "7px",
                background:
                  "transparent",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CITIZEN DASHBOARD */}

      <CitizenDashboard userName={user.name} />
      
    </div>
  );
}

export default App;