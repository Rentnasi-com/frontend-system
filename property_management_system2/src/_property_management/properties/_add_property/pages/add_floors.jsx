import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import axios from "axios";
import Units from "./floors/units";
import FloorDetails from "./floors/floorDetails";
import { Button } from "../../../../shared";
import { DashboardHeader } from "../../dashboard/page_components";

// Schema for the total number of floors (used mainly for initialization and maximum check)
const floorSchema = z.object({
    nof: z.preprocess((val) => Number(val), z.number().min(0).max(40).nonnegative()),
});

const AddFloors = () => {
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [propertyAmenities, setPropertyAmenities] = useState({}); // Initialize as object
    const [newFloorsToAdd, setNewFloorsToAdd] = useState(""); // State for the new floor input field

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const [searchParams] = useSearchParams();
    const propertyUrlId = searchParams.get("property_id");

    console.log(propertyUrlId)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(floorSchema),
        defaultValues: {
            nof: 0,
        }
    });

    const nofValue = watch("nof");

    useEffect(() => {
        if (propertyUrlId) {
            fetchFloorsData();
        }
        fetchUnitTypes();
        // Fetch amenities even if not editing, as they define unit field requirements
        fetchPropertyAmenities()
    }, [propertyUrlId, token, baseUrl, propertyUrlId]);

    const fetchPropertyAmenities = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-property/edit-property/amenities?property_id=${propertyUrlId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    }
                }
            )
            setPropertyAmenities(response.data || {});
            return response.data;
        } catch (error) {
            toast.error("Error fetching property amenities");
            return {};
        }
    }

    const fetchUnitTypes = async () => {
        try {
            const response = await axios.get(`${baseUrl}/get-unit-type`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, Accept: "application/json"
                    },
                });
            if (response.data?.success) {
                setUnitTypes(response.data.result || []);
            } else {
                toast.error(response.data?.message || "Failed to fetch unit types");
            }
        } catch (error) {
            toast.error("Error fetching unit types");
        }
    };

    const fetchFloorsData = async () => {
        try {
            const amenities = await fetchPropertyAmenities();
            const response = await axios.get(
                `${baseUrl}/manage-property/edit-property/floors?property_id=${propertyUrlId}`,
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const data = response.data;

            if (data?.floors) {
                // Determine the highest floor number fetched
                const maxFloorNumber = data.floors.length > 0 ? Math.max(...data.floors.map(f => f.floor_number)) : 0;

                // Set the form value to the highest floor number
                setValue("nof", maxFloorNumber);

                setFloors(
                    data.floors.map((floor) => ({
                        floor_id: floor.floor_id,
                        floor_no: floor.floor_number,
                        units_count: floor.units.length,
                        isExisting: true, // CRITICAL: Mark as existing floor from API
                        units: floor.units.map((unit) => ({
                            unit_id: unit.unit_id,
                            unit_no: unit.unit_no,
                            unit_type: String(unit.unit_type),
                            rent_amount: parseFloat(unit.rent_amount || 0),
                            deposit: amenities.rent_deposit === 1 ? parseFloat(unit.rent_deposit || 0) : 0,
                            water: amenities.is_water_inclusive_of_rent === 1 ? 0 : parseFloat(unit.water || 0),
                            electricity: parseFloat(unit.electricity || 0),
                            garbage: amenities.garbage_deposit === 1 ? 0 : parseFloat(unit.garbage || 0),

                            isDepositDisabled: amenities.rent_deposit !== 1,
                            isWaterDisabled: amenities.is_water_inclusive_of_rent === 1,
                            isGarbageDisabled: amenities.garbage_deposit === 1,
                        })).filter(unit => unit.unit_no) // filter out units with empty unit_no if any
                    })).filter(floor => floor.floor_no !== undefined) // filter out floors with empty floor_no if any
                );
            } else {
                toast.error("No floors data found for this property.");
            }
        } catch (error) {
            toast.error("Error fetching floors data");
        }
    };

    // 💡 REMOVED: The original handleFloorsChange logic that conflicted with existing data.
    // We now use a separate handler for adding new floors.

    // 💡 NEW: Handler for adding floors via the dedicated 'Add New Floors' input
    const handleAddNewFloors = () => {
        const count = parseInt(newFloorsToAdd, 10);
        const maxAllowed = 40;

        if (isNaN(count) || count <= 0) {
            toast.error("Please enter a valid number greater than 0.");
            return;
        }

        if (floors.length + count > maxAllowed) {
            const currentTotal = floors.length;
            const remaining = maxAllowed - currentTotal;
            toast.error(`Cannot add ${count} floors. Max allowed is ${maxAllowed} (you can add up to ${Math.max(0, remaining)} more).`);
            return;
        }

        // Find the highest floor number currently in the state
        const maxFloorNo = floors.length > 0 ? Math.max(...floors.map(f => f.floor_no)) : -1;

        setFloors((prevFloors) => {
            const floorsToAdd = [];
            for (let i = 1; i <= count; i++) {
                const newFloorNo = maxFloorNo + i;
                floorsToAdd.push({
                    floor_no: newFloorNo,
                    units_count: "",
                    units: [],
                    isExisting: false, // CRITICAL: Mark as new floor
                });
            }

            const newTotalFloorCount = maxFloorNo + count;

            // CRITICAL: Update the main form value (`nof`) with the new total count
            setValue("nof", newTotalFloorCount);

            return [...prevFloors, ...floorsToAdd].sort((a, b) => a.floor_no - b.floor_no);
        });

        // Clear the input field
        setNewFloorsToAdd("");
    };


    const updateUnits = (floorNo, unitsCount) => {
        setFloors((prevFloors) =>
            prevFloors.map((floor) => {
                if (floor.floor_no === floorNo) {
                    // Filter out existing units if unitsCount is decreased
                    const existingUnits = floor.units.filter(unit => unit.unit_id);

                    // Create new placeholder units only for the difference
                    const unitsToCreate = unitsCount > existingUnits.length ? unitsCount - existingUnits.length : 0;

                    const newUnits = Array.from({ length: unitsToCreate }, (_, i) => ({
                        unit_no: `F${floorNo}U${i + existingUnits.length + 1}`,
                        unit_type: "",
                        rent_amount: 0,
                        deposit: propertyAmenities.rent_deposit === 1 ? 0 : 0,
                        water: propertyAmenities.is_water_inclusive_of_rent === 1 ? 0 : 0,
                        electricity: 0,
                        garbage: propertyAmenities.garbage_deposit === 1 ? 0 : 0,
                        isDepositDisabled: propertyAmenities.rent_deposit !== 1,
                        isWaterDisabled: propertyAmenities.is_water_inclusive_of_rent === 1,
                        isGarbageDisabled: propertyAmenities.garbage_deposit === 1,
                    }));

                    return {
                        ...floor,
                        units_count: unitsCount,
                        // Combine existing units (up to the new count) and new placeholders
                        units: [...existingUnits, ...newUnits].slice(0, unitsCount),
                    };
                }
                return floor;
            })
        );
    };

    const updateUnitField = (floorNo, unitIndex, field, value) => {
        setFloors((prevFloors) =>
            prevFloors.map((floor) =>
                floor.floor_no === floorNo
                    ? {
                        ...floor,
                        units: floor.units.map((unit, idx) =>
                            idx === unitIndex ? { ...unit, [field]: value } : unit
                        ),
                    }
                    : floor
            )
        );
    };

    const removeUnit = (floorNo, unitIndex) => {
        setFloors((prevFloors) =>
            prevFloors.map((floor) => {
                if (floor.floor_no === floorNo) {
                    const newUnits = floor.units.filter((_, idx) => idx !== unitIndex);
                    return {
                        ...floor,
                        units: newUnits,
                        units_count: newUnits.length,
                    };
                }
                return floor;
            })
        );
    };

    const handleFinalSubmit = async () => {
        try {
            // Filter only NEW floors (not fetched from API and no floor_id)
            const newFloors = floors.filter(floor => !floor.isExisting && !floor.floor_id);

            if (newFloors.length === 0) {
                toast.error("No new floors with units to submit.");
                // Allow proceeding to the next step if we're in edit mode and no new floors were added
                if (propertyUrlId) {
                    navigate(`/property/view-property/${propertyUrlId}`);
                    return;
                }
                return;
            }

            // Validate all units in new floors before submission
            let hasErrors = false;
            for (const floor of newFloors) {
                // Check if the floor has units
                if (!floor.units || floor.units.length === 0) {
                    toast.error(`Floor ${floor.floor_no} has no units. Please add at least one unit.`);
                    return;
                }

                // Inner validation loop
                for (const unit of floor.units) {
                    if (!unit.unit_no?.trim()) {
                        hasErrors = true;
                        toast.error(`Unit number is required on floor ${floor.floor_no}.`);
                        break;
                    }
                    if (!unit.unit_type) {
                        hasErrors = true;
                        toast.error(`Unit type is required for unit ${unit.unit_no} on floor ${floor.floor_no}.`);
                        break;
                    }

                    const numericFields = ['rent_amount', 'deposit', 'water', 'electricity', 'garbage'];
                    for (const field of numericFields) {
                        const value = unit[field];
                        if (value !== undefined && value !== null && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
                            hasErrors = true;
                            toast.error(`${field.replace('_', ' ')} must be a non-negative number for unit ${unit.unit_no} on floor ${floor.floor_no}.`);
                            break;
                        }
                    }
                    if (hasErrors) break;
                }
                if (hasErrors) break;
            }

            if (hasErrors) {
                return;
            }

            // --- Submission Logic Starts Here ---
            const url = `${baseUrl}/manage-property/create-property/floors`;

            // Prepare data with only NEW floors
            const dataToSend = {
                property_id: parseInt(propertyUrlId, 10),
                floors: newFloors
                    .map((floor) => ({
                        floor_number: floor.floor_no,
                        units: floor.units
                            .filter(unit => unit.unit_no?.trim()) // Final check to ensure unit has a name
                            .map((unit) => ({
                                unit_no: unit.unit_no.trim(),
                                unit_type: parseInt(unit.unit_type, 10),
                                rent_deposit: unit.isDepositDisabled ? 0 : parseFloat(unit.deposit || 0),
                                rent_amount: parseFloat(unit.rent_amount || 0),
                                water: unit.isWaterDisabled ? 0 : parseFloat(unit.water || 0),
                                electricity: parseFloat(unit.electricity || 0),
                                garbage: unit.isGarbageDisabled ? 0 : parseFloat(unit.garbage || 0),
                            }))
                    }))
                    .filter(floor => floor.units.length > 0) // Only send floors that have units
            };

            if (dataToSend.floors.length === 0) {
                toast.error("At least one new floor with units is required to submit.");
                return;
            }

            console.log("Submitting new floors only:", dataToSend);

            const response = await axios.post(url, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.data?.status) {
                toast.success(response.data.message);
                navigate(`/add-property/manage-images?property_id=${propertyUrlId}`);
            } else {
                toast.error(response.data?.message || "Failed to save floor data");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Error submitting form");
        }
    };

    const duplicateUnit = (floorNo, unitIndex, count = 1) => {
        setFloors(prevFloors =>
            prevFloors.map(floor => {
                if (floor.floor_no === floorNo) {
                    const originalUnit = floor.units[unitIndex];
                    const baseName = originalUnit.unit_no.replace(/\d+$/, '');

                    // Find highest existing number
                    const existingNumbers = floor.units
                        .map(u => {
                            const match = u.unit_no.match(new RegExp(`^${baseName}(\\d+)$`));
                            return match ? parseInt(match[1]) : 0;
                        })
                        .filter(n => !isNaN(n));

                    const startNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 :
                        parseInt(originalUnit.unit_no.match(/\d+$/)?.[0] || 0) + 1;

                    // Create all copies at once
                    const newUnits = Array.from({ length: count }, (_, i) => ({
                        ...originalUnit,
                        unit_no: `${baseName}${startNumber + i}`,
                        unit_id: undefined // Ensure duplicated unit is treated as new
                    }));

                    return {
                        ...floor,
                        units: [...floor.units, ...newUnits],
                        units_count: floor.units.length + count,
                    };
                }
                return floor;
            })
        );
    };

    const duplicateFloor = (sourceFloorNo, count = 1) => {
        setFloors((prevFloors) => {
            const sourceFloor = prevFloors.find(f => f.floor_no === sourceFloorNo);

            if (!sourceFloor) {
                toast.error("Source floor not found");
                return prevFloors;
            }

            // Find the highest floor number
            const maxFloorNo = Math.max(...prevFloors.map(f => f.floor_no));

            // Create new floors
            const newFloors = [];
            for (let i = 1; i <= count; i++) {
                const newFloorNo = maxFloorNo + i;

                // Duplicate units with updated numbering
                const duplicatedUnits = sourceFloor.units.map(unit => {
                    // Simple replacement of the floor number part (Fxx)
                    let newUnitNo = unit.unit_no.replace(`F${sourceFloorNo}`, `F${newFloorNo}`);

                    return {
                        ...unit,
                        unit_no: newUnitNo,
                        unit_id: undefined // Remove unit_id for new units
                    };
                });

                newFloors.push({
                    floor_no: newFloorNo,
                    units_count: sourceFloor.units_count,
                    units: duplicatedUnits,
                    floor_id: undefined,
                    isExisting: false // Mark duplicated floors as new
                });
            }

            // Update the form value
            setValue("nof", maxFloorNo + count);

            // Sort floors by floor number
            return [...prevFloors, ...newFloors].sort((a, b) => a.floor_no - b.floor_no);
        });
    };

    const [floorToRemove, setFloorToRemove] = useState(null);
    const [showRemoveFloorModal, setShowRemoveFloorModal] = useState(false);

    const handleRemoveFloorClick = (floorNo) => {
        const floor = floors.find(f => f.floor_no === floorNo);

        if (!floor) {
            toast.error("Floor not found.");
            return;
        }

        // Prevent removal of existing floors unless that is explicitly allowed by the API.
        if (floor.isExisting) {
            toast.error("Cannot remove an existing floor via this action. This submission is for *new* floors only.");
            return;
        }

        // If floor has units, show modal for confirmation
        if (floor.units && floor.units.length > 0) {
            setFloorToRemove(floor);
            setShowRemoveFloorModal(true);
        } else {
            // Remove directly if no units
            removeFloor(floorNo);
            toast.success(`Floor ${floorNo} removed successfully.`);
        }
    };

    const confirmRemoveFloor = () => {
        if (floorToRemove) {
            removeFloor(floorToRemove.floor_no);
            toast.success(`New floor ${floorToRemove.floor_no} removed successfully.`);
        }
        setShowRemoveFloorModal(false);
        setFloorToRemove(null);
    };

    const cancelRemoveFloor = () => {
        setShowRemoveFloorModal(false);
        setFloorToRemove(null);
    };

    const removeFloor = (floorNo) => {
        setFloors((prevFloors) => {
            const newFloors = prevFloors.filter((f) => f.floor_no !== floorNo);

            // Update the number of floors input
            const maxFloor = newFloors.length > 0 ? Math.max(...newFloors.map(f => f.floor_no)) : 0;

            // Update the react-hook-form value
            setValue("nof", maxFloor);

            return newFloors.sort((a, b) => a.floor_no - b.floor_no);
        });
    };

    const goToPrevious = () => {
        navigate(`/add-property/property-type?property_id=${propertyId}`);
    };

    return (
        <section className="mx-auto">
            <DashboardHeader
                title="Add Property Floors"
                description="Properties / Add Property / Floors"
            />
            <form className="mx-4" onSubmit={handleSubmit(handleFinalSubmit)}>
                <div className="mb-4">
                    <label className="mb-2 text-sm block">Number of Floors</label>
                    <input
                        className={`bg-gray-100 border ${errors.nof ? "border-red-500" : "border-gray-300"
                            } rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5 cursor-not-allowed`}
                        placeholder="Total number of floors"
                        type="number"
                        // 💡 CRITICAL: Disable/readOnly the input to preserve existing data
                        readOnly={!!propertyUrlId}
                        disabled={!!propertyUrlId}
                        {...register("nof")}
                    />
                    {errors.nof && <p className="text-red-500 text-xs mt-1">{errors.nof.message}</p>}

                    {/* 💡 NEW SECTION for adding floors beyond the existing count */}
                    <div className="mt-4 border p-4 rounded-lg bg-red-50">
                        <label className="mb-2 text-sm block font-medium text-red-800">Add New Floors to the Top</label>
                        <div className="flex gap-2">
                            <input
                                className="bg-white border border-red-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                placeholder="Number of floors to add (e.g., 2)"
                                type="number"
                                min="1"
                                // Calculate max remaining floors
                                max={40 - floors.length}
                                value={newFloorsToAdd}
                                onChange={(e) => setNewFloorsToAdd(e.target.value)}
                            />
                            <Button
                                type="button"
                                onClick={handleAddNewFloors}
                                disabled={!newFloorsToAdd || parseInt(newFloorsToAdd) <= 0 || nofValue >= 40}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
                {floors.length > 0 && (
                    <>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-gray-500">
                                <thead className="bg-red-700 text-white uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Floor Number</th>
                                        <th className="px-6 py-3">Units</th>
                                        <th className="px-6 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {floors.map((floor) => (
                                        <FloorDetails
                                            key={floor.floor_no}
                                            floor={floor}
                                            updateUnits={updateUnits}
                                            // Pass the new removal handler
                                            removeFloor={handleRemoveFloorClick}
                                            duplicateFloor={duplicateFloor}
                                        />
                                    ))}
                                </tbody>

                            </table>
                        </div>
                        <div id="units">
                            {floors.map((floor) => (
                                <Units
                                    key={floor.floor_no}
                                    floor={floor}
                                    updateUnitField={updateUnitField}
                                    removeUnit={removeUnit}
                                    unitTypes={unitTypes}
                                    duplicateUnit={duplicateUnit}
                                    propertyAmenities={propertyAmenities}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-8">
                            <Button type="button" onClick={goToPrevious}>
                                Previous
                            </Button>
                            {/* 💡 The submit handler is correct, it only sends new floors */}
                            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </form>
            {showRemoveFloorModal && floorToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
                        <div className="flex items-start mb-6">
                            {/* Warning Icon (Good to keep as is) */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-200">
                                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            <div className="ml-4 flex-1">
                                <h3 className="font-extrabold text-xl text-gray-900 mb-1">
                                    Confirm Floor Deletion
                                </h3>

                                {/* Enhanced Warning Text */}
                                <p className="text-sm text-gray-700 mb-2">
                                    You are about to remove **Floor {floorToRemove.floor_no}** and all its units.
                                </p>
                                <p className="font-bold text-red-600 text-sm">
                                    ⚠️ This action is permanent and cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* Units to be Removed Section - Improved Display */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                            <p className="text-sm text-red-800 font-bold mb-2">
                                Units on this floor ({floorToRemove.units.length} total) that will be removed:
                            </p>
                            <div className="text-sm text-red-700 max-h-40 overflow-y-auto pr-2 space-y-1">
                                {floorToRemove.units.map((unit, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                        <span className="font-semibold">{unit.unit_no}</span>
                                        <span className="text-xs text-gray-500">
                                            {unitTypes.find(t => t.id === parseInt(unit.unit_type))?.name || 'Unknown Type'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons - Improved Styling and Labels */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={cancelRemoveFloor}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                            >
                                Keep Floor (Cancel)
                            </button>
                            <button
                                type="button"
                                onClick={confirmRemoveFloor}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 shadow-md"
                            >
                                Remove Floor {floorToRemove.floor_no}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AddFloors;