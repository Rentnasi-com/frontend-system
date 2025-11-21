import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DashboardHeader } from "../properties/dashboard/page_components";
import { useSearchParams } from "react-router-dom";

const TransferPayment = () => {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [propertyFloors, setPropertyFloors] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState("");
    const [propertyUnits, setPropertyUnits] = useState([]);

    const [unitTenantDetails, setTenantDetails] = useState(null);
    const [selectedUnitFullDetails, setSelectedUnitFullDetails] = useState(null);
    const [notes, setNotes] = useState("");

    const [searchParams] = useSearchParams();
    const moneyId = searchParams.get("money_id");

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");

    const [isProcessing, setIsProcessing] = useState(false);

    // ------------------------------------------------------------
    // FETCH PROPERTIES
    // ------------------------------------------------------------
    useEffect(() => {
        fetchProperties();
    }, [token, baseUrl]);

    useEffect(() => {
        setSelectedUnitFullDetails(null);
    }, [selectedProperty]);

    const fetchProperties = async () => {
        try {
            const response = await axios.get(`${baseUrl}/payment/data/properties`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProperties(response.data.result);
        } catch (error) {
            toast.error("You have no properties.");
        }
    };

    // ------------------------------------------------------------
    // SELECT PROPERTY
    // ------------------------------------------------------------
    const handlePropertyChange = async (event) => {
        const propertyId = event.target.value;

        setSelectedProperty(propertyId);
        setSelectedFloor("");
        setSelectedUnit("");
        setPropertyUnits([]);
        setPropertyFloors([]);
        setTenantDetails(null);

        try {
            const floorsRes = await axios.get(
                `${baseUrl}/payment/data/floors?property_id=${propertyId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (floorsRes.data.has_floors) {
                setPropertyFloors(floorsRes.data.result);
            } else {
                const unitsRes = await axios.get(
                    `${baseUrl}/payment/data/units?property_id=${propertyId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPropertyUnits(unitsRes.data.result);
            }
        } catch (error) {
            toast.error("You have no units in the selected property.");
        }
    };

    // ------------------------------------------------------------
    // SELECT FLOOR
    // ------------------------------------------------------------
    const handleFloorChange = async (event) => {
        const floorId = event.target.value;

        setSelectedFloor(floorId);
        setSelectedUnit("");
        setTenantDetails(null);

        try {
            const unitsRes = await axios.get(
                `${baseUrl}/payment/data/units?floor_id=${floorId}&property_id=${selectedProperty}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPropertyUnits(unitsRes.data.result);
        } catch (error) {
            toast.error("No units found on this floor.");
        }
    };

    // ------------------------------------------------------------
    // SELECT UNIT -> FETCH TENANT DETAILS
    // ------------------------------------------------------------
    const handleUnitChange = async (event) => {
        const unitId = event.target.value;

        setSelectedUnit(unitId);
        setTenantDetails(null);

        try {
            const detailsRes = await axios.get(
                `${baseUrl}/payment/data/unit?unit_id=${unitId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setTenantDetails(detailsRes.data.tenant_details);
            setSelectedUnitFullDetails(detailsRes.data);

        } catch (error) {
            toast.error("No tenant details found for selected unit.");
        }
    };

    // ------------------------------------------------------------
    // TRANSFER PAYMENT
    // ------------------------------------------------------------
    const handleTransfer = async () => {
        if (!selectedUnit) {
            toast.error("Please select a unit first.");
            return;
        }

        if (!unitTenantDetails?.tenant_id) {
            toast.error("Tenant details missing for this unit.");
            return;
        }

        const payload = {
            money_id: Number(moneyId),
            notes: notes,
            correct_unit_id: Number(selectedUnit),
            correct_tenant_id: Number(unitTenantDetails.tenant_id)
        };

        try {
            setIsProcessing(true);

            const response = await axios.patch(
                `${baseUrl}/payment/received`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success === false) {
                toast.success("Payment transferred successfully!");
            }
        } catch (error) {
            toast.error("Failed to transfer payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ------------------------------------------------------------
    // UI
    // ------------------------------------------------------------
    return (
        <>
            <DashboardHeader
                title="Transfer Payment"
                description="Transfer payments between units from different properties."
            />

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
                        <div className="text-center">
                            <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-gray-900 mx-auto mb-4" />
                            <p className="text-lg font-semibold">Processing...</p>
                            <p className="text-sm text-gray-500">Please wait while we complete your transaction</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 mt-4">
                <div className="col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border p-4 mx-4 space-y-4">

                        {/* PROPERTY, FLOOR, UNIT SELECTORS */}
                        <div className="md:flex justify-between md:space-x-4">

                            {/* PROPERTY */}
                            <div className="w-full">
                                <label className="block my-2 text-sm font-medium text-gray-900">
                                    Select property
                                </label>
                                <select
                                    value={selectedProperty}
                                    onChange={handlePropertyChange}
                                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
                                >
                                    <option value="">Select property</option>
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* FLOOR */}
                            <div className="w-full">
                                <label className="block my-2 text-sm font-medium text-gray-900">
                                    Select floor
                                </label>
                                <select
                                    value={selectedFloor}
                                    onChange={handleFloorChange}
                                    disabled={propertyFloors.length === 0}
                                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
                                >
                                    <option value="">Select floor</option>
                                    {propertyFloors.map((floor) => (
                                        <option key={floor.floor_id} value={floor.floor_id}>
                                            {floor.floor_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* UNIT */}
                            <div className="w-full">
                                <label className="block my-2 text-sm font-medium text-gray-900">
                                    Select unit
                                </label>
                                <select
                                    value={selectedUnit}
                                    onChange={handleUnitChange}
                                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
                                >
                                    <option value="">Select unit</option>
                                    {propertyUnits.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.unit_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedUnitFullDetails && (
                            <div className="grid grid-cols-2 gap-4 mt-6 space-y-6">

                                {/* --- UNIT DETAILS --- */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Unit Details</h2>
                                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                                        <p><strong>Name:</strong> {selectedUnitFullDetails.unit_details.name}</p>
                                        <p><strong>Unit Number:</strong> {selectedUnitFullDetails.unit_details.unit_number}</p>
                                        <p><strong>Unit Type:</strong> {selectedUnitFullDetails.unit_details.unit_type}</p>
                                        <p><strong>Rent Amount:</strong> {selectedUnitFullDetails.unit_details.rent_amount}</p>
                                        <p><strong>Floor:</strong> {selectedUnitFullDetails.unit_details.floor_number}</p>
                                        <p><strong>Status:</strong> {selectedUnitFullDetails.unit_details.availability_status}</p>
                                    </div>
                                </div>

                                {/* --- TENANT DETAILS --- */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Tenant Details</h2>
                                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                                        <p><strong>Name:</strong> {selectedUnitFullDetails.tenant_details.name}</p>
                                        <p><strong>Phone:</strong> {selectedUnitFullDetails.tenant_details.phone}</p>
                                        <p><strong>ID Number:</strong> {selectedUnitFullDetails.tenant_details.id_number}</p>
                                        <p><strong>Tenant ID:</strong> {selectedUnitFullDetails.tenant_details.tenant_id}</p>
                                    </div>
                                </div>

                                {/* --- PROPERTY DETAILS --- */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Property Details</h2>
                                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                                        <p><strong>Name:</strong> {selectedUnitFullDetails.property_details.name}</p>
                                        <p><strong>Location:</strong> {selectedUnitFullDetails.property_details.location}</p>
                                        <p><strong>Property Type:</strong> {selectedUnitFullDetails.property_details.property_type}</p>
                                        <p><strong>Property ID:</strong> {selectedUnitFullDetails.property_details.property_id}</p>
                                    </div>
                                </div>

                                {/* --- PAYMENT DETAILS --- */}
                                <div className="col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>
                                    <div className="mt-2 text-sm text-gray-700 space-y-3">

                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedUnitFullDetails.payment_details.map((pay, index) => (
                                                <div
                                                    key={index}
                                                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                                >
                                                    <p><strong>Description:</strong> {pay.description}</p>
                                                    <p><strong>Amount:</strong> {pay.amount}</p>
                                                    <p><strong>Expected:</strong> {pay.expected_amount}</p>
                                                    <p><strong>Month:</strong> {pay.month}</p>
                                                    <p><strong>Year:</strong> {pay.years}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* NOTES */}
                        <div>
                            <label className="block my-2 text-sm font-medium text-gray-900">
                                Notes (optional)
                            </label>
                            <textarea
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Describe the reason for transferring this payment..."
                                className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
                            />
                        </div>

                        {/* TRANSFER BUTTON */}
                        {selectedUnitFullDetails && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleTransfer}
                                    disabled={isProcessing || !selectedUnit}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    Transfer Payment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransferPayment;
