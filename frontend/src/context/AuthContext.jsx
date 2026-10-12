import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

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

  const customerLogout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_REFRESH_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);

    setCustomerToken(null);
    setCustomerUser(null);
  };

  // Sync latest customer profile and saved address on mount or token change
  useEffect(() => {
    if (!customerToken) return;

    let isMounted = true;
    const fetchLatestProfile = async () => {
      try {
        const response = await api.get("/api/auth/profile/", {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        });
        if (isMounted && response.data) {
          setCustomerUser(response.data);
          localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(response.data));
        }
      } catch (err) {
        // If token expired, clear session
        if (err.response?.status === 401) {
          customerLogout();
        }
      }
    };

    fetchLatestProfile();

    return () => {
      isMounted = false;
    };
  }, [customerToken]);

  const customerLogin = async (username, password) => {
    try {
      const response = await api.post(
        "/api/auth/customer-login/",
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
      const response = await api.post(
        "/api/auth/register/",
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

  const updateCustomerAddress = async (addressData) => {
    if (!customerToken) {
      return { success: false, error: "Please log in to update your address." };
    }

    try {
      const response = await api.put(
        "/api/auth/profile/",
        { saved_address: addressData },
        {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        }
      );

      const updatedUser = response.data;
      localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(updatedUser));
      setCustomerUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Failed to update saved address:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Unable to save delivery address.";
      return { success: false, error: errorMessage };
    }
  };

  const refreshCustomerProfile = async () => {
    if (!customerToken) return null;
    try {
      const response = await api.get("/api/auth/profile/", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });
      if (response.data) {
        setCustomerUser(response.data);
        localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
    return null;
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
        updateCustomerAddress,
        refreshCustomerProfile,
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
