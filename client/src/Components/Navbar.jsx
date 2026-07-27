import React, { useState, useEffect, useRef } from "react";
import { FaBagShopping, FaUser } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = () => {

      const loggedIn = localStorage.getItem("isLoggedIn");
      console.log(loggedIn);
      setIsLoggedIn(loggedIn);
      const storedUser = localStorage.getItem("username");
      setUsername(loggedIn ? storedUser : null);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("userEmail");
     localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setUsername(null);
    setShowDropdown(false);
    alert("Logout successful!");
    navigate("/Login");
  }

  function handleCart() {
    const useremail = localStorage.getItem("userEmail");
    if (!useremail) {
      alert("Please login to view Cart!");
      return;
    }
    navigate("/Cart");
  }

  return (
    <div className="flex gap-21 px-[4%] py-[1%] items-center">
      <div className="flex items-center font-bold text-lg">
        <FaBagShopping className="text-3xl mr-2" />
        Student<span className="text-blue-500">Market</span>
      </div>

      <ul className="flex gap-20 list-none p-[1%]">
        <li><Link className="hover:text-blue-500" to="/">Home</Link></li>
        <li><Link className="hover:text-blue-500" to="/Work">How It Works</Link></li>
        <li><Link className="hover:text-blue-500" to="/AboutUs">About Us</Link></li>
        <li><Link className="hover:text-blue-500" to="/Browse">Browse</Link></li>
      </ul>

      <div className="flex gap-4 w-[35%] items-center">
        {username && isLoggedIn ? (
          <div className="relative w-full" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 w-full border rounded-full text-white hover:bg-blue-600 justify-center"
            >
              <FaUser />
              <span className="truncate max w-[120%]">{username}</span>
              <span className="text-xs">{showDropdown ? "▲" : "▼"}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-5">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{username}</p>
                    <p className="text-gray-400 text-sm">Student</p>
                  </div>
                </div>

                {/* Menu Links */}
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">

                  <button
                    onClick={() => { navigate("/TrackOrder"); setShowDropdown(false); }}
                    className="w-full py-2 text-left px-3 rounded-xl hover:bg-blue-50 text-gray-700 text-sm font-medium flex items-center gap-2"
                  >
                    🚚 Track Order
                  </button>

                  <button
                    onClick={() => { navigate("/MyOrders"); setShowDropdown(false); }}
                    className="w-full py-2 text-left px-3 rounded-xl hover:bg-blue-50 text-gray-700 text-sm font-medium flex items-center gap-2"
                  >
                    🎉 My Orders
                  </button>

                  <button
                    onClick={() => { navigate("/SellerOrders"); setShowDropdown(false); }}
                    className="w-full py-2 text-left px-3 rounded-xl hover:bg-green-50 text-gray-700 text-sm font-medium flex items-center gap-2"
                  >
                    📋 Seller Orders
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-500 text-white rounded-full hover:bg-red-600 font-semibold mt-1"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/Login")}
              className="p-[1%] bg-blue-400 w-full border rounded-full text-white hover:text-blue-500 hover:bg-white"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/Signup")}
              className="p-[1%] bg-green-400 w-full border rounded-full text-white hover:text-green-500 hover:bg-white"
            >
              SignUp
            </button>
          </>
        )}

        <button
          onClick={handleCart}
          className="p-[1%] bg-blue-400 w-full border rounded-full text-white hover:text-blue-500 hover:bg-white whitespace-nowrap"
        >
          View Cart
        </button>

        <button
          onClick={() => navigate("/Sellerproducts")}
          className="p-[1%] bg-green-400 w-full border rounded-full text-white hover:text-green-500 hover:bg-white"
        >
          Your Products
        </button>
      </div>
    </div>
  );
};

export default Navbar;
