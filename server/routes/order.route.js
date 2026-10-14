import express from "express";
import isAuthenticated from "../middlewares/authMiddleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/", isAuthenticated, createPaymentOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/", isAuthenticated, getMyOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.patch("/:id/status", isAuthenticated, updateOrderStatus);
router.put("/:id/status", isAuthenticated, updateOrderStatus);

export default router;
