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

    if (!isNaN(newFloorCount) && newFloorCount >= 0 && newFloorCount <= 40) {
      setValue("nof", newFloorCount);

      const newFloors = Array.from({ length: newFloorCount + 1 }, (_, i) => ({
        floor_no: i,
        units_count: "",
        units: [],
      }));

      setFloors(newFloors);
    } else {
      setValue("nof", undefined);
      setFloors([]);
      toast.error("Please enter a valid number of floors (0-40).");
    }
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

  const goToPrevious = () => {
    navigate(`/add-property/property-type?property_id=${propertyId}`);
  };

  return (
    <section className="mx-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-700">Add Property Floors</h1>
        <p className="text-sm text-gray-500">Properties / Add Property / Floors</p>
      </div>
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
                      removeFloor={(floorNo) =>
                        setFloors((prev) => prev.filter((f) => f.floor_no !== floorNo))
                      }
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
    </section>
  );
};

export default PropertyFloors;
