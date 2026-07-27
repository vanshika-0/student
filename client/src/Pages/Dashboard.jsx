import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { FaBook, FaLaptop, FaCouch, FaTshirt } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) return; // logged out user ke liye recommendations skip

    const fetchRecommendations = async () => {
      try {
        setLoadingRecs(true);
        const res = await fetch(`${API_URL}/recommendations/${userEmail}`);
        const data = await res.json();
        if (res.ok) {
          setRecommendations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Recommendation fetch error:", err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [userEmail]);

  return (
    <div>
      <Navbar />

      <div className="row1 flex items-center justify-between px-[4%] py-[2%]">
        {/* LEFT CONTENT */}
        <div className="col1 w-1/2 my-10">
          <h1 className="text-4xl font-bold mb-2">Buy. Sell. Swap</h1>

          <h1 className="text-3xl font-semibold text-blue-700 mb-4">
            All With Students
          </h1>

          <p className="text-gray-700 leading-relaxed mb-10">
            Student-Market-place is a smart and student-friendly marketplace
            platform designed to help students exchange products easily within
            their college community. The project allows users to buy second-hand
            items, sell unused products, or swap essentials like books, gadgets,
            notes, stationery, and accessories with other students at affordable
            prices. It creates a trusted environment where students can connect
            directly, save money, reduce waste, and make better use of
            resources. The platform focuses on simplicity, secure user
            interaction, and a smooth experience, making campus trading faster,
            easier, and more convenient for students.
          </p>

          <button
            onClick={() => navigate("/Addproduct")}
            className="p-[1%] bg-blue-400 w-full border rounded-full text-white hover:text-blue-500 hover:bg-white whitespace-nowrap"
          >
            Add Product
          </button>
        </div>

        {/* RIGHT IMAGE */}
        <div className="col2 w-1/2 flex justify-center">
          <img src="/boy.png" alt="boy" className="w-[80%] object-contain" />
        </div>
      </div>

      {/* ✅ Recommendations section */}
      {userEmail && (
        <div className="px-[4%] py-[2%]">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Recommended For You
          </h2>

          {loadingRecs ? (
            <p className="text-gray-500">Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p className="text-gray-500">
              Kuch products search karo, fir hum tumhare liye recommendations dikhayenge.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {recommendations.map((item) => (
                <Link
                  to={`/products/${item._id}`}
                  key={item._id}
                  className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
                >
                  {item.photos?.[0] && (
                    <img
                      src={`${API_URL}/uploads/${item.photos[0]}`}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  <p className="font-bold mt-2">{item.title}</p>
                  <p className="text-purple-600 font-semibold">₹{item.price}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;