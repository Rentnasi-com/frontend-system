import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import axios from "axios";
// Assuming these are the correct paths and components based on your imports
import { Button } from "../../../shared";
import { FloorDetails, Units } from "../_add_property/pages/floors";

// Zod schema for form validation (only for number of floors)
const floorSchema = z.object({
    // Preprocess converts the string value from the input to a number
    nof: z.preprocess((val) => Number(val), z.number().min(0).max(40).nonnegative()),
});

const EditMultiUnit = () => {
    const navigate = useNavigate();
    // State to hold floor and unit data
    const [floors, setFloors] = useState([]);
    // State to hold unit type options fetched from API
    const [unitTypes, setUnitTypes] = useState([]);
    // State to hold property amenities data (used for conditional field disabling)
    const [propertyAmenities, setPropertyAmenities] = useState([]);
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
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

    // Fetch initial data on component mount
    useEffect(() => {
        if (propertyUrlId) {
            fetchFloorsData(); // This implicitly calls fetchPropertyAmenities first
        }
        fetchUnitTypes();
        // The dependency array is fine, but propertyUrlId is repeated
    }, [propertyUrlId, token, baseUrl]);

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
            return {}; // Return empty object on error
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
            // Await amenities data first to determine which fields are disabled
            const amenities = await fetchPropertyAmenities();

            const response = await axios.get(
                `${baseUrl}/manage-property/edit-property/floors?property_id=${propertyUrlId}`,
                { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
            );
            const data = response.data;

            if (data?.floors) {
                // Set the number of floors input field value
                setValue("nof", data.floors.length - 1);

                // Transform and set the fetched floors data
                setFloors(
                    data.floors.map((floor) => ({
                        floor_id: floor.floor_id,
                        floor_no: floor.floor_number,
                        units_count: floor.units.length,
                        units: floor.units.map((unit) => ({
                            unit_id: unit.unit_id,
                            unit_no: unit.unit_no,
                            unit_type: String(unit.unit_type), // Ensure unit_type is a string for the select input
                            rent_amount: parseFloat(unit.rent_amount),
                            // Set values to 0 if amenities flag is set, otherwise use fetched value
                            deposit: amenities.rent_deposit === 1 ? parseFloat(unit.rent_deposit) : 0,
                            water: amenities.is_water_inclusive_of_rent === 1 ? 0 : parseFloat(unit.water),
                            electricity: parseFloat(unit.electricity),
                            garbage: amenities.garbage_deposit === 1 ? 0 : parseFloat(unit.garbage),
                            // Add flags for disabled fields based on current amenities
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

        if (!isNaN(newFloorCount) && newFloorCount >= 0 && newFloorCount <= 40) {
            setValue("nof", newFloorCount);

            // Create new floor array with default unit counts and empty units
            const newFloors = Array.from({ length: newFloorCount + 1 }, (_, i) => ({
                // Use i for floor number (0 to N)
                floor_no: i,
                units_count: 0, // Should probably be 0 for new floors
                units: [],
            }));

            setFloors(newFloors);
        } else if (e.target.value.trim() !== '') {
            // Only show error if the input is not empty but invalid
            setValue("nof", undefined);
            setFloors([]);
            toast.error("Please enter a valid number of floors (0-40).");
        } else {
            // Clear if input is empty
            setValue("nof", undefined);
            setFloors([]);
        }
    };

    const updateUnits = (floorNo, unitsCount) => {
        // Ensure unitsCount is treated as a number
        const count = parseInt(unitsCount, 10);

        setFloors((prevFloors) =>
            prevFloors.map((floor) => {
                if (floor.floor_no === floorNo) {
                    // Create new units array with default values for new units
                    const newUnits = Array.from({ length: count }, (_, i) => ({
                        // Assuming propertyAmenities is populated
                        unit_no: `F${floorNo}U${i + 1}`,
                        unit_type: "",
                        rent_amount: 0,
                        // Use propertyAmenities to determine initial values and disabled state
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
                        units_count: count,
                        units: newUnits,
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
            prevFloors
                .map((floor) => {
                    if (floor.floor_no === floorNo) {
                        const updatedUnits = floor.units.filter((_, idx) => idx !== unitIndex);
                        return {
                            ...floor,
                            units: updatedUnits,
                            units_count: updatedUnits.length, // Update units_count here
                        };
                    }
                    return floor;
                })
        );
    };

    // Helper function moved to be accessible by handleFinalSubmit
    const getFieldState = (unit, field) => {
        if (!propertyAmenities || Object.keys(propertyAmenities).length === 0) return { disabled: false };

        // Use the initial flags set during data fetch, or fallback to current amenities state
        switch (field) {
            case 'water':
                return {
                    disabled: unit.isWaterDisabled || propertyAmenities.is_water_inclusive_of_rent === 1,
                };
            case 'garbage':
                return {
                    disabled: unit.isGarbageDisabled || propertyAmenities.garbage_deposit === 1,
                };
            case 'deposit':
                return {
                    disabled: unit.isDepositDisabled || propertyAmenities.rent_deposit !== 1,
                };
            default:
                return { disabled: false };
        }
    };

    const handleFinalSubmit = async () => {
        try {
            // Validate all units before submission
            const validationErrors = {};
            let hasErrors = false;

            floors.forEach((floor, floorIndex) => {
                // Skip validation for floors that have no units
                if (!floor.units || floor.units.length === 0) {
                    return;
                }

                floor.units.forEach((unit, unitIndex) => {
                    // Unique key for error tracking
                    const errorKeyBase = `${floor.floor_no}_${unitIndex}`;

                    // 1. Validate unit number
                    if (!unit.unit_no || !unit.unit_no.toString().trim()) {
                        validationErrors[`${errorKeyBase}_unit_no`] = `Unit number is required for F${floor.floor_no}, Unit ${unitIndex + 1}`;
                        hasErrors = true;
                    }

                    // 2. Validate unit type
                    const unitType = unit.unit_type ? unit.unit_type.toString() : '';
                    if (!unitType || unitType === '' || unitType === '0') {
                        validationErrors[`${errorKeyBase}_unit_type`] = `Unit type is required for F${floor.floor_no}, Unit ${unitIndex + 1}`;
                        hasErrors = true;
                    }

                    // 3. Validate numeric fields
                    const numericFields = [
                        { field: 'rent_amount', required: true },
                        { field: 'deposit', required: false },
                        { field: 'water', required: false },
                        { field: 'electricity', required: false },
                        { field: 'garbage', required: false }
                    ];

                    numericFields.forEach(({ field, required }) => {
                        const value = unit[field];
                        const fieldState = getFieldState(unit, field);

                        // Skip validation for disabled fields (since they are set to 0 in UI/state)
                        if (fieldState.disabled) {
                            return;
                        }

                        // Check if required field is missing
                        if (required && (value === undefined || value === null || value === '')) {
                            validationErrors[`${errorKeyBase}_${field}`] =
                                `${field.replace('_', ' ')} is required for F${floor.floor_no}, Unit ${unitIndex + 1}`;
                            hasErrors = true;
                            return;
                        }

                        // If value exists and is required/enabled, validate it's a valid non-negative number
                        if ((required || value !== undefined && value !== null && value !== '') && !fieldState.disabled) {
                            const numValue = parseFloat(value);
                            if (isNaN(numValue) || numValue < 0) {
                                validationErrors[`${errorKeyBase}_${field}`] =
                                    `${field.replace('_', ' ')} must be a non-negative number for F${floor.floor_no}, Unit ${unitIndex + 1}`;
                                hasErrors = true;
                            }
                        }
                    });
                });
            });

            // Check if there are any units at all
            const totalUnits = floors.reduce((acc, floor) => acc + floor.units.length, 0);
            if (totalUnits === 0) {
                toast.error("Please add at least one unit to proceed.");
                return;
            }

            if (hasErrors) {
                const errorMessages = Object.values(validationErrors);
                toast.error('Validation failed. Please check all unit details.');
                // Show the first 3 specific errors
                errorMessages.slice(0, 3).forEach(msg => toast.error(msg));
                return; // STOP EXECUTION HERE
            }

            // Only proceed if no errors
            const isEdit = Boolean(propertyUrlId);
            const url = isEdit
                ? `${baseUrl}/manage-property/edit-property/floors`
                : `${baseUrl}/manage-property/create-property/floors`;

            // Filter out floors with no units if needed (although the back-end usually handles this)
            const floorsToSend = floors.filter(floor => floor.units.length > 0);

            const dataToSend = {
                property_id: parseInt(propertyUrlId, 10),
                floors: floorsToSend.map((floor) => ({
                    // Include floor_id only if editing an existing property
                    ...(isEdit && floor.floor_id ? { floor_id: floor.floor_id } : {}),
                    floor_number: floor.floor_no,
                    units: floor.units.map((unit) => ({
                        // Include unit_id only if editing an existing unit
                        ...(isEdit && unit.unit_id ? { unit_id: unit.unit_id } : {}),
                        unit_no: unit.unit_no,
                        unit_type: parseInt(unit.unit_type, 10),
                        // Send 0 for disabled fields, otherwise send the parsed value
                        rent_deposit: unit.isDepositDisabled ? 0 : parseFloat(unit.deposit || 0),
                        rent_amount: parseFloat(unit.rent_amount || 0),
                        water: unit.isWaterDisabled ? 0 : parseFloat(unit.water || 0),
                        electricity: parseFloat(unit.electricity || 0),
                        garbage: unit.isGarbageDisabled ? 0 : parseFloat(unit.garbage || 0),
                    })),
                })),
            };

            // console.log('Sending data:', dataToSend);

            const response = await axios.post(url, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.data.status) {
                toast.success(response.data.message);
                navigate(-1); // Navigate back after success
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error("Error submitting form");
        }
    };

    const duplicateUnit = (floorNo, unitIndex, count = 1) => {
        setFloors(prevFloors =>
            prevFloors.map(floor => {
                if (floor.floor_no === floorNo) {
                    const originalUnit = floor.units[unitIndex];

                    // Safely extract the alphanumeric prefix (e.g., "F1U")
                    const baseMatch = originalUnit.unit_no.match(/^(.*?)(\d+)$/);
                    const baseName = baseMatch ? baseMatch[1] : originalUnit.unit_no + 'D';

                    // Find the highest existing number based on the prefix
                    const existingNumbers = floor.units
                        .map(u => {
                            // Match unit_no that starts with the baseName prefix and ends with digits
                            const match = u.unit_no.match(new RegExp(`^${baseName}(\\d+)$`));
                            return match ? parseInt(match[1]) : 0;
                        })
                        .filter(n => !isNaN(n));

                    // Determine the starting number for the new units
                    // If numbers exist, start from max + 1. Otherwise, use the original unit's number + 1.
                    const startNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 :
                        parseInt(originalUnit.unit_no.match(/\d+$/)?.[0] || 0) + 1;

                    // Create all copies at once
                    const newUnits = Array.from({ length: count }, (_, i) => ({
                        ...originalUnit,
                        unit_id: null, // Clear unit_id so it's created as new on backend
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

    const goToPrevious = () => {
        navigate(`/edit-property/property-type?property_id=${propertyUrlId}`);
    };

    return (
        <section className="mx-auto">
            <div className="p-4">
                <h1 className="text-xl font-bold text-gray-700">Edit Property Floors</h1>
                <p className="text-sm text-gray-500">Properties / Edit Property / Multi-Unit</p>
            </div>
            <form className="mx-4" onSubmit={handleSubmit(handleFinalSubmit)}>
                <div className="mb-4 overflow-auto">
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
                {/* Only show the tables if there are floors defined */}
                {floors.length > 0 && (
                    <>
                        <div className="relative overflow-auto">
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
                                            // The logic below currently removes the floor from the list of floors
                                            removeFloor={(floorNo) =>
                                                setFloors((prev) => prev.filter((f) => f.floor_no !== floorNo))
                                            }
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Unit Details Section */}
                        <div className="overflow-auto" id="units">
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

                        {/* Navigation Buttons */}
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
        </section>
    );
};

export default EditMultiUnit;