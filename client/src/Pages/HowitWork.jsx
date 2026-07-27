import React from "react";
import Navbar from "../Components/Navbar";
import {
  FaUserPlus,
  FaSearch,
  FaCartPlus,
  FaShoppingCart,
  FaHandshake,
  FaCamera,
  FaMagic,
  FaTags,
  FaCheckCircle,
} from "react-icons/fa";

const HowItWorks = () => {
  // 🟦 BUYER JOURNEY — product dhoondna se lekar khareedne tak
  const buyerSteps = [
    {
      icon: <FaUserPlus />,
      title: "Create Account",
      desc: "Sign up or login to access the marketplace and start exploring products.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaSearch />,
      title: "Browse Products",
      desc: "Search and filter products like books, notes, electronics easily.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaCartPlus />,
      title: "Add to Cart",
      desc: "Like a product? Add it to your cart for quick access later.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaShoppingCart />,
      title: "Manage Cart",
      desc: "Update quantity, remove items, and manage your selections.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaHandshake />,
      title: "Connect & Buy",
      desc: "Contact the seller, meet up, and complete your purchase smoothly.",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  // 🟩 SELLER JOURNEY — product list karna, AI ka use, aur sell mark karna
  const sellerSteps = [
    {
      icon: <FaUserPlus />,
      title: "Create Account",
      desc: "Sign up or login to start selling your unused items to fellow students.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaCamera />,
      title: "Upload Photos",
      desc: "Upload product photos — our AI instantly analyzes the image and auto-fills the title, category, and condition for you.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaMagic />,
      title: "AI-Powered Listing",
      desc: "Use 'Generate AI Description' to write a professional product description, and 'Predict Price with AI' to get a fair, student-friendly price suggestion instantly.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaTags />,
      title: "Publish Listing",
      desc: "Review your details and submit — your product goes live for buyers to discover.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaCheckCircle />,
      title: "Mark as Sold",
      desc: "Once you've met the buyer and completed the deal, mark the product as sold — the buyer gets an instant email confirmation.",
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div>
      <Navbar />

      <div className="bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-center mb-10">
          How It Works
        </h1>

        {/* 🔥 Do alag boxes — Buyer aur Seller */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">

          {/* ===== BUYER BOX ===== */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              🛒 For Buyers
            </h2>

            <div className="flex flex-col gap-5">
              {buyerSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 rounded-xl hover:bg-blue-50 transition duration-300"
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-xl ${step.color}`}
                  >
                    {step.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== SELLER BOX ===== */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
              🏪 For Sellers
            </h2>

            <div className="flex flex-col gap-5">
              {sellerSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 rounded-xl hover:bg-green-50 transition duration-300"
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-xl ${step.color}`}
                  >
                    {step.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HowItWorks; {/* ✅ typo fix kiya — "HowItWork" tha pehle, "s" missing tha */}