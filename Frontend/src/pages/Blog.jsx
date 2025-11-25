import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../apiInterceptor.js";
import { toast } from "react-toastify";

const Blog = () => {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [btnLoading, setBtnLoading] = useState(false);
    
    
    
      const navigate = useNavigate();
      const handleSubmit = async (e) => {
        e.preventDefault();
        setBtnLoading(true);
        try {
          const { data } = await api.post(`/api/v1/login`);
          localStorage.setItem("email", email);
          navigate("/verifyOtp");
          toast.success(data.message);
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          setBtnLoading(false);
          // setEmail("");
          // setPassword("")
        }
      };
    return (
        <div>
            <h2>Welcome to my blog</h2>
                <form onSubmit={handleSubmit} className="relative mb-4">
            <label htmlFor="email" className="leading-7 text-sm text-gray-600">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              id="email"
              name="email"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              required
            />

            <label
              htmlFor="message"
              className="leading-7 text-sm text-gray-600"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              id="password"
              name="password"
              required
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
            <button
              disabled={btnLoading}
              type="submit"
              className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg w-full mt-4"
            >
              {btnLoading ? "Submitting" : "Submit"}
            </button>
          </form>
        </div>
    );
};

export default Blog;