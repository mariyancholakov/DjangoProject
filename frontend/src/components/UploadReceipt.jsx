import axios from "axios";
import React, { useState } from "react";

function UploadReceipt() {
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [extractedData, setExtractedData] = useState(null);

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
    setOcrText("");
    setExtractedData(null);
    setError(null);
  };

  const performOCR = async (formData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/ocr/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.text;
  };

  const processReceipt = async (rawText) => {
    const formData = new FormData();
    formData.append("raw_text", rawText);
    formData.append("image", receiptFile);
    formData.append("category", "other");

    const response = await axios.post(
      "http://127.0.0.1:8000/api/receipts/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!receiptFile) {
      setError("Please select a file to upload.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", receiptFile);

    try {
      const ocrResult = await performOCR(formData);
      setOcrText(ocrResult);

      const processedData = await processReceipt(ocrResult);
      setExtractedData(processedData);
    } catch (error) {
      setError(error.response?.data?.error || "Error processing receipt");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Receipt</h1>

      {error && <div>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="receipt-file">Receipt Image:</label>
          <input
            type="file"
            id="receipt-file"
            onChange={handleFileChange}
            accept="image/*"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !receiptFile}>
          {loading ? "Processing..." : "Upload and Process"}
        </button>
      </form>

      {ocrText && (
        <div>
          <h2>OCR Result:</h2>
          <pre>{ocrText}</pre>
        </div>
      )}

      {extractedData && (
        <div>
          <h2>Extracted Receipt Data:</h2>
          <div>
            <p>
              <strong>Store:</strong> {extractedData.store_name}
            </p>
            <p>
              <strong>Date:</strong> {extractedData.date}
            </p>
            <p>
              <strong>Total Amount:</strong> {extractedData.total_amount} BGN
            </p>

            <h3>Products:</h3>
            <ul>
              {extractedData.products?.map((product, index) => (
                <li key={index}>
                  {product.name} - {product.price} BGN
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadReceipt;
