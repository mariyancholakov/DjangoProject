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

  return (
    <div>
      <h2>My Receipts</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {receipts.map((receipt) => {
            const imageUrl = receipt.image
              ? `http://127.0.0.1:8000/media/${receipt.image.split("/").pop()}`
              : null;

            return (
              <div key={receipt.id}>
                <div>
                  <p>
                    <span>Title:</span> {receipt.title}
                  </p>
                  <p>
                    <span>Store:</span> {receipt.store_name}
                  </p>
                  <p>
                    <span>Total:</span> {receipt.total_amount} BGN
                  </p>
                  <p>
                    <span>Date:</span> {receipt.date}
                  </p>
                  <p>
                    <span>Warranty:</span> {receipt.warranty_months || "0"}{" "}
                    months
                  </p>
                </div>

                {receipt.products?.length > 0 && (
                  <div>
                    <h3>Products:</h3>
                    <ul>
                      {receipt.products.map((product, index) => (
                        <li key={index}>
                          {product.name} - {product.price} BGN
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {imageUrl && <img src={imageUrl} alt="Receipt" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReceiptList;
