import { useEffect, useState } from "react";
import { DashboardHeader, PropertyCard, TableRow } from "./page_components";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">

        {[...Array(7)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-32 mx-auto" />
            </td>
        ))}

    </tr>
);
const StatCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="flex justify-between items-center">
            <SkeletonLoader className="h-8 w-8 rounded" />
            <SkeletonLoader className="h-6 w-6 rounded" />
        </div>
        <div className="mt-3">
            <SkeletonLoader className="h-4 w-24 mb-2" />
            {/* <SkeletonLoader className="h-6 w-16" /> */}
        </div>
    </div>
);
const UnitListing = () => {
    const [propertiesBreakdown, setPropertiesBreakdown] = useState([])
    const [propertiesRevenue, setPropertiesRevenue] = useState([])
    const [propertiesUnits, setPropertiesUnits] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status') || '';

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL

    const fetchPropertiesDetails = async (page = 1) => {
        try {
            const response = await axios.get(`${baseUrl}/manage-property/view-properties/units?status=${status}&pagination=${page}&property_id=${selectedProperty}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            if (response.data.success) {
                setPropertiesBreakdown(response.data.details.breakdown)
                setPropertiesRevenue(response.data.details)
                setPropertiesUnits(response.data.result.data)
                setCurrentPage(response.data.result.current_page);
                setPagination(response.data.result)
            }
        } catch (error) {
            toast.error("An error occurred while fetching property details!")
        } finally {
            setLoading(false)
        }
    }

    const fetchProperties = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-landlord/required-data/available-properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setProperties(response.data.result)
            }
        } catch (error) {
            toast.error("Failed to fetch properties")
        }
    }

    useEffect(() => {
        fetchPropertiesDetails(currentPage)
        fetchProperties()
    }, [currentPage, status, token, selectedProperty])

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchPropertiesDetails(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchPropertiesDetails(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchPropertiesDetails(pageNumber);
        }
    };

    const generatePageNumbers = () => {
        if (!pagination) return [];

        const { current_page, last_page } = pagination;
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const handleSelectChange = (event) => {
        setSelectedProperty(event.target.value);
    };

    const stats = [
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            label: "Total Units",
            value: propertiesBreakdown.all_property_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            label: "Occupied Units",
            value: propertiesBreakdown.occupied_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=available",
            iconSrc: "../../../assets/icons/png/vacate.png",
            label: "Vacant units",
            value: propertiesBreakdown.vacant_units?.count,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.expected_income?.images || "",
            label: "Total Payable",
            value: `KES ${(propertiesRevenue.revenue?.amounts?.expected_income?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.expected_income?.images || "",
            label: "Total Rent",
            value: `KES ${(propertiesRevenue.revenue?.amounts?.total_rent?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.amount_paid?.images || "",
            label: "Amount Paid",
            value: `KES ${(propertiesRevenue.revenue?.amounts?.amount_paid?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.outstanding_balance?.images || "",
            label: "Total Arrears",
            value: `KES ${Number(propertiesRevenue.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}`
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.total_fines?.images || "",
            label: "Total Fines",
            value: `KES ${(propertiesRevenue.revenue?.amounts?.total_fines?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.total_fines?.images || "",
            label: "Total Bills",
            value: `KES ${(propertiesRevenue.revenue?.amounts?.total_bills?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: propertiesRevenue.revenue?.amounts?.total_fines?.images || "",
            label: "Total Balance",
            value: `KES ${(propertiesRevenue.revenue?.amounts?.total_balance?.count || "0").toLocaleString()}`,
        },
    ];

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
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
            if (response.status === 200) {
                toast.success("Payment details updated successfully.");
                await fetchPropertiesDetails()
                setOpenDropdownId(null);
            }
        } catch (error) {
            setOpenDropdownId(null);
        }
    };

    return (
        <>
            <DashboardHeader
                title="All your units"
                description="Manage All Your Properties in One Place"
                name="New unit"
                link="/add-property/multi-single-unit"
                hideSelect={true}
                hideLink={true}
                properties={properties}
                onSelectChange={handleSelectChange}

            />
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 py-1 px-4">
                {loading ? (
                    Array(3).fill(0).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <div key={index}>
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))
                )}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5 overflow-auto">
                <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>

                <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                        <tr>
                            <th className="px-6 py-3 text-left">Property</th>
                            <th className="px-6 py-3 text-left">Unit</th>
                            <th className="px-6 py-3 text-left">Tenant</th>

                            <th className="px-6 py-3 text-right">Exp Rent</th>
                            <th className="px-6 py-3 text-right">Prev Arrears</th>
                            <th className="px-6 py-3 text-right">Bills</th>
                            <th className="px-6 py-3 text-right">Fines</th>
                            <th className="px-6 py-3 text-right">Paid</th>
                            <th className="px-6 py-3 text-right">Rent</th>
                            <th className="px-6 py-3 text-right">Balances</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {loading ? (
                            Array(5).fill(0).map((_, index) => (
                                <TableRowSkeleton key={index} />
                            ))
                        ) : (
                            propertiesUnits.map((unit, index) => (
                                <tr key={index} className="odd:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap">{unit.property_name}</td>

                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {unit.unit_number}
                                        <p className="text-gray-500 text-xs">{unit.unit_type}</p>
                                        <p className="text-gray-500 text-xs">Floor: {unit.floor_number}</p>
                                    </td>

                                    {/* Tenant */}
                                    <td className="px-4 py-2 text-xs">
                                        {unit.tenant}

                                        <p className="text-gray-700 text-xs">
                                            {unit.tenant_phone}
                                        </p>

                                        {unit.availability_status === 'available' ? (
                                            <>

                                            </>

                                        ) : (
                                            <>
                                                <br />
                                                <span className="bg-red-100 border border-red-400 text-red-600 px-2 text-xs rounded">
                                                    Occupied
                                                </span>
                                            </>
                                        )}
                                        {unit.payments_to_landlord === false ? (
                                            <p className="text-green-600 text-xs whitespace-nowrap mt-1">Payment to Managers</p>

                                        ) : (
                                            <p className="text-red-600 text-xs whitespace-nowrap mt-1">Payment to Landlord</p>
                                        )}
                                    </td>

                                    {/* Rent Info */}
                                    <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                        {(unit.expected).toLocaleString()}
                                    </td>

                                    <td className="px-6 py-3 text-right font-mono text-orange-600">
                                        {unit.arrears.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                        {unit.fines.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-yellow-600">

                                        {unit.bills.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono">
                                        {unit.received.toLocaleString()}
                                    </td>

                                    <td className="px-6 py-3 text-right font-mono text-green-600">
                                        {(unit.rent_amount).toLocaleString()}
                                    </td>

                                    <td className="px-6 py-3 text-right font-mono text-red-600">
                                        {unit.pending_balances.toLocaleString()}
                                    </td>

                                    <td className="px-6 py-3 text-right text-xs whitespace-nowrap">
                                        {unit.availability_status === "available" ? (
                                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                                                Vacant
                                            </span>
                                        ) : unit.pending_balances === 0 ? (
                                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                                                No Balance
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">
                                                With Balance
                                            </span>
                                        )}
                                    </td>
                                    {/* Actions Dropdown */}
                                    < td className="relative px-4 py-2 text-sm">
                                        <button
                                            onClick={() => toggleDropdown(unit.unit_id)}
                                            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                        >
                                            Actions
                                            <svg
                                                className="w-5 h-5 ml-2 -mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>

                                        {openDropdownId === unit.unit_id && (
                                            <div className="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                <div className="py-1">
                                                    {/* View Unit */}
                                                    <Link
                                                        to={`/property/single-unit/unit_id:${unit.unit_id}`}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                    >
                                                        View Unit
                                                    </Link>

                                                    {/* Add Tenant - Only if Available */}
                                                    {unit.availability_status === 'available' && (
                                                        <Link
                                                            to={`/tenants/add-personal-details/?property_id=${unit.property_id}&unit_id=${unit.unit_id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                                        >
                                                            Add Tenant
                                                        </Link>
                                                    )}

                                                    {/* Market Unit - Only if in market */}
                                                    {unit.availability_status === 'available' && (
                                                        <Link
                                                            to={`/property/market-unit?property_id=${unit.property_id}&unit_id=${unit.unit_id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-yellow-700 hover:bg-yellow-50"
                                                        >
                                                            Market Unit
                                                        </Link>
                                                    )}
                                                    <Link
                                                        to={`/tenants/edit-tenant-unit?tenant_id=${unit.tenant_id}&unit_id=${unit.unit_id}`}
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Edit Unit
                                                    </Link>
                                                    {unit.payments_to_landlord === false ? (
                                                        <button
                                                            onClick={() => setWhoToRecievePayment(unit.tenant_id, unit.unit_id, true)}
                                                            className="block w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-100"
                                                        >
                                                            Rent To Landlord
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setWhoToRecievePayment(unit.tenant_id, unit.unit_id, false)}
                                                            className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-gray-100"
                                                        >
                                                            Rent To Us
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}

                    </tbody>
                    {propertiesUnits.length > 0 && (
                        <tfoot className="sticky bottom-0 bg-yellow-100 font-mono text-sm border-t-2 border-yellow-400 shadow-inner">
                            <tr>
                                <td colSpan="3" className="px-4 py-2 text-center">Totals</td>

                                <td className="px-4 py-2 text-right text-blue-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.expected, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right text-orange-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.arrears, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right text-yellow-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.fines, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right text-yellow-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.bills, 0).toLocaleString()}
                                </td>

                                <td className="px-4 py-2 text-right text-blue-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.received, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right text-green-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.rent_amount, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right text-indigo-600">
                                    {propertiesUnits.reduce((sum, u) => sum + u.pending_balances, 0).toLocaleString()}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    )}
                </table>

            </div >

            {pagination && pagination.last_page > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 gap-4">
                    {/* Pagination Info */}
                    <div className="text-sm text-gray-700">
                        Showing page {pagination.from} to {pagination.last_page} of {pagination.total} results
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <button
                            className={`flex items-center justify-center px-3 h-8 text-sm font-medium rounded-l ${currentPage === 1
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-white bg-red-800 hover:bg-red-900'
                                }`}
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || loading}
                        >
                            <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                            </svg>
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {generatePageNumbers().map((pageNum) => (
                            <button
                                key={pageNum}
                                className={`flex items-center justify-center px-3 h-8 text-sm font-medium ${pageNum === currentPage
                                    ? 'text-white bg-red-800'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
                                    }`}
                                onClick={() => handlePageClick(pageNum)}
                                disabled={loading}
                            >
                                {pageNum}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            className={`flex items-center justify-center px-3 h-8 text-sm font-medium rounded-r ${currentPage === pagination.last_page
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-white bg-red-800 hover:bg-red-900'
                                }`}
                            onClick={handleNextPage}
                            disabled={currentPage === pagination.last_page || loading}
                        >
                            Next
                            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default UnitListing;
