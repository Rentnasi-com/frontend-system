import { useEffect, useState } from "react";
import { DashboardHeader, PropertyCard, TableRow } from "./page_components";
import axios from "axios";
import { useLocation } from "react-router-dom";

const UnitListing = () => {
    const [propertiesBreakdown, setPropertiesBreakdown] = useState([])
    const [propertiesRevenue, setPropertiesRevenue] = useState([])
    const [propertiesUnits, setPropertiesUnits] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1)
    const [isNextClicked, setIsNextClicked] = useState(false)
    const [pagination, setPagination] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [properties, setProperties] = useState([])

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
                setTotalPages(response.data.result.last_page)
                setPagination(response.data.result)
            }
        } catch (error) {
            console.error(error)
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
            console.error(error.message)
        }
    }

    useEffect(() => {
        fetchPropertiesDetails(currentPage)
        fetchProperties()
    }, [currentPage, status, token, selectedProperty])

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setIsNextClicked(true)
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
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
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 py-1 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className={` bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 ${index > 2 ? "md:col-span-3" : "md:col-span-4"}`}>
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
                                {propertiesUnits.map((property, index) => (
                                    <TableRow
                                        key={index}
                                        title={property.property_name}
                                        unit={property.unit_number}
                                        type={property.unit_type}
                                        floor={property.floor_number}
                                        monthly_rent={property.rent_amount}
                                        status={property.availability_status}
                                        eyeLink={`/property/single-unit/unit_id:${property.unit_id}`}
                                        eyeEdit={`/edit-property/single-unit/property_id:${property.property_id}/unit_id:${property.unit_id}`}
                                        isShowing={true}
                                        isShowingButtons={property.availability_status === "available"}
                                        isInMarket={property.in_market == true}
                                        addTenantLink={`/tenants/add-personal-details/`}
                                        addMarketUnitLink={`/property/market-unit?property_id=${property.property_id}&unit_id=${property.unit_id}`}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {totalPages >= 2 && (
                <div className="flex justify-between items-center mt-3 px-4">
                    {isNextClicked && (
                        <button
                            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-red-800 rounded-s hover:bg-red-900"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                            </svg>
                            Previous
                        </button>
                    )}


                    <span className="text-sm text-gray-700">
                        Showing page <span className="font-semibold text-gray-900">{pagination.from}</span> of <span className="font-semibold text-gray-900">{pagination.last_page}</span>
                    </span>
                    <button
                        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-red-800 border-0 border-s border-red-700 rounded-e hover:bg-red-900"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
};

export default UnitListing;
