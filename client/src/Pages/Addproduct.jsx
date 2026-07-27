import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useState, useEffect } from "react";
import { API_URL } from "../config";

const Addproduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    photos: [],
    title: "",
    price: "",
    description: "",
    location: "",
    category: "",
    condition: "",
    qyantity: "",
    seller: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const [analyzingImage, setAnalyzingImage] = useState(false); // ✅ loading state

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      alert("Please signup/login to add a product");
      navigate("/signup");
      return;
    }
  }, []);

  function handleSellerChange(e) {
    setProduct({
      ...product,
      seller: { ...product.seller, email: e.target.value },
    });
  }

  // ✅ helper function — photo ko base64 mein convert karta hai
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  }

  // ✅ NEW — image analyze karke title/category/condition auto-fill
  async function analyzeImage(file) {
    try {
      setAnalyzingImage(true);

      const photoBase64 = await toBase64(file);

      const response = await  fetch(`${API_URL}/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message || "Error analyzing image");
        return;
      }

      // 🔥 sirf empty fields ko hi auto-fill karo, user ka data overwrite nahi karna
      setProduct((prev) => ({
        ...prev,
        title: prev.title || data.title,
        category: prev.category || data.category,
        condition: prev.condition || data.condition,
      }));
    } catch (err) {
      console.log(err);
    } finally {
      setAnalyzingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", product.title);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("location", product.location);
    formData.append("category", product.category);
    formData.append("condition", product.condition);

    formData.append("sellerName", product.seller.name);
    formData.append("sellerPhone", product.seller.phone);
    formData.append("sellerEmail", product.seller.email);

    product.photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      const response = await  fetch(`${API_URL}/add-product`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("server error");
        return;
      }

      alert("Product Details saved successfulyy!");
      navigate("/");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  }

  async function generateDescription() {
    try {
      let photoBase64 = null;

      if (product.photos.length > 0) {
        photoBase64 = await toBase64(product.photos[0]);
      }

      const response = await  fetch(`${API_URL}/generate-description`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: product.title,
            category: product.category,
            condition: product.condition,
            price: product.price,
            location: product.location,
            quantity: product.quantity,
            photoBase64,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error generating description");
        return;
      }

      setProduct({ ...product, description: data.description });
    } catch (err) {
      console.log(err);
      alert("Error generating description");
    }
  }

  const [priceSuggestion, setPriceSuggestion] = useState(null);

  async function predictPrice() {
    try {
      if (
        !product.title ||
        !product.category ||
        !product.condition ||
        !product.quantity
      ) {
        alert("Pehle title, category,quantity aur condition fill karo");
        return;
      }

      let photoBase64 = null;
      if (product.photos.length > 0) {
        photoBase64 = await toBase64(product.photos[0]);
      }

      const response = await  fetch(`${API_URL}/predict-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          category: product.category,
          condition: product.condition,
          quantity: product.quantity,
          photoBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error predicting price");
        return;
      }

      setPriceSuggestion(data);
    } catch (err) {
      console.log(err);
      alert("Error predicting price");
    }
  }

  return (
    <div>
      <Navbar />

      <div className="flex justify-center">
        <form
          className="flex flex-col items-start w-[50%] my-1 shadow-lg px-[1%] py-[1%]"
          onSubmit={handleSubmit}
          action="submit"
        >
          <h1 className="mb-10 text-[180%] font-bold pt-5">Add details</h1>

          <label className="text-lg text-left mb-1" htmlFor="photo">
            Photo
          </label>
          <input
            type="file"
            placeholder="Select product photo"
            name="photo"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files.length == 3) {
                const filesArray = Array.from(e.target.files);

                setProduct({
                  ...product,
                  photos: filesArray,
                });

                analyzeImage(filesArray[0]); // ✅ pehli photo se auto-analyze
              } else {
                alert("please upload exactly 3 photos");
                e.target.value = "";
                return;
              }
            }}
            className="w-full mb-2 p-2 border rounded"
          />

          {/* ✅ loading indicator jab AI image analyze kar raha ho */}
          {analyzingImage && (
            <p className="text-sm text-purple-500 mb-3">
              🔍 Analyzing photo... title aur category auto-fill ho rahe hain
            </p>
          )}

          <label className="text-lg text-left mb-1" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="Enter product title"
            value={product.title}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s]*$/.test(value)) {
                setProduct({ ...product, title: value });
              }
            }}
            className="w-full mb-5 p-2 border rounded"
            required
          />

          <label className="text-lg mb-1">Category</label>
          <select
            name="category"
            className="appearance-none w-full mb-5 p-2 border rounded cursor-pointer"
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            } // ✅ sahi object spread syntax
            value={product.category} // ✅ product.category use kiya
            required
          >
            <option value="">Select category</option>{" "}
            {/* ✅ form ke lie better placeholder */}
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Stationery">Stationery</option>
            <option value="Notes">Notes</option>
            <option value="Sports">Sports</option>
            <option value="Furniture">Furniture</option>
            <option value="Accessories">Accessories</option>
            <option value="Clothes">Clothes</option>
          </select>

          <label className="text-lg mb-1">Condition</label>

