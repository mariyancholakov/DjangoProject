import React from "react";
import { MdOutlineDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

function ReceiptCard({ receipt, handleEdit, handleDelete }) {
  const images = receipt?.images || [];
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

  const handleCardClick = (e) => {
    if (!e.target.closest("button")) {
      navigate(`/receipts/${receipt.id}`);
    }
  };

  const getImageUrl = (image) => image?.image || "";

  return (
    <div
      key={receipt.id}
      className="bg-white rounded-lg cursor-pointer shadow-md hover:shadow-lg hover:shadow-gray-300 transition-shadow duration-300 relative flex flex-col h-full"
      onClick={handleCardClick}
    >
      <button
        className="cursor-pointer absolute top-2 right-2 p-2 rounded-full bg-primary/85 z-10 hover:bg-primary-hover/90 shadow-md hover:shadow-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(receipt.id);
        }}
      >
        <CiEdit className="text-accent font-extrabold text-2xl" size={30} />
      </button>
      <button
        className="absolute cursor-pointer top-2 left-2 p-2 rounded-full bg-primary/5 hover:bg-primary/10 z-10 shadow-md hover:shadow-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(receipt.id);
        }}
      >
        <MdOutlineDelete className="text-primary" size={30} />
      </button>

      <div className="flex flex-col h-full">
        <div className="p-6 flex-grow">
          <h3 className="text-text-color font-semibold text-center px-2 text-xl mb-8">
            {receipt.title}
          </h3>

          <div className="space-y-2 mb-4">
            <p className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-extrabold text-complementary">
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
              <span className="px-2 font-medium py-1 rounded-full text-xs bg-accent/70 text-primary">
                {categoryLabels[receipt.category]}
              </span>
            </div>
          </div>

          {receipt.products?.length > 0 && (
            <div className="mt-4 h-35 overflow-y-auto">
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

        {images.length > 0 && (
          <div className="p-4">
            <div
              className={`grid ${
                images.length > 1 ? "grid-cols-2" : "grid-cols-1"
              } gap-2`}
            >
              {images.map((image, index) => (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`Receipt ${index + 1} for ${receipt.title}`}
                  className="w-full max-h-48 object-cover rounded-md"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReceiptCard;
