import { useEffect, useState } from "react";
import api from "../../api/client";

import "./AdminAddProduct.css";

function AdminAddProduct({
  onCancel,
  onProductCreated,
  productToEdit = null,
}) {
  const isEditMode = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    name: "",
    section: "women",
    category: "Gopi Dress",
    description: "",
    price: "",
    fabric: "",
    weight: "",
    colors: "",
    sizes: "",
    stock_status: "In Stock",
    is_best_seller: false,
    is_new_collection: false,
  });

  const [sizeInventory, setSizeInventory] = useState({});
  const [sizePrices, setSizePrices] = useState({});

  /*
   * New images selected from the computer.
   */
  const [images, setImages] = useState([]);

  /*
   * Preview URLs for newly selected images.
   */
  const [previews, setPreviews] = useState([]);

  /*
   * Existing images already stored on Cloudinary.
   */
  const [existingImages, setExistingImages] = useState([]);

  /*
   * IDs of existing images that the admin wants to remove.
   */
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories/");
        if (response.data && response.data.length > 0) {
          setAvailableCategories(response.data);
          if (!productToEdit) {
            const initialSection = "women";
            const firstCat = response.data.find(
              (c) => (c.section || "women") === initialSection
            ) || response.data[0];
            setFormData((prev) => ({
              ...prev,
              section: prev.section || initialSection,
              category: prev.category || firstCat?.name || "Gopi Dress",
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, [productToEdit]);

  /*
   * Populate the form when editing an existing product.
   */
  useEffect(() => {
    if (!productToEdit) {
      setFormData({
        name: "",
        section: "women",
        category: "Gopi Dress",
        description: "",
        price: "",
        fabric: "",
        weight: "",
        colors: "",
        sizes: "",
        stock_status: "In Stock",
        is_best_seller: false,
        is_new_collection: false,
      });

      setSizeInventory({});
      setSizePrices({});
      setExistingImages([]);
      setRemovedImageIds([]);

      return;
    }

    setFormData({
      name: productToEdit.name || "",
      section: productToEdit.section || "women",
      category: productToEdit.category || "Gopi Dress",
      description: productToEdit.description || "",
      price: productToEdit.price ?? "",
      fabric: productToEdit.fabric || "",
      weight: productToEdit.weight || "",
      colors: Array.isArray(productToEdit.colors)
        ? productToEdit.colors.join(", ")
        : "",
      sizes: Array.isArray(productToEdit.sizes)
        ? productToEdit.sizes.join(", ")
        : "",
      stock_status:
        productToEdit.stock_status || "In Stock",
      is_best_seller:
        Boolean(productToEdit.is_best_seller),
      is_new_collection:
        Boolean(productToEdit.is_new_collection),
    });

    setSizeInventory(
      productToEdit.size_inventory && typeof productToEdit.size_inventory === "object"
        ? { ...productToEdit.size_inventory }
        : {}
    );
    setSizePrices(
      productToEdit.size_prices && typeof productToEdit.size_prices === "object"
        ? { ...productToEdit.size_prices }
        : {}
    );
    setExistingImages(productToEdit.images || []);
    setRemovedImageIds([]);
    setImages([]);
    setPreviews([]);
    setError("");
  }, [productToEdit]);

  /*
   * Clean up newly-created preview URLs.
   */
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSectionChange = (event) => {
    const newSection = event.target.value;
    const matchingCats = availableCategories.filter(
      (c) => (c.section || "women") === newSection
    );
    setFormData((previous) => ({
      ...previous,
      section: newSection,
      category: matchingCats.length > 0 ? matchingCats[0].name : "",
    }));
  };

  const handleToggleSizePreset = (preset) => {
    const currentSizes = formData.sizes
      ? formData.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const existsIndex = currentSizes.findIndex(
      (s) => s.toUpperCase() === preset.toUpperCase()
    );

    let newSizes;
    if (existsIndex >= 0) {
      newSizes = currentSizes.filter((_, idx) => idx !== existsIndex);
    } else {
      newSizes = [...currentSizes, preset];
    }

    setFormData((prev) => ({
      ...prev,
      sizes: newSizes.join(", "),
    }));
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    setImages((previousImages) => [
      ...previousImages,
      ...selectedFiles,
    ]);

    const newPreviewUrls = selectedFiles.map(
      (file) => URL.createObjectURL(file)
    );

    setPreviews((previousPreviews) => [
      ...previousPreviews,
      ...newPreviewUrls,
    ]);

    event.target.value = "";
  };

  /*
   * Remove a newly-selected image.
   */
  const handleRemoveNewImage = (indexToRemove) => {
    setImages((previousImages) =>
      previousImages.filter(
        (_, index) => index !== indexToRemove
      )
    );

    setPreviews((previousPreviews) => {
      const previewToRemove =
        previousPreviews[indexToRemove];

      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove);
      }

      return previousPreviews.filter(
        (_, index) => index !== indexToRemove
      );
    });
  };

  /*
   * Remove an existing Cloudinary image from the
   * edit form.
   *
   * It is NOT deleted from Cloudinary immediately.
   * We only mark it for deletion. The backend deletes
   * it after the product is successfully updated.
   */
  const handleRemoveExistingImage = (image) => {
    setExistingImages((previousImages) =>
      previousImages.filter(
        (existingImage) =>
          existingImage.id !== image.id
      )
    );

    setRemovedImageIds((previousIds) => [
      ...previousIds,
      image.id,
    ]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Please enter a product description."
      );
      return;
    }

    if (
      !formData.price ||
      Number(formData.price) < 0
    ) {
      setError(
        "Please enter a valid product price."
      );
      return;
    }

    /*
     * During Add mode, at least one new image is required.
     *
     * During Edit mode, the product must still have
     * at least one image after removals/new uploads.
     */
    if (
      !isEditMode &&
      images.length === 0
    ) {
      setError(
        "Please add at least one product image."
      );
      return;
    }

    if (
      isEditMode &&
      existingImages.length === 0 &&
      images.length === 0
    ) {
      setError(
        "A product must have at least one image."
      );
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "section",
        formData.section || "women"
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "fabric",
        formData.fabric.trim()
      );

      data.append(
        "weight",
        formData.weight ? formData.weight.trim() : ""
      );

      data.append(
        "stock_status",
        formData.stock_status
      );

      data.append(
        "is_best_seller",
        formData.is_best_seller
      );

      data.append(
        "is_new_collection",
        formData.is_new_collection
      );

      const colorsArray = formData.colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean);

      data.append(
        "colors",
        JSON.stringify(colorsArray)
      );

      const sizesArray = formData.sizes
        ? formData.sizes
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean)
        : [];

      data.append(
        "sizes",
        JSON.stringify(sizesArray)
      );

      const finalSizeInventory = {};
      const finalSizePrices = {};
      if (sizesArray.length > 0) {
        sizesArray.forEach((sz) => {
          finalSizeInventory[sz] =
            sizeInventory[sz] !== undefined ? Number(sizeInventory[sz]) : 10;
          if (
            sizePrices[sz] !== undefined &&
            sizePrices[sz] !== "" &&
            !isNaN(Number(sizePrices[sz]))
          ) {
            finalSizePrices[sz] = Number(sizePrices[sz]);
          } else if (formData.price) {
            finalSizePrices[sz] = Number(formData.price);
          }
        });
      }
      data.append(
        "size_inventory",
        JSON.stringify(finalSizeInventory)
      );
      data.append(
        "size_prices",
        JSON.stringify(finalSizePrices)
      );

      /*
       * Send newly-added images.
       */
      images.forEach((image) => {
        data.append(
          "image_files",
          image
        );
      });

      /*
       * Tell the backend which existing images
       * should be removed.
       */
      if (
        isEditMode &&
        removedImageIds.length > 0
      ) {
        removedImageIds.forEach((imageId) => {
          data.append(
            "remove_image_ids",
            imageId
          );
        });
      }

      const token = localStorage.getItem(
        "admin_access_token"
      );

      if (!token) {
        setError(
          "Your admin session has expired. Please log in again."
        );
        return;
      }

      const url = isEditMode
        ? `/api/products/${productToEdit.id}/`
        : "/api/products/";

      if (isEditMode) {
        await api.patch(
          url,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          url,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      onProductCreated();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        setError(
          "Your admin session has expired. Please log in again."
        );
      } else if (err.response?.data) {
        console.error(
          "Product save error:",
          err.response.data
        );

        const dataErr = err.response.data;
        let detailedMsg = "";
        if (typeof dataErr === "object") {
          const firstKey = Object.keys(dataErr)[0];
          const firstVal = dataErr[firstKey];
          if (Array.isArray(firstVal) && firstVal.length > 0) {
            detailedMsg = `${firstKey}: ${firstVal[0]}`;
          } else if (typeof firstVal === "string") {
            detailedMsg = `${firstKey}: ${firstVal}`;
          }
        }

        setError(
          detailedMsg ||
            (isEditMode
              ? "Unable to update the product. Please check the details."
              : "Unable to create the product. Please check the details.")
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-add-product-section">
      <div className="admin-add-product-top">
        <div className="admin-add-product-heading">
          <span>STORE MANAGEMENT</span>

          <h2>
            {isEditMode
              ? "Edit Product"
              : "Add Product"}
          </h2>

          <p>
            {isEditMode
              ? "Update the details and images of this Yamuna Store product."
              : "Add a new product to your Yamuna Store collection."}
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={onCancel}
          disabled={loading}
        >
          ← Products
        </button>
      </div>

      <form
        className="admin-product-form"
        onSubmit={handleSubmit}
      >
        {/* Product Details */}

        <div className="admin-form-section">
          <div className="admin-form-section-heading">
            <span>01</span>

            <div>
              <h3>Product Details</h3>

              <p>
                Basic information about the product.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="product-name">
                Product Name *
              </label>

              <input
                id="product-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-section">
                Collection Sub-Section *
              </label>

              <select
                id="product-section"
                name="section"
                value={formData.section || "women"}
                onChange={handleSectionChange}
              >
                <option value="women">Women's Collection</option>
                <option value="men">Men's Collection</option>
                <option value="kids">Kids' Collection</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-category">
                Category ({formData.section === "men" ? "Men's" : formData.section === "kids" ? "Kids'" : "Women's"}) *
              </label>

              <select
                id="product-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {availableCategories.filter(
                  (cat) => (cat.section || "women") === (formData.section || "women")
                ).length > 0 ? (
                  availableCategories
                    .filter(
                      (cat) => (cat.section || "women") === (formData.section || "women")
                    )
                    .map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                ) : (
                  <option value="">No categories under {formData.section} section</option>
                )}
              </select>
            </div>

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="product-description">
                Description
              </label>

              <textarea
                id="product-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows="5"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-price">
                Price
              </label>

              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹0.00"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-fabric">
                Fabric
              </label>

              <input
                id="product-fabric"
                name="fabric"
                type="text"
                value={formData.fabric}
                onChange={handleChange}
                placeholder="e.g. Cotton"
              />
            </div>

            <div className="admin-form-group">
              <div className="admin-field-header-row">
                <label htmlFor="product-weight">
                  Weight
                </label>
                <span className="admin-field-tag-optional">Optional</span>
              </div>

              <input
                id="product-weight"
                name="weight"
                type="text"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 450 g or 0.5 kg"
              />

              <div className="admin-size-presets" style={{ marginTop: "6px" }}>
                <span className="admin-presets-label">Quick:</span>
                {["200 g", "350 g", "500 g", "750 g", "1 kg", "1.5 kg"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`admin-size-preset-btn ${formData.weight === preset ? "selected" : ""}`}
                    onClick={() => setFormData((prev) => ({ ...prev, weight: preset }))}
                    title={`Set weight to ${preset}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <small>
                Used for shipping calculation & displayed on product page.
              </small>
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-colors">
                Colors
              </label>

              <input
                id="product-colors"
                name="colors"
                type="text"
                value={formData.colors}
                onChange={handleChange}
                placeholder="Red, Yellow, Blue"
              />

              <small>
                Enter multiple colors separated by commas.
              </small>
            </div>

            <div className="admin-form-group admin-form-group-full">
              <div className="admin-field-header-row">
                <label htmlFor="product-sizes">
                  Available Sizes
                </label>
                <span className="admin-field-tag-optional">Optional</span>
              </div>

              <input
                id="product-sizes"
                name="sizes"
                type="text"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="e.g. S, M, L, XL or Free Size"
              />

              <div className="admin-size-presets">
                <span className="admin-presets-label">Quick Presets:</span>
                {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((preset) => {
                  const isSelected = formData.sizes
                    .split(",")
                    .map((s) => s.trim().toUpperCase())
                    .includes(preset.toUpperCase());
                  return (
                    <button
                      key={preset}
                      type="button"
                      className={`admin-size-preset-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleToggleSizePreset(preset)}
                      title={`Toggle ${preset}`}
                    >
                      {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  );
                })}
              </div>

              {formData.sizes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean).length > 0 && (
                <div
                  className="admin-size-inventory-section"
                  style={{
                    marginTop: "14px",
                    padding: "14px 16px",
                    background: "rgba(93, 30, 52, 0.04)",
                    border: "1px solid rgba(93, 30, 52, 0.14)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "var(--maroon)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          display: "block",
                        }}
                      >
                        🏷️ Size Pricing & Inventory
                      </label>
                      <small style={{ fontSize: "10px", color: "rgba(93, 30, 52, 0.65)" }}>
                        Set custom price and stock per size. If price is left empty, Base Price (₹{formData.price || 0}) is used.
                      </small>
                    </div>

                    {formData.price && (
                      <button
                        type="button"
                        onClick={() => {
                          const sizesArray = formData.sizes
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const updated = {};
                          sizesArray.forEach((s) => {
                            updated[s] = formData.price;
                          });
                          setSizePrices(updated);
                        }}
                        style={{
                          background: "#fff",
                          border: "1px solid var(--maroon)",
                          color: "var(--maroon)",
                          borderRadius: "14px",
                          padding: "4px 12px",
                          fontSize: "10px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                        title="Copy the base product price to all available sizes"
                      >
                        📋 Copy Base Price (₹{formData.price}) to All Sizes
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    {formData.sizes
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((sz) => (
                        <div
                          key={sz}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#fff",
                            padding: "8px 12px",
                            border: "1px solid rgba(93, 30, 52, 0.18)",
                            borderRadius: "6px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "13px",
                              color: "var(--maroon-dark)",
                              minWidth: "28px",
                            }}
                          >
                            {sz}
                          </strong>

                          {/* Price Input */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title={`Custom price for size ${sz} (leave empty to use ₹${formData.price || 0})`}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--gold-dark)",
                                fontWeight: "600",
                              }}
                            >
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={formData.price || "Price"}
                              style={{
                                width: "75px",
                                padding: "4px 6px",
                                fontSize: "12px",
                                border: "1px solid #ccc",
                                borderRadius: "3px",
                                textAlign: "center",
                              }}
                              value={
                                sizePrices[sz] !== undefined
                                  ? sizePrices[sz]
                                  : ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setSizePrices((prev) => ({
                                  ...prev,
                                  [sz]: val,
                                }));
                              }}
                            />
                          </div>

                          {/* Stock Input */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title={`Stock count for size ${sz}`}
                          >
                            <input
                              type="number"
                              min="0"
                              style={{
                                width: "55px",
                                padding: "4px 6px",
                                fontSize: "12px",
                                border: "1px solid #ccc",
                                borderRadius: "3px",
                                textAlign: "center",
                              }}
                              value={
                                sizeInventory[sz] !== undefined
                                  ? sizeInventory[sz]
                                  : 10
                              }
                              onChange={(e) => {
                                const val = Math.max(
                                  0,
                                  parseInt(e.target.value, 10) || 0
                                );
                                setSizeInventory((prev) => ({
                                  ...prev,
                                  [sz]: val,
                                }));
                              }}
                            />
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "#666",
                              }}
                            >
                              pcs
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <small>
                Optional. Enter sizes separated by commas, or click quick presets above. Adjust per-size stock counts above. Leave blank if sizing does not apply.
              </small>
            </div>
          </div>
        </div>

        {/* Stock & Collection */}

        <div className="admin-form-section">
          <div className="admin-form-section-heading">
            <span>02</span>

            <div>
              <h3>Stock & Collection</h3>

              <p>
                Set the product's store status.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="product-stock">
                Stock Status
              </label>

              <select
                id="product-stock"
                name="stock_status"
                value={formData.stock_status}
                onChange={handleChange}
              >
                <option value="In Stock">
                  In Stock
                </option>

                <option value="Out of Stock">
                  Out of Stock
                </option>
              </select>
            </div>

            <div className="admin-form-checkboxes">
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="is_best_seller"
                  checked={
                    formData.is_best_seller
                  }
                  onChange={handleChange}
                />

                <span>
                  Best Seller
                </span>
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="is_new_collection"
                  checked={
                    formData.is_new_collection
                  }
                  onChange={handleChange}
                />

                <span>
                  New Collection
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Images */}

        <div className="admin-form-section">
          <div className="admin-form-section-heading">
            <span>03</span>

            <div>
              <h3>Product Images</h3>

              <p>
                {isEditMode
                  ? "Manage existing images or add new ones."
                  : "Upload multiple images for this product."}
              </p>
            </div>
          </div>

          <div className="admin-image-upload">

            {/* Existing Cloudinary Images */}

            {isEditMode &&
              existingImages.length > 0 && (
                <>
                  <div className="admin-image-previews">
                    {existingImages.map(
                      (image, index) => (
                        <div
                          className="admin-image-preview"
                          key={image.id}
                        >
                          <img
                            src={image.image}
                            alt={`${formData.name} ${
                              index + 1
                            }`}
                          />

                          <button
                            type="button"
                            className="admin-remove-image"
                            onClick={() =>
                              handleRemoveExistingImage(
                                image
                              )
                            }
                            disabled={loading}
                            aria-label={`Remove existing image ${
                              index + 1
                            }`}
                          >
                            ×
                          </button>

                          <span>
                            Existing
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <p className="admin-image-count">
                    {existingImages.length}{" "}
                    {existingImages.length === 1
                      ? "existing image"
                      : "existing images"}
                  </p>
                </>
              )}

            {/* Upload New Images */}

            <label
              htmlFor="product-images"
              className="admin-image-upload-box"
            >
              <span>+</span>

              <strong>
                {isEditMode
                  ? "Add More Images"
                  : "Choose Product Images"}
              </strong>

              <small>
                You can select multiple images at once.
              </small>
            </label>

            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              hidden
            />

            {/* New Image Previews */}

            {previews.length > 0 && (
              <>
                <div className="admin-image-previews">
                  {previews.map(
                    (preview, index) => (
                      <div
                        className="admin-image-preview"
                        key={preview}
                      >
                        <img
                          src={preview}
                          alt={`New product preview ${
                            index + 1
                          }`}
                        />

                        <button
                          type="button"
                          className="admin-remove-image"
                          onClick={() =>
                            handleRemoveNewImage(
                              index
                            )
                          }
                          disabled={loading}
                          aria-label={`Remove new image ${
                            index + 1
                          }`}
                        >
                          ×
                        </button>

                        <span>
                          New
                        </span>
                      </div>
                    )
                  )}
                </div>

                <p className="admin-image-count">
                  {images.length}{" "}
                  {images.length === 1
                    ? "new image"
                    : "new images"}{" "}
                  selected
                </p>
              </>
            )}

            {!isEditMode &&
              previews.length === 0 && (
                <p className="admin-image-count">
                  No images selected
                </p>
              )}
          </div>
        </div>

        {error && (
          <p
            className="admin-product-form-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Form Actions */}

        <div className="admin-product-form-actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={loading}
          >
            {loading
              ? isEditMode
                ? "Updating Product..."
                : "Saving Product..."
              : isEditMode
                ? "Update Product"
                : "Save Product"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminAddProduct;