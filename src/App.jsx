import React,{ useState,useEffect } from 'react'
import {useDispatch} from 'react-redux'
import authService from './appwrite/auth'
import {login,logout} from './store/authSlice'
import Header from './components/header/Header'
import Footer from './components/Footer/Footer'
import { Outlet } from 'react-router-dom'
import './App.css'


function App() {
//loading is use to wait for the arrival of data if the data is not available a preloader can be shown else the data will be shown
const [Loading,setLoading]=useState(true)
const dispatch=useDispatch()

useEffect(()=>{
  authService.getCurrentUser()
  .then((userData)=>{
    if(userData)
    {
      dispatch(login({userData}))
    }
    else
    {
      dispatch(logout())
    }
  })
  .finally(()=>setLoading(false))
},[])

return !Loading?(
  <div className='min-h-screen w-full md:flex flex-wrap content-between bg-gray-600'>
      <div className='w-full block'>
        <Header/>
        <main >
 <Outlet />
        </main>
        <Footer/>
      </div>
      </div>
):null
}

export default App
