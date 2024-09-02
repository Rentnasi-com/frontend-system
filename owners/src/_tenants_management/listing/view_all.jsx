import axios from "axios"
import { useEffect, useState } from "react"

const ViewAllTenants = () => {
    const [tenants, setTenants] = useState([])
    const baseURL = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/manage-tenant/get-all-tenants`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                )

                if (response.data.success) {
                    setTenants(response.data.result)
                    console.log(response.data.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchTenants()
    }, [token, baseURL])
    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Tenants Listing</h1>
                    <p className="text-sm text-gray-500">Real-time information and activities of your tenants.</p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white col-span-2 mx-8 h-full">
                    <div className="overflow-hidden border border-gray-200 rounded mt-3">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                                <tr>
                                    <th scope="col" className="px-3 py-3">
                                        Photo
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        tenant Info
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        Vacant Units
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        Occupied Units
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        Open Issues
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        Expected Revenue
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        Outstanding Revenue
                                    </th>
                                    <th scope="col" className="px-1 py-3">
                                        Pending Balances
                                    </th>
                                    <th scope="col" className="px-3 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="bg-white divide-y divide-gray-200">
                                        <td className="px-2 py-4">
                                            <img
                                                src={
                                                    tenant.document_url ||
                                                    "https://static.thenounproject.com/png/123924-200.png"
                                                }
                                                alt="tenant"
                                                className="w-12 h-12 rounded-full"
                                            />
                                        </td>
                                        <td className="px-2 py-4">
                                            <div className="font-semibold text-black">
                                                {tenant.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {tenant.email}
                                            </div>
                                            <div className="flex space-x-10">
                                                <div className="mt-1">
                                                    <p>Phone</p>
                                                    <p className="font-semibold text-black">
                                                        {tenant.phone}
                                                    </p>
                                                </div>
                                                <div className="mt-1">
                                                    <p>Id or Passport Number</p>
                                                    <p className="font-semibold text-black">
                                                        {tenant.id_or_passport_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4">{tenant.vacant_units}</td>
                                        <td className="px-2 py-4">{tenant.occupied_units}</td>
                                        <td className="py-4">
                                            <div className="text-center align-baseline inline-flex px-2 py-1 items-center text-success border border-red-900 bg-red-200 rounded">
                                                <div className="bg-red-800 border border-red-600 rounded-full w-2 h-2 mr-1"></div>
                                                <p className="font-semibold text-red-800">
                                                    {tenant.open_issues}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-center border border-green-700 align-baseline inline-flex px-2 py-1 items-center text-green-700 bg-green-200 rounded font-semibold">
                                                {(tenant.expected_revenue)}
                                            </p>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-center border border-blue-700 align-baseline inline-flex px-2 py-1 items-center text-blue-700 bg-blue-200 rounded font-semibold">
                                                {(tenant.outstanding_revenue)}
                                            </p>
                                        </td>
                                        <td className="py-4">
                                            <p className="text-center border border-red-700 align-baseline inline-flex px-2 py-1 items-center text-success bg-red-200 rounded font-semibold">
                                                {(tenant.pending_balance)}
                                            </p>
                                        </td>
                                        <td className="text-center">
                                            <button

                                                className="text-gray-600 bg-gray-300 hover:text-gray-800 flex justify-center items-center h-[25px] w-[25px] text-base font-medium leading-normal text-center align-middle cursor-pointer rounded-2xl transition-colors duration-200 ease-in-out shadow-none border-0"
                                            >
                                                <span className="flex items-center justify-center p-0 m-0 leading-none shrink-0">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                        className="w-4 h-4"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                                        />
                                                    </svg>
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewAllTenants