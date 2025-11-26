import { createContext, useContext, useEffect, useState } from "react";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  async function fetchUser() {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/v1/auth/me`);
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function  logoutUser(navigate) {
    try {
      const {data} = await api.post("/api/v1/auth/logout");
      toast.success(data.message);
      setIsAuth(false);
      setUser(null);
      navigate("/login")
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext provider value={{ user, setUser, loading, isAuth, setIsAuth, logoutUser }}>
      {children}
    </AppContext>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("App data must be used within an AppProvider");
  }

  return context;
};
