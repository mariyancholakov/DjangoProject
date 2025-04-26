import React, { useEffect, useState } from "react";
import axios from "axios";

function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      axios
        .get("http://127.0.0.1:8000/api/receipts/")
        .then((response) => {
          console.log(response);
          setReceipts(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching receipts:", error);
          setLoading(false);
        });
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setLoading(false);
    }
  };

  // В ReceiptList.jsx
  return (
    <>
      <p className="text-xl font-semibold mb-4">My receipts</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {receipts.map((receipt) => {
            const imageUrl = `http://127.0.0.1:8000${receipt.image}`;
            console.log("Image URL:", imageUrl);

            return (
              <div key={receipt.id} className="p-4 border rounded shadow">
                <p>
                  <strong>Title:</strong> {receipt.title}
                </p>
                <p>
                  <strong>Store:</strong> {receipt.store_name}
                </p>
                <p>
                  <strong>Total:</strong> {receipt.total_amount} лв
                </p>
                <p>
                  <strong>Date:</strong> {receipt.date}
                </p>
                <p>
                  <strong>Warranty:</strong> {receipt.warranty_months || "Няма"}{" "}
                  months
                </p>
                <img src={imageUrl} alt="Receipt" className="mt-2 w-48" />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ReceiptList;
