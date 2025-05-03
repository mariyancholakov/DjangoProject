import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import ClipLoader from "react-spinners/ClipLoader";

function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const navigate = useNavigate();

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "total_amount", label: "Total Amount" },
    { value: "store_name", label: "Store Name" },
    { value: "warranty_months", label: "Warranty" },
  ];

  const categoryLabels = {
    food: "Храна",
    electronics: "Електроника",
    clothing: "Дрехи",
    other: "Друго",
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-green-100 text-green-800",
      electronics: "bg-blue-100 text-blue-800",
      clothing: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

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
      console.log("API Response:", response.data);
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

  const handleEdit = (id) => {
    console.log("Edit receipt:", id);
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
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between px-20 mb-10">
        <h2 className="text-2xl font-bold mb-6">My Receipts</h2>
        <input
          type="text"
          placeholder="Search receipts..."
          className="shadow-md bg-white/50 shadow-blue-600/30 focus:shadow-blue-500/50 placeholder:text-gray-600 outline-none rounded-full h-10 w-80 px-4"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="shadow-md bg-white placeholder:text-gray-600 outline-none rounded-full h-10 w-70 pl-4 cursor-pointer"
        >
          <option value="">Sort by...</option>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ClipLoader color="#007BFF" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <h2 className="font-bold text-gray-700 text-3xl">
            No receipts found.
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => {
            const imageUrl = receipt.images?.[0]?.image || null;
            return (
              <div
                key={receipt.id}
                className="bg-white rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full"
              >
                <button
                  className="absolute top-2 right-2 p-2 rounded-full bg-gray-50 z-10 shadow-md hover:shadow-gray-300"
                  onClick={() => handleEdit(receipt.id)}
                >
                  <CiEdit className="text-blue-600" size={30} />
                </button>
                <button
                  className="absolute top-2 left-2 p-2 rounded-full bg-gray-50 z-10 shadow-md hover:shadow-gray-300"
                  onClick={() => handleDelete(receipt.id)}
                >
                  <MdOutlineDelete className="text-red-600" size={30} />
                </button>

                <div className="flex flex-col h-full">
                  <div className="p-6 flex-grow">
                    <h3 className="font-semibold text-center px-2 text-xl mb-4">
                      {receipt.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">
                          {receipt.total_amount} BGN
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{receipt.date}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Warranty:</span>
                        <span className="font-medium">
                          {receipt.warranty_months || "0"} months
                        </span>
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                            receipt.category
                          )}`}
                        >
                          {categoryLabels[receipt.category]}
                        </span>
                      </div>
                    </div>

                    {receipt.products?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Products:</h4>
                        <ul className="space-y-1">
                          {receipt.products.map((product, index) => (
                            <li
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>{product.name}</span>
                              <span className="font-medium">
                                {product.price} BGN
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {imageUrl && (
                    <div className="p-4">
                      <img
                        src={imageUrl}
                        alt={`Receipt for ${receipt.title}`}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReceiptList;
