import { useEffect, useState } from "react";
import api from "../../api/client";

import "./AdminCategories.css";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSection, setFormSection] = useState("women");
  const [activeSectionFilter, setActiveSectionFilter] = useState("all");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    const token = localStorage.getItem("admin_access_token");

    try {
      setLoading(true);
      setError("");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(
        "/api/categories/?all=true",
        { headers }
      );

      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Unable to load categories. Ensure the Django server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormName("");
    setFormSection(activeSectionFilter !== "all" ? activeSectionFilter : "women");
    setFormIsActive(true);
    setFormImage(null);
    setFormImagePreview("");
    setError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSection(cat.section || "women");
    setFormIsActive(cat.is_active);
    setFormImage(null);
    setFormImagePreview(cat.image || "");
    setError("");
  };

  // Image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Add
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Please provide a category name.");
      return;
    }

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setError("Admin session expired. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = new FormData();
      data.append("name", formName.trim());
      data.append("section", formSection);
      data.append("is_active", formIsActive ? "true" : "false");
      if (formImage) {
        data.append("image", formImage);
      }

      const response = await api.post(
        "/api/categories/",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsAddModalOpen(false);
      showSuccess(`Category "${response.data.name}" added successfully to ${formSection === "men" ? "Men's" : formSection === "kids" ? "Kids'" : "Women's"} section.`);
      fetchCategories();
    } catch (err) {
      console.error("Error creating category:", err);
      const msg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        "Failed to create category. Ensure the name is unique within this section.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Please provide a category name.");
      return;
    }

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setError("Admin session expired. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = new FormData();
      data.append("name", formName.trim());
      data.append("section", formSection);
      data.append("is_active", formIsActive ? "true" : "false");
      if (formImage) {
        data.append("image", formImage);
      }

      const response = await api.patch(
        `/api/categories/${editingCategory.id}/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEditingCategory(null);
      showSuccess(`Category "${response.data.name}" updated successfully.`);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      const msg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        "Failed to update category.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setSubmitting(true);
      await api.delete(
        `/api/categories/${deletingCategory.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const deletedName = deletingCategory.name;
      setDeletingCategory(null);
      showSuccess(`Category "${deletedName}" deleted.`);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="admin-categories-section">
      <div className="admin-categories-top">
        <div className="admin-categories-heading">
          <span>STORE MANAGEMENT</span>
          <h2>Categories ({categories.length})</h2>
          <p>
            Manage store categories, customize devotion wear groupings, and add new collections.
          </p>
        </div>

        <div className="admin-categories-actions-top">
          <button
            type="button"
            className="admin-add-category-btn-primary"
            onClick={handleOpenAdd}
          >
            + Add Category
          </button>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={fetchCategories}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="admin-categories-alert success">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {error && !isAddModalOpen && !editingCategory && (
        <div className="admin-categories-alert error">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Section Filter Tabs */}
      <div className="admin-cat-section-tabs">
        <button
          type="button"
          className={`admin-cat-section-tab ${activeSectionFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveSectionFilter("all")}
        >
          All Sub-Sections ({categories.length})
        </button>
        <button
          type="button"
          className={`admin-cat-section-tab ${activeSectionFilter === "women" ? "active" : ""}`}
          onClick={() => setActiveSectionFilter("women")}
        >
          🌸 Women's ({categories.filter((c) => (c.section || "women") === "women").length})
        </button>
        <button
          type="button"
          className={`admin-cat-section-tab ${activeSectionFilter === "men" ? "active" : ""}`}
          onClick={() => setActiveSectionFilter("men")}
        >
          🪔 Men's ({categories.filter((c) => c.section === "men").length})
        </button>
        <button
          type="button"
          className={`admin-cat-section-tab ${activeSectionFilter === "kids" ? "active" : ""}`}
          onClick={() => setActiveSectionFilter("kids")}
        >
          ✨ Kids' ({categories.filter((c) => c.section === "kids").length})
        </button>
      </div>

      <div className="admin-categories-table-card">
        <table className="admin-categories-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Sub-Section</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Products</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories
              .filter((cat) => {
                if (activeSectionFilter === "all") return true;
                return (cat.section || "women") === activeSectionFilter;
              })
              .map((cat) => {
                const sectionKey = cat.section || "women";
                return (
                  <tr key={cat.id}>
                    <td>
                      <div className="category-name-cell">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="category-thumb"
                          />
                        ) : (
                          <div className="category-thumb-placeholder">
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="category-title">{cat.name}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`cat-section-pill section-${sectionKey}`}>
                        {sectionKey === "men"
                          ? "🪔 Men"
                          : sectionKey === "kids"
                          ? "✨ Kids"
                          : "🌸 Women"}
                      </span>
                    </td>

                    <td>
                      <span className="category-slug">{cat.slug}</span>
                    </td>

                    <td>
                      <span
                        className={`category-status-badge ${
                          cat.is_active ? "active" : "inactive"
                        }`}
                      >
                        ● {cat.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span className="category-product-count">
                        {cat.product_count ?? 0} {cat.product_count === 1 ? "item" : "items"}
                      </span>
                    </td>

                    <td>
                      <div
                        className="category-actions"
                        style={{ justifyContent: "flex-end" }}
                      >
                        <button
                          type="button"
                          className="category-edit-btn"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="category-delete-btn"
                          onClick={() => setDeletingCategory(cat)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {categories.filter((cat) => {
              if (activeSectionFilter === "all") return true;
              return (cat.section || "women") === activeSectionFilter;
            }).length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="admin-categories-empty">
                  No categories found in this sub-section. Click "+ Add Category" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Prominent bottom Add Button requested by user */}
      <div className="admin-categories-bottom-action">
        <button
          type="button"
          className="admin-add-category-btn-large"
          onClick={handleOpenAdd}
        >
          + Add Category
        </button>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div
          className="category-modal-overlay"
          onClick={() => !submitting && setIsAddModalOpen(false)}
        >
          <div
            className="category-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="category-modal-header">
              <h3>+ Add Category</h3>
              <button
                type="button"
                className="category-modal-close-btn"
                onClick={() => !submitting && setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="category-modal-body">
                {error && (
                  <div
                    className="admin-categories-alert error"
                    style={{ marginBottom: "16px" }}
                  >
                    <span>{error}</span>
                  </div>
                )}

                <div className="category-form-group">
                  <label htmlFor="cat-section-input">Sub-Section *</label>
                  <select
                    id="cat-section-input"
                    className="category-form-input category-section-select"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    required
                  >
                    <option value="women">🌸 Women's Section</option>
                    <option value="men">🪔 Men's Section</option>
                    <option value="kids">✨ Kids' Section</option>
                  </select>
                  <small className="category-field-hint">
                    Select which department (Women's, Men's, or Kids') this category belongs to.
                  </small>
                </div>

                <div className="category-form-group">
                  <label htmlFor="cat-name-input">Category Name *</label>
                  <input
                    id="cat-name-input"
                    type="text"
                    className="category-form-input"
                    placeholder="e.g. Sarees or Dhoti Kurta"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="category-form-group">
                  <label className="category-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                    />
                    <span>Active (display on storefront & in filters)</span>
                  </label>
                </div>

                <div className="category-form-group">
                  <label htmlFor="cat-image-input">
                    Category Cover Image (Optional)
                  </label>
                  <input
                    id="cat-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {formImagePreview && (
                    <div className="category-image-preview-wrapper">
                      <img
                        src={formImagePreview}
                        alt="Preview"
                        className="category-image-preview"
                      />
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        Selected preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="category-modal-actions">
                  <button
                    type="button"
                    className="category-cancel-btn"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="category-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "[ Add Category ]"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          className="category-modal-overlay"
          onClick={() => !submitting && setEditingCategory(null)}
        >
          <div
            className="category-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="category-modal-header">
              <h3>Edit Category</h3>
              <button
                type="button"
                className="category-modal-close-btn"
                onClick={() => !submitting && setEditingCategory(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCategory}>
              <div className="category-modal-body">
                {error && (
                  <div
                    className="admin-categories-alert error"
                    style={{ marginBottom: "16px" }}
                  >
                    <span>{error}</span>
                  </div>
                )}

                <div className="category-form-group">
                  <label htmlFor="edit-cat-section">Sub-Section *</label>
                  <select
                    id="edit-cat-section"
                    className="category-form-input category-section-select"
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    required
                  >
                    <option value="women">🌸 Women's Section</option>
                    <option value="men">🪔 Men's Section</option>
                    <option value="kids">✨ Kids' Section</option>
                  </select>
                  <small className="category-field-hint">
                    Change the department this category belongs to.
                  </small>
                </div>

                <div className="category-form-group">
                  <label htmlFor="edit-cat-name">Category Name *</label>
                  <input
                    id="edit-cat-name"
                    type="text"
                    className="category-form-input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="category-form-group">
                  <label className="category-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                    />
                    <span>Active (display on storefront & in filters)</span>
                  </label>
                </div>

                <div className="category-form-group">
                  <label htmlFor="edit-cat-image">
                    Update Image (Optional)
                  </label>
                  <input
                    id="edit-cat-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {formImagePreview && (
                    <div className="category-image-preview-wrapper">
                      <img
                        src={formImagePreview}
                        alt="Preview"
                        className="category-image-preview"
                      />
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        Current / selected preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="category-modal-actions">
                  <button
                    type="button"
                    className="category-cancel-btn"
                    onClick={() => setEditingCategory(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="category-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "[ Save Changes ]"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div
          className="category-modal-overlay"
          onClick={() => !submitting && setDeletingCategory(null)}
        >
          <div
            className="category-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="category-modal-header">
              <h3>Delete Category</h3>
              <button
                type="button"
                className="category-modal-close-btn"
                onClick={() => !submitting && setDeletingCategory(null)}
              >
                ✕
              </button>
            </div>

            <div className="category-modal-body">
              <p style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#441727" }}>
                Are you sure you want to permanently delete category{" "}
                <strong>"{deletingCategory.name}"</strong>?
              </p>

              {deletingCategory.product_count > 0 && (
                <div className="category-delete-warning">
                  ⚠️ <strong>Notice:</strong> {deletingCategory.product_count} product
                  {deletingCategory.product_count > 1 ? "s are" : " is"} currently
                  assigned to this category. Deleting this category will NOT delete
                  the products, but will leave them uncategorized.
                </div>
              )}

              <div className="category-modal-actions">
                <button
                  type="button"
                  className="category-cancel-btn"
                  onClick={() => setDeletingCategory(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="category-delete-btn"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                  style={{ padding: "10px 22px", borderRadius: "4px" }}
                >
                  {submitting ? "Deleting..." : "Delete Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCategories;
