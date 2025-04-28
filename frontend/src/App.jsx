import React from "react";
import ReceiptList from "./components/ReceiptList";
import UploadReceipt from "./components/UploadReceipt";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import MyReceiptsPage from "./pages/MyReceiptsPage";
import UploadReceiptPage from "./pages/UploadReceiptPage";
import StatisticsPage from "./pages/StatisticsPage";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/my-receipts" element={<MyReceiptsPage />} />
        <Route path="/upload" element={<UploadReceiptPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </>
  );
}

export default App;
