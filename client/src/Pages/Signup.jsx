import React from "react";
import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate= useNavigate();
   const [User, setUser] = useState({
         username:"",
         email: "",
         password:"",

   });

   async function handleSubmit(e){
     e.preventDefault();
     try{
        const response = await fetch("http://localhost:5000/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(User),
      });

     if(!response.ok){
      //convert response into json

  const errorData = await response.json();

  console.log(errorData.message);

  alert(errorData.message);

  return;
}

      
      navigate("/Otpverify",{state:{email:User.email}})  //ye email ko otpverify page m bhej rha hai});
      


    }catch(error){
      //catch jb run jb server ne respone hi nhi bhja toh error aaega--server crash
        alert("Server error",error);
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
          onSubmit={handleSubmit}
          
        >
          <h1 className="mb-10 text-[180%] font-bold pt-5">SignUp Page</h1>

          <label className="text-lg text-left mb-1" htmlFor="">
            User Name
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={User.username}
            onChange={(e) => {
              setUser({ ...User, username: e.target.value });
            }}
            className="w-full mb-5 p-2 border rounded"
            required
          />

        
          
            <label className="text-lg text-left mb-1" htmlFor="">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={User.email}
            onChange={(e) => {
              setUser({ ...User, email: e.target.value });
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
            value={User.password}
            onChange={(e) => {
              setUser({ ...User, password: e.target.value });
            }}
            className="w-full mb-5 p-2 border rounded"
            required
          />

          <button
            type="submit"
            className="p-[2%] bg-blue-400 w-full border rounded-full text-white hover:text-blue-500 hover:bg-white "
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}


export default Signup
