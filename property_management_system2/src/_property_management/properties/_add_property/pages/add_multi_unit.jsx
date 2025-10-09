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

const floorSchema = z.object({
    nof: z.preprocess((val) => Number(val), z.number().min(0).max(40).nonnegative()),
});

const PropertyFloors = () => {
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    const [propertyAmenities, setPropertyAmenities] = useState([]);
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const propertyId = localStorage.getItem("propertyId");
    const [searchParams] = useSearchParams();
    const propertyUrlId = searchParams.get("property_id");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(floorSchema),
    });

    useEffect(() => {
        if (propertyUrlId) {
            fetchFloorsData();
        }
        fetchUnitTypes();
        fetchPropertyAmenities()
    }, [propertyUrlId, token, baseUrl, propertyId]);

    const fetchPropertyAmenities = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-property/edit-property/amenities?property_id=${propertyId}`,
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
                setValue("nof", data.floors.length - 1);
                setFloors(
                    data.floors.map((floor) => ({
                        floor_id: floor.floor_id,
                        floor_no: floor.floor_number,
                        units_count: floor.units.length,
                        units: floor.units.map((unit) => ({
                            unit_id: unit.unit_id,
                            unit_no: unit.unit_no,
                            unit_type: String(unit.unit_type),
                            rent_amount: parseFloat(unit.rent_amount),
                            deposit: amenities.rent_deposit === 1 ? parseFloat(unit.rent_deposit) : 0,
                            water: amenities.is_water_inclusive_of_rent === 1 ? 0 : parseFloat(unit.water),
                            electricity: parseFloat(unit.electricity),
                            garbage: amenities.garbage_deposit === 1 ? 0 : parseFloat(unit.garbage),
                            // Add flags for disabled fields
                            isDepositDisabled: amenities.rent_deposit !== 1,
                            isWaterDisabled: amenities.is_water_inclusive_of_rent === 1,
                            isGarbageDisabled: amenities.garbage_deposit === 1,
                        })),
                    }))
                );
            } else {
                toast.error("No floors data found for this property.");
            }
        } catch (error) {
            toast.error("Error fetching floors data");
        }
    };

    const handleFloorsChange = (e) => {
        const newFloorCount = parseInt(e.target.value, 10);

        if (isNaN(newFloorCount) || newFloorCount < 0 || newFloorCount > 40) {
            if (e.target.value !== "") {
                toast.error("Please enter a valid number of floors (0-40).");
            }
            return;
        }

        setValue("nof", newFloorCount);

        setFloors((prevFloors) => {
            const currentMaxFloor = prevFloors.length - 1;

            // CASE 1: Increasing floors - Add new empty floors
            if (newFloorCount > currentMaxFloor) {
                const floorsToAdd = [];
                for (let i = currentMaxFloor + 1; i <= newFloorCount; i++) {
                    floorsToAdd.push({
                        floor_no: i,
                        units_count: "",
                        units: [],
                    });
                }
                return [...prevFloors, ...floorsToAdd];
            }

            // CASE 2: Decreasing floors - Remove floors from the end
            if (newFloorCount < currentMaxFloor) {
                // Check if floors to be removed have units
                const floorsToRemove = prevFloors.filter(f => f.floor_no > newFloorCount);
                const hasUnits = floorsToRemove.some(f => f.units && f.units.length > 0);

                if (hasUnits) {
                    const floorNumbers = floorsToRemove
                        .filter(f => f.units && f.units.length > 0)
                        .map(f => f.floor_no)
                        .join(", ");

                    const confirmRemove = window.confirm(
                        `Warning: Floor(s) ${floorNumbers} contain units. Are you sure you want to remove them?`
                    );

                    if (!confirmRemove) {
                        // Revert the input value
                        setValue("nof", currentMaxFloor);
                        return prevFloors;
                    }
                }


                return prevFloors.filter(f => f.floor_no <= newFloorCount);
            }


            return prevFloors;
        });
    };

    const updateUnits = (floorNo, unitsCount) => {
        setFloors((prevFloors) =>
            prevFloors.map((floor) =>
                floor.floor_no === floorNo
                    ? {
                        ...floor,
                        units_count: unitsCount,
                        units: Array.from({ length: unitsCount }, (_, i) => ({
                            unit_no: `F${floorNo}U${i + 1}`,
                            unit_type: "",
                            rent_amount: 0,
                            deposit: propertyAmenities.rent_deposit === 1 ? 0 : 0,
                            water: propertyAmenities.is_water_inclusive_of_rent === 1 ? 0 : 0,
                            electricity: 0,
                            garbage: propertyAmenities.garbage_deposit === 1 ? 0 : 0,
                            isDepositDisabled: propertyAmenities.rent_deposit !== 1,
                            isWaterDisabled: propertyAmenities.is_water_inclusive_of_rent === 1,
                            isGarbageDisabled: propertyAmenities.garbage_deposit === 1,
                        })),
                    }
                    : floor
            )
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
            prevFloors
                .map((floor) =>
                    floor.floor_no === floorNo
                        ? {
                            ...floor,
                            units: floor.units.filter((_, idx) => idx !== unitIndex),
                            units_count: floor.units.length - 1,
                        }
                        : floor
                )
                .filter((floor) => floor.units.length > 0 || floor.floor_no === 0)
        );
    };

    const handleFinalSubmit = async () => {
        try {
            // Validate all units before submission
            const validationErrors = {};
            let hasErrors = false;

            floors.forEach((floor, floorIndex) => {
                floor.units.forEach((unit, unitIndex) => {
                    // Validate unit number
                    if (!unit.unit_no?.trim()) {
                        validationErrors[`${floor.floor_no}_${unitIndex}_unit_no`] =
                            "Unit number is required";
                        hasErrors = true;
                    }

                    // Validate unit type
                    if (!unit.unit_type) {
                        validationErrors[`${floor.floor_no}_${unitIndex}_unit_type`] =
                            "Unit type is required";
                        hasErrors = true;
                    }

                    // Validate numeric fields (optional)
                    const numericFields = ['rent_amount', 'deposit', 'water', 'electricity', 'garbage'];
                    numericFields.forEach(field => {
                        if (unit[field] !== undefined && (isNaN(unit[field]) || unit[field] < 0)) {
                            validationErrors[`${floor.floor_no}_${unitIndex}_${field}`] =
                                `${field.replace('_', ' ')} must be a non-negative number`;
                            hasErrors = true;
                        }
                    });
                });
            });

            if (hasErrors) {
                // Set the errors state if you have one, or handle them appropriately
                // setErrors(validationErrors);
                toast.error("Please fix all validation errors before submitting");
                return;
            }

            const isEdit = Boolean(propertyUrlId);
            const url = isEdit
                ? `${baseUrl}/manage-property/edit-property/floors`
                : `${baseUrl}/manage-property/create-property/floors`;

            // Prepare data with additional validation
            const dataToSend = {
                property_id: parseInt(propertyId, 10),
                floors: floors.map((floor) => {
                    // Validate floor has at least one unit
                    if (floor.units.length === 0) {
                        toast.error(`Floor ${floor.floor_no} has no units`);
                        throw new Error(`Floor ${floor.floor_no} has no units`);
                    }

                    return {
                        ...(isEdit && { floor_id: floor.floor_id }),
                        floor_number: floor.floor_no,
                        units: floor.units.map((unit) => ({
                            ...(isEdit && unit.unit_id && { unit_id: unit.unit_id }),
                            unit_no: unit.unit_no.trim(),
                            unit_type: parseInt(unit.unit_type, 10),
                            rent_deposit: unit.isDepositDisabled ? 0 : parseFloat(unit.deposit || 0),
                            rent_amount: parseFloat(unit.rent_amount || 0),
                            water: unit.isWaterDisabled ? 0 : parseFloat(unit.water || 0),
                            electricity: parseFloat(unit.electricity || 0),
                            garbage: unit.isGarbageDisabled ? 0 : parseFloat(unit.garbage || 0),
                        })).filter(unit => unit.unit_no) // Filter out any empty units
                    };
                }).filter(floor => floor.units.length > 0) // Filter out empty floors
            };

            // Additional validation before sending
            if (dataToSend.floors.length === 0) {
                toast.error("At least one floor with units is required");
                return;
            }

            const response = await axios.post(url, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.data?.status) {
                toast.success(response.data.message);
                navigate("/add-property/manage-images");
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
                        unit_no: `${baseName}${startNumber + i}`
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
                    // Extract the pattern from unit number (e.g., "F001U1" → "F", "001", "U1")
                    const unitNoMatch = unit.unit_no.match(/^F(\d+)(.*)$/);

                    let newUnitNo;
                    if (unitNoMatch) {
                        // Format: F001U1 → F101U1 (with leading zeros preserved)
                        const oldFloorPart = unitNoMatch[1];
                        const remainingPart = unitNoMatch[2];
                        const paddedFloorNo = String(newFloorNo).padStart(oldFloorPart.length, '0');
                        newUnitNo = `F${paddedFloorNo}${remainingPart}`;
                    } else {
                        // Fallback: just append the new floor number
                        newUnitNo = unit.unit_no.replace(/\d+/, newFloorNo);
                    }

                    return {
                        ...unit,
                        unit_no: newUnitNo,
                        // Remove unit_id for new units (they'll get new IDs from backend)
                        unit_id: undefined
                    };
                });

                newFloors.push({
                    floor_no: newFloorNo,
                    units_count: sourceFloor.units_count,
                    units: duplicatedUnits,
                    // No floor_id for new floors
                    floor_id: undefined
                });
            }

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

        // If floor has units, show modal for confirmation
        if (floor.units && floor.units.length > 0) {
            setFloorToRemove(floor);
            setShowRemoveFloorModal(true);
        } else {
            // Remove directly if no units (including ground floor/parking)
            removeFloor(floorNo);
            toast.success(`Floor ${floorNo} removed successfully.`);
        }
    };

    const confirmRemoveFloor = () => {
        if (floorToRemove) {
            removeFloor(floorToRemove.floor_no);
            toast.success(`Floor ${floorToRemove.floor_no} removed successfully.`);
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
            setValue("nof", maxFloor);

            return newFloors;
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
                        className={`bg-white border ${errors.nof ? "border-red-500" : "border-gray-300"
                            } rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5`}
                        placeholder="Enter number of floors (e.g., 1)"
                        type="number"
                        {...register("nof")}
                        onChange={handleFloorsChange}
                    />
                    {errors.nof && <p className="text-red-500 text-xs mt-1">{errors.nof.message}</p>}
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
                                            removeFloor={handleRemoveFloorClick}  // ← CHANGED from direct removeFloor
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
                        <div className="flex justify-between mt-1">
                            <Button type="button" onClick={goToPrevious}>
                                Previous
                            </Button>
                            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </form>
            {showRemoveFloorModal && floorToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full mx-4">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    Remove Floor {floorToRemove.floor_no}?
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>
                                        This floor contains <strong>{floorToRemove.units.length} unit(s)</strong>.
                                        Removing this floor will permanently delete all associated units and their data.
                                    </p>
                                    <p className="font-medium text-red-600">
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded mb-4">
                            <p className="text-xs text-gray-700 font-medium mb-1">Units to be removed:</p>
                            <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                                {floorToRemove.units.map((unit, idx) => (
                                    <div key={idx} className="py-1">
                                        • {unit.unit_no} - {unitTypes.find(t => t.id === parseInt(unit.unit_type))?.name || 'N/A'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelRemoveFloor}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveFloor}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors font-medium"
                            >
                                Yes, Remove Floor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PropertyFloors;
