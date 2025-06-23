import { Dropdown } from "flowbite-react"
import { CiUser } from "react-icons/ci";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

const Header = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const AUTH_URL = import.meta.env.VITE_AUTH_URL;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dataToSend = {
    sessionId: localStorage.getItem("sessionId"),
    userId: localStorage.getItem("userId"),
  }

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/v2/logout-api`,
        {
          headers: {
            Authoraization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
        dataToSend
      )
      if (response.data.success) {
        toast.success(response.data.message)
        localStorage.clear()
        // window.location.href = "http://localhost:5173"
        window.location.href = `${AUTH_URL}`
      } else {
        console.error("Failed to log out:", response.data.message)
      }
    } catch (error) {
      console.error("Error clearing local storage:", error)
    }
  }

  const menuItems = [
    { label: 'Dashboard', action: () => console.log('Dashboard clicked') },
    { label: 'Settings', action: () => console.log('Settings clicked') },
    { label: 'Earnings', action: () => console.log('Earnings clicked') },
    { label: 'Logout', action: handleLogout }
  ];

  return (
    <>
      <header className="shadow sticky top-0 z-30 bg-white px-16">
        <nav className="mx-auto container py-2 flex justify-between">
          <Link to="/landlord_management_systemdashboard">
            <img
              className="w-[72px] h-[34px]"
              src="/assets/images/rentnasi.png"
              alt="logo"
            />
          </Link>

          {/* Tabs */}
          <ul className="flex space-x-5 rounded-xl bg-gray-100 px-4 py-1 text-xs">

            <li className="bg-white py-1 px-3 border border-gray-800 rounded">
              <a href="/dashboard">Home</a>
            </li>
            <li className="p-1 rounded-lg">
              <Link to="/view-apps">
                Apps
              </Link>
            </li>
            <li className="p-1 rounded-lg">
              <Link to="">
                Profile Info
              </Link>
            </li>
            <li className="p-1"><a href="">Payment & Subscriptions</a></li>

          </ul>

          <div className="flex space-x-3">
            <div className="bg-gray-100 px-2 py-1 flex justify-center items-center rounded-xl">
              <FaBell />
            </div>

            <div className="relative inline-block" ref={dropdownRef}>
              {/* Trigger Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center rounded-xl bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Panel */}
              {isOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                >
                  <div className="py-1">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                        }}
                        className={`block w-full px-4 py-2 text-left text-sm ${item.label === 'Logout'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        role="menuitem"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
