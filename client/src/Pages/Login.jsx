import React from "react";
import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";

//login hne ke bdd verify hga email jaegi
const Login = () => {
  const [user, setUser] = useState({
    // username: "",
    email: "",
    password: "",
  });
  // const [login, setLogin] = useState(false);
  const navigate = useNavigate();

  async function handlesubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "server error during login!");
        return;
      }
      console.log(data.email);
      //localstorage m sirf string format m sotre hta hai toh agr kch strng na ho toh usko stringify use krke strng m comvert krna pdega or get krte tim parse krna pdega vapid string se uski originat format mai lane ke lie --parse agr get kia or null aya toh parse error de dega
      navigate("/Otpverify", { state: { email: data.email } });
      // setLogin(true);

      // localStorage.setItem("username", data.username);
      // console.log(data.username);
      // localStorage.setItem("userEmail", user.email);

    
    } catch (error) {
      console.error("Login error", error);
      return;
    }
  }

  return (
    <div>
      <Navbar />

      {/* horizonatlly and vertically center hjaega */}
      <div className="flex justify-center">
        <form
          className="flex flex-col items-start w-[50%] my-10 shadow-lg px-[5%] py-[3%]"
          onSubmit={handlesubmit}
        >
          <h1 className="mb-10 text-[180%] font-bold pt-5">Login Page</h1>

          {/* <label className="text-lg text-left mb-1" htmlFor="">
            UserName
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={user.username}
            onChange={(e) => {
              setUser({ ...user, username: e.target.value });
            }}
            className="w-full mb-5 p-2 border rounded"
            required
          /> */}

          <label className="text-lg text-left mb-1" htmlFor="">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={user.email}
            onChange={(e) => {
              setUser({ ...user, email: e.target.value });
            }}
            className="w-full mb-5 p-2 border rounded"
            required
          />

          <label className="text-lg text-left mb-1" htmlFor="">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={user.password}
            onChange={(e) => {
              setUser({ ...user, password: e.target.value });
            }}
            className="w-full mb-5 p-2 border rounded"
            required
          />

          <button
            type="submit"
            className="p-[2%] bg-blue-400 w-full border rounded-full text-white hover:text-blue-500 hover:bg-white "
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
