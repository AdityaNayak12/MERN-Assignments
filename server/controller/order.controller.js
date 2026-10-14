import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Customer from "../models/customer.model.js";
import razorpay from "../config/razorpay.js";

export const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required";
  }

  const { fullName, phone, addressLine1, city, state, pincode } = address;

  if (
    !fullName ||
    typeof fullName !== "string" ||
    fullName.trim().length === 0 ||
    !phone ||
    typeof phone !== "string" ||
    phone.trim().length === 0 ||
    !addressLine1 ||
    typeof addressLine1 !== "string" ||
    addressLine1.trim().length === 0 ||
    !city ||
    typeof city !== "string" ||
    city.trim().length === 0 ||
    !state ||
    typeof state !== "string" ||
    state.trim().length === 0 ||
    !pincode ||
    typeof pincode !== "string" ||
    pincode.trim().length === 0
  ) {
    return "All shipping address fields are required and cannot be empty";
  }

  // Validate phone: standard 10 digit number
  const phoneClean = phone.trim();
  if (!/^\d{10}$/.test(phoneClean)) {
    return "Phone number must be a valid 10-digit number";
  }

  // Validate pincode: 6 digit number
  const pincodeClean = pincode.trim();
  if (!/^\d{6}$/.test(pincodeClean)) {
    return "Pincode must contain 6 digits";
  }

  return null;
};

export const createPaymentOrder = async (req, res) => {
  try {
    const user = req.user;
    const { shippingAddress } = req.body;

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    // Refresh customer to get latest cart items
    const customer = await Customer.findById(user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = customer.cart || [];
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Validate each cart item against current Product data and verify stock
    const orderItems = [];
    let serverTotal = 0;

    for (const item of cart) {
      const productId = item.product?._id || item.product;
      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in cart",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available",
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      serverTotal += itemTotal;

      // Order snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || "",
      });
    }

    // Round total to 2 decimal places to avoid floating point issues
    const totalAmount = Math.round(serverTotal * 100) / 100;

    // Create pending ShopKart order
    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    const amountInPaise = Math.round(totalAmount * 100);

    let razorpayOrderId = null;
    if (razorpay && process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("placeholder")) {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: shopKartOrder._id.toString(),
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr) {
        console.warn("Razorpay API error, falling back to simulated order ID:", rzpErr.message);
        razorpayOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
      }
    } else {
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
    }

    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: shopKartOrder.razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating payment order",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const user = req.user;
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    if (!mongoose.isValidObjectId(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to order" });
    }

    // Verify HMAC SHA-256 signature using database stored razorpayOrderId
    const secret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret_shopkart";
    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Payment signature is valid
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock for each purchased item
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart in backend
    const customer = await Customer.findById(user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying payment",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = req.user;
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching single order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching order",
      error: error.message,
    });
  }
};

// Bonus: Order status progression
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }

    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating order status",
      error: error.message,
    });
  }
};
