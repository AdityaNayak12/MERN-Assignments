import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers?.authorization);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.jwt_secret);
    const user = await Customer.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

export default isAuthenticated;
