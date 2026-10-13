import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isSaved = user.wishlist.some(id => id.toString() === productId);
    if (isSaved) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name price category image stock"
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const isSaved = user.wishlist.some(id => id.toString() === productId);
    if (!isSaved) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isSaved = user.wishlist.some(id => id.toString() === productId);

    if (isSaved) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      return res.status(200).json({ success: true, saved: false, message: "Product removed from wishlist" });
    } else {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({ success: true, saved: true, message: "Product added to wishlist" });
    }
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
