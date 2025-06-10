import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import MyReceiptsPage from "./pages/MyReceiptsPage";
import UploadReceiptPage from "./pages/UploadReceiptPage";
import StatisticsPage from "./pages/StatisticsPage";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Navbar />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        toastClassName="bg-blue-600 text-white"
      />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/my-receipts" element={<MyReceiptsPage />} />
        <Route path="/upload" element={<UploadReceiptPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
