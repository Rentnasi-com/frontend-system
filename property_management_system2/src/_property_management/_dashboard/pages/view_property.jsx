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
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status') || '';

    useEffect(() => {
        if (property_id) {
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
            fetchPropertyDetails();

            const fetchPropertyUnits = async () => {
                const response = await axios.get(
                    `${baseUrl}/manage-property/single-property/unit-listing?property_id=${property_id}&status=${status}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );
                setPropertyUnits(response.data.result);
                setLoading(false);
            };
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
            label: "Expected Income",
            value: `KES ${property?.revenue?.amounts?.expected_income?.count || "0"}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.amount_paid?.images || "",
            label: "Amount Paid",
            value: `KES ${property?.revenue?.amounts?.amount_paid?.count || "0"}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.outstanding_balance?.images || "",
            label: "Outstanding Balance",
            value: `KES ${property?.revenue?.amounts?.outstanding_balance?.count || "0"}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.total_fines?.images || "",
            label: "Total Fines",
            value: `KES ${property?.revenue?.amounts?.total_fines?.count || "0"}`,
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
                            className="rounded w-full h-auto object-cover"
                        />
                    </div>


                    <div className="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold text-lg">{property?.property_name}</h2>
                                <p className="text-gray-500 text-sm">{property?.location_name}</p>
                            </div>
                            {/* Add New Tenant Button */}
                            <Link to="">
                                <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>Add new tenant</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </div>
                            </Link>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-semibold">Property Type: <span className="font-normal">{property?.property_type}</span></p>
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
            <div className="w-full grid grid-cols-12 gap-4 py-1 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className={` bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 ${index > 2 ? "col-span-3" : "col-span-4"}`}>
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
                                    <th className="px-4 py-2">Unit name</th>
                                    <th className="px-4 py-2">Unit type</th>
                                    <th className="px-4 py-2">Floor number</th>
                                    <th className="px-4 py-2">Tenant name</th>
                                    <th className="px-4 py-2">Rent amount</th>
                                    <th className="px-4 py-2">Pending Balances</th>
                                    <th className="px-4 py-2">Rent  status</th>
                                    <th className="px-4 py-2">Actions</th>
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
                                            <td className="px-4 py-2">{unit.unit_number}</td>
                                            <td className="px-4 py-2">{unit.unit_type}</td>
                                            <td className="px-4 py-2">{unit.floor_number}</td>
                                            <td className="px-4 py-2">{unit.tenant}</td>
                                            <td className="px-4 py-2">{unit.rent_amount}</td>
                                            <td className="px-4 py-2">{unit.pending_balances}</td>
                                            <td className="px-4 py-2">
                                                <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{unit.availability_status}</span>
                                            </td>

                                            <td className="flex py-5 px-2 space-x-4">
                                                <FaEye onClick={() => navigate(`/property/single-unit/unit_id:${unit.unit_id}`)} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                                                <FaEdit onClick={() => navigate(`/edit-property/general-information?property_id=${unit.id}`)} className="text-purple-500 hover:text-purple-700 cursor-pointer" />
                                                <FaTrash onClick={() => openDeleteModal(property)} className="text-red-500 hover:text-red-700 cursor-pointer" />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Property;
