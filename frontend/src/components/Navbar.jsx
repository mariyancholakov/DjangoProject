import React from "react";
import { NavLink } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";

function Navbar() {
  const navLinkStyles = ({ isActive }) =>
    `relative px-2 py-1
    ${isActive ? "text-[#007BFF]" : "text-gray-700"}
    before:content-[''] before:absolute before:block before:w-full 
    before:h-[2px] before:bottom-0 before:left-0 before:bg-[#007BFF]
    before:transition-transform before:duration-200
    ${isActive ? "before:scale-x-100" : "before:scale-x-0"}
    before:origin-left`;

  return (
    <div className="flex justify-center gap-50 font-bold items-center w-full pb-8 pt-2">
      <NavLink className={navLinkStyles} to="/">
        SmartReceipt
      </NavLink>
      <NavLink className={navLinkStyles} to="/my-receipts">
        MyReceipts
      </NavLink>
      <NavLink className="text-[#007BFF]" to="/upload">
        <CiCirclePlus size={60} />
      </NavLink>
      <NavLink className={navLinkStyles} to="/statistics">
        Statistics
      </NavLink>
      <NavLink className={navLinkStyles} to="/profile">
        Login/Profile
      </NavLink>
    </div>
  );
}

export default Navbar;
