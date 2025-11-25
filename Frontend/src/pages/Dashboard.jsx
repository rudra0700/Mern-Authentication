import { useEffect, useState } from "react";
import { server } from "../main";
import { toast } from "react-toastify";
import api from "../apiInterceptor";
import { Link } from "react-router";

const Dashboard = () => {
  const [content, setContent] = useState("");

  async function fetchAdminData() {
    try {
      const { data } = await api.get(`${server}/api/v1/admin`, {
        withCredentials: true,
      });
      setContent(data.message);
    } catch (error) {
      toast.error(error.response.data?.message);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdminData();
  }, []);
  return (
    <div className="mt-10 mx-auto">
      <p className="text-2xl text-green-500 font-bold mx-auto">{content}</p>
      <Link to={"/"} className="text-xl text-red-500 font-semibold mx-auto">Go to Home</Link>
    </div>
  );
};

export default Dashboard;
