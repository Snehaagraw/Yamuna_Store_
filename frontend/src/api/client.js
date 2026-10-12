import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // Preserve any explicitly set Authorization header
    if (config.headers?.Authorization) {
      return config;
    }

    const adminToken = localStorage.getItem("admin_access_token");
    const customerToken =
      localStorage.getItem("yamuna_store_customer_token") ||
      localStorage.getItem("customer_access_token");

    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    // 1. Admin endpoints
    const isAdminEndpoint =
      url.includes("/api/auth/customers") ||
      url.includes("all=true") ||
      (url.startsWith("/api/categories/") && method !== "get") ||
      (url.startsWith("/api/products/") && method !== "get") ||
      (url.includes("/api/orders/") && !url.includes("my-orders") && method !== "post");

    if (isAdminEndpoint && adminToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }

    // 2. Customer authenticated endpoints
    const isCustomerEndpoint =
      url.includes("/api/auth/profile") ||
      url.includes("/api/auth/addresses") ||
      url.includes("/api/auth/me") ||
      url.includes("/api/orders/my-orders") ||
      (url.includes("/api/orders/") && method === "post");

    if (isCustomerEndpoint && customerToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${customerToken}`;
      return config;
    }

    // 3. Public GET endpoints (e.g. /api/products/, /api/categories/)
    // Never attach an Authorization header to public browsing requests.
    // If an expired token is attached, SimpleJWT rejects with 401 Unauthorized even on AllowAny views!
    if (
      method === "get" &&
      (url.includes("/api/products/") || url.includes("/api/categories/")) &&
      !url.includes("all=true")
    ) {
      return config;
    }

    // Fallback: If customer token exists and it's an authenticated route
    if (customerToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${customerToken}`;
    } else if (adminToken && !url.includes("/api/auth/customer-login") && !url.includes("/api/auth/register")) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      (error.response?.data?.code === "token_not_valid" ||
        error.response?.data?.detail?.includes?.("token") ||
        error.response?.data?.detail?.includes?.("valid"))
    ) {
      // 1. If a public GET request failed due to an expired token header, retry cleanly without it
      if (
        !originalRequest._retry &&
        originalRequest.method?.toLowerCase() === "get" &&
        (originalRequest.url?.includes("/api/products/") ||
          originalRequest.url?.includes("/api/categories/")) &&
        !originalRequest.url?.includes("all=true")
      ) {
        originalRequest._retry = true;
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
      }

      // 2. Try silent refresh for customer sessions if a refresh token is present
      const customerRefresh =
        localStorage.getItem("yamuna_store_customer_refresh") ||
        localStorage.getItem("customer_refresh_token");

      if (
        customerRefresh &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/api/auth/token/refresh/")
      ) {
        try {
          originalRequest._retry = true;
          const refreshRes = await axios.post(
            `${API_BASE_URL}/api/auth/token/refresh/`,
            { refresh: customerRefresh }
          );

          if (refreshRes.data?.access) {
            const newAccess = refreshRes.data.access;
            localStorage.setItem("yamuna_store_customer_token", newAccess);
            if (refreshRes.data.refresh) {
              localStorage.setItem(
                "yamuna_store_customer_refresh",
                refreshRes.data.refresh
              );
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.warn("Silent token refresh failed; session expired.");
        }
      }

      // 3. If refresh failed or was an admin session, clean up expired tokens
      const authHeader = originalRequest?.headers?.Authorization || "";
      const adminToken = localStorage.getItem("admin_access_token");
      const customerToken =
        localStorage.getItem("yamuna_store_customer_token") ||
        localStorage.getItem("customer_access_token");

      if (adminToken && authHeader.includes(adminToken)) {
        localStorage.removeItem("admin_access_token");
      }
      if (customerToken && authHeader.includes(customerToken)) {
        localStorage.removeItem("yamuna_store_customer_token");
        localStorage.removeItem("yamuna_store_customer_refresh");
        localStorage.removeItem("yamuna_store_customer_user");
        localStorage.removeItem("customer_access_token");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
