import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import VerifyOTP from "./pages/VerifyOTP";
import { AppData } from "./context/AppContext";
import Loading from "./Loading";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
function App() {
  const { isAuth, loading } = AppData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuth ? <Home /> : <Login />}></Route>
            <Route path="/login" element={isAuth ? <Home /> : <Login />}></Route>
            <Route path="/register" element={isAuth ? <Home /> : <Register />}></Route>
            <Route path="/verifyOtp" element={isAuth ? <Home /> : <VerifyOTP />}></Route>
            <Route path="/token/:token" element={<Verify />}></Route>
            <Route path="/dashboard" element={<Dashboard />}></Route>
            <Route path="/blog" element={<Blog />}></Route>
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
