import axios from "axios";
import { useState } from "react";
import { server } from "../main";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { AppData } from "../context/AppContext";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const email = localStorage.getItem("email");
  const {setIsAuth, setUser} = AppData();

  const handleSubmit = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/api/v1/verify`,
        {
          email,
          otp,
        },
        { withCredentials: true }
      );
      setIsAuth(true);
      setUser(data.user)
      localStorage.clear("email");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <section className="text-gray-600 body-font relative">
      <div className="absolute inset-0 bg-gray-300">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="map"
          scrolling="no"
        ></iframe>
      </div>
      <div className="container px-5 py-24 mx-auto flex">
        <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col md:ml-auto w-full mt-10 md:mt-0 relative z-10 shadow-md">
          <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">
            OTP Verification
          </h2>
          <p className="leading-relaxed mb-5 text-gray-600">
            Please Provide Your OTP
          </p>
          <form onSubmit={handleSubmit} className="relative mb-4">
            <label htmlFor="otp" className="leading-7 text-sm text-gray-600">
              OTP
            </label>
            <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              type="number"
              id="otp"
              name="otp"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              required
            />
            <button
              disabled={btnLoading}
              type="submit"
              className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg w-full mt-4"
            >
              {btnLoading ? "Submitting" : "Submit"}
            </button>
          </form>

          <Link
            to={"/login"}
            className="text-xs text-gray-500 mt-3 hover:underline"
          >
            Go to login page
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VerifyOTP;
