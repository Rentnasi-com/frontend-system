import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { Button } from "../../../shared";
import toast from "react-hot-toast";
import { DashboardHeader, PropertyCard } from "./page_components";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        {/* <td className="px-4 py-3"><SkeletonLoader className="w-12 h-12" rounded /></td> */}
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
            <SkeletonLoader className="h-3 w-24" />
        </td>
        {[...Array(8)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-20 mx-auto" />
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
        </div>
    </div>
);

const PropertyListing = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState([]);
    const [revenue, setRevenue] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Changed from array to null

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    const fetchProperties = async (page = 1) => {
        try {
            setLoading(true);


            const response = await axios.get(
                `${baseUrl}/manage-property/view-properties/saved?pagination=${page}&query=${confirmedSearch}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const result = response.data;

            setProperties(result.result?.data || result.data || []);
            setDetails(result.details?.breakdown || {});
            setRevenue(result.details?.revenue?.amounts || {});

            setCurrentPage(response.data.result.current_page);
            setPagination(response.data.result)

        } catch (err) {

            toast.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    // Remove currentPage from dependency array to prevent infinite loops
    useEffect(() => {
        fetchProperties(currentPage);
    }, [token, confirmedSearch]); // Only depend on token

    // Separate effect for page changes
    useEffect(() => {
        if (currentPage > 1) {
            fetchProperties(currentPage);
        }
    }, [currentPage]);

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchProperties(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchProperties(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchProperties(pageNumber);
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

    const stats = [
        {
            redirectUrl: "/property/property-listing",
            iconSrc: "../../../assets/icons/png/total_property.png",
            progress: 2.2,
            label: "Total Properties",
            value: details.all_properties?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            progress: 4.2,
            label: "Total Units",
            value: details.all_property_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            progress: 3.2,
            label: "Occupied Units",
            value: details.occupied_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=available",
            iconSrc: "../../../assets/icons/png/vacate.png",
            progress: 2,
            label: "Vacant units",
            value: details.vacant_units?.count,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 20,
            label: "Rent Payable",
            value: `KES ${(revenue.total_rent?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 80,
            label: "Previous Arrears",
            value: `KES ${(revenue.arrears?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/outstanding_balance.png",
            progress: 3.4,
            label: "Total Bills",
            value: `KES ${(revenue.total_bills?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Total fines",
            value: `KES ${(revenue.fines?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Total Payable",
            value: `KES ${(revenue.expected_amount?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Amount Paid",
            value: `KES ${(revenue.amount_paid?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Total Balance",
            value: `KES ${(revenue.outstanding_balance?.count || 0).toLocaleString()}`,
        },
    ];

    const openDeleteModal = (property) => {
        setItemToDelete(property);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            try {
                const deleteItem = await axios.post(
                    `${baseUrl}/manage-property/delete?property_id=${itemToDelete.id}`, {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (deleteItem.status === 200 || deleteItem.status === 204) {
                    setProperties((prevProperties) =>
                        prevProperties.filter((property) => property.id !== itemToDelete.id)
                    );
                    toast.success(`${itemToDelete.property_name} moved to recycle bin successfully.`);
                } else {
                    console.error("Failed to delete item.");
                }
            } catch (error) {
                console.error("Error deleting item:", error);
            } finally {
                setIsModalOpen(false);
                setItemToDelete(null);
            }
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery);
    };

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    const setWhoToRecievePayment = async (propertyId, toLandlord) => {
        try {
            const response = await axios.patch(`${baseUrl}/settings/payment/details`, {
                property_id: propertyId,
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
                fetchProperties()
                setOpenDropdownId(null);
            }
        } catch (error) {
            setOpenDropdownId(null);
        }
    };

    return (
        <>
            <DashboardHeader
                title="All your property"
                description="Manage All Your Properties in One Place"
                name="New property"
                link="/add-property/general-information"
                hideSelect={false}
                hideLink={true}
            />
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 py-1 px-4">
                {loading ? (
                    Array(8).fill(0).map((_, index) => (
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
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center">
                    <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
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
                                placeholder="Search property..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </form>
                </div>
                <div>
                    <div className="">
                        <table className="min-w-full">
                            <thead className="bg-gray-100 text-left text-xs border-y ">
                                <tr className="py-2">
                                    {/* <th className="px-4 py-2">Photo</th> */}
                                    <th className="px-4 py-2">Property</th>
                                    <th className="text-end">Exp Rent</th>
                                    <th className="text-end">Pre Arrears</th>
                                    <th className="text-end">Fines</th>
                                    <th className="text-end">Bills</th>
                                    <th className="text-end">Total Payable</th>
                                    <th className="text-end">Paid</th>
                                    <th className="text-end">Balances</th>
                                    <th className="px-6 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <TableRowSkeleton key={index} />
                                    ))
                                ) : (
                                    properties.map((property, index) => (
                                        <tr key={index} className="border-b text-sm overflow-x-auto">

                                            <td className="px-4 py-2">
                                                {property.property_name}
                                                <br />
                                                <span className="text-gray-500 text-xs">
                                                    Occupied: {property.occupied_units}
                                                </span>
                                                <br />
                                                <span className="text-gray-500 text-xs">
                                                    Vacant: {property.vacant_units}
                                                </span>
                                            </td>

                                            <td className=" text-gray-700 text-end">
                                                <span className="text-yellow-600 ">
                                                    {property.rent.toLocaleString()}
                                                </span>

                                            </td>



                                            <td className=" text-gray-700 text-end">
                                                <span className="text-orange-600">
                                                    {property.arrears.toLocaleString()}
                                                </span>

                                            </td>

                                            <td className=" text-gray-700 text-end">
                                                <span className="text-yellow-600">
                                                    {property.fines.toLocaleString()}
                                                </span>

                                            </td>
                                            <td className=" text-gray-700 text-end">
                                                <span className="text-yellow-600">
                                                    {property.bills.toLocaleString()}
                                                </span>
                                            </td>

                                            <td className=" text-gray-700 text-end">

                                                {property.expected.toLocaleString()}

                                            </td>


                                            <td className=" text-gray-700 text-end">
                                                <span className="text-green-600 ">
                                                    {property.received.toLocaleString()}
                                                </span>

                                            </td>

                                            <td className=" text-gray-700 text-end">
                                                <span className="text-teal-600 ">
                                                    {property.balance.toLocaleString()}
                                                </span>
                                            </td>


                                            <td className="relative px-4 py-2 text-sm">
                                                <button
                                                    onClick={() => toggleDropdown(property.id)}
                                                    className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Actions
                                                    <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>


                                                {openDropdownId === property.id && (
                                                    <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                        <div className="py-1">
                                                            <Link
                                                                to={`/property/view-property/${property.id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                View Property
                                                            </Link>

                                                            <Link
                                                                to={`/edit-property/general-information?property_id=${property.id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit Property
                                                            </Link>
                                                            {property.payments_to_landlord === false ? (
                                                                <button
                                                                    onClick={() => setWhoToRecievePayment(property.id, true)}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-100"
                                                                >
                                                                    Rent To Landlord
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setWhoToRecievePayment(property.id, false)}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-gray-100"
                                                                >
                                                                    Rent To Rentalpay
                                                                </button>
                                                            )}

                                                            <hr />

                                                            <button
                                                                onClick={() => openDeleteModal(property)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete Property
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
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 text-center mt-2">
                            Are you sure you want to move this property{" "}
                            <span className="font-bold">{itemToDelete?.property_name}</span> to recycle bin? This action
                            can be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleDelete}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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

export default PropertyListing;