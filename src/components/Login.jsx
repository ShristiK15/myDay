import React, {useState} from 'react'
import authService from '../appwrite/auth'
import {Link ,useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import Button from './Button'
import Input from './Input'
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'
import Signup from './Signup'
function LoginPage() {
   const navigate=useNavigate();
    const dispatch=useDispatch();
    const {register,handleSubmit}=useForm();
    const [error,setError]=useState("");

    const login=async(data)=>{
        setError("")
        try{
            const session=await authService.login(data)
            if(session)
            {
                const userData=await authService.getCurrentUser()
                if(userData)
                {
                    dispatch(authLogin(userData));
                    navigate("/");
                }
            }
        }
        catch(error)
        {
            setError(error.message)
        }
    }
  return (
    <div className="flex min-h-screen">
      {/* Login form takes half width */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          {/* Top message */}
          <p className="text-sm text-gray-600 mb-4">
            Don't have an account?{" "}
            <Link to="/Signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
          {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Login</h2>
          <form onSubmit={handleSubmit(login)}  className="space-y-4">
               <div className='space-y-5'>
                 <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
                {...register("email", {
                    required: true,
                    validate: {
                        matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                        "Email address must be a valid address",
                    }
                })}
                />

             <Input
                label="Password: "
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                    required: true,
                })}
                />
                <Button
                type="submit"
                className="w-full"
                >Sign in</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Empty half (can add image later) */}
      <div className="w-1/2 bg-gray-100">
      </div>
    </div>
  );
}

export default LoginPage;
