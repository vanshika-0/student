import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const Browse = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState(10000);
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  // const [recommendations, setRecommendations] = useState([]); // ✅ array

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err)); // ✅
  }, []);

  // Browse.jsx ke top pe (component ke andar ya bahar) add karo
  const getImageUrl = (photo) => {
    if (!photo) return "";
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo; // already full URL (e.g. picsum links)
    }
    return `${API_URL}/uploads/${photo}`; // local uploaded file
  };

  // 🔥 FILTER LOGIC (search + price + category)
  const filteredProducts = products.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchPrice = item.price <= Number(price);
    const matchCategory = category
      ? item.category.toLowerCase() === category.toLowerCase() // ✅ case-insensitive
      : true;
    const matchCondition = condition ? item.condition === condition : true;

    return matchSearch && matchPrice && matchCategory && matchCondition;
  });

  // ✅ Recommendations — fixed key, endpoint, response shape
  // useEffect(() => {
  //   const getRecommendations = async () => {
  //     const email = localStorage.getItem("userEmail"); // ✅ "userEmail" — same key everywhere
  //     if (!email) return;

  //     try {
  //       const response = await fetch(
  //         `http://localhost:5000/recommendations/${email}`, // ✅ correct path
  //       );

  //       if (!response.ok) {
  //         console.error("Failed to fetch recommendations");
  //         return;
  //       }

  //       const data = await response.json();
  //       setRecommendations(data); // ✅ backend array bhejta hai directly
  //     } catch (err) {
  //       console.error("Error fetching recommendations:", err);
  //     }
  //   };

  //   getRecommendations();
  // }, []);

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

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    setDebounceValue(value);
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (
        userEmail &&
        debounceValue.trim() !== "" &&
        debounceValue.length >= 3
      ) {
        try {
          await fetch(`${API_URL}/save-search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              searchText: debounceValue.toLowerCase(),
            }),
          });
        } catch (err) {
          console.error("Error saving search:", err);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [debounceValue]);

  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-1/4 bg-white p-5 shadow-md">
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          <p className="font-semibold mb-3">Category</p>
          <select
            className="appearance-none w-full mb-5 p-2 border rounded cursor-pointer"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="">All</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Stationery">Stationery</option>
            <option value="Notes">Notes</option>
            <option value="Sports">Sports</option>
            <option value="Furniture">Furniture</option>
            <option value="Accessories">Accessories</option>
            <option value="Clothes">Clothes</option>
          </select>

          <p className="font-semibold">Price Range</p>
          <input
            type="range"
            min="0"
            max="10000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <p>Price: ₹{price}</p>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Browse Products</h1>
            <input
              type="text"
              placeholder="Search..."
              className="border p-2 rounded-lg w-1/3"
              onChange={handleSearch}
              value={search}
            />
          </div>

          {/* PRODUCTS */}
          <div className="grid grid-cols-3 gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition"
              >
               <img
  src={getImageUrl(item.photos?.[0])}
  alt={item.title}
  className="w-full h-48 object-contain rounded-lg"
/>
                <h2 className="font-bold text-lg mt-2">{item.title}</h2>
                <p className="text-gray-500 text-sm">{item.category}</p>
                <p className="text-blue-600 font-semibold mt-1">
                  ₹{item.price}
                </p>

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

       
          {/* {recommendations.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-8 mb-4">
                Recommended for You
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {recommendations.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white p-3 rounded-xl shadow hover:shadow-lg transition" */}
                  {/* >
                    <img
                      src={getImageUrl(item.photos?.[0])}
                      alt={item.title}
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <h2 className="font-bold text-lg mt-2">{item.title}</h2>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                    <p className="text-blue-600 font-semibold mt-1">
                      ₹{item.price}
                    </p>

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
          //       ))} */}
          {/* //     </div>
          //   </>
          // )} */}
        </div>
      </div>
    </div>
  );
};

export default Browse;
