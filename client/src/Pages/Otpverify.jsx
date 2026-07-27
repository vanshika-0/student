import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

const OtpVerify = () => {

  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(60);
  const [verifyotp, setVerifyOtp] = useState(true);


  const email = location.state?.email;


  // page reload ke baad timer continue hoga
  useEffect(() => {

    const savedTime = localStorage.getItem("otpTime");

    if (savedTime) {

      const remaining = Math.floor(
        (Number(savedTime) - Date.now()) / 1000
      );

      if (remaining > 0) {
        setTimeLeft(remaining);
      }
      else {
        localStorage.removeItem("otpTime");
      }
    }

  }, []);


  // countdown timer
  useEffect(() => {

    if (timeLeft <= 0) return;

    const interval = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {
          localStorage.removeItem("otpTime");
          return 0;
        }

        return prev - 1;

      });

    },1000);


    return () => clearInterval(interval);

  },[timeLeft]);



  async function handleVerify(e){

    e.preventDefault();

    try{

      const response = await fetch(
        "http://localhost:5000/verify-otp",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({
            email,
            otp
          })
        }
      );


      const data = await response.json();


      if(!response.ok){

        alert(data.message || "Invalid OTP");
        setVerifyOtp(false);
        return;

      }


      alert("OTP Verified Successfully!");

      localStorage.removeItem("otpTime");

      navigate("/")


    }
    catch(error){

      console.log(error);
      alert("Server Error");

    }

  }



  async function handleResend(){

    try{

      const response = await fetch(
        "http://localhost:5000/resend-otp",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({
            email
          })
        }
      );


      const data = await response.json();


      if(!response.ok){

        alert(data.message);
        return;

      }


      // 2 min timer save
      const expiryTime = Date.now() + 120 * 1000;

      localStorage.setItem(
        "otpTime",
        expiryTime
      );


      setTimeLeft(120);


      alert("OTP resent successfully!");

    }
    catch(error){

      console.log(error);
      alert("Server error while resending OTP");

    }

  }



return (
<div>
    <Navbar/>
<div className="py-[140px] flex items-center justify-center bg-gray-100 px-4">
   
<div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">


<h2 className="text-3xl font-bold text-center mb-2">
Verify OTP
</h2>


<p className="text-gray-500 text-center mb-6">
OTP sent to
</p>


<p className="text-center font-medium text-blue-600 mb-6">
{email}
</p>



<form onSubmit={handleVerify}>


<input
type="text"
placeholder="Enter 6-digit OTP"
value={otp}
onChange={(e)=>setOtp(e.target.value)}
maxLength={6}
required
className="w-full border p-3 rounded-lg mb-4"
/>


<button
type="submit"
className="w-full bg-blue-600 text-white py-3 rounded-lg"
>
Verify OTP
</button>


</form>



{
timeLeft > 0 &&

<p className="text-center text-gray-500 mt-3">
Resend OTP in {timeLeft} seconds
</p>

}



{
timeLeft === 0 &&

<button
onClick={handleResend}
className="w-full mt-4 text-blue-600"
>
Resend OTP
</button>

}


</div>
</div>

</div>

);

};

export default OtpVerify;