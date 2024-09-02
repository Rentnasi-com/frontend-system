import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const UnitListing = () => {
    const [unitDetails, setUnitDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const propertyId = queryParams.get("property_id");
    const floorId = queryParams.get("floor_id");

    const fetchUnitDetails = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://pm.api.rentnasi.com/api/v1/manage-property/single-property/unit-listing?property_id=${propertyId}&page=${page}&floor_id=${floorId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.data.success) {
                setUnitDetails(response.data.result.data);
                setCurrentPage(response.data.result.current_page);
                setTotalPages(response.data.result.last_page);
            } else {
                setError("Failed to fetch unit details.");
            }
        } catch (error) {
            setError("Error fetching unit details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (propertyId && floorId) {
            fetchUnitDetails(1);
        }
    }, [propertyId, floorId]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            fetchUnitDetails(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchUnitDetails(currentPage - 1);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!unitDetails.length) {
        return <div>No unit details available.</div>;
    }

    return (
        <section className="p-4">
            <div className="bg-white rounded col-span-3 flex justify-between">
                <div className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white">
                    Units Overview
                    <p className="mt-1 text-sm font-normal text-gray-500">Here is a list of all the units and some statistics</p>
                    <input type="text" className="my-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-64 p-2.5" placeholder="Search..." required />
                </div>
                <div className="p-5">
                    <div className="flex space-x-4">
                        <button type="button" className="flex text-gray-700 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded text-sm px-3 py-1.5">
                            <img className="mr-2" width={16} height={16} src="/assets/icons/png/bottom.png" alt="" />
                            Export
                        </button>
                        <button type="button" className="flex text-gray-100 bg-red-600 border border-gray-300 focus:outline-none hover:bg-red-700 focus:ring-4 focus:ring-gray-100 rounded text-sm px-3 py-1.5">
                            <img className="mr-2" width={16} height={16} src="/assets/icons/png/plus.png" alt="" />
                            Add Unit
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
            <div className="relative overflow-x-auto shadow rounded">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Unit number
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Availability status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Unit type
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Inquiries
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Pending balances
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {unitDetails.map((unit, index) => (
                            <tr key={unit.unit_id} className="bg-white border border-b">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {index + 1 + (currentPage - 1) * 10}
                                </th>
                                <td className="px-6 py-4">
                                    {unit.unit_number}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="rounded-xl text-center" style={{
                                        backgroundColor: hexToRgba(unit.availability_status.bg_color, 0.28),
                                        color: `#${unit.availability_status.text_color}`,
                                        border: `1px solid #${unit.availability_status.border_color}`
                                    }}>
                                        {unit.availability_status.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {unit.unit_type}
                                </td>
                                <td className="px-6 py-4">
                                    {unit.inquiries}
                                </td>
                                <td className="px-6 py-4">
                                    Ksh {unit.pending_balances}
                                </td>
                                <td className="flex space-x-1 px-6 py-4">
                                    <a href={`/manage-unit/${unit.unit_id}`} className="font-medium text-red-600 hover:underline">Manage unit</a>
                                    <img height={16} width={16} src="/assets/icons/png/redirect.png" alt=""/>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex justify-between mt-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 bg-gray-200 rounded ${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-300'}`}
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 bg-gray-200 rounded ${currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-300'}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default UnitListing;
