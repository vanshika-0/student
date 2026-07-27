const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  //iska mtlb h multiple photos store krna hai to hmne usko array m store krna h
  //agr ek photo krani hoti toh simple string hta 
  photos: [String],
  title: String,
  price: Number,
  description: String,
  category: String,
  location: String,
  condition: String,
  quantity: Number,
  // image: String
  seller:{
    name: String,
    email: String,
    phone: String,
    // image: String
  }
 
});

module.exports = mongoose.model("Products", productSchema);