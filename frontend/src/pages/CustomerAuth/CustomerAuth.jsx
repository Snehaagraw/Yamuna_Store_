import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./CustomerAuth.css";

function CustomerAuth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const { customerLogin, customerRegister, isCustomerLoggedIn } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, navigate to redirect
  if (isCustomerLoggedIn) {
    navigate(redirectTo, { replace: true });
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (mode === "login") {
      if (!username || !password) {
        setError("Please enter your username/email and password.");
        return;
      }

      setLoading(true);
      const result = await customerLogin(username, password);
      setLoading(false);

      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error);
      }
    } else if (mode === "register") {
      if (!name || (!username && !email) || !password) {
        setError("Please fill in your name, email/username, and password.");
        return;
      }

      if (password.length < 6) {
        setError("Password should be at least 6 characters long.");
        return;
      }

      setLoading(true);
      const result = await customerRegister({
        name,
        username: username || email,
        email: email || username,
        password,
      });
      setLoading(false);

      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error);
      }
    } else if (mode === "reset") {
      const identifier = username || email;
      if (!identifier || !newPassword) {
        setError("Please provide your username/email and your new password.");
        return;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }

      setLoading(true);
      try {
        const resp = await api.post("/api/auth/reset-password/", {
          email: identifier,
          new_password: newPassword,
        });

        setSuccessMessage(resp.data.message || "Password updated successfully. Please sign in.");
        setMode("login");
        setUsername(identifier);
        setPassword("");
        setNewPassword("");
      } catch (err) {
        setError(err.response?.data?.error || "Unable to reset password. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Navbar />

      <main className="customer-auth-page">
        <div className="customer-auth-container">
          <div className="customer-auth-card">
            <div className="customer-auth-brand">
              <span className="customer-auth-mark">य</span>
              <div className="customer-auth-brand-text">
                <h2>Yamuna Store</h2>
                <small>VRINDAVAN DEVOTIONAL WEAR</small>
              </div>
            </div>

            <div className="customer-auth-header">
              <span className="customer-auth-eyebrow">
                {mode === "login"
                  ? "WELCOME BACK"
                  : mode === "register"
                  ? "JOIN DEVOTEE COMMUNITY"
                  : "ACCOUNT RECOVERY"}
              </span>
              <h1>
                {mode === "login"
                  ? "Sign In to Proceed"
                  : mode === "register"
                  ? "Create Your Account"
                  : "Reset Password"}
              </h1>
              <p>
                {mode === "reset"
                  ? "Enter your registered email or username to update your password."
                  : redirectTo === "/checkout"
                  ? "Please sign in or create an account to complete your checkout and delivery details."
                  : "Access your devotional order history, saved addresses, and express checkout."}
              </p>
            </div>

            {mode !== "reset" && (
              <div className="customer-auth-toggle">
                <button
                  type="button"
                  className={mode === "login" ? "auth-toggle-btn active" : "auth-toggle-btn"}
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={mode === "register" ? "auth-toggle-btn active" : "auth-toggle-btn"}
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {successMessage && (
              <div className="auth-success-message" role="status">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="customer-auth-form">
              {mode === "register" && (
                <div className="auth-field">
                  <label htmlFor="customer-name">Full Name</label>
                  <input
                    id="customer-name"
                    type="text"
                    placeholder="e.g. Radhika Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="customer-username">
                  {mode === "register" ? "Email Address" : "Username or Email"}
                </label>
                <input
                  id="customer-username"
                  type={mode === "register" ? "email" : "text"}
                  placeholder={mode === "register" ? "e.g. devotee@example.com" : "Enter your username or email"}
                  value={mode === "register" ? email : username}
                  onChange={(e) => {
                    if (mode === "register") {
                      setEmail(e.target.value);
                      setUsername(e.target.value);
                    } else {
                      setUsername(e.target.value);
                      setEmail(e.target.value);
                    }
                  }}
                  required
                />
              </div>

              {mode !== "reset" ? (
                <div className="auth-field">
                  <label htmlFor="customer-password">Password</label>
                  <input
                    id="customer-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {mode === "login" && (
                    <button
                      type="button"
                      className="forgot-password-link"
                      onClick={() => {
                        setMode("reset");
                        setError("");
                        setSuccessMessage("");
                      }}
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
              ) : (
                <div className="auth-field">
                  <label htmlFor="customer-new-password">New Password (min. 6 characters)</label>
                  <input
                    id="customer-new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="auth-error-message" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? redirectTo === "/checkout"
                    ? "Sign In & Proceed to Checkout →"
                    : "Sign In →"
                  : mode === "register"
                  ? redirectTo === "/checkout"
                    ? "Create Account & Proceed to Checkout →"
                    : "Create Account →"
                  : "Update Password →"}
              </button>
            </form>

            <div className="customer-auth-footer">
              <p>
                {mode === "login" ? (
                  <>
                    New to Yamuna Store?{" "}
                    <button
                      type="button"
                      className="auth-link-button"
                      onClick={() => {
                        setMode("register");
                        setError("");
                        setSuccessMessage("");
                      }}
                    >
                      Create an account
                    </button>
                  </>
                ) : mode === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="auth-link-button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                        setSuccessMessage("");
                      }}
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Remember your password?{" "}
                    <button
                      type="button"
                      className="auth-link-button"
                      onClick={() => {
                        setMode("login");
                        setError("");
                        setSuccessMessage("");
                      }}
                    >
                      Back to Sign In
                    </button>
                  </>
                )}
              </p>

              <div className="auth-footer-help">
                <Link to="/help">Need help with sizing or orders? Visit Help & FAQ</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default CustomerAuth;
