import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.access}`;
        navigate("/");
        toast.success("Login successful!");
      }
    } catch (error) {
      toast.error("Login failed!");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <h2 className="text-3xl mb-6 text-center font-bold text-text-color">
          Login
        </h2>
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
            />
          </div>
          <div>
            <label className="text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full mb-2 mt-6 bg-primary hover:bg-primary-hover cursor-pointer text-accent font-bold rounded-sm p-2 transition duration-300 ease-in-out"
        >
          Login
        </button>
        <p className="text-center text-gray-600">
          Dont have an account yet?{" "}
          <Link
            to="/register"
            className="text-complementary hover:text-complementary-hover"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
