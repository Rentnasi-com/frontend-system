import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardHeader, PropertyCard, TableRow } from "../../_dashboard/pages/page_components";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        <td className="px-4 py-3"><SkeletonLoader className="w-12 h-12" rounded /></td>
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
            <SkeletonLoader className="h-3 w-24" />
        </td>
        {[...Array(4)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-12 mx-auto" />
            </td>
        ))}
        <td className="px-4 py-3 flex space-x-4">
            <SkeletonLoader className="h-5 w-5 rounded" />
            <SkeletonLoader className="h-5 w-5 rounded" />
            <SkeletonLoader className="h-5 w-5 rounded" />
        </td>
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

const Tenants = () => {
    const [properties, setProperties] = useState([])
    const [tenants, setTenants] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const [selectedProperty, setSelectedProperty] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties()
        fetchTenants(currentPage)

    }, [currentPage, baseUrl, token, selectedProperty, confirmedSearch])

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
            console.error(error.message)
        }
    }

    const fetchTenants = async (page = 1) => {
        try {
            const response = await axios.get(`${baseUrl}/manage-tenant/get-all-tenants?property_id=${selectedProperty}&query=${confirmedSearch}&pagination=${page}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setTenants(response.data.result.data)
                setCurrentPage(response.data.result.current_page);
                setPagination(response.data.result)
            }
        } catch (error) {
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchTenants(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchTenants(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchTenants(pageNumber);
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

    const handleSearch = (event) => {
        setSearchQuery(event.target.value); // Update the search input state
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery); // Only confirm search upon submission
        console.log("Searching for:", searchQuery); // Replace this with your API call
    };

    const stats = [
        {
            redirectUrl: "/property/property-listing",
            iconSrc: "../../../assets/icons/png/total_property.png",
            progress: 2.2,
            label: "Total Tenants",
            value: 6,
        },
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            progress: 4.2,
            label: "Fully Paid Tenants",
            value: 10,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            progress: 3.2,
            label: "Partially Paid Tenants",
            value: 13,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            progress: 3.2,
            label: "Not Paid Tenants",
            value: 13,
        }
    ]

    return (
        <>
            <DashboardHeader
                title="All your tenants"
                description="Manage all your tenant here"
                link="/tenants/add-personal-details"
                name="Add tenant"
                hideSelect={true}
                hideLink={true}
                properties={properties}
                onSelectChange={handleSelectChange}
            />

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 py-1 px-4">
                {loading ? (
                    Array(4).fill(0).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <div key={index} className={` bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2`}>
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

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
                    <h4 className="text-md text-gray-600">All tenant list</h4>

                    <form onSubmit={handleSubmitSearch} className="w-72">
                        <label className="text-sm font-medium text-gray-900 sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                                placeholder="Search Tenants..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </form>
                </div>

                {/* Table Container with Fixed Height and Scroll */}
                <div className="relative max-h-[590px] overflow-y-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100 text-left text-xs border-b sticky top-0 z-20">
                            <tr className="py-2">
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Tenant Name</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Property Name</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Unit No</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Unit Type</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Phone</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Rent Amount</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Inquiries</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : (
                                tenants.map((tenant, index) => (
                                    <TableRow
                                        key={index}
                                        tenant={tenant.name}
                                        title={tenant.property_name}
                                        unit={tenant.unit_no}
                                        type={tenant.unit_floor}
                                        status={tenant.roomStatus}
                                        phone_no={tenant.phone}
                                        monthly_rent={tenant.rent_amount}
                                        openIssues={"Pending Issues"}
                                        isShowing={true}
                                        eyeLink={`/property/single-unit/unit_id:${tenant.unit_id}`}
                                        eyeEdit={`/tenants/edit-personal-details?tenant_id=${tenant.id}&unit_id=${tenant.unit_id}`}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
    )
}

export default Tenants