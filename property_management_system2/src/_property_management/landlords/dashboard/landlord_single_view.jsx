import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "../../../shared";
import { DashboardHeader, PropertyCard } from "../../properties/dashboard/page_components";
import { Loader } from "lucide-react";

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
        {[...Array(4)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-32 mx-auto" />
            </td>
        ))}

    </tr>
);

const LandlordSingleView = () => {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState([]);
    const [landlordDetails, setLandlordDetails] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState([]);
    const [lastPage, setLastPage] = useState(1);
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate()
    const { landlord_id } = useParams();

    const [openAddPropertyModal, setOpenAddPropertyModal] = useState(false)
    const [selectedProperties, setSelectedProperties] = useState([])
    const [isLoadingProperties, setIsLoadingProperties] = useState(true)
    const [fetchError, setFetchError] = useState(null)
    const [properties, setProperties] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stats = [

        {
            // redirectUrl: "/property/revenue-breakdown",
            iconSrc: details.all_properties?.images,
            progress: 20,
            label: "All Properties",
            value: details.all_properties?.count || 0,
        },

        {
            // redirectUrl: "/property/revenue-breakdown",
            iconSrc: details.all_property_units?.images || "",
            progress: 20,
            label: "All Property Units",
            value: details.all_property_units?.count || 0,
        },
        {
            // redirectUrl: "/property/revenue-breakdown",
            iconSrc: details.occupied_units?.images || "",
            progress: 20,
            label: "Occupied Units",
            value: details.occupied_units?.count || 0,
        },
        {
            // redirectUrl: "/property/revenue-breakdown",
            iconSrc: details.vacant_units?.images || "",
            progress: 20,
            label: "Vacant Units",
            value: details.vacant_units?.count || 0,
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
            value: `KES ${(revenue.total_fines?.count || 0).toLocaleString()}`,
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

    useEffect(() => {
        fetchLandlordDetails(currentPage);
        fetchProperties()
    }, [currentPage, token, landlord_id, baseUrl]);

    const fetchLandlordDetails = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${baseUrl}/manage-property/view-properties/saved?pagination=${page}&landlord_id=${landlord_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const result = response.data;
            setUnits(result.result.data);
            setDetails(response.data.details.breakdown);
            setRevenue(response.data.details.revenue.amounts);
            setLandlordDetails(response.data.details.landlord_details);
            setCurrentPage(result.current_page);
            setNextPageUrl(result.next_page_url);
            setPrevPageUrl(result.prev_page_url);
            setLastPage(result.last_page);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

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
                            // "Content-Type": "application/json",
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
                setIsModalOpen(false); // Close the modal
                setItemToDelete(null);
            }
        }
    };

    const fetchProperties = async () => {
        setIsLoadingProperties(true);
        setFetchError(null);

        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/manage-landlord/required-data/available-properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setProperties(propertyResponse.data.result)
        } catch (error) {
            setFetchError("Failed to fetch properties. Please try again.")
        } finally {
            setIsLoadingProperties(false)
        }
    }

    const handleSelectChange = (event) => {
        const selectedOption = Number(event.target.value); // Convert to number
        if (selectedOption && !selectedProperties.includes(selectedOption)) {
            setSelectedProperties((prev) => {
                const updatedProperties = [...prev, selectedOption];
                return updatedProperties;
            });
        }
    };

    const handleRemoveProperty = (propertyId) => {
        setSelectedProperties((prev) => prev.filter((id) => id !== propertyId));
    };

    const propertiesOptions = useMemo(() => (
        properties
            .filter(property => !selectedProperties.includes(property.id)) // Filter out selected properties
            .map((property) => (
                <option value={property.id} key={property.id}>{property.name}</option>
            ))
    ), [properties, selectedProperties]);
    const handlePropertySubmit = async (e) => {
        e.preventDefault();

        if (selectedProperties.length === 0) {
            toast.error("Please select at least one property.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.put(
                `${baseUrl}/manage-landlord/create-landlord/other-info`,
                {
                    landlord_id: parseInt(landlord_id),
                    properties: selectedProperties
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success("Properties added successfully!");
                setSelectedProperties([]);
                setOpenAddPropertyModal(false);
                // Refresh the properties list
                fetchLandlordDetails(currentPage);
            }
        } catch (error) {
            console.error("Error adding properties:", error);
            toast.error(error.response?.data?.message || "Failed to add properties. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    return (
        <>
            <DashboardHeader
                title="Landlord View"
                description="View all information about your landlord"
                name="Add landlord"
                link="/add-landlord/personal-information"
                hideSelect={false}
                hideLink={true}
            />
            <div className="m-4 py-2 bg-white rounded border">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full px-4 mt-4 md:mt-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold text-lg">{landlordDetails.name}</h2>
                                <div className="flex justify-between space-x-4 mt-2">
                                    <p className="text-gray-500 text-sm">{landlordDetails.email}</p>
                                    <p className="text-gray-500 text-sm">Phone: {landlordDetails.phone}</p>
                                </div>
                            </div>
                            {/* Add New Tenant Button */}
                            <div className="flex space-x-4">
                                <Link to={`/edit-landlord/personal-information?landlord_id=${landlord_id}`}>
                                    <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                        <p>Edit landlord</p>
                                        <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                    </div>
                                </Link>

                                <button onClick={() => setOpenAddPropertyModal(true)} className="flex space-x-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>Add Property</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="w-full grid grid-cols-12 gap-4 py-1 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className="col-span-3">
                        <PropertyCard
                            redirectUrl={stat.redirectUrl}
                            iconSrc={stat.iconSrc}
                            label={stat.label}
                            value={stat.value}
                        />
                    </div>
                ))}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
                {loading ? (
                    <p className="text-center py-4">Loading...</p>
                ) : (
                    <div className="w-full">
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
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
                                        <th className="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array(5).fill(0).map((_, index) => (
                                            <TableRowSkeleton key={index} />
                                        ))
                                    ) : (
                                        units.map((property, index) => (
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
                                                        {property.bills.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className=" text-gray-700 text-end">
                                                    <span className="text-yellow-600">
                                                        {property.fines.toLocaleString()}
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
                                                    {/* Dropdown button - only in Actions column */}
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
                )}
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
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {openAddPropertyModal && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Add Properties
                        </h2>
                        <form onSubmit={handlePropertySubmit}>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Select landlord property
                                </label>
                                {isLoadingProperties ? (
                                    <Loader className="animate-spin" />
                                ) : (
                                    <select
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        onChange={handleSelectChange}
                                    >
                                        <option value="">Select property to link to this landlord</option>
                                        {propertiesOptions}
                                    </select>
                                )}

                                {fetchError && (
                                    <p className="text-xs text-red-500">
                                        {fetchError}
                                    </p>
                                )}
                            </div>

                            <div className="mt-3">
                                {selectedProperties.map((propertyId) => {
                                    const property = properties.find((property) => (property.id) === (propertyId));

                                    return (
                                        <span
                                            key={propertyId}
                                            className="inline-flex items-center px-2 py-1 mr-2 mb-2 text-sm font-medium text-green-800 bg-green-100 rounded"
                                        >
                                            {property ? property.name : "unknown"}

                                            <button
                                                type="button"
                                                className="inline-flex items-center p-1 ml-2 text-sm text-green-400 bg-transparent rounded-sm hover:bg-green-200 hover:text-green-900"
                                                onClick={() => handleRemoveProperty(propertyId)}
                                                aria-label="Remove"
                                            >
                                                <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                </svg>
                                                <span className="sr-only">Remove badge</span>
                                            </button>
                                        </span>
                                    )
                                })}
                            </div>

                            <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || selectedProperties.length === 0}
                                    className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpenAddPropertyModal(false)}
                                    className="text-white bg-red-700 hover:bg-red-700 p-2.5 rounded"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

export default LandlordSingleView