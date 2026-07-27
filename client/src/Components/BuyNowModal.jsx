import { useState } from "react";
import { API_URL } from "../config";

export default function BuyNowModal({ product, onClose }) {
  const buyerEmail = localStorage.getItem("email") || "";
  const buyerUsername = localStorage.getItem("username") || "";

  const [form, setForm] = useState({
    buyerName: buyerUsername,
    buyerEmail: buyerEmail,
    buyerPhone: "",
    buyerAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.buyerName || !form.buyerEmail || !form.buyerPhone || !form.buyerAddress) {
      setError("Saari fields fill karo!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          productTitle: product.title,
          productPhoto: product.photos?.[0] || "",
          productPrice: product.price,
          buyerName: form.buyerName,
          buyerEmail: form.buyerEmail,
          buyerPhone: form.buyerPhone,
          buyerAddress: form.buyerAddress,
          sellerEmail: product.seller?.email || "",
          sellerName: product.seller?.name || "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Order place nahi hua");
      }
    } catch (err) {
      setError("Server error aagya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-2">Seller ko notification bhej di gayi hai.</p>
            <p className="text-gray-500 text-sm mb-6">Track your order in <b>My Orders</b> section.</p>
            <button
              onClick={onClose}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">🛒 Place Order</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            {/* Product Info */}
            <div className="bg-purple-50 rounded-xl p-3 mb-4 flex gap-3 items-center">
              {product.photos?.[0] && (
                <img
                  src={`${API_URL}/uploads/${product.photos[0]}`}
                  alt={product.title}
                  className="w-14 h-14 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{product.title}</p>
                <p className="text-purple-600 font-bold">₹{product.price}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Your Name</label>
                <input
                  name="buyerName"
                  value={form.buyerName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <input
                  name="buyerEmail"
                  value={form.buyerEmail}
                  onChange={handleChange}
                  placeholder="College email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <input
                  name="buyerPhone"
                  value={form.buyerPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Delivery Address</label>
                <textarea
                  name="buyerAddress"
                  value={form.buyerAddress}
                  onChange={handleChange}
                  placeholder="Room no., Hostel/Block name, College campus, City"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "✅ Confirm Order"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
