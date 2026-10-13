import express from "express";
import { addProductToWishlist, getWishlist, removeProductFromWishlist, toggleWishlist } from "../controller/wishlist.controller.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/:productId", addProductToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeProductFromWishlist);
router.patch("/:productId/toggle", toggleWishlist);

export default router;
