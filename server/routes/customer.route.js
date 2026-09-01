import express from "express"
import Customer from "../models/customer.model.js"
import { registerCustomer } from "../controller/customer.controller.js"

const customerRoutes = express.Router()

customerRoutes.post("/register", registerCustomer)

export default customerRoutes;