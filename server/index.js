import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import customerRoute from "./routes/customer.route.js";
import productRoute from "./routes/product.route.js";
dotenv.config();

const app = express();
const dbUrl = process.env.dbUrl;
app.use(express.json())
app.use(cookieParser())

const allowedClientOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedClientOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


app.use("/user", customerRoute);
app.use("/products", productRoute);


const port = 8001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

mongoose.connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
