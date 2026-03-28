import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import Logo from '../assets/logo.png'
import { useDarkmode } from '../stores/useDarkmode'

const Footer = () => {
    const { isDarkmodeEnabled } = useDarkmode()
    const navigate = useNavigate()  
    return (
        <div
  className={`w-full py-10 ${
    isDarkmodeEnabled ? "bg-[#222222] text-white" : "bg-gray-100 text-black"
  }`}
>
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

    {/* TOP SECTION */}
    <div className="flex flex-col md:flex-row justify-between gap-10">
      
      {/* LEFT - ABOUT */}
      <div className="max-w-[400px]">
        <h1 className="font-bold text-[20px]">About</h1>
        <p className="text-gray-500 mt-2 leading-7">
          We provide reliable and affordable car rental services with a wide
          range of vehicles. Our goal is to deliver a smooth and user-friendly
          experience, ensuring customer satisfaction every time.
        </p>

        <div className="flex mt-4">
          <h1 className="font-bold">Email:</h1>
          <p className="text-gray-600 pl-1">RentCAR@rentcar.com</p>
        </div>

        <div className="flex mt-2">
          <h1 className="font-bold">Phone:</h1>
          <p className="text-gray-600 pl-1">+123 456 7890</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex gap-16">
        
        {/* QUICK LINKS */}
        <div>
          <h1 className="font-bold text-[20px]">Quick Links</h1>
          <ul className="mt-2 text-gray-600">
            <li className="mt-3">About Us</li>
            <li className="mt-1">Services</li>
            <li className="mt-1">Contact</li>
            <li className="mt-1">Home</li>
          </ul>
        </div>

        {/* CATEGORY */}
        <div>
          <h1 className="font-bold text-[20px]">Category</h1>
          <ul className="mt-2 text-gray-600">
            <li className="mt-3">SUV</li>
            <li className="mt-1">Sedan</li>
            <li className="mt-1">Sport</li>
            <li className="mt-1">Luxury</li>
          </ul>
        </div>

      </div>
    </div>

    {/* BOTTOM */}
    <div className="border-t border-gray-300 mt-10 pt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md mr-3">
            <img
              src={Logo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-semibold">Rent</h1>
          <h1 className="text-2xl text-red-500 ml-1">CAR</h1>
        </div>

        <div>
          <h1 className="text-gray-600 text-center md:text-right">
            © 2024 Meta Blog. All rights reserved.
          </h1>
        </div>
      </div>
    </div>

  </div>
</div>
    )
}

export default Footer