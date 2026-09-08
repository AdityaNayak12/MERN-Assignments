import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const registerCustomer = async (req , res) =>{
    try{
        const { fullName,email, password, phone } = req.body;
        if(!fullName || !phone || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length <= 6){
            return res.status(400).json({ message: "Password must be greater than 6 characters" });
        }

        const emailExists = await Customer.findOne({ email })
        if(emailExists){
            return res.status(409).json({ message: "Email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const customer = await Customer.create({ fullName, email, password: hashedPassword, phone });
        res.status(201).json({ message: "Customer created successfully", customer });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }
        const user = await Customer.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(400).json({ message: "Incorrect Password" });
        }
        res.cookie("token", generateToken(user._id.toString()), { httpOnly: true });
        return res.status(200).json({ message: "User logged in" });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getMe = (req, res) => {
    return res.status(200).json({ authenticatedUser: req.user });
};

export const logoutCustomer = (req, res) =>{
    res.clearCookie('token', {
        httpOnly: true,
      });
      return res.status(200).json({ message: 'Logged out successfully' });
}