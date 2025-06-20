import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import ClipLoader from "react-spinners/ClipLoader";
import ReceiptCard from "../components/ReceiptCard";
import EditReceiptModal from "./../components/EditReceiptModal";
import { toast } from "react-toastify";

function MyReceiptsPage() {
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [receipts, setReceipts] = useState([]);
  const navigate = useNavigate();

  const sortOptions = [
    { value: "created_at", label: "Upload Date" },
    { value: "date", label: "Receipt Date" },
    { value: "total_amount", label: "Total Amount" },
    { value: "store_name", label: "Store Name" },
    { value: "warranty_months", label: "Warranty" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "home", label: "Home" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "transport", label: "Transport" },
    { value: "entertainment", label: "Entertainment" },
    { value: "education", label: "Education" },
    { value: "utilities", label: "Utilities" },
    { value: "services", label: "Services" },
    { value: "finances", label: "Finances" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchReceipts();
  }, [navigate]);

  const fetchReceipts = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: searchInput,
        category: categoryFilter,
        sort_by: sortBy,
        ...params,
      }).toString();

      const response = await axiosInstance.get(`/receipts/?${queryParams}`);
      setReceipts(response.data);
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
    const receipt = receipts.find((r) => r.id === id);
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
        setReceipts((prevReceipts) =>
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
        setReceipts((prevReceipts) =>
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReceipts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, categoryFilter, sortBy]);

  return (
    <div className="container mx-auto px-16 py-8">
      <div className="flex justify-between px-10 mb-12">
        <div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search receipts..."
            className="shadow-md bg-white/50 shadow-primary/30 focus:shadow-primary/50 placeholder:text-gray-600 outline-none rounded-full h-10 w-80 px-4"
          />
        </div>
        <div className="flex gap-6">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="shadow-md bg-white/50 shadow-primary/30 focus:shadow-primary/50 placeholder:text-gray-600 outline-none rounded-full h-10 w-40 pl-4 cursor-pointer"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="shadow-md bg-white/50 shadow-primary/30 focus:shadow-primary/50 placeholder:text-gray-600 outline-none rounded-full h-10 w-40 pl-4 cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ClipLoader color="#2F27CE" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <h2 className="font-light text-gray-700 text-3xl">
            No receipts found
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              handleEdit={handleEditClick}
              handleDelete={handleDelete}
            />
          ))}
        </div>
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

export default MyReceiptsPage;
