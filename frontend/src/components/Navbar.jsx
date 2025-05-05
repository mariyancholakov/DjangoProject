import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";
import Logo from "../assets/Logo.png";

function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axiosInstance
        .get("/user/")
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, []);

  const navLinkStyles = ({ isActive }) =>
    `relative px-2 py-1
    ${isActive ? "text-[#007BFF]" : "text-gray-700"}
    before:content-[''] before:absolute before:block before:w-full 
    before:h-[2px] before:bottom-0 before:left-0 before:bg-[#007BFF]
    before:transition-transform before:duration-200
    ${isActive ? "before:scale-x-100" : "before:scale-x-0"}
    before:origin-left`;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUsername(null);
    toast.success("Logout successful!");
    navigate("/login");
  };

  return (
    <div className="flex justify-center gap-50 font-bold items-center w-full pb-8 pt-2">
      <NavLink className={navLinkStyles} to="/">
        <img src={Logo} alt="SmartReceipt Logo" className="h-12 w-auto" />
      </NavLink>
      <NavLink className={navLinkStyles} to="/my-receipts">
        MyReceipts
      </NavLink>
      <NavLink className="text-[#007BFF]" to="/upload">
        <CiCirclePlus size={60} />
      </NavLink>
      <NavLink className={navLinkStyles} to="/statistics">
        Statistics
      </NavLink>
      {username ? (
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Hi, {username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border-2 border-[#007BFF] hover:bg-slate-100 cursor-pointer rounded-md"
          >
            Logout
          </button>
        </div>
      ) : (
        <NavLink className={navLinkStyles} to="/login">
          Login
        </NavLink>
      )}
    </div>
  );
}

export default Navbar;
