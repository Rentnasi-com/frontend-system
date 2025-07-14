import { Mail, Phone, User } from "lucide-react"
import { DashboardHeader } from "../../_dashboard/pages/page_components"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../../../shared"

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        <td className="px-4 py-3"><SkeletonLoader className="w-12 h-5" /></td>
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
        </td>
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
        </td>
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
        </td>
        {[...Array(1)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-12 mx-auto" />
            </td>
        ))}
    </tr>
);

const TenantUnits = () => {
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL

    const [tenant, setTenant] = useState([])
    const [searchParams] = useSearchParams();
    const tenantId = searchParams.get('tenant_id')

    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const navigate = useNavigate()


    const fetchTenantDetails = async () => {
        try {
            const response = await axios.get(
                `${baseUrl}/manage-tenant/create-tenant/basic-info?tenant_id=${tenantId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            if (response.data.success) {
                setTenant(response.data.result)
            } else {
                toast.error(response.data.message || "Error fetching tenant details!")
            }
        } catch (error) {
            toast.error("An error occurred while fetching tenant details!")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchTenantDetails()
    }, [token, baseUrl])

    const handleVacate = async (tenantId, unitId) => {
        try {
            await axios.post(`${baseUrl}/manage-tenant/vacate-tenant`, {
                tenant_id: tenantId,
                unit_id: unitId
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            setOpenDropdownId(null);
            toast.success("Tenant vacated successfully!");
            fetchTenantDetails()
        } catch (error) {
            console.error("Vacate error:", error);
            toast.error("Failed to vacate tenant.");
        }
    };


    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    const handleDelete = (tenantId, tenantName) => {
        setItemToDelete({ id: tenantId, name: tenantName });
        setIsDeleteModalOpen(true);
    };

    const handleSingleDelete = async () => {
        console.log("Deleting tenant:", itemToDelete);
        if (!itemToDelete?.id) return;

        try {
            const response = await toast.promise(
                axios.delete(`${baseUrl}/manage-tenant/delete-and-restore-tenant`, {
                    data: { tenant_id: itemToDelete.id },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                {
                    loading: "Deleting your tenant ...",
                    success: "Tenant deleted successfully, check your bin.",
                    error: "Failed to delete tenant. Please try again later.",
                }
            );

            // Optional: If your API returns a custom message
            if (response?.data?.message) {
                toast.success(response.data.message);
            }

            // Navigate after delete
            navigate("/tenants");
        } catch (error) {
            console.error("Deletion error:", error);
            toast.error("Failed to delete tenant.");
        }
    };



    return (
        <>
            <DashboardHeader
                title="The tenant units"
                description="View tenant information and associated units"
                link="/tenants/add-personal-details"
                name="Assign Unit"
                hideSelect={false}
                hideLink={false}
            />

            <div className="rounded-lg border border-gray-200 bg-white p-6 mb-8 mx-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">{tenant.name}</h2>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            to={`/tenants/edit-personal-details?tenant_id=${tenantId}`}
                            className="flex space-x-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-xs px-2 py-2.5"
                        >
                            Edit Profile
                        </Link>
                        <Link
                            to={`/tenants/add-tenant-unit?tenant_id=${tenantId}`}
                            className="flex space-x-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-xs px-2 py-2.5"
                        >
                            Assign Unit
                        </Link>

                        <button
                            onClick={() => handleDelete(tenantId, tenant.name)}
                            className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-xs px-2 py-2.5"
                        >
                            Delete Tenant
                        </button>

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                        <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="text-gray-900">{tenant.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="text-gray-900">{tenant.email}</p>
                            </div>
                        </div>
                    </div>


                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Next of Kin</h3>
                        {tenant.next_of_kin_name == "" ? (
                            <p className="px-4 py-2">None</p>
                        ) : (
                            <>
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="text-gray-900">{tenant.next_of_kin_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="text-gray-900">{tenant.next_of_kin_phone}</p>
                                    </div>
                                </div>
                            </>
                        )
                        }
                    </div>
                </div>
            </div>

            <div className="relative max-h-[590px] overflow-auto mx-4 rounded-lg border border-gray-200">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100 text-left text-xs border-b sticky top-0 z-20">
                        <tr className="px-4 py-2">

                            <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Property Details</th>
                            <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Units Details</th>
                            <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Amounts</th>
                            <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Fines</th>
                            <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            Array(5).fill(0).map((_, index) => (
                                <TableRowSkeleton key={index} />
                            ))
                        ) : (
                            tenant.tenantUnits.map((unit, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">
                                        {unit.property_name}
                                        <br />
                                        <span className="text-gray-500 text-xs">
                                            Location: {unit.property_location}
                                        </span>
                                    </td>

                                    < td className="px-4 py-2">
                                        Unit No: {unit.unit_number}
                                    </td>

                                    <td className="text-gray-500 text-xs px-4 py-2">
                                        Rent amount:
                                        <span className="text-red-700 pl-2">KES {(unit.rent_amount || 0).toLocaleString()}</span>
                                        <br />
                                        Arrears:
                                        <span className="text-red-700 pl-2"
                                        >KES {(unit.arrears || 0).toLocaleString()}</span>
                                    </td>
                                    <td className="text-gray-500 text-xs px-4 py-2">
                                        Fines:
                                        <span className="text-red-700 pl-2"
                                        >KES {(unit.fines || 0).toLocaleString()}</span>

                                        <br />
                                        Rent due date: <span className="text-red-700 pl-2">{unit.rent_due_date}</span>
                                        <br />
                                        Due rent fine start date:
                                        <span className="text-red-700 pl-2">{unit.due_rent_fine_start_date}</span>
                                    </td>

                                    <td className="relative px-4 py-2 text-sm">
                                        {/* Dropdown button - only in Actions column */}
                                        <button
                                            onClick={() => toggleDropdown(unit.unit_id)}
                                            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                        >
                                            Actions
                                            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>


                                        {openDropdownId === unit.unit_id && (
                                            <div className="absolute right-0 z-10 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                <div className="py-1">
                                                    <Link
                                                        to={`/property/single-unit/unit_id:${unit.unit_id}`}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                    >
                                                        View Unit
                                                    </Link>
                                                    <Link
                                                        to={`tenants/add-tenant-unit?tenant_id:${tenantId}&unit_id:${unit.unit_id}`}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Edit Unit
                                                    </Link>

                                                    <button
                                                        onClick={() => handleVacate(tenantId, unit.unit_id)}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Vacate Tenant
                                                    </button>

                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isDeleteModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to delete{" "}
                            <span className="font-bold">{itemToDelete?.name}</span> permanently? This action
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleSingleDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default TenantUnits
