import { useEffect, useState } from 'react';
import { DashboardHeader } from './page_components'
import axios from 'axios';
import { use } from 'react';
import toast from 'react-hot-toast';

const DueRent = () => {
    const [rentDues, setRentDues] = useState([])
    const [loading, setLoading] = useState(false)
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')

    useEffect(() => {
        fetchRentDues();
        fetchProperties()
    }, [baseUrl, token])

    const fetchRentDues = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/dashboard/due-rent?limit=2&`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );
            setRentDues(response.data.results);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }
    const handleSelectChange = (event) => {
        setSelectedProperty(event.target.value);
    };

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

    return (
        <>
            <DashboardHeader
                title="All Units With Rent Due"
                description="Manage All Your Properties Units in One Place"
                // name="New property"
                // link="/add-property/general-information"
                hideSelect={true}
                hideLink={false}
                properties={properties}
                onSelectChange={handleSelectChange}
            />
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
                                        <th className="px-4 py-2">Unit Name</th>
                                        <th className="px-4 py-2">Tenant Name</th>
                                        <th className="px-4 py-2">Initial Amount</th>
                                        <th className="px-4 py-2">Total Paid</th>
                                        <th className="px-4 py-2">Amount Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentDues.map((rentDue, index) => (
                                        <tr key={index} className="border-b text-sm">
                                            <td className="px-4 py-2">
                                                 {rentDue.floor} Floor - {rentDue.unit_number}, {rentDue.unit_type}
                                                <br />
                                                <span className="text-gray-500 text-xs">
                                                     {rentDue.property_name}
                                                </span>
                                                <br />
                                                <span className="text-gray-500 text-xs">
                                                    {rentDue.location_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {rentDue.tenant_name}
                                                <br />
                                                <span className="text-gray-500 text-xs">
                                                    {rentDue.tenant_phone}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {rentDue.inial_amount_due.toLocaleString()}
                                                <br />
                                                {rentDue.bills?.map((bill, i) => (
                                                    <span key={i} className="capitalize text-gray-500 text-xs block">
                                                        {bill.bill_type} — {bill.amount_due?.toLocaleString()}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 font-bold text-green-500">{rentDue.total_paid.toLocaleString()}
                                                <br />
                                                {rentDue.bills?.map((bill, i) => (
                                                    <span key={i} className="capitalize text-gray-500 text-xs block">
                                                        {bill.bill_type} — {bill.amount_paid?.toLocaleString()}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 font-bold text-red-500">{rentDue.amount_due.toLocaleString()}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default DueRent
