import React from "react";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function ReceiptCard({ receipt, handleEdit, handleDelete }) {
  const BACKEND_URL = "http://127.0.0.1:8000";
  const imageUrl = `${BACKEND_URL}${receipt?.images?.[0]?.image}` || null;
  const navigate = useNavigate();

  const categoryLabels = {
    food: "Храна",
    electronics: "Електроника",
    clothing: "Дрехи",
    home: "Дом",
    pharmacy: "Аптека",
    entertainment: "Развлечение",
    transport: "Транспорт",
    education: "Образование",
    utilities: "Сметки",
    finances: "Финанси",
    services: "Услуги",
    other: "Друго",
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-green-100 text-green-800",
      electronics: "bg-blue-100 text-blue-800",
      clothing: "bg-purple-100 text-purple-800",
      home: "bg-amber-100 text-amber-800",
      pharmacy: "bg-red-100 text-red-800",
      transport: "bg-sky-100 text-sky-800",
      entertainment: "bg-pink-100 text-pink-800",
      education: "bg-indigo-100 text-indigo-800",
      utilities: "bg-cyan-100 text-cyan-800",
      services: "bg-teal-100 text-teal-800",
      finances: "bg-violet-100 text-violet-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const handleCardClick = (e) => {
    if (!e.target.closest("button")) {
      navigate(`/receipts/${receipt.id}`);
    }
  };

  return (
    <div
      key={receipt.id}
      className="bg-white rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full"
      onClick={handleCardClick}
    >
      <button
        className="cursor-pointer absolute top-2 right-2 p-2 rounded-full bg-gray-50 z-10 shadow-md hover:shadow-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(receipt.id);
        }}
      >
        <CiEdit className="text-blue-600" size={30} />
      </button>
      <button
        className="absolute cursor-pointer top-2 left-2 p-2 rounded-full bg-gray-50 z-10 shadow-md hover:shadow-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(receipt.id);
        }}
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
              <span className="font-medium">{receipt.total_amount} BGN</span>
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
                  <li key={index} className="flex justify-between text-sm">
                    <span>{product.name}</span>
                    <span className="font-medium">{product.price} BGN</span>
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
}

export default ReceiptCard;
