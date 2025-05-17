import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";
import axiosInstance from "../utils/axios";

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUsername(null);
    navigate("/login");
  };

  return (
    <div className="flex justify-center gap-50 font-bold items-center w-full mb-6 pt-2">
      <Link
        style={{ fontSize: 20 }}
        className="relative px-2 py-1 text-sm font-bold text-primary-blue-dark hover:text-primary-blue focus:text-primary-blue transition duration-300 ease-in-out"
        to="/"
      >
        SmartReceipt
      </Link>
      <Link
        className="relative px-2 py-1 text-md font-bold text-primary-blue-dark hover:text-primary-blue focus:text-primary-blue transition duration-300 ease-in-out"
        to="/my-receipts"
      >
        MyReceipts
      </Link>
      <Link className="relative px-2 py-1" to="/upload">
        <CiCirclePlus
          className="text-primary-blue hover:text-neon-green transition duration-300 ease-in-out"
          size={55}
        />
      </Link>
      <Link
        className="relative px-2 py-1 text-md font-bold text-primary-blue-dark hover:text-primary-blue focus:text-primary-blue transition duration-300 ease-in-out"
        to="/statistics"
      >
        Statistics
      </Link>
      {username ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary-blue-dark">Hi, {username}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm border-2 border-primary-blue hover:bg-slate-100 cursor-pointer rounded-md transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <Link
            className="px-4 py-2 text-white border-2 border-primary-blue mr-2 text-sm bg-primary-blue hover:bg-primary-blue-hover hover:border-primary-blue-hover transition duration-300 ease-in-out cursor-pointer rounded-md"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="px-4 py-2 text-sm border-2 border-primary-blue hover:bg-slate-100 cursor-pointer rounded-md"
            to="/register"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default Navbar;
