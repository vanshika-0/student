const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const mongoose = require("mongoose");
const Product = require("./models/Products");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    photos: ["https://picsum.photos/seed/tshirt1/600/600"],
    title: "Black Oversized T-Shirt",
    price: 299,
    description: "Comfortable cotton oversized t-shirt.",
    category: "Fashion",
    location: "SRM University Sonepat",
    condition: "Like New",
    quantity: 1,
    seller: {
      name: "Rahul",
      email: "rahul@srm.edu.in",
      phone: "9876543210"
    }
  },
  {
    photos: ["https://picsum.photos/seed/book1/600/600"],
    title: "Engineering Mathematics Book",
    price: 250,
    description: "Useful for B.Tech students.",
    category: "Books",
    location: "SRM University Sonepat",
    condition: "Good",
    quantity: 1,
    seller: {
      name: "Priya",
      email: "priya@srm.edu.in",
      phone: "9876543211"
    }
  },
  {
    photos: ["https://picsum.photos/seed/laptop1/600/600"],
    title: "Dell Inspiron Laptop",
    price: 28000,
    description: "8GB RAM, SSD, good condition.",
    category: "Electronics",
    location: "SRM University Sonepat",
    condition: "Good",
    quantity: 1,
    seller: {
      name: "Aman",
      email: "aman@srm.edu.in",
      phone: "9876543212"
    }
  },
  {
    photos: ["https://picsum.photos/seed/headphone1/600/600"],
    title: "Wireless Headphones",
    price: 1200,
    description: "Bluetooth headphones with mic.",
    category: "Electronics",
    location: "SRM University Sonepat",
    condition: "Like New",
    quantity: 1,
    seller: {
      name: "Sneha",
      email: "sneha@srm.edu.in",
      phone: "9876543213"
    }
  },
  {
    photos: ["https://picsum.photos/seed/cycle1/600/600"],
    title: "Hero Bicycle",
    price: 2500,
    description: "Perfect for hostel commuting.",
    category: "Sports",
    location: "SRM University Sonepat",
    condition: "Used",
    quantity: 1,
    seller: {
      name: "Karan",
      email: "karan@srm.edu.in",
      phone: "9876543214"
    }
  },
  {
    photos: ["https://picsum.photos/seed/calculator1/600/600"],
    title: "Scientific Calculator",
    price: 450,
    description: "Approved for engineering exams.",
    category: "Electronics",
    location: "SRM University Sonepat",
    condition: "Good",
    quantity: 1,
    seller: {
      name: "Neha",
      email: "neha@srm.edu.in",
      phone: "9876543215"
    }
  },
  {
    photos: ["https://picsum.photos/seed/hoodie1/600/600"],
    title: "Grey Hoodie",
    price: 500,
    description: "Warm hoodie for winters.",
    category: "Fashion",
    location: "SRM University Sonepat",
    condition: "Like New",
    quantity: 1,
    seller: {
      name: "Rohit",
      email: "rohit@srm.edu.in",
      phone: "9876543216"
    }
  },
  {
    photos: ["https://picsum.photos/seed/mouse1/600/600"],
    title: "Logitech Wireless Mouse",
    price: 650,
    description: "Smooth and responsive mouse.",
    category: "Electronics",
    location: "SRM University Sonepat",
    condition: "Good",
    quantity: 1,
    seller: {
      name: "Anjali",
      email: "anjali@srm.edu.in",
      phone: "9876543217"
    }
  }
];

async function seedProducts() {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("Products Inserted Successfully");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

seedProducts();