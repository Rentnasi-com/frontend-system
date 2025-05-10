import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../../shared";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import axios from "axios";
import Units from "./floors/units";
import FloorDetails from "./floors/floorDetails";

const floorSchema = z.object({
  nof: z.preprocess((val) => Number(val), z.number().min(0).max(40).nonnegative()),
});

const PropertyFloors = () => {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
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
  }, [propertyUrlId]);

  const fetchUnitTypes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/get-unit-type`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
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
              deposit: parseFloat(unit.rent_deposit),
              water: parseFloat(unit.water),
              electricity: parseFloat(unit.electricity),
              garbage: parseFloat(unit.garbage),
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
              deposit: 0,
              water: 0,
              electricity: 0,
              garbage: 0,
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
      const isEdit = Boolean(propertyUrlId); // Determine if editing
      const url = isEdit
        ? `${baseUrl}/manage-property/edit-property/floors`
        : `${baseUrl}/manage-property/create-property/floors`;

      const dataToSend = {
        property_id: parseInt(propertyId, 10),
        floors: floors.map((floor) => ({
          ...(isEdit ? { floor_id: floor.floor_id } : {}), // Include floor_id if editing
          floor_number: floor.floor_no,
          units: floor.units.map((unit) => ({
            ...(isEdit && unit.unit_id ? { unit_id: unit.unit_id } : {}), // Include unit_id only when editing
            unit_no: unit.unit_no,
            unit_type: parseInt(unit.unit_type, 10), // Ensure unit_type is sent as integer
            rent_deposit: parseFloat(unit.deposit), // Ensure numerical values are sent as numbers
            rent_amount: parseFloat(unit.rent_amount),
            water: parseFloat(unit.water),
            electricity: parseFloat(unit.electricity),
            garbage: parseFloat(unit.garbage),
          })),
        })),
      };

      const response = await axios.post(url, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data.status) {
        toast.success(response.data.message);
        navigate("/add-property/manage-images");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error submitting form");
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
