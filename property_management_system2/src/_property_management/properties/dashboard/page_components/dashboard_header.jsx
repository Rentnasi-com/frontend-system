import { Link } from "react-router-dom"
import QRCode from "react-qr-code"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { FaBell, FaChevronDown, FaCog, FaSignOutAlt, FaStore, FaUser } from "react-icons/fa"
import { useAuth } from "../../../../AuthContext"

const DashboardHeader = ({ title, description, link, name, hideSelect, selectUnit, hideLink, properties, units, onSelectChange, onUnitSelectChange, showLink2, link2Name, link2 }) => {
    const baseUrl = import.meta.env.VITE_BASE_URL
    const sessionId = localStorage.getItem("sessionId")
    const userId = localStorage.getItem("userId")
    const token = localStorage.getItem("token")
    const [packageDetails, setPackageDetails] = useState([])
    const [isExpired, setIsExpired] = useState(false)
    const AUTH_URL = import.meta.env.VITE_AUTH_URL;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const organization = JSON.parse(localStorage.getItem("organization"));
    const user = JSON.parse(localStorage.getItem("userProfile"));

    const dataToSend = {
        sessionId: localStorage.getItem("sessionId"),
        userId: localStorage.getItem("userId"),
    }

    // Use logout function from useAuth for proper cleanup (if available)
    const { logout } = useAuth();

    const handleLogout = () => {
        if (logout) {
            logout(); // Use the context logout function
        } else {
            // Fallback if context is not fully initialized
            toast.success("Redirecting to auth")
            localStorage.clear()
            window.location.href = `${AUTH_URL}`
        }
    }


    useEffect(() => {
        // PackageDetails()
        // getUserDetails()
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [token, baseUrl]);

    // Omitted PackageDetails and getUserDetails as they were commented out.

    const { hasPermission } = useAuth();

    return (
        <>

            {isExpired && (
                <div className="bg-gray-700 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0">
                    <div className="relative p-4 w-full max-w-md max-h-full">

                        <div className="relative bg-white rounded-lg border border-gray-200">

                            <div className="p-4 md:p-5">
                                <svg className="w-10 h-10 text-gray-400  mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                    <path d="M8 5.625c4.418 0 8-1.063 8-2.375S12.418.875 8 .875 0 1.938 0 3.25s3.582 2.375 8 2.375Zm0 13.5c4.963 0 8-1.538 8-2.375v-4.019c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353c-.193.081-.394.158-.6.231l-.189.067c-2.04.628-4.165.936-6.3.911a20.601 20.601 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244c-.053-.028-.113-.053-.165-.082v4.019C0 17.587 3.037 19.125 8 19.125Zm7.09-12.709c-.193.081-.394.158-.6.231l-.189.067a20.6 20.6 0 0 1-6.3.911 20.6 20.6 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244C.112 6.035.052 6.01 0 5.981V10c0 .837 3.037 2.375 8 2.375s8-1.538 8-2.375V5.981c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353Z" />
                                </svg>
                                <h3 className="mb-1 text-xl font-bold text-yellow-700">Your {packageDetails.package_name} Package Has Expired</h3>
                                <p className="text-gray-500">Choosing the right package solution is essential for maintaining continuous working.</p>
                                <p className="text-gray-500 mb-4">Scan to make payment for your subscription.</p>
                                <div className="flex justify-center">
                                    <QRCode
                                        size={256}
                                        style={{ height: "auto", maxWidth: "25%", width: "25%" }}
                                        value={`https://billing.rentnasi.com?sessionId=${sessionId}&userId=${userId}`}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>
                                <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                    <a target="_blank" href={`https://billing.rentnasi.com?sessionId=${sessionId}&userId=${userId}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Upgrade to PRO</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 md:flex justify-between sticky top-0 z-30 bg-white border-b border-gray-200 rounded-b-xl">
                <div>
                    <h1 className="text-lg font-semibold text-gray-600">{title}</h1>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
                <div>
                    <div className="flex justify-end space-x-3 mb-2">
                        <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <div className="flex items-center space-x-2">
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-700"><span className="text-base font-semibold">Organization</span> - {organization.name}</p>
                                </div>
                            </div>
                        </div>
                        

                        <div className="flex items-center space-x-5 mt-2 md:mt-0 justify-end">

                            {/* Notification Bell */}
                            <div className="relative cursor-pointer text-gray-600 hover:text-gray-800">
                                <FaBell className="text-xl" />
                                <span className="absolute -top-1 -right-0.5 h-2.5 w-2.5 bg-yellow-500 rounded-full border-2 border-white"></span>
                            </div>

                            {/* User Profile Dropdown Trigger */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="flex items-center space-x-2 border border-gray-300 rounded-full md:rounded-xl px-2 py-1 hover:bg-gray-50 transition focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user.firstname.charAt(0).toUpperCase()}{user.lastname.charAt(0).toUpperCase()}
                                    </div>
                                    <FaChevronDown className={`hidden md:block text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* --- DROPDOWN MENU START --- */}
                                {isOpen && (
                                    <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">

                                        {/* 1. Header (User Info) */}
                                        <div className="p-5 border-b border-gray-100 flex items-start space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-yellow-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                                                {user.firstname.charAt(0).toUpperCase()}{user.lastname.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.firstname} {user.lastname}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                                            </div>
                                        </div>

                                        {/* 3. Settings Links */}
                                        <div className="py-2">
                                            <Link to="/profile" className="flex items-center px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                                <FaUser className="mr-3 text-gray-400" />
                                                Profile Settings
                                            </Link>
                                            <Link to="/settings" className="flex items-center px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                                <FaCog className="mr-3 text-gray-400" />
                                                Account Settings
                                            </Link>
                                        </div>

                                        {/* 4. Logout Footer */}
                                        <div className="border-t border-gray-100 p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <FaSignOutAlt className="mr-3" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* --- DROPDOWN MENU END --- */}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        {hasPermission("properties", "add") && hideLink && (
                            <Link className="w-full" to={link}>
                                <div className="flex justify-center items-center space-x-3 focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>{name}</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </div>
                            </Link>
                        )}

                        {hasPermission("payments", "add") && showLink2 && (
                            <Link className="w-full" to={link2}>
                                <div className="flex justify-center items-center space-x-3 focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>{link2Name}</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </div>
                            </Link>
                        )}

                        {hideSelect && (
                            <div className="w-full">
                                <select onChange={onSelectChange} className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 py-2.5">
                                    <option value="">All properties</option>
                                    {(properties || []).map((property) => (
                                        <option key={property.id} value={property.id}>{property.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectUnit && (
                            <div className="w-full">
                                <select onChange={onUnitSelectChange} className="ml-3 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 py-2.5">
                                    <option selected>Select unit</option>
                                    {(units || []).map((unit) => (
                                        <option key={unit.id} value={unit.id}>{unit.unit_number}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>

    )
}

export default DashboardHeader