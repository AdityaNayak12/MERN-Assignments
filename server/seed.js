import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const dbUrl = process.env.dbUrl;

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches. Perfect for gaming and typing.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    stock: 15
  },
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 30-hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
    stock: 25
  },
  {
    name: "Classic Denim Jacket",
    description: "Vintage wash denim jacket with multiple pockets and a comfortable fit.",
    price: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&q=80&w=800",
    stock: 8
  },
  {
    name: "The Pragmatic Programmer",
    description: "Your journey to mastery. One of the best software engineering books.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    stock: 40
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted ceramic mug, perfect for your morning brew. Microwave safe.",
    price: 499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800",
    stock: 0
  },
  {
    name: "Minimalist Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls and warm light.",
    price: 1499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    stock: 12
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB for seeding...");
    
    await Product.deleteMany({});
    console.log("Cleared existing products.");
    
    await Product.insertMany(sampleProducts);
    console.log("Inserted sample products successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
};

seedDB();
