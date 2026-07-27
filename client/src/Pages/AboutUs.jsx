import React from "react";
import Navbar from "../Components/Navbar";
import { FaBullseye, FaUsers, FaRocket, FaLightbulb } from "react-icons/fa";

const AboutUs = () => {
  const sections = [
    {
      icon: <FaLightbulb />,
      title: "Our Idea",
      desc: "StudentMarket was created to help students easily buy and sell items like books, notes, and electronics within their community.",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: <FaBullseye />,
      title: "Our Mission",
      desc: "To build a simple, affordable and trusted platform where students can reuse resources and save money.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FaUsers />,
      title: "Our Community",
      desc: "We connect students directly so they can interact, negotiate and help each other without middlemen.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <FaRocket />,
      title: "Our Vision",
      desc: "To grow into a smart campus marketplace used by students across multiple universities.",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div>
      <Navbar />

      <div className="bg-gray-100 min-h-screen p-8">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-4">
          About Us
        </h1>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          StudentMarket is a student-focused marketplace where you can buy and sell items easily.
          Our goal is to simplify student life by making resources accessible and affordable.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {sections.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition duration-300 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 text-xl ${item.color}`}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold mb-2">
                {item.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Highlight Section */}
        <div className="mt-12 bg-white p-6 rounded-2xl shadow max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-3">
            Why Choose StudentMarket?
          </h2>
          <p className="text-gray-600">
            ✔ Easy to use <br />
            ✔ Affordable for students <br />
            ✔ Direct connection with sellers <br />
            ✔ Built with modern technologies
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;