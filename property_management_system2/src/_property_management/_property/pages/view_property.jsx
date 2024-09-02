import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";

const View_Property = () => {
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const propertyId = queryParams.get("property_id");
    const baseURL = import.meta.env.VITE_BASE_URL || "https://pm.api.rentnasi.com/api/v1";

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/manage-property/single-property/details?property_id=${propertyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                if (response.data.success) {
                    setPropertyDetails(response.data.result);
                } else {
                    setError("Failed to fetch property details. Please try again later.");
                }
            } catch (error) {
                if (error.response) {
                    setError(`Error: ${error.response.data.message}`);
                } else {
                    setError("Network error. Please check your internet connection.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) {
            fetchPropertyDetails();
        }
    }, [propertyId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!propertyDetails) {
        return <div>No property details available.</div>;
    }

    const chartData = {
        type: 'doughnut',
        labels: ["Occupied", "Vacant", "Under Maintenance"],
        datasets: [
            {
                label: "Units Breakdown",
                data: [
                    propertyDetails.units_breakdown.occupied.count,
                    propertyDetails.units_breakdown.vacant.count,
                    propertyDetails.units_breakdown.under_maintenance.count
                ],
                backgroundColor: [
                    `#${propertyDetails.units_breakdown.occupied.color}`,
                    `#${propertyDetails.units_breakdown.vacant.color}`,
                    `#${propertyDetails.units_breakdown.under_maintenance.color}`
                ],
            },
        ],
    };

    const chartOptions = {
        
        plugins: {
            legend: {
                display: false
            }
        }
    };

    const handleViewProperty = (floorId) => {
        navigate(`/property/unit-listing?property_id=${propertyId}&floor_id=${floorId}`);
    };

    return (
        <section className="grid grid-cols-3 m-4 gap-3">
            <div className="col-span-2">
                <div className="grid grid-cols-2 p-2 rounded bg-[#F2F2F2] border-3 border-white">
                    <div className="">
                        <h1 className="font-bold text-2xl">Welcome Back To {propertyDetails.property_name}</h1>
                        <p className="text-sm">This is your property portfolio report</p>
                        <div className="flex space-x-3 mt-3">
                            <div className="pie-chart w-1/2 mt-2">
                                <Pie data={chartData} options={chartOptions} />
                            </div>
                            <div className="chart-labels mt-4">
                                {chartData.labels.map((label, index) => (
                                    <div key={index} className="chart-label flex">
                                        <div
                                            className="w-1 h-4 mr-2 label-color"
                                            style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                                        ></div>
                                        <span className="text-sm text-gray-600">{label}: {chartData.datasets[0].data[index]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs mt-2">Last updated: 3 days ago</p>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <img width={282} height={208} src="/assets/icons/png/property_details.png" alt="property details" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="bg-white border-1 border-gray-300 rounded p-2 shadow-xl">
                        <div className="flex justify-between">
                            <img width={25} height={25} src="/assets/icons/png/maintain.png" alt="" />
                            <p className="text-xs">Maintenance Request</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">
                                {propertyDetails.maintenance_requests}
                            </p>
                            <img width={24} height={24} src="/assets/icons/png/arrow.png" alt="" />
                        </div>
                    </div>
                    <div className="bg-white border-1 border-gray-300 rounded p-2 shadow-xl">
                        <div className="flex justify-between">
                            <img width={25} height={25} src="/assets/icons/png/enquiry.png" alt="" />
                            <p className="text-xs">Enquiry messages</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">
                                {propertyDetails.enquiry_messages}
                            </p>
                            <img width={24} height={24} src="/assets/icons/png/arrow.png" alt="" />
                        </div>
                    </div>
                    <div className="bg-white border-1 border-gray-300 rounded p-2 shadow-xl">
                        <div className="flex justify-between">
                            <img width={25} height={25} src="/assets/icons/png/vacate.png" alt="" />
                            <p className="text-xs">Vacate notice</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-medium">
                                {propertyDetails.vacate_notices}
                            </p>
                            <img width={24} height={24} src="/assets/icons/png/arrow.png" alt="" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="">
                <div className="bg-white rounded p-2 space-y-2">
                    <h2 className="text-sm font-semibold">My Todo list</h2>
                    <div className="flex justify-between border border-gray-200 rounded p-2">
                        <div className="flex justify-center items-center">
                            <div className="rounded-full bg-red-700 p-1 w-1"></div>
                        </div>
                        <div className="">
                            <p className="text-sm font-medium">Renew Tenancy</p>
                            <p className="text-xs">
                                Checking Simon Kamau tenancy agreement
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs">June 22 at 6:00 PM</p>
                            <p className="flex text-xs">
                                Done
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded col-span-3 flex justify-between">
                <div className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white">
                    Property floors
                    <p className="mt-1 text-sm font-normal text-gray-500">Here is a list of all the floors and some statistics</p>
                    <input type="text" className="mt-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-64 p-2.5" placeholder="Search..." required />
                </div>
                <div className="p-5">
                    <div className="flex space-x-4">
                        <button type="button" className="flex text-gray-700 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded text-sm px-3 py-1.5">
                            <img className="mr-2" width={16} height={16} src="/assets/icons/png/bottom.png" alt="" />
                            Export
                        </button>
                        <button type="button" className="flex text-gray-100 bg-red-600 border border-gray-300 focus:outline-none hover:bg-red-700 focus:ring-4 focus:ring-gray-100 rounded text-sm px-3 py-1.5">
                            <img className="mr-2" width={16} height={16} src="/assets/icons/png/plus.png" alt="" />
                            Add Floor
                        </button>
                    </div>
                    <div className="flex space-x-4 mt-3">
                        <button type="button" className="flex text-gray-700 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded text-sm px-3 py-1.5">
                            <img className="mr-2" width={16} height={16} src="/assets/icons/png/tabs.png" alt="" />
                            Filter
                        </button>
                        <button type="button" className="flex text-gray-700 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded text-sm px-3 py-1.5">
                            <img className="mr-2" width={16} height={16} src="/assets/icons/png/tabs.png" alt="" />
                            Newest to oldest
                        </button>
                    </div>
                </div>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded col-span-3">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Floor number
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Total Units
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Occupied Units
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Vacant Units
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Units under maintenance
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(propertyDetails.property_floors_listing.data) && propertyDetails.property_floors_listing.data.length > 0 ? (
                            propertyDetails.property_floors_listing.data.map((floor) => (
                                <tr key={floor.floor_id} className="bg-white border border-b">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {floor.floor_number}
                                    </th>
                                    <td className="px-6 py-4">
                                        {floor.total_units}
                                    </td>
                                    <td className="px-6 py-4">
                                        {floor.occupied_units}
                                    </td>
                                    <td className="px-6 py-4">
                                        {floor.vacant_units}
                                    </td>
                                    <td className="px-6 py-4">
                                        {floor.under_maintenance_units}
                                    </td>
                                    <td className="flex space-x-2 px-6 py-4">
                                        <button className="text-red-600" onClick={() => handleViewProperty(floor.floor_id)}>
                                            View units
                                        </button>
                                        <img width={16} height={16} src="/assets/icons/png/redirect.png" alt="" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No floors available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default View_Property;
