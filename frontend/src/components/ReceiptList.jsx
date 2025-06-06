import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import ClipLoader from "react-spinners/ClipLoader";
import ReceiptCard from "./ReceiptCard";
import EditReceiptModal from "./EditReceiptModal";
import { toast } from "react-toastify";

function ReceiptList() {
  const [latestReceipts, setLatestReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchReceipts();
  }, [navigate]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/receipts/");
      console.log("Latest Response:", response.data);
      const sortedReceipts = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setLatestReceipts(sortedReceipts.slice(0, 5));
    } catch (error) {
      console.error("Error fetching receipts:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (id) => {
    const receipt = latestReceipts.find((r) => r.id === id);
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (id, formData) => {
    try {
      const requestData = {
        title: `Receipt from ${formData.store_name}`,
        store_name: formData.store_name,
        total_amount: formData.total_amount,
        date: formData.date,
        category: formData.category,
        warranty_months: formData.warranty_months || 0,
        products: formData.products,
      };

      const response = await axiosInstance.put(`/receipts/${id}/`, requestData);

      if (response.status === 200) {
        setLatestReceipts((prevReceipts) =>
          prevReceipts.map((receipt) =>
            receipt.id === id ? response.data : receipt
          )
        );
        setIsModalOpen(false);
        toast.success("Receipt updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to edit receipt.");
      console.error("Edit error:", error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/receipts/${id}/`);
      if (res.status === 204) {
        setLatestReceipts((prevReceipts) =>
          prevReceipts.filter((receipt) => receipt.id !== id)
        );
      }
      toast.success("Receipt deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete receipt.");
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center px-20 mb-10"></div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ClipLoader color="#2F27CE" />
        </div>
      ) : latestReceipts.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <h2 className="font-light text-gray-700 text-3xl">
            No receipts found
          </h2>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-text-color">
            Latest 5 Receipts
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {latestReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                handleEdit={handleEditClick}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
      <EditReceiptModal
        isOpen={isModalOpen}
        receipt={selectedReceipt}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export default ReceiptList;
