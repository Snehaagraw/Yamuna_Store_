import { useEffect, useState } from "react";
import axios from "axios";

import "./AdminAddProduct.css";

function AdminAddProduct({
  onCancel,
  onProductCreated,
  productToEdit = null,
}) {
  const isEditMode = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    name: "",
    category: "Gopi Dress",
    description: "",
    price: "",
    fabric: "",
    colors: "",
    stock_status: "In Stock",
    is_best_seller: false,
    is_new_collection: false,
  });

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Populate the form when editing an existing product.
   */
  useEffect(() => {
    if (!productToEdit) {
      setFormData({
        name: "",
        category: "Gopi Dress",
        description: "",
        price: "",
        fabric: "",
        colors: "",
        stock_status: "In Stock",
        is_best_seller: false,
        is_new_collection: false,
      });

      setExistingImages([]);
      setRemovedImageIds([]);

      return;
    }

    setFormData({
      name: productToEdit.name || "",
      category: productToEdit.category || "Gopi Dress",
      description: productToEdit.description || "",
      price: productToEdit.price ?? "",
      fabric: productToEdit.fabric || "",
      colors: Array.isArray(productToEdit.colors)
        ? productToEdit.colors.join(", ")
        : "",
      stock_status:
        productToEdit.stock_status || "In Stock",
      is_best_seller:
        Boolean(productToEdit.is_best_seller),
      is_new_collection:
        Boolean(productToEdit.is_new_collection),
    });

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
        ? `http://127.0.0.1:8000/api/products/${productToEdit.id}/`
        : "http://127.0.0.1:8000/api/products/";

      if (isEditMode) {
        await axios.patch(
          url,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
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

        setError(
          isEditMode
            ? "Unable to update the product. Please check the details."
            : "Unable to create the product. Please check the details."
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
                Product Name
              </label>

              <input
                id="product-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-category">
                Category
              </label>

              <select
                id="product-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Gopi Dress">
                  Gopi Dress
                </option>

                <option value="Sarees">
                  Sarees
                </option>

                <option value="Kurties">
                  Kurties
                </option>

                <option value="Dupattas">
                  Dupattas
                </option>

                <option value="Dhoti Kurta">
                  Dhoti Kurta
                </option>
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

            <div className="admin-form-group admin-form-group-full">
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