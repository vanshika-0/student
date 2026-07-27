import { useState, useEffect } from "react";
import { API_URL } from "../config";
import Navbar from "../Components/Navbar";

const STATUS_INFO = {
  pending:            { label: "Pending",           icon: "🕐", color: "text-yellow-600", bg: "bg-yellow-50" },
  accepted:           { label: "Waiting for Buyer",  icon: "⏳", color: "text-indigo-600", bg: "bg-indigo-50" },
  cancelled_by_buyer: { label: "Cancelled by Buyer", icon: "🚫", color: "text-red-600",    bg: "bg-red-50"    },
  packed:             { label: "Packed",             icon: "📦", color: "text-orange-600", bg: "bg-orange-50" },
  dispatched:         { label: "Dispatched",         icon: "🚚", color: "text-purple-600", bg: "bg-purple-50" },
  payment_claimed:    { label: "Payment Claimed",    icon: "💸", color: "text-amber-600",  bg: "bg-amber-50"  },
  payment_confirmed:  { label: "Payment Confirmed",  icon: "💰", color: "text-emerald-600",bg: "bg-emerald-50"},
  delivered:          { label: "Delivered",          icon: "🎉", color: "text-green-600",  bg: "bg-green-50"  },
  rejected:           { label: "Rejected",           icon: "❌", color: "text-red-600",    bg: "bg-red-50"    },
};

