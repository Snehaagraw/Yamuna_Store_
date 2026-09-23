import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminProducts from "./AdminProducts";
import AdminAddProduct from "./AdminAddProduct";
import AdminOrders from "./AdminOrders";
import AdminCustomers from "./AdminCustomers";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState("products");

  const [showAddProduct, setShowAddProduct] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const handleLogout = () => {
    localStorage.removeItem(
      "admin_access_token"
    );

    localStorage.removeItem(
      "admin_refresh_token"
    );

    navigate("/");
  };

  const handleProductsClick = () => {
    setActiveSection("products");
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleOrdersClick = () => {
    setActiveSection("orders");
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleCustomersClick = () => {
    setActiveSection("customers");
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    setActiveSection("products");
    setEditingProduct(null);
    setShowAddProduct(true);
  };

  const handleEditProduct = (product) => {
    setActiveSection("products");
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleProductCreated = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    setActiveSection("products");
  };

  const handleProductUpdated = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
    setActiveSection("products");
  };

  const handleCancelProductForm = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const renderContent = () => {
    if (activeSection === "products") {
      if (showAddProduct) {
        return (
          <AdminAddProduct
            productToEdit={editingProduct}
            onCancel={handleCancelProductForm}
            onProductCreated={
              editingProduct
                ? handleProductUpdated
                : handleProductCreated
            }
          />
        );
      }

      return (
        <AdminProducts
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
        />
      );
    }

    if (activeSection === "orders") {
      return <AdminOrders />;
    }

    if (activeSection === "customers") {
      return <AdminCustomers />;
    }

    return null;
  };

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <button
          type="button"
          className="admin-dashboard-brand"
          onClick={() => navigate("/")}
          title="Yamuna Store Home"
        >
          <div className="admin-dashboard-mark">
            य
          </div>

          <div>
            <h1>Yamuna Store</h1>

            <span>ADMINISTRATION</span>
          </div>
        </button>

        <button
          type="button"
          className="admin-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-dashboard-intro">
          <span>STORE MANAGEMENT</span>

          <h2>Dashboard</h2>

          <p>
            Manage your Yamuna Store from one place.
          </p>
        </div>

        <nav className="admin-dashboard-tabs">
          <button
            type="button"
            className={
              activeSection === "products"
                ? "admin-dashboard-tab active"
                : "admin-dashboard-tab"
            }
            onClick={handleProductsClick}
          >
            Products
          </button>

          <button
            type="button"
            className={
              activeSection === "orders"
                ? "admin-dashboard-tab active"
                : "admin-dashboard-tab"
            }
            onClick={handleOrdersClick}
          >
            Orders
          </button>

          <button
            type="button"
            className={
              activeSection === "customers"
                ? "admin-dashboard-tab active"
                : "admin-dashboard-tab"
            }
            onClick={handleCustomersClick}
          >
            Customers
          </button>
        </nav>

        <div className="admin-dashboard-main-content">
          {renderContent()}
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;