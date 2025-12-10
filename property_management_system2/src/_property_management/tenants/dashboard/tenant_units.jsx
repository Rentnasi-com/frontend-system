import { Building2, CreditCard, Mail, Phone, Search, User, Wallet } from "lucide-react"
import { DashboardHeader } from "../../properties/dashboard/page_components"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../../../shared"
import { set } from "date-fns"
import { useAuth } from "../../../AuthContext"

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
    const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToVacate, setItemToVacate] = useState(null);
    const [tenantStats, setTenantStats] = useState([])

    const [tenantPayments, setTenantPayments] = useState([])

    const navigate = useNavigate()
    const { hasPermission } = useAuth();

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
                setTenantStats(response.data.tenant_stats)
            } else {
                toast.error(response.data.message || "Error fetching tenant details!")
            }
        } catch (error) {
            toast.error("An error occurred while fetching tenant details!")
        } finally {
            setLoading(false)
        }
    }

    const fetchPayments = async () => {
        try {
            const response = await axios.get(
                `${baseUrl}/payment/received?tenant_id=${tenantId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            if (response.data.success) {
                setTenantPayments(response.data.results)
            }
        } catch (error) {
            toast.error("An error occurred while fetching tenant payments!")
        }
    }

    useEffect(() => {
        fetchTenantDetails()
        fetchPayments()
    }, [token, baseUrl, tenantId,])

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
            setIsVacateModalOpen(false)
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
            toast.error("Failed to delete tenant.");
        }
    };

    const handleVacateModalOpen = (item) => {
        setItemToVacate(item);
        setIsVacateModalOpen(true);
        setOpenDropdownId(false);
    };

    const setWhoToRecievePayment = async (tenantId, unitId, toLandlord) => {
        try {
            const response = await axios.patch(`${baseUrl}/manage-tenant/settings/payment`, {
                tenant_id: tenantId,
                unit_id: unitId,
                payments_to_landlord: toLandlord,
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (response.data.success === true) {
                toast.success("Payment details updated successfully.");
                await fetchTenantDetails()
                setOpenDropdownId(null);
            }
        } catch (error) {
            setOpenDropdownId(null);
            toast.error("An error occurred while updating payment details.");
        }
    };

    const summaryItems = [
        { label: "Total Arrears", value: tenantStats.total_arrears, color: "border-red-500" },
        { label: "Total Expected", value: tenantStats.total_expected, color: "border-blue-500" },
        { label: "Total Fines", value: tenantStats.total_fines, color: "border-yellow-500" },
        { label: "Total Received", value: tenantStats.total_received, color: "border-green-500" },
    ];


    const getMethodIcon = (method) => {
        const normalized = method?.toLowerCase() || '';

        if (normalized.includes('bank')) {
            return (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                </div>
            );
        }

        switch (normalized) {
            case 'mpesa':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-green-600" />
                    </div>
                );
            case 'cash':
                return (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                );
            default:
                return null;
        }
    };

    const getMethodBadgeColor = (method) => {
        const normalized = method?.toLowerCase() || '';

        if (normalized.includes('bank')) {
            return 'bg-blue-100 text-blue-800';
        }

        switch (normalized) {
            case 'mpesa':
                return 'bg-green-100 text-green-800';
            case 'cash':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

            <div className="mx-4 mt-4 mb-6 rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] p-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">

                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-4 rounded-2xl shadow-inner">
                            <User className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                                {tenant.name}
                            </h2>
                            <p className="text-sm text-gray-500">Tenant Profile</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {hasPermission("tenants", "edit") && (
                            <Link
                                to={`/tenants/edit-personal-details?tenant_id=${tenantId}`}
                                className="px-4 py-2.5 text-xs font-medium rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all"
                            >
                                Edit Profile
                            </Link>
                        )}

                        <Link
                            to={`/tenants/add-tenant-unit?tenant_id=${tenantId}`}
                            className="px-4 py-2.5 text-xs font-medium rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md transition-all"
                        >
                            Assign Unit
                        </Link>

                        <button
                            onClick={() => handleDelete(tenantId, tenant.name)}
                            className="px-4 py-2.5 text-xs font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all"
                        >
                            Delete Tenant
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Contact Information */}
                    <div className="md:col-span-2 space-y-5">
                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-gray-900 font-medium">{tenant.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-900 font-medium">{tenant.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Wallet – Own Card */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-gray-900">Wallet</h3>

                        <div className="p-5 rounded-xl border border-green-200 bg-green-50 shadow-inner flex items-center gap-4">
                            <Wallet className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Wallet Balance</p>
                                <p className="text-2xl font-semibold text-green-700">
                                    {tenant.wallet_amount}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Next of Kin */}
                    <div className="md:col-span-3 space-y-5">
                        <h3 className="text-lg font-semibold text-gray-900">Next of Kin</h3>

                        {tenant.next_of_kin_name === "" ? (
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-600">
                                None
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="text-gray-900 font-medium">{tenant.next_of_kin_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-gray-900 font-medium">{tenant.next_of_kin_phone}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 my-6 mx-5">
                {summaryItems.map((item, index) => (
                    <div
                        key={index}
                        className={`rounded-lg py-1 px-4 bg-white/70 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] border hover:shadow-md transition-shadow ${item.color}`}
                    >
                        <p className="text-sm font-medium">{item.label}</p>
                        <h3 className="text-xl font-mono mt-1">
                            KES {item.value?.toLocaleString()}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="relative mx-4 rounded-xl border border-gray-200 overflow-x-auto">
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
                            tenant?.tenantUnits.map((unit, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">
                                        {unit.property_name}
                                        <br />
                                        <span className="text-gray-500 text-xs">
                                            Location: {unit.property_location}
                                        </span>
                                        {unit.payments_to_landlord === false ? (
                                            <p className="text-green-600 text-xs whitespace-nowrap mt-1">We receive payment</p>

                                        ) : (
                                            <p className="text-red-600 text-xs whitespace-nowrap mt-1">We don't receive payment</p>
                                        )}
                                    </td>
                                    < td className="px-4 py-2">
                                        Unit No: {unit.unit_number}
                                    </td>
                                    <td className="text-gray-500 text-xs px-4 py-2">
                                        Arrears:
                                        <span className="text-red-700 pl-2 font-mono">KES {(unit.arrears || 0).toLocaleString()}</span>
                                        <br />
                                        Expected amount:
                                        <span className="text-red-700 pl-2 font-mono">KES {(unit.expected_amount || 0).toLocaleString()}</span>
                                        <br />
                                        Amount received:
                                        <span className="text-red-700 pl-2 font-mono"
                                        >KES {(unit.amount_received || 0).toLocaleString()}</span>
                                    </td>
                                    <td className="text-gray-500 text-xs px-4 py-2">
                                        Fines:
                                        <span className="text-red-700 pl-2 font-mono"
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
                                            <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-visible">
                                                <div className="py-1 overflow-visible">
                                                    <Link
                                                        to={`/property/single-unit/unit_id:${unit.unit_id}`}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                                    >
                                                        View Unit
                                                    </Link>
                                                    <Link
                                                        to={`/tenants/edit-tenant-unit?tenant_id=${tenantId}&unit_id=${unit.unit_id}`}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                                    >
                                                        Edit Unit
                                                    </Link>
                                                    {unit.payments_to_landlord === false ? (
                                                        <button
                                                            onClick={() => setWhoToRecievePayment(tenantId, unit.unit_id, true)}
                                                            className="block w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-100"
                                                        >
                                                            Rent To Landlord
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setWhoToRecievePayment(tenantId, unit.unit_id, false)}
                                                            className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-gray-100"
                                                        >
                                                            Rent To Us
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleVacateModalOpen({
                                                                id: tenantId,
                                                                unit_id: unit.unit_id,
                                                                name: unit.unit_number
                                                            })
                                                        }
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 whitespace-nowrap"
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4 mt-5">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tenant
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Property & Unit
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Reference
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tenantPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors odd:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {payment.name?.split(' ').map(n => n[0]).join('') || '?'}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{payment.name}</p>
                                                <p className="text-xs font-medium text-gray-900">{payment.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-900 font-medium">{payment.unit_details?.property_name}</div>
                                        <div className="text-xs text-gray-500">Unit {payment.unit_details?.unit_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getMethodIcon(payment.method)}
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodBadgeColor(payment.method)}`}>
                                                {payment.method?.toUpperCase() || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs text-gray-600 font-mono">{payment.reference}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-gray-900">
                                            {new Date(payment.date_received?.replace('Z', '')).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(payment.date_received?.replace('Z', '')).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-xs font-mono text-gray-900">
                                            KES {parseFloat(payment.amount || 0).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* No results */}
                {tenantPayments.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                        <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                )}
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

            {isVacateModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Vacation
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to vacate {tenant.name} from{" "}
                            <span className="font-bold">{itemToVacate?.name}</span> permanently? This action
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsVacateModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() =>
                                    handleVacate(itemToVacate?.id, itemToVacate?.unit_id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Vacate
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TenantUnits
