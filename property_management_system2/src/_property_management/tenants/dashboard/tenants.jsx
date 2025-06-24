import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardHeader, TableRow } from "../../_dashboard/pages/page_components";
import { set } from "date-fns";

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

const Tenants = () => {
    const [properties, setProperties] = useState([])
    const [tenants, setTenants] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [lastPage, setLastPage] = useState(1);

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
                setNextPageUrl(response.data.result.next_page_url);
                setPrevPageUrl(response.data.result.prev_page_url);
                setLastPage(response.data.result.last_page);
            }
        } catch (error) {
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleNextPage = () => {
        if (nextPageUrl) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (prevPageUrl) {
            setCurrentPage((prev) => prev - 1);
        }
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

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center">
                    <h4 className="text-md text-gray-600 my-4 px-2">All tenant list</h4>

                    <form onSubmit={handleSubmitSearch} className="w-72 mr-2">
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
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs border-y ">
                                <tr className="py-2">
                                    <th className="px-4 py-2">Tenant Name</th>
                                    <th className="px-4 py-2">Property Name</th>
                                    <th className="px-4 py-2">Unit No</th>
                                    <th className="px-4 py-2">Unit Type</th>
                                    <th className="px-4 py-2">Phone</th>
                                    <th className="px-4 py-2">Rent Amount</th>
                                    <th className="px-4 py-2">Inquiries</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
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

            </div>

            {(nextPageUrl || currentPage > 1) && (
                <div className="flex justify-between items-center mt-4 px-4">

                    {prevPageUrl && (
                        <button
                            onClick={handlePreviousPage}
                            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-red-800 rounded-s hover:bg-red-900"
                        >
                            <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                            </svg>
                            Previous
                        </button>
                    )}

                    {/* Pagination Info */}
                    <span className="text-sm text-gray-600">
                        Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{lastPage}</span>
                    </span>

                    {/* Next Button */}
                    {nextPageUrl && (
                        <button
                            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-red-800 border-0 border-s border-red-700 rounded-e hover:bg-red-900"
                            onClick={handleNextPage}

                        >
                            Next
                            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </>
    )
}

export default Tenants