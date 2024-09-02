import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FloorDetails, Units } from "./floors";
import { Loader } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";

// Validation schema
const floorSchema = z.object({
  nof: z.preprocess((val) => Number(val), z.number().min(0).max(40).optional()),
});

const PropertyFloors = () => {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [unitTypes, setUnitTypes] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(floorSchema),
  });

  const floorCount = watch("nof");

  useEffect(() => {
    const propertyId = localStorage.getItem("propertyId");
    if (!propertyId) {
      console.error("No propertyId found in local storage");
      return;
    }
    fetchUnitTypes();
  }, []);

  const fetchUnitTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://pm.api.rentnasi.com/api/v1/get-unit-type",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.data?.success) {
        setUnitTypes(response.data.result || []);
      } else {
        console.error(
          "Failed to fetch unit types:",
          response.data?.message || "No data"
        );
      }
    } catch (error) {
      console.error("Error fetching unit types:", error);
    }
  };

  const MAX_FLOORS = 40;

  const handleFloorsChange = (e) => {
    const newFloorCount = parseInt(e.target.value, 10);

    if (!isNaN(newFloorCount) && newFloorCount <= MAX_FLOORS) {
      setValue("nof", newFloorCount);

      // Create an array representing each floor with an initial structure, starting from ground floor (0)
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

  const updateUnits = (floorNumber, unitsCount) => {
    setFloors((prevFloors) =>
      prevFloors.map((floor) => {
        if (floor.floor_no === floorNumber) {
          const newUnits = Array.from({ length: unitsCount }, (_, i) => ({
            unit_no: `MK${floorNumber}${i + 1}`,
            unit_type: "--Select--",
            rent_amount: 0,
            deposit: 0,
            water: 0,
            electricity: 0,
            garbage: 200, // Set default garbage amount to 200
          }));
          return { ...floor, units_count: unitsCount, units: newUnits };
        }
        return floor;
      })
    );
  };

  const removeFloor = (floorNumber) => {
    const updatedFloors = floors.filter(
      (floor) => floor.floor_no !== floorNumber
    );
    setFloors(updatedFloors);
    setValue("nof", updatedFloors.length);
  };

  const updateUnitField = (floorNumber, unitIndex, field, value) => {
    setFloors((prevFloors) =>
      prevFloors.map((floor) => {
        if (floor.floor_no === floorNumber) {
          const updatedUnits = floor.units.map((unit, idx) => {
            if (idx === unitIndex) {
              return { ...unit, [field]: value };
            }
            return unit;
          });
          return { ...floor, units: updatedUnits };
        }
        return floor;
      })
    );
  };

  const removeUnit = (floorNumber, unitIndex) => {
    setFloors((prevFloors) =>
      prevFloors
        .map((floor) => {
          if (floor.floor_no === floorNumber) {
            const updatedUnits = floor.units.filter(
              (_, idx) => idx !== unitIndex
            );
            if (updatedUnits.length === 0) {
              return null;
            } else {
              return {
                ...floor,
                units: updatedUnits,
                units_count: updatedUnits.length,
              };
            }
          }
          return floor;
        })
        .filter((floor) => floor !== null)
    );
  };

  const handleFinalSubmit = async (data) => {
    try {
      const propertyId = localStorage.getItem("propertyId");
      const token = localStorage.getItem("token");
      if (!propertyId || !token) {
        toast.error("Authorization token or property ID not found!");
        if (!token) window.location.href = "https://auth.rentnasi.com";
        return;
      }

      const dataToSend = {
        property_id: parseInt(propertyId, 10),
        floors: floors.map((floor) => ({
          floor_number: floor.floor_no,
          units: floor.units.map((unit) => ({
            unit_no: unit.unit_no,
            unit_type: unit.unit_type,
            rent_deposit: unit.deposit,
            rent_amount: unit.rent_amount,
            water: unit.water,
            electricity: unit.electricity,
            garbage: unit.garbage,
          })),
        })),
      };

      const response = await axios.post(
        "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/floors",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/add-property/property-summary");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error submitting form");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <section className="mx-auto">
      <div className="p-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-700">
            Add Property Floors
          </h1>
          <p className="text-sm text-gray-500">Properties / Add Property / </p>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div className="bg-white rounded-xl shadow col-span-3 p-4 mx-4 h-full">
          <form onSubmit={handleSubmit(handleFinalSubmit)}>
            <div>
              <label className="mb-2 text-sm">
                Define the number of floors
              </label>
              <input
                className={`bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-2.5 ${errors.nof ? "border-red-500" : ""}`}
                placeholder="Enter floor number e.g. 1"
                type="number"
                {...register("nof")}
                onChange={handleFloorsChange}
              />
              {errors.nof && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nof.message}
                </p>
              )}
            </div>
            {floors.length > 0 && (
              <>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white">
                      Property floors
                      <p className="mt-1 text-sm font-normal text-gray-500">
                        You can now manage the number of units on each floor!
                        🏢✨
                      </p>
                    </caption>
                    <thead className="text-xs text-white uppercase bg-red-700">
                      <tr>
                        <th scope="col" className="px-16 py-3">
                          Floor Number
                        </th>
                        <th scope="col" className="px-16 py-3">
                          Number of Units
                        </th>
                        <th scope="col" className="px-16 py-3">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {floors.map((floor) => (
                        <FloorDetails
                          key={floor.floor_no}
                          floor={floor}
                          updateUnits={updateUnits}
                          removeFloor={removeFloor}
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
                    />
                  ))}
                </div>
                <div className="flex flex-row-reverse mt-4">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                  >
                    {isSubmitting ? (
                      <div className="flex justify-center items-center gap-2">
                        <Loader className="animate-spin" /> Loading ...
                      </div>
                    ) : (
                      <div className="flex justify-center items-center space-x-2">
                        <p>Next</p> <FaArrowRight />
                      </div>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default PropertyFloors;
