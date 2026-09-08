import express from "express"
import { registerCustomer, loginCustomer, getMe, logoutCustomer } from "../controller/customer.controller.js"
import isAuthenticated from "../middlewares/authMiddleware.js"

const customerRoutes = express.Router()

customerRoutes.post("/register", registerCustomer)
customerRoutes.post("/login", loginCustomer)
customerRoutes.get("/me", isAuthenticated, getMe)
customerRoutes.post("/logout", logoutCustomer)

export default customerRoutes;
