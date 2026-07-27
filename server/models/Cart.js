const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    
  userEmail: String,
  productId: String,
  quantity: { type: Number, default: 1 },
  photos:[String],
  title: String,
  price: Number
  
});

module.exports = mongoose.model("Cart", CartSchema);