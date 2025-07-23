import axios from "axios"
import { DashboardHeader } from "../properties/dashboard/page_components"
import toast from "react-hot-toast"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BulkWaterBill = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedFloor, setSelectedFloor] = useState('')
    const [propertyFloors, setPropertyFloors] = useState([])

    const [properties, setProperties] = useState([])
    const [waterBills, setWaterBills] = useState([])

    useEffect(() => {
        fetchProperties()
    }, [token, baseUrl])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId !== null) {
                // Check if the click is outside any dropdown
                const dropdowns = document.querySelectorAll('[data-dropdown]');
                let isClickOutside = true;

                dropdowns.forEach(dropdown => {
                    if (dropdown.contains(event.target)) {
                        isClickOutside = false;
                    }
                });

                if (isClickOutside) {
                    setOpenDropdownId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdownId])

    const fetchProperties = async () => {
        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/payment/data/properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setProperties(propertyResponse.data.result)
        } catch (error) {
            toast.error("You have no properties")
        }
    }

    const handlePropertyChange = async (event) => {
        const propertyId = event.target.value
        setSelectedProperty(propertyId)

        setSelectedFloor(null);
        setPropertyFloors([]);

        try {
            const floorsResponse = await axios.get(
                `${baseUrl}/payment/data/floors?property_id=${propertyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            if (floorsResponse.data.has_floors) {
                setPropertyFloors(floorsResponse.data.result)
            } else {
                navigate('/')
            }

        } catch (error) {
            toast.error("You have no units in the property selected")
            setPropertyFloors([]);
        }
    }

    const handleFloorChange = async (event) => {
        const floorId = event.target.value
        setSelectedFloor(floorId)

        try {
            const responseWaterBill = await axios.get(`${baseUrl}/manage-tenant/water-billing?property_id=${selectedProperty}&floor_id=${floorId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            if (responseWaterBill.data.success) {
                const billsWithEditableFields = responseWaterBill.data.results.map(bill => ({
                    ...bill,
                    editableUnitPrice: bill.unit_price,
                    editableCurrentReading: 0,
                    isSelected: false, // For bulk selection
                    hasValidReading: false // For validation
                }));
                setWaterBills(billsWithEditableFields || [])
            }
        } catch (error) {
            toast.error("You have no units in the floor selected")
        }
    }

    const toggleDropdown = (id) => {
        setOpenDropdownId(prev => (prev === id ? null : id));
    };

    const handleUnitPriceChange = (index, value) => {
        const updatedBills = [...waterBills];
        updatedBills[index].editableUnitPrice = parseFloat(value) || 0;
        setWaterBills(updatedBills);
    };

    const handleCurrentReadingChange = (index, value) => {
        const updatedBills = [...waterBills];
        const currentReading = parseFloat(value) || 0;
        const previousReading = parseFloat(updatedBills[index].meter_reading) || 0;

        updatedBills[index].editableCurrentReading = currentReading;

        // Add validation flag
        updatedBills[index].hasValidReading = currentReading > previousReading;

        setWaterBills(updatedBills);

        // Show toast error if current reading is not greater than previous
        if (currentReading > 0 && currentReading <= previousReading) {
            toast.error(`Current reading must be greater than previous reading (${previousReading})`);
        }
    };

    const toggleSelectBill = (index) => {
        const updatedBills = [...waterBills];
        updatedBills[index].isSelected = !updatedBills[index].isSelected;
        setWaterBills(updatedBills);
    };

    const calculateUnitsConsumed = (bill) => {
        const previousReading = parseFloat(bill.meter_reading) || 0;
        const currentReading = parseFloat(bill.editableCurrentReading) || 0;
        return Math.max(0, currentReading - previousReading);
    };

    const calculateBillAmount = (bill) => {
        const unitsConsumed = calculateUnitsConsumed(bill);
        const unitPrice = parseFloat(bill.editableUnitPrice) || 0;
        return unitsConsumed * unitPrice;
    };

    const prepareSubmitData = (singleBill = null) => {
        if (singleBill) {
            // Single submission format for individual bill
            if (singleBill.editableCurrentReading <= 0) {
                toast.error("Please enter a current reading for this bill.");
                return null;
            }
            if (!singleBill.hasValidReading) {
                toast.error("Current reading must be greater than previous reading.");
                return null;
            }
            return {
                tenant_id: singleBill.tenant_id,
                unit_id: singleBill.unit_id,
                meter_reading: singleBill.editableCurrentReading,
                ...(singleBill.editableUnitPrice ? { unit_price: singleBill.editableUnitPrice } : {})
            };
        }

        // Get selected bills (if any) or all bills if none are specifically selected
        const billsToSubmit = waterBills.filter(bill =>
            waterBills.some(b => b.isSelected) ? bill.isSelected : true
        ).filter(bill => bill.editableCurrentReading > 0 && bill.hasValidReading);

        if (billsToSubmit.length === 0) {
            const invalidBills = waterBills.filter(bill =>
                bill.editableCurrentReading > 0 && !bill.hasValidReading
            );

            if (invalidBills.length > 0) {
                toast.error("Some readings are invalid. Current reading must be greater than previous reading.");
            } else {
                toast.error("No valid readings to submit. Please enter current readings.");
            }
            return null;
        }

        if (billsToSubmit.length === 1) {
            // Single submission format
            const bill = billsToSubmit[0];
            return {
                tenant_id: bill.tenant_id,
                unit_id: bill.unit_id,
                meter_reading: bill.editableCurrentReading,
                ...(bill.editableUnitPrice ? { unit_price: bill.editableUnitPrice } : {})
            };
        } else {
            // Multiple submission format
            return {
                multiple_meter_reading: billsToSubmit.map(bill => ({
                    tenant_id: bill.tenant_id,
                    unit_id: bill.unit_id,
                    meter_reading: bill.editableCurrentReading,
                    ...(bill.editableUnitPrice ? { unit_price: bill.editableUnitPrice } : {})
                }))
            };
        }
    };

    const handleSubmit = async (singleBill = null) => {
        const submitData = prepareSubmitData(singleBill);
        if (!submitData) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${baseUrl}/manage-tenant/water-billing`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                toast.success("Water readings submitted successfully!");
                // Refresh the data
                handleFloorChange({ target: { value: selectedFloor } });
                // Close any open dropdown
                setOpenDropdownId(null);
            } else {
                toast.error(response.data.message || "Failed to submit readings");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while submitting readings");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <DashboardHeader
                title="Water Billing"
                description="Receive Water Billings"
                name="New property"
                link="/add-property/general-information"
                hideSelect={false}
                hideLink={false}
            />
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-lg text-gray-800">Receive Bulk Water Billing</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Select property
                                </label>
                                <select
                                    value={selectedProperty}
                                    onChange={handlePropertyChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                                    <option defaultValue>Select property</option>
                                    {
                                        properties.map((property) => (
                                            <option key={property.id} value={property.id}>{property.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Select property floors
                                    {propertyFloors.length === 0 && (
                                        <span className="text-red-500 text-xs"> (The selected property has no floors)</span>
                                    )}
                                </label>
                                <select
                                    value={selectedFloor}
                                    onChange={handleFloorChange}
                                    disabled={propertyFloors.length === 0}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                                    <option defaultValue>Select property floor</option>
                                    {
                                        propertyFloors.map((floor) => (
                                            <option key={floor.floor_id} value={floor.floor_id}>{floor.floor_number}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
                        <div className="col-span-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex justify-between my-2 px-2 items-center">
                                <h4 className="text-md text-gray-600">Water Meter History</h4>
                            </div>
                            <div className="w-full">
                                <form className="">
                                    <table className="min-w-full table-auto">
                                        <thead className="bg-gray-100 text-left text-xs">
                                            <tr>
                                                <th className="px-4 py-2 w-8">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            const updatedBills = waterBills.map(bill => ({
                                                                ...bill,
                                                                isSelected: e.target.checked
                                                            }));
                                                            setWaterBills(updatedBills);
                                                        }}
                                                    />
                                                </th>
                                                <th className="px-4 py-2">Tenant</th>
                                                <th className="px-4 py-2">Previous Reading</th>
                                                <th className="px-4 py-2">Unit Price</th>
                                                <th className="px-4 py-2">Current Reading</th>
                                                <th className="px-4 py-2">Units Consumed</th>
                                                <th className="px-4 py-2">Bill</th>
                                                <th className="px-4 py-2">Status</th>
                                                <th className="px-4 py-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {waterBills.length === 0 ? (
                                                <tr>
                                                    <td colSpan="10" className="text-center text-sm my-3">No data found.</td>
                                                </tr>
                                            ) : (
                                                waterBills.map((item, index) => (
                                                    <tr key={index} className="border-b text-xs">
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.isSelected || false}
                                                                onChange={() => toggleSelectBill(index)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">{(item.tenant_name)}</td>
                                                        <td className="px-4 py-2">{(item?.meter_reading || "0")}
                                                            <br />
                                                            <span className="text-xs">
                                                                Recorded At: {new Date(item.date_recorded).toLocaleString('en-US', {
                                                                    dateStyle: 'medium',
                                                                })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="number"
                                                                value={item.editableUnitPrice}
                                                                onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                                                                className="border px-1 py-2 rounded w-24 text-xs"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="number"
                                                                value={item.editableCurrentReading}
                                                                onChange={(e) => handleCurrentReadingChange(index, e.target.value)}
                                                                className={`border px-1 py-2 rounded w-24 text-xs ${item.editableCurrentReading > 0 && !item.hasValidReading
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : 'border-gray-300'
                                                                    }`}
                                                                min={parseFloat(item.meter_reading || 0) + 0.01}
                                                                step="0.01"
                                                            />
                                                            {item.editableCurrentReading > 0 && !item.hasValidReading && (
                                                                <div className="text-red-500 text-xs mt-1">
                                                                    Must be &gt; {item.meter_reading || 0}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-2">
                                                            {calculateUnitsConsumed(item).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {calculateBillAmount(item).toFixed(2)}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                ${item.paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                                            >
                                                                {item.paid ? "Paid" : "Not Paid"}
                                                            </span>
                                                        </td>
                                                        <td className="relative px-4 py-2 text-sm" data-dropdown>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    toggleDropdown(index);
                                                                }}
                                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                            >
                                                                Actions
                                                                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </button>

                                                            {openDropdownId === index && (
                                                                <div
                                                                    className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <div className="py-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                handleSubmit(item);
                                                                            }}
                                                                            disabled={isSubmitting || item.editableCurrentReading <= 0 || !item.hasValidReading}
                                                                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${isSubmitting || item.editableCurrentReading <= 0 || !item.hasValidReading
                                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                                : 'text-blue-600'
                                                                                }`}
                                                                        >
                                                                            {isSubmitting ? 'Submitting...' : 'Submit Reading'}
                                                                        </button>
                                                                        <Link
                                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            View Tenant
                                                                        </Link>
                                                                        <button
                                                                            type="button"
                                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            Vacate Tenant
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
                                </form>
                            </div>

                            {/* Multiple Submit Button - Bottom Right */}
                            {waterBills.length > 0 && (
                                <div className="flex justify-end py-2 px-4">
                                    <button
                                        onClick={() => handleSubmit()}
                                        disabled={isSubmitting || waterBills.length === 0}
                                        className={`px-2 py-1 rounded-md text-sm text-white ${isSubmitting || waterBills.length === 0
                                            ? 'bg-gray-400'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Multiple Readings'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BulkWaterBill