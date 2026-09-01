import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";

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