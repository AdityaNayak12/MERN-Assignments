import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    user.cart = user.cart || [];
    const itemIndex = user.cart.findIndex(
      (item) => (item.product?._id || item.product).toString() === productId
    );

    const currentQty = itemIndex > -1 ? user.cart[itemIndex].quantity : 0;
    const targetQty = currentQty + 1;

    if (targetQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = targetQty;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    await user.populate({
      path: "cart.product",
      select: "_id name price image stock category description",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "_id name price image stock category description",
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = (user.cart || []).filter((item) => item.product != null);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    if (
      quantity === undefined ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid integer of at least 1",
      });
    }

    user.cart = user.cart || [];
    const itemIndex = user.cart.findIndex(
      (item) => (item.product?._id || item.product).toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity exceeds available stock",
      });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();
    await user.populate({
      path: "cart.product",
      select: "_id name price image stock category description",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    user.cart = user.cart || [];
    const itemIndex = user.cart.findIndex(
      (item) => (item.product?._id || item.product).toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();
    await user.populate({
      path: "cart.product",
      select: "_id name price image stock category description",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: user.cart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
