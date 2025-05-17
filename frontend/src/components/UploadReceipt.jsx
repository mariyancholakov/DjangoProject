import axiosInstance from "../utils/axios";
import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

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

function UploadReceipt() {
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [editableData, setEditableData] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("image", file);
      const ocrResponse = await axiosInstance.post("/ocr/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!ocrResponse.data.text) {
        throw new Error("OCR failed to extract text");
      }

      const geminiFormData = new FormData();
      geminiFormData.append("raw_text", ocrResponse.data.text);
      const processedData = await axiosInstance.post(
        "/process/",
        geminiFormData
      );

      setExtractedData({
        ...processedData.data,
        raw_text: ocrResponse.data.text,
      });
    } catch (error) {
      console.error("Error processing receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  React.useEffect(() => {
    if (extractedData) {
      setEditableData({
        store_name: extractedData.store_name,
        date: extractedData.date,
        total_amount: extractedData.total_amount,
        category: extractedData.category,
        products: extractedData.products || [],
      });
    }
  }, [extractedData]);

  const handleInputChange = (field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductChange = (index, field, value) => {
    setEditableData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const handleAddProduct = () => {
    setEditableData((prev) => ({
      ...prev,
      products: [...prev.products, { name: "", price: "" }],
    }));
  };

  const handleDeleteProduct = (index) => {
    setEditableData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editableData || !receiptFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("store_name", editableData.store_name);
      formData.append("total_amount", editableData.total_amount);
      formData.append("date", editableData.date);
      formData.append("category", editableData.category);
      formData.append("warranty_months", "0");
      formData.append("images", receiptFile);

      if (editableData.products && editableData.products.length > 0) {
        formData.append("products", JSON.stringify(editableData.products));
      }

      const response = await axiosInstance.post("/receipts/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        setReceiptFile(null);
        setPreviewUrl(null);
        setExtractedData(null);
        toast.success("Receipt uploaded successfully!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to upload receipt.");
      console.error("Error saving receipt:", error);
      console.log("Error response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-8 bg-white/80 w-[80%] h-[70%] rounded-xl p-6 shadow-lg">
      <div className="w-1/2 h-full">
        <form
          className="h-full rounded-xl border-2 border-dashed border-neon-green hover:border-neon-green-hover cursor-pointer"
          onSubmit={handleSubmit}
        >
          {previewUrl ? (
            <div className="h-full w-full relative group">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="h-full w-full object-contain p-2"
              />
            </div>
          ) : (
            <label
              htmlFor="receipt-file"
              className="h-full w-full flex flex-col items-center justify-center cursor-pointer p-4"
            >
              <FiUpload className="text-4xl text-primary-blue mb-4" />
              <span className="text-lg font-medium text-gray-700">
                {loading ? "Processing..." : "Upload your Receipt here"}
              </span>
            </label>
          )}
          <input
            type="file"
            id="receipt-file"
            onChange={handleFileChange}
            accept="image/*"
            disabled={loading}
            className="hidden"
          />
        </form>
      </div>

      <div className="w-1/2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <ClipLoader color="#278AB0" />
          </div>
        ) : extractedData ? (
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-primary-blue-dark">
              Receipt Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium text-gray-600">Store</span>
                <input
                  type="text"
                  value={editableData?.store_name || ""}
                  onChange={(e) =>
                    handleInputChange("store_name", e.target.value)
                  }
                  className="text-right text-gray-800 font-semibold outline-none rounded px-2"
                />
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium text-gray-600">Date</span>
                <input
                  type="text"
                  value={editableData?.date || ""}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className="text-right text-gray-800 outline-none rounded px-2"
                />
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium text-gray-600">Total Amount</span>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editableData?.total_amount || ""}
                    onChange={(e) =>
                      handleInputChange("total_amount", e.target.value)
                    }
                    className="text-right text-neon-green font-bold w-24 outline-none rounded px-2"
                    placeholder="0.00"
                  />
                  <span className="text-gray-600">BGN</span>
                </div>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium text-gray-600">Category</span>
                <select
                  value={editableData?.category || "other"}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="text-right text-gray-800 outline-none rounded px-2"
                >
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-primary-blue-dark">
                    Products
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="px-2 py-1 text-sm bg-neon-green text-white rounded hover:bg-neon-green-hover transition-colors"
                  >
                    + Add Product
                  </button>
                </div>
                <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                  {editableData?.products?.map((product, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded group"
                    >
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(index, "name", e.target.value)
                        }
                        className="text-gray-700 w-1/2 outline-none rounded px-2"
                        placeholder="Product name"
                      />
                      <div className="flex items-center w-1/3">
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) =>
                            handleProductChange(index, "price", e.target.value)
                          }
                          className="text-right font-medium text-gray-800 w-full outline-none rounded px-2"
                          placeholder="0.00"
                        />
                        <span className="text-gray-600">BGN</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(index)}
                        className="ml-auto p-1 text-primary-blue hover:text-primary-blue-hover transition-opacity"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-6 w-full bg-primary-blue hover:bg-primary-blue-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Processing..." : "Save Receipt"}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Upload a receipt to see the details
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadReceipt;
