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
    original_price: "",
    discount_percent: "",
    discount_label: "",
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
  const [sizeWeights, setSizeWeights] = useState({});
  const [colorInventory, setColorInventory] = useState({});


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

  /*
   * Color variants mapped to images.
   */
  const [newImageColors, setNewImageColors] = useState([]);
  const [existingImageColors, setExistingImageColors] = useState({});

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
        original_price: "",
        discount_percent: "",
        discount_label: "",
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
      setColorInventory({});
      setExistingImages([]);

      setRemovedImageIds([]);
      setNewImageColors([]);
      setExistingImageColors({});

      return;
    }

    const rawOrig = productToEdit.original_price;
    const rawPrice = productToEdit.price;
    const rawDiscount = productToEdit.discount_percent;

    let editOriginalPrice = rawOrig ? String(Number(rawOrig)) : "";
    let editPrice = rawPrice ? String(Number(rawPrice)) : "";
    let editDiscount = rawDiscount !== undefined && rawDiscount !== null && rawDiscount !== ""
      ? Number(rawDiscount)
      : "";

    // If discount % is set but price and original_price are equal, recalculate selling price
    if (editDiscount > 0 && editOriginalPrice) {
      if (!editPrice || Number(editPrice) === Number(editOriginalPrice)) {
        editPrice = String(Math.round(Number(editOriginalPrice) * (1 - editDiscount / 100)));
      }
    } else if (
      (editDiscount === "" || editDiscount === 0) &&
      editOriginalPrice &&
      editPrice &&
      Number(editOriginalPrice) > Number(editPrice)
    ) {
      editDiscount = Math.round(
        ((Number(editOriginalPrice) - Number(editPrice)) /
          Number(editOriginalPrice)) *
          100
      );
    } else if (!editOriginalPrice && editPrice) {
      editOriginalPrice = editPrice;
    }

    setFormData({
      name: productToEdit.name || "",
      section: productToEdit.section || "women",
      category: productToEdit.category || "Gopi Dress",
      description: productToEdit.description || "",
      original_price: editOriginalPrice,
      discount_percent: editDiscount !== "" && editDiscount > 0 ? String(editDiscount) : "",
      discount_label: productToEdit.discount_label || "",
      price: editPrice,
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
    // Filter out any size weights that were just duplicate copies of base weight,
    // so they don't lock the size from updating when base weight changes
    const rawSizeWeights =
      productToEdit.size_weights && typeof productToEdit.size_weights === "object"
        ? { ...productToEdit.size_weights }
        : {};
    const baseProductWeight = (productToEdit.weight || "").trim().toLowerCase();
    const cleanSizeWeights = {};
    Object.entries(rawSizeWeights).forEach(([sz, wt]) => {
      const trimmedWt = String(wt || "").trim();
      if (trimmedWt && trimmedWt.toLowerCase() !== baseProductWeight) {
        cleanSizeWeights[sz] = trimmedWt;
      }
    });
    setSizeWeights(cleanSizeWeights);
    setColorInventory(
      productToEdit.color_inventory && typeof productToEdit.color_inventory === "object"
        ? { ...productToEdit.color_inventory }
        : {}
    );
    const existingImgs = productToEdit.images || [];

    setExistingImages(existingImgs);
    const initColors = {};
    existingImgs.forEach((img) => {
      initColors[img.id] = img.color || "";
    });
    setExistingImageColors(initColors);
    setNewImageColors([]);
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

  /**
   * Automatic Bi-directional Pricing & Discount Calculation:
   * 1. If user updates Actual Price (MRP), recalculate Final Selling Price if discount is active.
   * 2. If user updates Discount %, auto-calculate Final Selling Price = Actual Price - Discount.
   * 3. If user updates Final Selling Price, auto-calculate Discount % = (Actual - Final) / Actual * 100.
   */
  const handleOriginalPriceChange = (event) => {
    const val = event.target.value;
    const numVal = parseFloat(val);

    setFormData((prev) => {
      const disc = parseFloat(prev.discount_percent);
      const existingPrice = parseFloat(prev.price);
      let calculatedPrice = val;
      let calculatedDisc = prev.discount_percent;

      if (!isNaN(numVal) && numVal > 0) {
        if (!isNaN(disc) && disc > 0 && disc < 100) {
          calculatedPrice = String(Math.round(numVal * (1 - disc / 100)));
        } else if (!isNaN(existingPrice) && existingPrice > 0 && existingPrice < numVal) {
          calculatedDisc = String(Math.round(((numVal - existingPrice) / numVal) * 100));
          calculatedPrice = String(existingPrice);
        } else {
          calculatedPrice = val;
        }
      }

      return {
        ...prev,
        original_price: val,
        discount_percent: calculatedDisc,
        price: calculatedPrice,
      };
    });
  };

  const handleDiscountPercentChange = (event) => {
    const val = event.target.value;
    const disc = parseFloat(val);

    setFormData((prev) => {
      const orig = parseFloat(prev.original_price);
      let calculatedPrice = prev.price;

      if (!isNaN(orig) && orig > 0) {
        if (!isNaN(disc) && disc > 0 && disc < 100) {
          calculatedPrice = String(Math.round(orig * (1 - disc / 100)));
        } else if (isNaN(disc) || disc === 0) {
          calculatedPrice = String(orig);
        }
      }

      // Sync size prices if any match old base price or MRP
      if (calculatedPrice) {
        setSizePrices((prevSizes) => {
          const updated = { ...prevSizes };
          Object.keys(updated).forEach((k) => {
            if (
              updated[k] === prev.price ||
              updated[k] === prev.original_price ||
              !updated[k]
            ) {
              updated[k] = calculatedPrice;
            }
          });
          return updated;
        });
      }

      return {
        ...prev,
        discount_percent: val,
        price: calculatedPrice,
      };
    });
  };

  const handleFinalPriceChange = (event) => {
    const val = event.target.value;
    const finalPrice = parseFloat(val);

    setFormData((prev) => {
      const orig = parseFloat(prev.original_price);
      let calculatedDisc = prev.discount_percent;
      let calculatedOrig = prev.original_price;

      if (!isNaN(orig) && orig > 0 && !isNaN(finalPrice) && finalPrice >= 0) {
        if (finalPrice < orig) {
          calculatedDisc = String(
            Math.round(((orig - finalPrice) / orig) * 100)
          );
        } else {
          calculatedDisc = "0";
        }
      } else if ((isNaN(orig) || orig <= 0) && !isNaN(finalPrice) && finalPrice > 0) {
        const d = parseFloat(calculatedDisc);
        if (!isNaN(d) && d > 0 && d < 100) {
          calculatedOrig = String(Math.round(finalPrice / (1 - d / 100)));
        }
      }

      return {
        ...prev,
        price: val,
        original_price: calculatedOrig,
        discount_percent: calculatedDisc,
      };
    });
  };

  const applyDiscountPreset = (pct) => {
    setFormData((prev) => {
      const orig = parseFloat(prev.original_price);
      let calculatedPrice = prev.price;

      if (!isNaN(orig) && orig > 0) {
        if (pct > 0) {
          calculatedPrice = String(Math.round(orig * (1 - pct / 100)));
        } else {
          calculatedPrice = String(orig);
        }
      }

      // Sync size prices that matched the old base price or MRP
      if (calculatedPrice) {
        setSizePrices((prevSizes) => {
          const updated = { ...prevSizes };
          Object.keys(updated).forEach((k) => {
            if (
              updated[k] === prev.price ||
              updated[k] === prev.original_price ||
              !updated[k]
            ) {
              updated[k] = calculatedPrice;
            }
          });
          return updated;
        });
      }

      return {
        ...prev,
        discount_percent: pct > 0 ? String(pct) : "",
        price: calculatedPrice,
      };
    });
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

    const currentColors = (formData.colors || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const initialAssigned = selectedFiles.map((_, i) => {
      const targetIdx = images.length + i;
      return currentColors[targetIdx] || "";
    });

    setImages((previousImages) => [
      ...previousImages,
      ...selectedFiles,
    ]);

    setNewImageColors((prev) => [
      ...prev,
      ...initialAssigned,
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

    setNewImageColors((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
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

    const finalPriceVal = Number(formData.price || formData.original_price);
    if (isNaN(finalPriceVal) || finalPriceVal <= 0) {
      setError(
        "Please enter a valid product price (Actual Price or Selling Price)."
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

      const origNum = parseFloat(formData.original_price);
      const discNum = parseFloat(formData.discount_percent);
      const priceNum = parseFloat(formData.price);

      let finalOriginalPrice = "";
      let finalPrice = "";
      let finalDiscount = 0;

      if (!isNaN(origNum) && origNum > 0) {
        finalOriginalPrice = origNum;
        if (!isNaN(discNum) && discNum > 0) {
          finalDiscount = Math.round(discNum);
          finalPrice = Math.round(origNum * (1 - finalDiscount / 100));
        } else if (!isNaN(priceNum) && priceNum > 0 && priceNum < origNum) {
          finalPrice = priceNum;
          finalDiscount = Math.round(((origNum - priceNum) / origNum) * 100);
        } else {
          finalPrice = !isNaN(priceNum) && priceNum > 0 ? priceNum : origNum;
          finalDiscount = 0;
        }
      } else if (!isNaN(priceNum) && priceNum > 0) {
        finalPrice = priceNum;
        if (!isNaN(discNum) && discNum > 0 && discNum < 100) {
          finalDiscount = Math.round(discNum);
          finalOriginalPrice = Math.round(priceNum / (1 - finalDiscount / 100));
        } else {
          finalOriginalPrice = priceNum;
          finalDiscount = 0;
        }
      }

      data.append("price", String(finalPrice));
      data.append("original_price", String(finalOriginalPrice));
      data.append("discount_percent", String(finalDiscount));
      data.append(
        "discount_label",
        formData.discount_label ? formData.discount_label.trim() : ""
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

      const finalColorInventory = {};
      if (colorsArray.length > 0) {
        colorsArray.forEach((c) => {
          finalColorInventory[c] =
            colorInventory[c] !== undefined ? colorInventory[c] : "In Stock";
        });
      }
      data.append(
        "color_inventory",
        JSON.stringify(finalColorInventory)
      );

      // If all colors/prints are explicitly marked Out of Stock, also set overall stock_status to Out of Stock
      if (
        colorsArray.length > 0 &&
        colorsArray.every(
          (c) =>
            String(finalColorInventory[c] || "").trim().toLowerCase() === "out of stock"
        )
      ) {
        data.set("stock_status", "Out of Stock");
      }

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
      const finalSizeWeights = {};
      if (sizesArray.length > 0) {
        sizesArray.forEach((sz) => {
          finalSizeInventory[sz] =
            sizeInventory[sz] !== undefined ? Number(sizeInventory[sz]) : 10;
          const rawSz = sizePrices[sz];
          if (
            rawSz !== undefined &&
            rawSz !== "" &&
            !isNaN(Number(rawSz))
          ) {
            const numSz = Number(rawSz);
            // If the custom size price was exactly the un-discounted MRP, but now there is a discount,
            // ensure it reflects the discounted price so sizes don't show full MRP
            if (finalDiscount > 0 && numSz === Number(finalOriginalPrice)) {
              finalSizePrices[sz] = Number(finalPrice);
            } else {
              finalSizePrices[sz] = numSz;
            }
          } else if (finalPrice) {
            finalSizePrices[sz] = Number(finalPrice);
          }

          // Size Weight: only store specific custom overrides per size.
          // Sizes without explicit overrides naturally inherit the base weight in real time.
          const rawWt = sizeWeights[sz];
          if (
            rawWt !== undefined &&
            rawWt !== null &&
            String(rawWt).trim() !== ""
          ) {
            finalSizeWeights[sz] = String(rawWt).trim();
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
      data.append(
        "size_weights",
        JSON.stringify(finalSizeWeights)
      );

      /*
       * Send newly-added images and their color mapping.
       */
      images.forEach((image) => {
        data.append(
          "image_files",
          image
        );
      });

      data.append(
        "image_colors",
        JSON.stringify(newImageColors)
      );

      if (isEditMode) {
        data.append(
          "existing_image_colors",
          JSON.stringify(existingImageColors)
        );
      }

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

      let savedProductData = null;
      if (isEditMode) {
        const res = await api.patch(
          url,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        savedProductData = res.data;
      } else {
        const res = await api.post(
          url,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        savedProductData = res.data;
      }

      onProductCreated(savedProductData);
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

  const availableColorOptions = (formData.colors || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

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

            {/* Dynamic Product Pricing & Discount Section */}
            <div className="admin-pricing-card">
              <div className="admin-pricing-header">
                <span className="admin-pricing-title">💰 Product Pricing &amp; Automatic Discount</span>
                <span className="admin-pricing-subtitle">
                  Enter the actual MRP and discount % — the final discounted selling price calculates automatically.
                </span>
              </div>

              <div className="admin-pricing-grid">
                {/* 1. Actual Price / MRP */}
                <div className="admin-form-group">
                  <label htmlFor="product-original-price">
                    Actual Price / MRP (₹) <span className="admin-required-star">*</span>
                  </label>
                  <div className="admin-currency-input-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      id="product-original-price"
                      name="original_price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.original_price}
                      onChange={handleOriginalPriceChange}
                      placeholder="e.g. 3000"
                    />
                  </div>
                  <small className="field-hint">Actual retail price / printed MRP</small>
                </div>

                {/* 2. Discount Percentage */}
                <div className="admin-form-group">
                  <label htmlFor="product-discount-percent">
                    Discount Percentage (%)
                  </label>
                  <div className="admin-currency-input-wrap">
                    <input
                      id="product-discount-percent"
                      name="discount_percent"
                      type="number"
                      min="0"
                      max="99"
                      step="1"
                      value={formData.discount_percent}
                      onChange={handleDiscountPercentChange}
                      placeholder="e.g. 20"
                    />
                    <span className="currency-suffix">% OFF</span>
                  </div>
                  <small className="field-hint">Type % or click quick buttons below</small>
                </div>

                {/* 3. Discounted Final Selling Price */}
                <div className="admin-form-group">
                  <label htmlFor="product-price">
                    Final Discounted Price (₹) <span className="admin-required-star">*</span>
                  </label>
                  <div className="admin-currency-input-wrap">
                    <span className="currency-prefix">₹</span>
                    <input
                      id="product-price"
                      name="price"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={handleFinalPriceChange}
                      placeholder="e.g. 2400"
                    />
                  </div>
                  <small className="field-hint">Customer checkout price (auto-calculated)</small>
                </div>
              </div>

              {/* Discount Quick Presets */}
              <div className="discount-presets-row">
                <span className="presets-label">Quick Presets:</span>
                {[5, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className={`discount-preset-btn ${Number(formData.discount_percent) === pct ? "active" : ""}`}
                    onClick={() => applyDiscountPreset(pct)}
                  >
                    {pct}%
                  </button>
                ))}
                {Number(formData.discount_percent) > 0 && (
                  <button
                    type="button"
                    className="discount-preset-clear"
                    onClick={() => applyDiscountPreset(0)}
                  >
                    ✕ Clear Discount
                  </button>
                )}
              </div>

              {/* 4. Special Offer / Seasonal Event Note (Requested Feature) */}
              <div className="admin-offer-tag-section">
                <div className="admin-field-header-row">
                  <label htmlFor="product-discount-label" style={{ fontWeight: 600, color: "var(--maroon)", fontSize: "13px" }}>
                    🏷️ Special Offer / Seasonal Note <span className="admin-field-tag-optional">Optional</span>
                  </label>
                </div>
                <input
                  id="product-discount-label"
                  name="discount_label"
                  type="text"
                  value={formData.discount_label}
                  onChange={handleChange}
                  placeholder="e.g. Special Winter Offer till December, Diwali Dhamaka Sale, etc."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    border: "1px solid rgba(93, 30, 52, 0.25)",
                    background: "#fff",
                    boxSizing: "border-box",
                  }}
                />
                <div className="admin-offer-chips-row">
                  <span className="chips-label">Quick Suggestions:</span>
                  {[
                    "❄️ Special Winter Offer till December",
                    "🎉 Festive Dham Sale",
                    "🌸 New Arrival Special",
                    "✨ Limited Time Offer",
                    "🔥 Clearance Deal"
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`admin-offer-chip ${formData.discount_label === tag ? "active" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, discount_label: tag }))}
                    >
                      {tag}
                    </button>
                  ))}
                  {formData.discount_label && (
                    <button
                      type="button"
                      className="admin-offer-chip-clear"
                      onClick={() => setFormData((prev) => ({ ...prev, discount_label: "" }))}
                    >
                      ✕ Clear Note
                    </button>
                  )}
                </div>
                <small className="field-hint" style={{ marginTop: "4px", display: "block" }}>
                  Customers will see this offer badge prominently on the product card and product page.
                </small>
              </div>

              {/* Live Price Display Preview */}
              {formData.original_price && Number(formData.original_price) > 0 && (
                <div className="admin-price-preview-banner">
                  <span className="preview-label">Live Customer Display Preview:</span>
                  <div className="preview-values">
                    <span className="preview-final-price">
                      ₹{Number(formData.price || formData.original_price).toLocaleString("en-IN")}
                    </span>
                    {Number(formData.discount_percent) > 0 && Number(formData.original_price) > Number(formData.price) && (
                      <>
                        <span className="preview-mrp">
                          MRP ₹{Number(formData.original_price).toLocaleString("en-IN")}
                        </span>
                        <span className="preview-badge">
                          {formData.discount_percent}% OFF
                        </span>
                        <span className="preview-savings">
                          (Customer saves ₹{(Number(formData.original_price) - Number(formData.price)).toLocaleString("en-IN")})
                        </span>
                      </>
                    )}
                    {formData.discount_label && (
                      <span className="preview-offer-badge">
                        {formData.discount_label}
                      </span>
                    )}
                  </div>
                </div>
              )}
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

            <div className="admin-form-group admin-form-group-full">
              <label htmlFor="product-colors">
                Colors / Prints / Variants
              </label>

              <input
                id="product-colors"
                name="colors"
                type="text"
                value={formData.colors}
                onChange={handleChange}
                placeholder="e.g. Peacock Blue, Lotus Pink, Kesari Yellow or Print 1, Print 2"
              />

              <small>
                Enter multiple colors or prints separated by commas (e.g. "Peacock Blue, Lotus Pink, Yellow"). You can toggle each print In Stock or Out of Stock individually below.
              </small>

              {/* Color & Print Stock Status Panel */}
              {availableColorOptions.length > 0 && (
                <div className="admin-color-stock-panel">
                  <div className="color-stock-panel-header">
                    <div>
                      <span className="color-stock-panel-title">
                        🎨 Color &amp; Print Stock Status
                      </span>
                      <small className="color-stock-panel-subtitle">
                        Click on any print to switch between In Stock and Out of Stock.
                      </small>
                    </div>
                    <div className="color-stock-bulk-actions">
                      <button
                        type="button"
                        className="color-stock-bulk-btn in-stock"
                        onClick={() => {
                          const updated = {};
                          availableColorOptions.forEach((c) => {
                            updated[c] = "In Stock";
                          });
                          setColorInventory(updated);
                        }}
                        title="Mark all colors/prints as In Stock"
                      >
                        ✓ Mark All In Stock
                      </button>
                      <button
                        type="button"
                        className="color-stock-bulk-btn out-stock"
                        onClick={() => {
                          const updated = {};
                          availableColorOptions.forEach((c) => {
                            updated[c] = "Out of Stock";
                          });
                          setColorInventory(updated);
                        }}
                        title="Mark all colors/prints as Out of Stock"
                      >
                        ✕ Mark All Out of Stock
                      </button>
                    </div>
                  </div>

                  <div className="color-stock-grid">
                    {availableColorOptions.map((colorName) => {
                      const isOut =
                        String(colorInventory[colorName] || "").trim().toLowerCase() === "out of stock";

                      // Find thumbnail if an existing image or newly uploaded preview is tagged with this color
                      const pairedExisting = existingImages.find(
                        (img) => (existingImageColors[img.id] || img.color || "").trim().toLowerCase() === colorName.toLowerCase()
                      );
                      const pairedNewIdx = newImageColors.findIndex(
                        (c) => (c || "").trim().toLowerCase() === colorName.toLowerCase()
                      );
                      const pairedThumb = pairedExisting?.image || (pairedNewIdx >= 0 ? previews[pairedNewIdx] : null);

                      return (
                        <div
                          key={colorName}
                          className={`color-stock-card ${isOut ? "is-out" : "is-in"}`}
                        >
                          <div className="color-stock-card-left">
                            {pairedThumb ? (
                              <img
                                src={pairedThumb}
                                alt={colorName}
                                className="color-stock-card-thumb"
                              />
                            ) : (
                              <div className="color-stock-card-placeholder">🎨</div>
                            )}
                            <div className="color-stock-card-details">
                              <span className="color-stock-card-name">{colorName}</span>
                              <span className={`color-stock-status-badge ${isOut ? "out" : "in"}`}>
                                {isOut ? "● Out of Stock" : "● In Stock"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`color-stock-toggle-pill ${isOut ? "pill-make-in" : "pill-make-out"}`}
                            onClick={() => {
                              setColorInventory((prev) => ({
                                ...prev,
                                [colorName]: isOut ? "In Stock" : "Out of Stock",
                              }));
                            }}
                          >
                            {isOut ? "Make In Stock" : "Make Out of Stock"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                        🏷️ Size Pricing, Inventory & Weight
                      </label>
                      <small style={{ fontSize: "10px", color: "rgba(93, 30, 52, 0.65)" }}>
                        Set custom price, stock, and weight per size. If empty, Base Price (₹{formData.price || 0}) and Base Weight ({formData.weight || "N/A"}) are used.
                      </small>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                          📋 Copy Base Price (₹{formData.price})
                        </button>
                      )}

                      {formData.weight && (
                        <button
                          type="button"
                          onClick={() => {
                            const sizesArray = formData.sizes
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                            const updated = {};
                            sizesArray.forEach((s) => {
                              updated[s] = formData.weight;
                            });
                            setSizeWeights(updated);
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
                          title="Copy the base product weight to all available sizes"
                        >
                          ⚖️ Copy Base Weight ({formData.weight})
                        </button>
                      )}
                    </div>
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

                          {/* Weight Input */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            title={`Weight for size ${sz} (e.g. 450g or 0.5 kg). Leave empty to use base weight (${formData.weight || "N/A"})`}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                              }}
                            >
                              ⚖️
                            </span>
                            <input
                              type="text"
                              placeholder={formData.weight || "Weight"}
                              style={{
                                width: "70px",
                                padding: "4px 6px",
                                fontSize: "12px",
                                border: "1px solid #ccc",
                                borderRadius: "3px",
                                textAlign: "center",
                              }}
                              value={
                                sizeWeights[sz] !== undefined
                                  ? sizeWeights[sz]
                                  : ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setSizeWeights((prev) => ({
                                  ...prev,
                                  [sz]: val,
                                }));
                              }}
                            />
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

            {availableColorOptions.length > 0 && (
              <div
                style={{
                  background: "#fdf7f9",
                  border: "1px solid rgba(114, 38, 63, 0.2)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "14px",
                  fontSize: "12.5px",
                  color: "var(--maroon-dark)",
                }}
              >
                <strong>🎨 Multi-Color Image Pairing:</strong> Tag each uploaded dress photo with its specific color below ({availableColorOptions.join(", ")}). Customers will see and order that exact dress color!
              </div>
            )}

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

                          <div className="admin-img-badge-row">
                            <span className="admin-img-badge">
                              Existing
                            </span>
                            {availableColorOptions.length > 0 && (
                              <select
                                className="admin-img-color-select"
                                value={
                                  existingImageColors[image.id] ||
                                  image.color ||
                                  ""
                                }
                                onChange={(e) =>
                                  setExistingImageColors((prev) => ({
                                    ...prev,
                                    [image.id]: e.target.value,
                                  }))
                                }
                                title="Select color for this dress photo"
                              >
                                <option value="">(No Color)</option>
                                {availableColorOptions.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
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

                        <div className="admin-img-badge-row">
                          <span className="admin-img-badge">
                            New
                          </span>
                          {availableColorOptions.length > 0 && (
                            <select
                              className="admin-img-color-select"
                              value={newImageColors[index] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewImageColors((prev) => {
                                  const copy = [...prev];
                                  copy[index] = val;
                                  return copy;
                                });
                              }}
                              title="Select color for this dress photo"
                            >
                              <option value="">(No Color)</option>
                              {availableColorOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
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