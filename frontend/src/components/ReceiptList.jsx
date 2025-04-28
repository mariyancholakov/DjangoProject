import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "total_amount", label: "Total Amount" },
    { value: "store_name", label: "Store Name" },
    { value: "warranty_months", label: "Warranty" },
  ];

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/receipts/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReceipts(response.data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    console.log("Edit receipt:", id);
  };

  const handleDelete = (id) => {
    console.log("Delete receipt:", id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between px-20 mb-10">
        <h2 className="text-2xl font-bold mb-6">My Receipts</h2>
        <input
          type="text"
          placeholder="Search receipts..."
          className="shadow-md bg-white/50 shadow-blue-600/30 focus:shadow-blue-500/50  placeholder:text-gray-600 outline-none rounded-full h-10 w-80 px-4"
        />
        <select className="shadow-md bg-white placeholder:text-gray-600 outline-none rounded-full h-10 w-70 pl-4 cursor-pointer">
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => {
            const imageUrl = receipt.image?.startsWith("http")
              ? receipt.image
              : `http://127.0.0.1:8000${receipt.image}`;

            return (
              <div
                key={receipt.id}
                className="bg-white rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full"
              >
                <button
                  className="cursor-pointer shadow-md hover:shadow-gray-300 absolute top-2 right-2 p-2 rounded-full bg-gray-50 z-10"
                  onClick={() => handleEdit(receipt.id)}
                >
                  <CiEdit className="text-blue-600" size={30} />
                </button>
                <button
                  className="cursor-pointer shadow-md hover:shadow-gray-300 absolute top-2 left-2 p-2 rounded-full bg-gray-50 z-10"
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
                      <p className="flex justify-between"></p>
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
                        alt="Receipt"
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          console.error("Image failed to load:", imageUrl);
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
