import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body ?? {};
    const [cleanName, cleanDescription, cleanCategory, cleanImage] = [
      name,
      description,
      category,
      image,
    ].map((value) => (typeof value === "string" ? value.trim() : value));

    if (
      [cleanName, cleanDescription, cleanCategory, cleanImage].some(
        (value) => typeof value !== "string" || !value,
      ) ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    const product = await Product.create({
      name: cleanName,
      description: cleanDescription,
      price,
      category: cleanCategory,
      image: cleanImage,
      stock,
    });
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("createProduct failed:", error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product data" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filters = {};

    if (
      (search !== undefined && typeof search !== "string") ||
      (category !== undefined && typeof category !== "string")
    ) {
      return res.status(400).json({ success: false, message: "Invalid query parameters" });
    }

    if (search) {
      filters.name = {
        $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }
    if (category) {
      filters.category = category;
    }

    let productsQuery = Product.find(filters);
    if (sort === "price_asc") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "price_desc") {
      productsQuery = productsQuery.sort({ price: -1 });
    }

    const products = await productsQuery;
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("getProducts failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("getProductById failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
