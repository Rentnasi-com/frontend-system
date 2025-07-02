import { useEffect, useState } from "react"
import axios from "axios"
import { DashboardHeader } from "../../_dashboard/pages/page_components"
import { FaEdit, FaEye, FaTrash } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const ViewLandlord = () => {
    const [landlords, setLandlords] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")
    const navigate = useNavigate()

    useEffect(() => {
        const fetchLandlord = async () => {
            try {
                const response = await axios.get(
                    `${baseUrl}/manage-landlord/get-all-landlord`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setLandlords(response.data.result)
            } catch (error) {
                console.error(error)
            }
        }
        fetchLandlord()
    }, [baseUrl, token])
    return (
        <>
            <DashboardHeader
                title="Landlords Listing"
                description="Real-time information and activities of your landlords."
                name="Add landlord"
                link="/add-landlord/personal-information"
                hideSelect={false}
                hideLink={true}
            />

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">All Landlords </h4>

                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs border-y ">
                                <tr>
                                    <th scope="col" className="px-3 py-3">Photo </th>
                                    <th scope="col" className="px-1 py-3">Landlord Info</th>
                                    <th scope="col" className="px-1 py-3">Properties</th>
                                    <th scope="col" className="px-1 py-3">Vacant Units</th>
                                    <th scope="col" className="px-1 py-3">Occupied Units</th>
                                    <th scope="col" className="px-1 py-3">Expected Revenue</th>
                                    <th scope="col" className="px-1 py-3">Outstanding Revenue</th>
                                    <th scope="col" className="px-1 py-3">Pending Balances</th>
                                    <th scope="col" className="px-1 py-3">Fines</th>
                                    <th scope="col" className="px-3 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {landlords.map((landlord) => (
                                    <tr key={landlord.id} className="bg-white divide-y divide-gray-200">
                                        <td className="px-2 py-4">
                                            <img
                                                src={
                                                    landlord.image ||
                                                    "https://static.thenounproject.com/png/123924-200.png"
                                                }
                                                alt="landlord"
                                                className="w-12 h-12 rounded-full"
                                            />
                                        </td>
                                        <td className="text-xs px-2 py-4">
                                            <div className="font-semibold text-black">
                                                {landlord.landlord_info.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {landlord.landlord_info.email}
                                            </div>
                                            <div className="flex space-x-10 text-xs">
                                                <div className="mt-1">
                                                    <p>Phone</p>
                                                    <p className="font-semibold text-black">
                                                        {landlord.landlord_info.phone}
                                                    </p>
                                                </div>
                                                <div className="mt-1">
                                                    <p>Id or Passport Number</p>
                                                    <p className="font-semibold text-black">
                                                        {landlord.landlord_info.id_or_passport_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4">{landlord.properties}</td>
                                        <td className="px-2 py-4">{landlord.vacant_units}</td>
                                        <td className="px-2 py-4">{landlord.occupied_units}</td>

                                        <td className="py-4 px-2">
                                            <p className="text-center border border-green-700 align-baseline inline-flex px-2 py-1 items-center text-green-700 bg-green-200 rounded font-semibold">
                                                Ksh {(landlord.expected_revenue.toLocaleString() || 0)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-2">
                                            <p className="text-center border border-blue-700 align-baseline inline-flex px-2 py-1 items-center text-blue-700 bg-blue-200 rounded font-semibold">
                                                Ksh {(landlord.outstanding_revenue.toLocaleString() || 0)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-2">
                                            <p className="text-center border border-red-700 align-baseline inline-flex px-2 py-1 items-center text-success bg-red-200 rounded font-semibold">
                                                Ksh {(landlord.pending_balance.toLocaleString() || 0)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-2">
                                            <p className="text-center border border-red-700 align-baseline inline-flex px-2 py-1 items-center text-success bg-red-200 rounded font-semibold">
                                                Ksh {landlord.fines.toLocaleString() || 0}
                                            </p>
                                        </td>
                                        <td className="flex pt-10 px-2 space-x-4">
                                            <FaEye onClick={() => navigate(`/landlords/view-landlord/${landlord.landlord_info.landlord_id}`)} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                                            <FaEdit onClick={() => navigate(`/edit-landlord/personal-information?landlord_id=${landlord.landlord_info.landlord_id}`)} className="text-purple-500 hover:text-purple-700 cursor-pointer" />
                                            {/* <FaTrash onClick={() => openDeleteModal(property)} className="text-red-500 hover:text-red-700 cursor-pointer" /> */}
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

export default ViewLandlord