import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { DashboardHeader, PropertyCard, QuickLinksCard } from "./page_components";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
const Property = () => {
    const { property_id } = useParams();
    const [property, setProperty] = useState([]);
    const [propertyUnits, setPropertyUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status') || '';

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const fetchPropertyUnits = async (page = 1) => {
        const response = await axios.get(
            `${baseUrl}/manage-property/single-property/unit-listing?property_id=${property_id}&pagination=${page}&status=${status}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
        setPropertyUnits(response.data.result);
        setLoading(false);
        setCurrentPage(response.data.pagination.current_page);
        setPagination(response.data.pagination)
    };

    const fetchPropertyDetails = async () => {
        const response = await axios.get(
            `${baseUrl}/manage-property/single-property/details?property_id=${property_id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
        setProperty(response.data.result);
        setLoading(false);
    };

    useEffect(() => {
        if (property_id) {
            fetchPropertyDetails();
            fetchPropertyUnits();
        }
    }, [property_id, baseUrl, token, status]);


    const stats = [
        {
            redirectUrl: `/property/view-property/${property_id}?status=`,
            iconSrc: property?.units_breakdown?.all_units?.images || "",
            label: "Total Units",
            value: property?.units_breakdown?.all_units?.count || 0,
        },
        {
            redirectUrl: `/property/view-property/${property_id}?status=occupied`,
            iconSrc: property?.units_breakdown?.occupied?.images || "",
            label: "Occupied Units",
            value: property?.units_breakdown?.occupied?.count || 0,
        },
        {
            redirectUrl: `/property/view-property/${property_id}?status=available`,
            iconSrc: property?.units_breakdown?.vacant?.images || "",
            label: "Vacant Units",
            value: property?.units_breakdown?.vacant?.count || 0,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.expected_income?.images || "",
            label: "Rent Payable",
            value: `KES ${(property?.revenue?.amounts?.total_rent?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.outstanding_balance?.images || "",
            label: "Previous Arrears",
            value: `KES ${Number(property?.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}`
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.total_fines?.images || "",
            label: "Total Bills",
            value: `KES ${(property?.revenue?.amounts?.total_bills?.count || "0").toLocaleString()}`,
        },

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.expected_income?.images || "",
            label: "Total Payable",
            value: `KES ${(property?.revenue?.amounts?.expected_income?.count || "0").toLocaleString()}`,
        },

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.amount_paid?.images || "",
            label: "Amount Paid",
            value: `KES ${(property?.revenue?.amounts?.amount_paid?.count || "0").toLocaleString()}`,
        },



        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.total_fines?.images || "",
            label: "Total Balance",
            value: `KES ${(property?.revenue?.amounts?.total_balance?.count || "0").toLocaleString()}`,
        },
    ];
    const quicks = [
        {
            url: "/reports",
            icon: "./../../../../assets/icons/png/reports.png",
            title: "Reports",
            description: "View all your property reports",
            bgColor: "bg-[#BAE5F5]"
        },
        {
            url: "/maintenance",
            icon: "./../../../../assets/icons/png/maintenance.png",
            title: "Maintenance",
            description: "Manage your maintenance request",
            bgColor: "bg-[#CCF0C0]"
        },
        {
            url: "/inquiries",
            icon: "./../../../../assets/icons/png/inquiries-1.png",
            title: "Inquiries",
            description: "View all your tenant inquiries",
            bgColor: "bg-[#E1D3FE]"
        }
    ]

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchPropertyUnits(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchPropertyUnits(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchPropertyUnits(pageNumber);
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

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    return (
        <>
            <DashboardHeader
                title="Property details"
                description="View all information about your property"
            />
            <div className="m-4 p-2 bg-white rounded border">
                <div className="flex flex-col md:flex-row">

                    <div className="w-full md:w-1/3">
                        <img
                            src={property?.cover_image || "https://via.placeholder.com/300"}
                            alt={property?.property_name || "Property"}
                            className="rounded w-full h-44 object-cover"
                        />
                    </div>


                    <div className="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold text-lg">{property?.property_name}</h2>
                                <p className="text-gray-500 text-sm">{property?.location_name}</p>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    to="/tenants/add-personal-details"
                                    className="flex space-x-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded text-xs px-2 py-2.5"
                                >
                                    Add Tenant
                                </Link>
                                <Link
                                    to={`/edit-property/general-information?property_id=${property_id}`}
                                    className="flex space-x-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded text-xs px-2 py-2.5"
                                >
                                    Edit Property
                                </Link>
                                <Link
                                    to="/add-property/multi-single-unit"
                                    className="flex space-x-3 focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded text-xs px-2 py-2.5"
                                >
                                    Add Unit
                                </Link>

                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-semibold">Property Type: <span className="font-normal">{property?.property_type}</span></p>
                            <p className="text-xs font-semibold">Payment Status: <span className="font-normal">
                                {property?.payments_to_landlord === true ? "Landlord Receiving Payment" : "Agency Receiving Payment"}
                            </span>
                            </p>
                        </div>


                        <div className="mt-4">
                            <h3 className="text-red-500 font-semibold text-xs">Quick action</h3>
                            <div className="flex space-x-4 mt-2">
                                {quicks.map((quick, index) => (
                                    <QuickLinksCard
                                        key={index}
                                        url={quick.url}
                                        icon={quick.icon}
                                        title={quick.title}
                                        description={quick.description}
                                        bgColor={quick.bgColor}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full gap-4 py-1 px-4">
                {/* First 3 cards in grid-cols-3 */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {stats.slice(0, 3).map((stat, index) => (
                        <div key={index} className="">
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))}
                </div>

                {/* Remaining cards in grid-cols-5 */}
                <div className="grid grid-cols-4 gap-4">
                    {stats.slice(3).map((stat, index) => (
                        <div key={index + 3}>
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))}
                </div>

            </div >
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
                <div className="w-full">
                    <div className="">
                        <table className="min-w-full table-auto">
                            <thead className="sticky top-0 bg-gray-100 text-left text-xs">
                                <tr>
                                    <th className="px-4 py-2">Unit</th>
                                    <th className="px-4 py-2">Tenant</th>
                                    <th className="text-end">Exp Rent</th>
                                    <th className="text-end">Prev Arrears</th>
                                    <th className="text-end">Bills</th>
                                    <th className="text-end">Fines</th>
                                    <th className="text-end">Expected</th>
                                    <th className="text-end">Paid</th>
                                    <th className="text-end">Balances</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className=""></th>
                                </tr>
                            </thead>
                            <tbody>
                                {propertyUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-sm my-3">No data found.</td>
                                    </tr>
                                ) : (
                                    propertyUnits.map((unit, index) => (
                                        <tr key={index} className="border-b text-sm">
                                            <td className="px-4 py-2">
                                                {unit.unit_number}
                                                <br />
                                                <span className="text-gray-500 text-xs">{unit.unit_type}</span>
                                                <br />
                                                <span className="text-gray-500 text-xs">{unit.floor_number}</span>
                                            </td>
                                            <td className="px-4 py-2 text-xs">
                                                {unit.tenant}

                                                <span className="text-gray-700 text-xs">
                                                    <br />{unit.tenant_phone}
                                                </span>

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
                                            </td>
                                            <td className=" text-gray-700 text-end">
                                                <span className="text-blue-600">
                                                    {(unit.rent_amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className=" text-gray-700 text-end">
                                                <span className="text-orange-600">
                                                    {unit.arrears.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className=" text-gray-700 text-end">
                                                <span className="text-yellow-600">
                                                    {unit.bills.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className=" text-gray-700 text-end">
                                                <span className="text-yellow-600">
                                                    {unit.fines.toLocaleString()}
                                                </span>
                                            </td>

                                            <td className=" text-gray-700 text-end">
                                                <span className="text-blue-600">
                                                    {(unit.expected).toLocaleString()}
                                                </span>
                                            </td>


                                            <td className=" text-gray-700 text-end">
                                                <span className="text-green-600">
                                                    {unit.received.toLocaleString()}
                                                </span>
                                            </td>

                                            <td className=" text-gray-700 text-end">
                                                <span className="text-indigo-600">
                                                    {unit.pending_balances.toLocaleString()}
                                                </span>
                                            </td>


                                            <td className="px-4 py-2 text-xs">
                                                {unit.availability_status === 'available' ? (
                                                    <>
                                                        <br />
                                                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                                                            Vacant
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <br />
                                                        {unit.pending_balances === 0 ? (
                                                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                                                                No Balance
                                                            </span>
                                                        ) : (
                                                            <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">
                                                                With Balance
                                                            </span>
                                                        )}
                                                    </>
                                                )}

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
                                                    <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                        <div className="py-1">
                                                            <Link
                                                                to={`/property/single-unit/unit_id:${unit.unit_id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                View Unit
                                                            </Link>
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
                                                                Edit Assign Unit
                                                            </Link>

                                                            {/* <button
                                                                onClick={() => openDeleteModal(property)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete Property
                                                            </button> */}
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
            </div >
            {
                pagination && pagination.last_page > 1 && (
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
                )
            }
        </>
    );
};

export default Property;
