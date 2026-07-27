import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { API_URL } from "../config";


//jo seller ne product bechne ke lie rkhe hue h or unpe order agya toh vo order wale idhr show hnge 
const Sellerproducts = () => {
  const [products, setproducts] = useState([]);

  useEffect(() => {
  const getsellerproducts = async () => {  // ✅ ab try ke bahar define hua — scope sahi hai
    try {
      const email = localStorage.getItem("userEmail");
      console.log(email);
      if (!email) {
        return;
      }

      const response = await fetch(`${API_URL}/${email}`, // ✅ space hata kar "/" lagaya
      );


if (response.status === 404) {
  setproducts([]); // ✅ explicitly empty rakho, koi error nahi
  return;
}


      if (!response.ok) {
        console.error("failed to fetch seller products");
        return;
      }

      const data = await response.json();
      setproducts(data);
    } catch (error) {
      console.error("Error fetching seller products:", error);
    }
  };

  getsellerproducts(); // ✅ ab yeh function scope mein hai, koi red line nahi
}, []);
  

  async function addToCart(product) {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please login to add products to cart");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          productId: product._id,
          photos: product.photos,
          title: product.title,
          price: product.price,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.message || "Server error while adding to cart");
        return;
      }

      alert("Added to Cart " + result.message);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Something went wrong while adding to cart");
    }
  }

  return (
    
    <div>
<Navbar/>
      {/* PRODUCTS */}
      <div className="grid grid-cols-3 gap-6">
        {products.map((item) => (
          <div
            key={item._id}
            className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
          >
            <img
              src={`http://localhost:5000/uploads/${item.photos?.[0]}`} // ✅ optional chaining
              alt={item.title}
              className="w-full h-48 object-contain rounded-lg"
            />
            <h2 className="font-bold text-lg mt-2">{item.title}</h2>
            <p className="text-gray-500 text-sm">{item.category}</p>
            <p className="text-blue-600 font-semibold mt-1">₹{item.price}</p>

            <Link to={`/products/${item._id}`}>
              <button className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700">
                View Details
              </button>
            </Link>

            <button
              onClick={() => addToCart(item)}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sellerproducts;
