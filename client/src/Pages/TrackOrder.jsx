import { useState, useEffect } from "react";
import { API_URL } from "../config";
import Navbar from "../Components/Navbar";

const STATUS_STEPS = ["pending", "accepted", "packed", "dispatched", "payment_claimed", "payment_confirmed", "delivered"];

const STATUS_INFO = {
  pending:            { label: "Order Placed",     icon: "🕐", color: "text-yellow-500",  bg: "bg-yellow-50"  },
  accepted:           { label: "Confirm Amount",    icon: "⏳", color: "text-indigo-500",  bg: "bg-indigo-50"  },
  cancelled_by_buyer: { label: "Cancelled",         icon: "🚫", color: "text-red-500",     bg: "bg-red-50"     },
  packed:             { label: "Packed",            icon: "📦", color: "text-orange-500",  bg: "bg-orange-50"  },
  dispatched:         { label: "Dispatched",        icon: "🚚", color: "text-purple-500",  bg: "bg-purple-50"  },
  payment_claimed:    { label: "Payment Claimed",   icon: "💸", color: "text-amber-500",   bg: "bg-amber-50"   },
  payment_confirmed:  { label: "Payment Confirmed", icon: "💰", color: "text-emerald-500", bg: "bg-emerald-50" },
  delivered:          { label: "Delivered",         icon: "🎉", color: "text-green-500",   bg: "bg-green-50"   },
  rejected:           { label: "Rejected",          icon: "❌", color: "text-red-500",     bg: "bg-red-50"     },
};

const ENDED_STATUSES = ["delivered", "rejected", "cancelled_by_buyer"];