const COMPLETED_STATUSES = ["delivered", "rejected", "cancelled_by_buyer"];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptForm, setAcceptForm] = useState({});     // orderId → { deliveryCharge }
  const [dispatchForm, setDispatchForm] = useState({}); // orderId → form data
  const [rejectReason, setRejectReason] = useState({}); // orderId → reason
  const [actionMsg, setActionMsg] = useState({});
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed"

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/seller-orders/${email}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (url, method, body, orderId, successMsg) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ ...actionMsg, [orderId]: successMsg });
        setTimeout(fetchOrders, 1000);
      } else {
        setActionMsg({ ...actionMsg, [orderId]: data.message || "Error hua!" });
      }
    } catch {
      setActionMsg({ ...actionMsg, [orderId]: "Server error!" });
    }
  };

  const activeOrders = orders.filter(o => !COMPLETED_STATUSES.includes(o.status));
  const completedOrders = orders.filter(o => COMPLETED_STATUSES.includes(o.status));
  const displayOrders = activeTab === "active" ? activeOrders : completedOrders;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Seller Orders</h1>
        <p className="text-gray-500 mb-6">Manage all incoming orders here.</p>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
              activeTab === "active"
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${
              activeTab === "completed"
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>

        {displayOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">Koi orders nahi hain abhi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((order) => {
              const info = STATUS_INFO[order.status] || STATUS_INFO.pending;
              const af = acceptForm[order._id] || {};
              const df = dispatchForm[order._id] || {};

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      {order.productPhoto && (
                        <img
                          src={`${API_URL}/uploads/${order.productPhoto}`}
                          alt={order.productTitle}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                        />
                      )}
                      <div>
                        <h2 className="font-bold text-gray-800">{order.productTitle}</h2>
                        <p className="text-purple-600 font-semibold">₹{order.productPrice}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`${info.bg} ${info.color} px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0`}>
                      {info.icon} {info.label}
                    </span>
                  </div>

                  {/* Buyer Details */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">👤 Buyer Details</p>
                    <p className="text-sm text-gray-700"><b>Name:</b> {order.buyerName}</p>
                    <p className="text-sm text-gray-700"><b>Email:</b> {order.buyerEmail}</p>
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <b>Phone:</b>
                      <a href={`tel:${order.buyerPhone}`} className="text-purple-600 font-semibold">
                        📞 {order.buyerPhone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-700"><b>Address:</b> {order.buyerAddress}</p>
                  </div>

                  {/* Action Message */}
                  {actionMsg[order._id] && (
                    <p className="text-purple-600 text-sm font-medium mb-3">{actionMsg[order._id]}</p>
                  )}

                  {/* PENDING → Accept (with delivery charge) / Reject */}
                  {order.status === "pending" && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">✅ Order Accept karne ke liye Delivery Charge daalo:</p>
                      <input
                        type="number"
                        placeholder="Delivery charge (₹) — e.g. 60"
                        value={af.deliveryCharge || ""}
                        onChange={(e) => setAcceptForm({ ...acceptForm, [order._id]: { ...af, deliveryCharge: e.target.value } })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (af.deliveryCharge === undefined || af.deliveryCharge === "" || af.deliveryCharge < 0) {
                              setActionMsg({ ...actionMsg, [order._id]: "Delivery charge daalna zaroori hai!" });
                              return;
                            }
                            doAction(
                              `${API_URL}/order-accept/${order._id}`, "PATCH",
                              { deliveryCharge: af.deliveryCharge },
                              order._id, "✅ Order accepted! Buyer ko confirm email gaya."
                            );
                          }}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          ✅ Accept Order
                        </button>
                        <button
                          onClick={() => doAction(`${API_URL}/order-reject/${order._id}`, "PATCH", { reason: rejectReason[order._id] || "" }, order._id, "❌ Order rejected.")}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          ❌ Reject Order
                        </button>
                      </div>
                      <input
                        placeholder="Rejection reason (optional)"
                        value={rejectReason[order._id] || ""}
                        onChange={(e) => setRejectReason({ ...rejectReason, [order._id]: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                    </div>
                  )}

                  {/* ACCEPTED → waiting for buyer to confirm total amount */}
                  {order.status === "accepted" && (
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-indigo-700 font-semibold">⏳ Buyer ke confirmation ka wait hai</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Amount: ₹{order.totalAmount} (Product ₹{order.productPrice} + Delivery ₹{order.deliveryCharge})
                      </p>
                      <p className="text-sm text-gray-600">Buyer ko email gaya hai — accept/reject karega Track Order page se.</p>
                    </div>
                  )}

                  {/* CANCELLED BY BUYER */}
                  {order.status === "cancelled_by_buyer" && (
                    <div className="bg-red-50 rounded-xl p-4">
                      <p className="text-red-600 font-semibold">🚫 Buyer ne total amount accept nahi kiya</p>
                      <p className="text-sm text-gray-600 mt-1">Order yahin cancel ho gaya hai.</p>
                    </div>
                  )}

                  {/* PACKED → Add Dispatch Details (incl. Paytm number) */}
                  {order.status === "packed" && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">🚚 Add Dispatch Details:</p>
                      <input
                        placeholder="Courier name (e.g. India Post, Delhivery)"
                        value={df.courierName || ""}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, [order._id]: { ...df, courierName: e.target.value } })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <input
                        placeholder="Tracking ID"
                        value={df.trackingId || ""}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, [order._id]: { ...df, trackingId: e.target.value } })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <input
                        placeholder="Estimated delivery date (e.g. 25 Jan 2025)"
                        value={df.estimatedDelivery || ""}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, [order._id]: { ...df, estimatedDelivery: e.target.value } })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <input
                        placeholder="Apna Paytm number (buyer isi par pay karega)"
                        maxLength={10}
                        value={df.sellerPaytmNumber || ""}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, [order._id]: { ...df, sellerPaytmNumber: e.target.value } })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={() => {
                          if (!df.courierName || !df.trackingId || !df.estimatedDelivery || !df.sellerPaytmNumber) {
                            setActionMsg({ ...actionMsg, [order._id]: "Saari fields fill karo (Paytm number bhi)!" });
                            return;
                         
                          }
                          doAction(`${API_URL}/order-dispatch/${order._id}`, "PATCH", df, order._id, "🚚 Dispatched! Buyer ko email gaya.");
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-xl text-sm transition"
                      >
                        🚀 Dispatch Order
                      </button>
                    </div>
                  )}

                  {/* DISPATCHED — waiting for buyer payment */}
                  {order.status === "dispatched" && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-purple-700 font-semibold">⏳ Buyer Paytm se payment karega</p>
                      <p className="text-sm text-gray-600 mt-1">Total: ₹{order.totalAmount} — buyer ko aapka Paytm number ({order.sellerPaytmNumber}) bhej diya gaya hai.</p>
                    </div>
                  )}

                  {/* PAYMENT CLAIMED → seller confirm kare */}
                  {order.status === "payment_claimed" && (
                    <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                      <p className="text-amber-700 font-semibold">💸 Buyer ne bola hai payment ho gayi hai!</p>
                      <p className="text-sm text-gray-600">Apna Paytm check karo. Amount ₹{order.totalAmount} aaya ho toh confirm karo.</p>
                      <button
                        onClick={() => doAction(`${API_URL}/order-payment-confirm/${order._id}`, "PATCH", null, order._id, "💰 Payment confirmed! Buyer ab OTP verify karega.")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl text-sm transition"
                      >
                        ✅ Payment Mil Gayi — Confirm Karo
                      </button>
                    </div>
                  )}

                  {/* PAYMENT CONFIRMED — waiting for OTP */}
                  {order.status === "payment_confirmed" && (
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-emerald-700 font-semibold">💰 Payment confirm ho gayi hai!</p>
                      <p className="text-sm text-gray-600 mt-1">Buyer ab OTP verify karega delivery ke time — tab status Delivered ho jayega.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
