const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  username: String,

  email: String,

  password: String,
  OTP: String,
  OTPexpiry: Date,
  isVerified: Boolean,

  searchHistory: [String]

});

module.exports = mongoose.model("User", userSchema);