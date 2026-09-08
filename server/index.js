import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import customerRoute from "./routes/customer.route.js";
dotenv.config();

const app = express();
const dbUrl = process.env.dbUrl;
app.use(express.json())
app.use(cookieParser())


app.use("/user", customerRoute);


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
