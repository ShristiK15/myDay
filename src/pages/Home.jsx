import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Login from '../components/Login'
import Dashboard from "../components/Dashboard";

function Home() {
  const authStatus=useSelector((state)=>state.auth.status)
  const navigate=useNavigate();
  return(
    <>
       {authStatus ? (
        <Dashboard/>
      ) : (
        <Login />
      )}
    </>
  )
}

export default Home;
