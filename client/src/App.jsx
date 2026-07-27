import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HowitWork from "./Pages/HowitWork";
import Dashboard from "./Pages/Dashboard";
import AboutUs from "./Pages/AboutUs";
import Browse from "./Pages/Browse";
import ViewDetails from "./Pages/ViewDetails";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Cart from "./Pages/Cart";

import Otpverify from "./Pages/Otpverify";
import Sellerproducts from "./Pages/Sellerproducts";

import TrackOrder from "./Pages/TrackOrder";
import MyOrders from "./Pages/MyOrders";
import SellerOrders from "./Pages/SellerOrders";

import Addproduct from "./Pages/Addproduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/HowitWork" element={<HowitWork />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/Browse" element={<Browse />} />
        <Route path="/products/:id" element={<ViewDetails />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Addproduct" element={<Addproduct />} />
        <Route path="/Aboutus" element={<AboutUs />} />
        <Route path="/Work" element={<HowitWork />} />
        <Route path="/Otpverify" element={<Otpverify />} />
        <Route path="/Sellerproducts" element={<Sellerproducts />} />
        
        <Route path="/TrackOrder" element={<TrackOrder />} />
        <Route path="/MyOrders" element={<MyOrders />} />
        <Route path="/SellerOrders" element={<SellerOrders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
