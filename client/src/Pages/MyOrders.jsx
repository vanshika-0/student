import { useState, useEffect } from "react";
import { API_URL } from "../config";
import Navbar from "../Components/Navbar";


//jo mene order kie h vo products yha show hnge
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail");

  // ✅ fetchOrders useEffect ke bahar define karo
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/buyer-orders/${email}`);
      const data = await res.json();
      const delivered = data.filter(o => o.status === "delivered");
      setOrders(delivered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 My Orders</h1>
        <p className="text-gray-500 mb-8">Ye sare products tujhe successfully deliver ho gaye hain!</p>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg">Abhi koi completed order nahi hai.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4 items-center"
              >
                {order.productPhoto && (
                  <img
                    src={`${API_URL}/uploads/${order.productPhoto}`}
                    alt={order.productTitle}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-bold text-gray-800 text-lg">{order.productTitle}</h2>
                  <p className="text-purple-600 font-semibold">₹{order.productPrice}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Delivered on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                  <p className="text-gray-500 text-sm">Seller: {order.sellerName}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-green-100 text-green-600 text-sm font-semibold px-3 py-1 rounded-full">
                    ✅ Delivered
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
