const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  // Product Info
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  productPhoto: { type: String },
  productPrice: { type: Number, required: true },

  // Buyer Info
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  buyerAddress: { type: String, required: true },

  // Seller Info
  sellerEmail: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerPaytmNumber: { type: String, default: "" }, // seller enters this at dispatch time

  // Delivery Charge (seller sets when accepting the order)
  deliveryCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 }, // productPrice + deliveryCharge

  // Delivery Info (seller fills after dispatching)
  courierName: { type: String, default: "" },
  trackingId: { type: String, default: "" },
  estimatedDelivery: { type: String, default: "" },

  // Payment Info (buyer pays seller directly via Paytm)
  paymentClaimedByBuyer: { type: Boolean, default: false },   // buyer clicked "Maine Pay Kar Diya"
  paymentConfirmedBySeller: { type: Boolean, default: false }, // seller confirmed receiving it

  // OTP for delivery confirmation
  deliveryOTP: { type: String, default: "" },
  deliveryOTPExpiry: { type: Date },

  // Order Status
  // pending → accepted/rejected → packed/cancelled_by_buyer → dispatched
  // → payment_claimed → payment_confirmed → delivered
  status: {
    type: String,
    enum: [
      "pending",             // buyer placed order, waiting for seller
      "accepted",            // seller accepted + set delivery charge, waiting for buyer confirmation
      "rejected",            // seller rejected the order
      "packed",              // buyer confirmed total amount, seller preparing
      "cancelled_by_buyer",  // buyer rejected the delivery charge / total
      "dispatched",          // seller shipped it, buyer needs to pay
      "payment_claimed",     // buyer says payment done, waiting for seller confirmation
      "payment_confirmed",   // seller confirmed payment, buyer can verify OTP
      "delivered",           // OTP verified, order complete
    ],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);