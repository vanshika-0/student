import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail");

  //jb bhi cart items m kch bhi chnge aaega tb run hoga
  useEffect(() => {
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0,
    );

    setTotal(totalAmount);
  }, [cartItems]);

  useEffect(() => {
    console.log(userEmail);
    // ✅ Login check - render se pehle hi rok do
    if (!userEmail) {
      alert("Please login to view Cart!");
      navigate("/Login");
      return null; // kuch bhi render mat karo
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`${API_URL}/cart-items/${userEmail}`,
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
          alert(data.message || "error while fetching cart items");
          return;
        }

        setCartItems(data);
      } catch (error) {
        console.error(error);
        alert("server error!while fetching cart items!");
      }
    };

    fetchCart();
  }, []);

  // Delete item
  async function handleRemove(productId) {
    try {
      const response = await fetch(`${API_URL}/remove-from-cart/${productId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        alert("Error removing item from cart");
        return;
      }
      const data = await response.json();
      alert(data.message);
      setCartItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Error removing item from cart:", err);
      alert("Error removing item from cart. Please try again.");
    }
  }

  // Decrease quantity
  async function handleDecrease(productId) {
    try {
      const response = await fetch(`${API_URL}/decrease-quan/${productId}`,
        { method: "PATCH" },
      );
      if (!response.ok) {
        alert("Error decreasing quantity");
        return;
      }
      const data = await response.json();
      alert(data.message);
      setCartItems((prev) =>
        prev
          .map((item) =>
            item._id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <Navbar />

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-6 p-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
            >
              {item.photos?.[0] && (
                <img
                  src={`http://localhost:5000/uploads/${item.photos[0]}`}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <p className="font-bold text-lg mt-2">{item.title}</p>
              <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
              <p className="text-gray-500 text-sm">
                Price: ₹{item.price?.toFixed(2) ?? "N/A"}
              </p>

               <div className="grid grid-cols-3 gap-2 mt-3">

            
  <button
    onClick={() => handleRemove(item._id)}
    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700"
  >
    Remove Item
  </button>

  <button
    onClick={() => handleDecrease(item._id)}
    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700"
  >
    -
  </button>

  <Link
    to={`/products/${item.productId}`}
    className="flex-1"
  >
    <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700">
      View Details
    </button>
  </Link>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-4">No cart items</p>
      )}
      


      {/* //finding total amiount */}
      <div className="flex p-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-80 ">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Order Summary
          </h2>

          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Items</span>
            <span>{cartItems.length}</span>
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total Amount</span>

              <span className="text-2xl font-bold text-blue-600">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
