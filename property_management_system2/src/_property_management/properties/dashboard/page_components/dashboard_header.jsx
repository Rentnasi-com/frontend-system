import { Link } from "react-router-dom"
import QRCode from "react-qr-code"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { FaBell } from "react-icons/fa"

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


    const dataToSend = {
        sessionId: localStorage.getItem("sessionId"),
        userId: localStorage.getItem("userId"),
    }

    const handleLogout = () => {
        toast.success("Redirecting to auth")
        localStorage.clear()
        window.location.href = `${AUTH_URL}`
    }

    const menuItems = [
        { label: 'Dashboard', action: () => console.log('Dashboard clicked') },
        { label: 'Settings', action: () => console.log('Settings clicked') },
        { label: 'Earnings', action: () => console.log('Earnings clicked') },
        { label: 'Logout', action: handleLogout }
    ];

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

    // const PackageDetails = async () => {
    //   try {
    //     const response = await axios.post(`${baseUrl}/auth/package-manager`, {},
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       }
    //     )
    //     setPackageDetails(response.data.package)

    //     if (response.data.package?.expiry_date) {
    //       const expiryDate = new Date(response.data.package.expiry_date)
    //       const now = new Date()
    //       setIsExpired(now > expiryDate)
    //     }
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }

    // const getUserDetails = async () => {
    //   try {
    //     const response = await axios.post(`${baseUrl}/v2/get-user`, dataToSend,
    //       {
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       }
    //     )
    //     console.log(response)
    //     if (response.data.success) {
    //       localStorage.setItem("userDetails", JSON.stringify(response.data.result))
    //     }
    //   } catch (error) {
    //     console.error(error)
    //   }
    // }

    return (
        <>

            {isExpired && (
                <div className="bg-gray-700 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0">
                    <div className="relative p-4 w-full max-w-md max-h-full">

                        <div className="relative bg-white rounded-lg border border-gray-200">
                            {/* <button type="button" onClick={handleClose} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button> */}
                            <div className="p-4 md:p-5">
                                <svg className="w-10 h-10 text-gray-400  mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
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
                                    {/* <button onClick={handleClose} type="button" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">Cancel</button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 md:flex justify-between sticky top-0 z-30 bg-white rounded-b-xl">
                <div>
                    <h1 className="text-lg font-semibold text-gray-600">{title}</h1>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>


                <div className="">
                    <div className="flex justify-end space-x-3 mb-2">
                        <div className="bg-gray-200 px-2 py-1 flex justify-center items-center rounded-xl">
                            <FaBell />
                        </div>

                        <div className="relative inline-block" ref={dropdownRef}>

                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center justify-center rounded-xl bg-gray-200 p-2 hover:bg-gray-200 transition-colors"
                                aria-expanded={isOpen}
                                aria-haspopup="true"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-yellow-700"
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

                            {isOpen && (
                                <div
                                    className="absolute right-0 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
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
                                                    ? 'text-yellow-600 hover:bg-yellow-50'
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
                    <div className="flex space-x-3">
                        {hideLink && (
                            <Link to={link}>
                                <div className="flex space-x-3 focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>{name}</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </div>
                            </Link>
                        )}

                        {showLink2 && (
                            <Link to={link2}>
                                <div className="flex space-x-3 focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>{link2Name}</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </div>
                            </Link>
                        )}

                        {hideSelect && (
                            <div className="">
                                <select onChange={onSelectChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 py-2.5">
                                    <option value="">All properties</option>
                                    {(properties || []).map((property) => (
                                        <option key={property.id} value={property.id}>{property.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectUnit && (
                            <div>
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