<select
  name="condition"
  value={product.condition}
  onChange={(e) =>
    setProduct({ ...product, condition: e.target.value })
  }
  className="appearance-none w-full mb-5 p-2 border rounded"
>
  <option value="">Select Condition</option>
  <option value="New">New</option>
  <option value="Like New">Like New</option>
  <option value="Good">Good</option>
  <option value="Fair">Fair</option>
  <option value="Used">Used</option>
</select>

          <label className="text-lg mb-1">Location</label>
          <input
            type="text"
            name="location"
            placeholder="Enter location"
            value={product.location}
            onChange={(e) =>
              setProduct({ ...product, location: e.target.value })
            }
            className="w-full mb-5 p-2 border rounded"
          />

          <label className="text-lg mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            min="1"
            placeholder="How many items? (e.g. 3 pens in pack)"
            value={product.quantity}
            onChange={(e) =>
              setProduct({ ...product, quantity: e.target.value })
            }
            className="w-full mb-5 p-2 border rounded"
          />

          <label className="text-lg text-left mb-1">Price</label>
          <input
            type="number"
            name="price"
            placeholder="Enter product price"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
            required
          />

          <button
            type="button"
            onClick={predictPrice}
            className="mb-3 px-4 py-2 bg-purple-500 text-white rounded"
          >
            🔮 Predict Price with AI
          </button>

          {priceSuggestion && (
            <div className="w-full mb-5 p-3 border rounded bg-purple-50">
              <p className="text-sm">
                Suggested Price:{" "}
                <strong>₹{priceSuggestion.suggestedPrice}</strong> (Range: ₹
                {priceSuggestion.minPrice} – ₹{priceSuggestion.maxPrice})
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {priceSuggestion.reason}
              </p>
              <button
                type="button"
                onClick={() => {
                  setProduct({
                    ...product,
                    price: priceSuggestion.suggestedPrice,
                  });
                  setPriceSuggestion(null);
                }}
                className="mt-2 text-sm px-3 py-1 bg-blue-400 text-white rounded"
              >
                Use this price
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={generateDescription}
            className="mb-3 px-4 py-2 bg-green-500 text-white rounded"
          >
            Generate AI Description
          </button>

          <label className="text-lg text-left mb-1" htmlFor="">
            Description
          </label>

          <textarea
            name="description"
            type="text"
            placeholder="Enter description"
            value={product.description}
            onChange={(e) => {
              setProduct({ ...product, description: e.target.value });
            }}
            className="w-full mb-5 p-2 border rounded h-30"
            required
          />

          <h2 className="text-xl font-semibold mt-5 mb-3">Seller Details</h2>

          <label className="text-lg mb-1">Seller Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter seller name"
            value={product.seller.name}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-z\s]*$/.test(value)) {
                setProduct({
                  ...product,
                  seller: { ...product.seller, name: value },
                });
              }
            }}
            className="w-full mb-5 p-2 border rounded"
          />

          <label className="text-lg mb-1">Seller Phone</label>
          <input
            type="number"
            name="phone"
            placeholder="Enter phone number"
            value={product.seller.phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]*$/.test(value) && value.length <= 10) {
                setProduct({
                  ...product,
                  seller: { ...product.seller, phone: value },
                });
              }
            }}
            maxLength="10"
            className="w-full mb-5 p-2 border rounded"
          />

          <label className="text-lg mb-1">Seller Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter seller email"
            value={product.seller.email}
            onChange={handleSellerChange}
            className="w-full mb-5 p-2 border rounded"
          />

          <button
            type="submit"
            className="p-[2%] bg-blue-400 w-full border rounded-full text-white hover:text-blue-500 hover:bg-white "
          >
            Save Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addproduct;
