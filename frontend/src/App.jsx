import React from "react";
import ReceiptList from "./components/ReceiptList";

function App() {
  return (
    <>
      <h1 className="text-3xl text-center font-bold">
        Welcome to SmartReceipt
        <ReceiptList />
      </h1>
    </>
  );
}

export default App;
