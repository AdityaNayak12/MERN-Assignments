import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpay = null;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret) {
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.warn("Razorpay initialization warning:", err.message);
  }
}

export default razorpay;
