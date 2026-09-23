import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const CUSTOMER_TOKEN_KEY = "yamuna_store_customer_token";
const CUSTOMER_REFRESH_KEY = "yamuna_store_customer_refresh";
const CUSTOMER_USER_KEY = "yamuna_store_customer_user";

export function AuthProvider({ children }) {
  const [customerToken, setCustomerToken] = useState(() => {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY) || null;
  });

  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(CUSTOMER_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const isCustomerLoggedIn = Boolean(customerToken);

  const customerLogin = async (username, password) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/customer-login/",
        { username, password }
      );

      const { access, refresh, user } = response.data;

      localStorage.setItem(CUSTOMER_TOKEN_KEY, access);
      localStorage.setItem(CUSTOMER_REFRESH_KEY, refresh);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));

      setCustomerToken(access);
      setCustomerUser(user);

      return { success: true, user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Invalid username or password.";
      return { success: false, error: errorMessage };
    }
  };

  const customerRegister = async ({ name, username, email, password }) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/",
        { name, username, email, password }
      );

      const { access, refresh, user } = response.data;

      localStorage.setItem(CUSTOMER_TOKEN_KEY, access);
      localStorage.setItem(CUSTOMER_REFRESH_KEY, refresh);
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));

      setCustomerToken(access);
      setCustomerUser(user);

      return { success: true, user };
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Unable to create account. Please try again.";
      return { success: false, error: errorMessage };
    }
  };

  const customerLogout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_REFRESH_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);

    setCustomerToken(null);
    setCustomerUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customerToken,
        customerUser,
        isCustomerLoggedIn,
        customerLogin,
        customerRegister,
        customerLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
