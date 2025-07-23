import { useEffect, useState } from "react";
import { DashboardHeader, PropertyCard, TableRow } from "./page_components";
import axios from "axios";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

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
                setPropertiesRevenue(response.data.details.revenue.amounts)
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
    ];

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
                <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs">
                                <tr>
                                    <th className="px-4 py-2">Property Name</th>
                                    <th className="px-4 py-2">Unit Name</th>
                                    <th className="px-4 py-2">Unit Type</th>
                                    <th className="px-4 py-2">Floor</th>
                                    <th className="px-4 py-2">Amount</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <TableRowSkeleton key={index} />
                                    ))
                                ) : (
                                    propertiesUnits.map((property, index) => (
                                        <TableRow
                                            key={index}
                                            title={property.property_name}
                                            unit={property.unit_number}
                                            type={property.unit_type}
                                            floor={property.floor_number}
                                            monthly_rent={Number(property?.rent_amount || 0).toLocaleString()}
                                            status={property.availability_status}
                                            eyeLink={`/property/single-unit/unit_id:${property.unit_id}`}
                                            eyeEdit={`/edit-property/single-unit/property_id:${property.property_id}/unit_id:${property.unit_id}`}
                                            isShowing={true}
                                            isShowingButtons={property.availability_status === "available"}
                                            isInMarket={property.in_market == true}
                                            addTenantLink={`/tenants/add-personal-details/`}
                                            addMarketUnitLink={`/property/market-unit?property_id=${property.property_id}&unit_id=${property.unit_id}`}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
    );
};

export default UnitListing;
