import "./Admin.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/api/auth/login/",
        {
          username,
          password,
        }
      );

      localStorage.setItem("admin_access_token", response.data.access);
      localStorage.setItem("admin_refresh_token", response.data.refresh);

      navigate("/admin/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many login attempts. Please wait a minute before trying again.");
      } else if (err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <Link to="/" className="admin-login-brand" title="Return to Yamuna Store">
          <div className="admin-login-mark">य</div>

          <div>
            <h1>Yamuna Store</h1>
            <p>ADMINISTRATION</p>
          </div>
        </Link>

        <div className="admin-login-heading">
          <span>STORE MANAGEMENT</span>
          <h2>Welcome back.</h2>
          <p>Sign in to manage your Yamuna Store.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="admin-username">Username</label>

            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Enter your admin username"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="admin-login-footer">
          Yamuna Store · Vrindavan
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;