import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import BuyNowModal from "../Components/BuyNowModal"; // ✅ import karo
import { API_URL } from "../config"; // ✅ centralized URL

const ViewDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [seller, setSeller] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false); // ✅ buy modal state

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.photos?.[0] || null);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-xl">
        ❌ {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const getImageUrl = (photo) => {
    if (!photo) return "";
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    return `${API_URL}/uploads/${photo}`;
  };

  function handleSeller() {
    const user = localStorage.getItem("username");
    if (!user) {
      alert("Please login to contact the seller.");
    } else {
      fetch(`${API_URL}/sellers/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Seller details not found");
          return res.json();
        })
        .then((data) => {
          setSeller(data);
          setShowCard(true);
        })
        .catch((error) => alert(error.message));
    }
  }

  // ✅ Buy Now — login check karo pehle
  function handleBuyNow() {
    const user = localStorage.getItem("username");
    if (!user) {
      alert("Please login to place an order.");
      return;
    }
    setShowBuyModal(true);
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-[50%] mx-auto bg-white shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-6">

          <div className="md:w-[90%] flex flex-col justify-between">
            <div>
              {/* Main Image */}
              <img
                src={getImageUrl(selectedImage)}
                alt={product.title}
                className="w-full h-80 object-contain rounded-lg"
              />

              {/* Thumbnail Images */}
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {product.photos?.map((photo, index) => (
                  <img
                    key={index}
                    src={getImageUrl(photo)}
                    alt={`${product.title} ${index + 1}`}
                    onClick={() => setSelectedImage(photo)}
                    className={`w-20 h-20 object-contain rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                      selectedImage === photo ? "border-blue-600" : "border-gray-200"
                    }`}
                  />
                ))}
              </div>

              <h1 className="text-3xl font-bold mt-4">{product.title}</h1>
              <p className="text-gray-500 mt-2">Category: {product.category}</p>
              <p className="text-2xl text-blue-600 font-bold mt-4">₹{product.price}</p>
              <p className="mt-4 text-gray-700">
                {product.description || "No description available for this product."}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSeller}
                className="border text-blue-600 px-5 py-2 rounded-lg w-[120%]"
              >
                Contact Seller
              </button>

              {/* ✅ Buy Now button — ab modal open karega */}
              <button
                onClick={handleBuyNow}
                className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg w-full hover:bg-blue-600 hover:text-white transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Card */}
      {showCard && seller && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[350px] border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Seller Details</h2>
              <button
                onClick={() => setShowCard(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                {seller.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{seller.name}</p>
                <p className="text-gray-400 text-sm">Seller</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <span>📧</span>
                <span>{seller.email}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <span>📞</span>
                <span>{seller.phone}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCard(false)}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Buy Now Modal */}
      {showBuyModal && (
        <BuyNowModal
          product={product}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
};

export default ViewDetails;