export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState({});
  const [otpMsg, setOtpMsg] = useState({});
  const [actionMsg, setActionMsg] = useState({});
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/buyer-orders/${email}`);
      const data = await res.json();
      const active = data.filter(o => !ENDED_STATUSES.includes(o.status));
      setOrders(active);
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

 const handleOTPSubmit = async (orderId) => {
  const otp = otpInput[orderId];

  if (!otp || otp.length !== 6) {
    setOtpMsg({
      ...otpMsg,
      [orderId]: "OTP should be of 6 digit!",
    });
    return;
  }

  try {
    const res = await fetch(`${API_URL}/order-verify-otp/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Order ko turant remove nahi karna — pehle status update karo
      // taaki progress bar "delivered" tak animate ho jaye aur message dikhe
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "delivered" } : order
        )
      );

      setOtpMsg({
        ...otpMsg,
        [orderId]: "Order Delivered Successfully!",
      });

      // backend se fresh list — ab delivered order khud filter ho jayega
      setTimeout(() => {
        fetchOrders();
      }, 3000);
    } else {
      setOtpMsg({
        ...otpMsg,
        [orderId]: data.message,
      });
    }
  } catch (err) {
    setOtpMsg({
      ...otpMsg,
      [orderId]: "Server error!",err
    });
  }
};
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Track Orders</h1>
        <p className="text-gray-500 mb-8">All your active orders are shown below.</p>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">Koi active order nahi hai abhi.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const info = STATUS_INFO[order.status] || STATUS_INFO.pending;
              const currentStep = STATUS_STEPS.indexOf(order.status);

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                  {/* Product Info */}
                  <div className="flex gap-4 items-start mb-5">
                    {order.productPhoto && (
                      <img
                        src={`${API_URL}/uploads/${order.productPhoto}`}
                        alt={order.productTitle}
                        className="w-16 h-16 object-cover rounded-xl border border-gray-100"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="font-bold text-gray-800 text-lg">{order.productTitle}</h2>
                      <p className="text-purple-600 font-semibold">₹{order.productPrice}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                    {/* Status Badge */}
                    <span className={`${info.bg} ${info.color} px-3 py-1 rounded-full text-sm font-semibold`}>
                      {info.icon} {info.label}
                    </span>
                  </div>

                  {/* Action Message */}
                  {actionMsg[order._id] && (
                    <p className="text-purple-600 text-sm font-medium mb-3">{actionMsg[order._id]}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex justify-between mb-2">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                            ${i <= currentStep ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                            {i < currentStep ? "✓" : i + 1}
                          </div>
                          <span className={`text-[10px] mt-1 text-center ${i <= currentStep ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                            {STATUS_INFO[step].label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Line */}
                    <div className="relative flex items-center -mt-9 mb-4 px-4">
                      <div className="w-full h-1 bg-gray-200 rounded">
                        <div
                          className="h-1 bg-purple-600 rounded transition-all duration-500"
                          style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ACCEPTED — Confirm/Cancel total amount */}
                  {order.status === "accepted" && (
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="font-semibold text-indigo-700 mb-2">💰 Total Amount Confirm Karo</p>
                      <p className="text-sm text-gray-700">Product Price: ₹{order.productPrice}</p>
                      <p className="text-sm text-gray-700">Delivery Charge: ₹{order.deliveryCharge}</p>
                      <p className="text-base font-bold text-gray-800 mt-1">Total: ₹{order.totalAmount}</p>
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => doAction(`${API_URL}/order-confirm/${order._id}`, "PATCH", null, order._id, "✅ Confirmed! Seller ab order pack karega.")}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => doAction(`${API_URL}/order-cancel/${order._id}`, "PATCH", null, order._id, "🚫 Order cancelled.")}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PACKED */}
                  {order.status === "packed" && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <p className="text-orange-700 font-semibold">📦 Seller aapka order pack kar raha hai</p>
                      <p className="text-sm text-gray-600 mt-1">Total: ₹{order.totalAmount}</p>
                    </div>
                  )}

                  {/* DISPATCHED — show paytm number + pay button */}
                  {order.status === "dispatched" && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="font-semibold text-purple-700 mb-2">🚚 Delivery Details</p>
                      <p className="text-sm text-gray-700"><b>Courier:</b> {order.courierName}</p>
                      <p className="text-sm text-gray-700"><b>Tracking ID:</b> {order.trackingId}</p>
                      <p className="text-sm text-gray-700"><b>Estimated Delivery:</b> {order.estimatedDelivery}</p>

                      <div className="mt-4 bg-white rounded-xl p-4 border border-purple-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">💰 Payment Karo</p>
                        <p className="text-sm text-gray-600">Seller ke Paytm number par pay karein:</p>
                        <p className="text-lg font-bold text-purple-700 mt-1">📱 {order.sellerPaytmNumber || "Not available"}</p>
                        <p className="text-base font-semibold text-gray-800 mt-1">Total Amount: ₹{order.totalAmount}</p>
                        <button
                          onClick={() => doAction(`${API_URL}/order-payment-claim/${order._id}`, "PATCH", null, order._id, "💸 Seller ko bata diya gaya hai. Wo confirm karega.")}
                          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl text-sm transition"
                        >
                          ✅ Maine Pay Kar Diya
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PAYMENT CLAIMED — waiting for seller confirmation */}
                  {order.status === "payment_claimed" && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-amber-700 font-semibold">⏳ Seller payment confirm karega</p>
                      <p className="text-sm text-gray-600 mt-1">Aapne payment ka bata diya hai. Seller confirm karega, fir aap OTP verify kar payenge.</p>
                    </div>
                  )}

                  {/* PAYMENT CONFIRMED — OTP verify */}
                  {order.status === "payment_confirmed" && (
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="font-semibold text-emerald-700 mb-2">💰 Seller ne payment confirm kar diya hai!</p>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">🔐 Delivery OTP enter karo:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit OTP"
                            value={otpInput[order._id] || ""}
                            onChange={(e) => setOtpInput({ ...otpInput, [order._id]: e.target.value })}
                            className="border border-emerald-300 rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <button
                            onClick={() => handleOTPSubmit(order._id)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700"
                          >
                            Verify
                          </button>
                        </div>
                        {otpMsg[order._id] && (
                          <p className="text-sm mt-2 text-emerald-700">{otpMsg[order._id]}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DELIVERED — success confirmation */}
{order.status === "delivered" && (
  <div className="bg-green-50 rounded-xl p-4">
    <p className="text-green-700 font-semibold">
      🎉 {otpMsg[order._id] || "Order Delivered Successfully!"}
    </p>
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
