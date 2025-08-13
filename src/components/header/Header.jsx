import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "./Logout";
function Header() {
   const authStatus=useSelector((state)=>state.auth.status)

    const navigate=useNavigate();
  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      
      <h1 className="text-2xl font-bold text-gray-800">My Day</h1>

      {/* Right side button */}
      {authStatus && (
              <li>
                <LogoutBtn />
              </li>
      )}
    </header>
  );
}

export default Header;
