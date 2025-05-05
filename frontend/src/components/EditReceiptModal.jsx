import React, { useState, useEffect } from "react";

function EditReceiptModal({ receipt, onClose, onSave, isOpen }) {
  const [formData, setFormData] = useState({
    store_name: "",
    total_amount: "",
    date: "",
    category: "",
    warranty_months: "",
    products: [],
  });

  useEffect(() => {
    if (receipt) {
      setFormData({
        store_name: receipt.store_name,
        total_amount: receipt.total_amount,
        date: receipt.date,
        category: receipt.category,
        warranty_months: receipt.warranty_months || "0",
        products: receipt.products || [],
      });
    }
  }, [receipt]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(receipt.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 transition duration-300 ease-in-out flex items-center justify-center z-50">
      <div className="bg-white/90 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Edit Receipt</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Store Name</label>
            <input
              type="text"
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Total Amount</label>
            <input
              type="number"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              step="0.01"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="food">Храна</option>
              <option value="electronics">Електроника</option>
              <option value="clothing">Дрехи</option>
              <option value="other">Друго</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Warranty (months)
            </label>
            <input
              type="number"
              name="warranty_months"
              value={formData.warranty_months}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Products</label>
            {formData.products.map((product, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    handleProductChange(index, "name", e.target.value)
                  }
                  placeholder="Product name"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                  placeholder="Price"
                  step="0.01"
                  className="w-32 p-2 border rounded"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditReceiptModal;
