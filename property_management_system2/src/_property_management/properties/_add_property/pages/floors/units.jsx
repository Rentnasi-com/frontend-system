import { useState, useEffect } from "react";

const Units = ({ floor, updateUnitField, removeUnit, unitTypes, duplicateUnit, propertyAmenities }) => {
  const [errors, setErrors] = useState({});
  const [inputValue, setInputValue] = useState("1");
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [showBulkDuplicate, setShowBulkDuplicate] = useState(false);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(null);

  const handleBulkDuplicate = () => {
    if (selectedUnitIndex !== null) {
      duplicateUnit(floor.floor_no, selectedUnitIndex, duplicateCount);
    }
    setShowBulkDuplicate(false);
  };


  const validateField = (field, value) => {
    if (!value && field === "unit_no") {
      return "Unit number is required";
    }
    if (field === "unit_no" && typeof value !== "string") {
      return "Unit number must be text";
    }

    if (!value && field === "unit_type") {
      return "Unit type is required";
    }

    if (["rent_amount", "deposit", "water", "electricity", "garbage"].includes(field)) {
      if (value !== "" && (isNaN(value) || value < 0)) {
        return `${field.replace("_", " ")} must be a non-negative number`;
      }
    }
    return "";
  };

  const handleFieldChange = (unitIndex, field, value) => {
    const fieldState = getFieldState(floor.units[unitIndex], field);
    if (fieldState.disabled) return;

    if (field === "unit_no" || field === "unit_type") {
      const error = validateField(field, value);
      if (!error) {
        updateUnitField(floor.floor_no, unitIndex, field, value);
        setErrors((prevErrors) => ({ ...prevErrors, [`${unitIndex}_${field}`]: "" }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, [`${unitIndex}_${field}`]: error }));
      }
      return;
    }

    const sanitizedValue = value === "" ? "" : Number(value);


    // Validate and update field if no errors
    const error = validateField(field, sanitizedValue);
    if (!error) {
      updateUnitField(floor.floor_no, unitIndex, field, sanitizedValue);

      // Update deposit to match rent_amount dynamically (only if deposit is not disabled)
      if (field === "rent_amount" && !getFieldState(floor.units[unitIndex], 'deposit').disabled) {
        updateUnitField(floor.floor_no, unitIndex, "deposit", sanitizedValue);
      }

      setErrors((prevErrors) => ({ ...prevErrors, [`${unitIndex}_${field}`]: "" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, [`${unitIndex}_${field}`]: error }));
    }
  };

  const handleRemoveUnit = (unitIndex, event) => {
    event.preventDefault();
    removeUnit(floor.floor_no, unitIndex);
  };
  const handleDuplicateUnit = (unitIndex, event) => {
    event.preventDefault();
    duplicateUnit(floor.floor_no, unitIndex);
  };

  useEffect(() => {
    // Ensure garbage value is set to 0 if not defined
    floor.units.forEach((unit, index) => {
      if (unit.garbage === undefined) {
        updateUnitField(floor.floor_no, index, "garbage", 0);
      }
    });
  }, [floor.units, floor.floor_no, updateUnitField]);

  const getFieldState = (unit, field) => {
    if (!propertyAmenities) return { disabled: false };

    switch (field) {
      case 'water':
        return {
          disabled: propertyAmenities.is_water_inclusive_of_rent === 1,
          value: propertyAmenities.is_water_inclusive_of_rent === 1 ? 0 : unit.water
        };
      case 'garbage':
        return {
          disabled: propertyAmenities.garbage_deposit === 1,
          value: propertyAmenities.garbage_deposit === 1 ? 0 : unit.garbage
        };
      case 'deposit':
        return {
          disabled: propertyAmenities.rent_deposit !== 1,
          value: propertyAmenities.rent_deposit === 1 ? unit.deposit : 0
        };
      default:
        return { disabled: false, value: unit[field] };
    }
  };

  const renderInputField = (unitIndex, field, value, placeholder) => {
    const fieldState = getFieldState(floor.units[unitIndex], field);

    return (
      <td className="p-1 overflow-auto">
        <input
          type="number"
          className={`bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full p-1.5 ${fieldState.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          value={fieldState.value}
          onChange={(e) => !fieldState.disabled &&
            handleFieldChange(unitIndex, field, e.target.value)}
          placeholder={placeholder}
          min="0"
          disabled={fieldState.disabled}
        />
        {errors[`${unitIndex}_${field}`] && !fieldState.disabled && (
          <p className="text-red-500 text-xs mt-1">{errors[`${unitIndex}_${field}`]}</p>
        )}
        {fieldState.disabled && (
          <p className="text-xs text-gray-500">
            {field === 'water' && 'Included in rent'}
            {field === 'garbage' && 'Included in rent'}
            {field === 'deposit' && 'Not required'}
          </p>
        )}
      </td>
    );
  };
  return (
    <div className={`my-3 floor${floor.floor_no}`}>
      <div className="border rounded p-2">
        <strong>
          Floor <span>{floor.floor_no}</span> with{" "}
          <span id={`fl${floor.floor_no}`}>{floor.units_count}</span> unit(s)
        </strong>
        <p className="mt-1 text-sm font-normal text-gray-500">
          You can now manage each unit on this floor! 🏢 Just enter the unit
          number 📋, type 🏠, rent 💰, deposits for water 🚰, electricity ⚡,
          and garbage 🗑️.
        </p>
      </div>
      <div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-red-700 py-4">
            <tr>
              <th className="px-5 py-3">No</th>
              <th className="px-5 py-3">Unit Name</th>
              <th className="px-5 py-3">Unit Type</th>
              <th className="px-5 py-3">Rent Amount</th>
              <th className="px-5 py-3">Deposit</th>
              <th className="px-5 py-3">Water</th>
              <th className="px-5 py-3">Electricity</th>
              <th className="px-5 py-3">Garbage</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {floor.units?.map((unit, index) => (
              <tr key={index} className={`unit${floor.floor_no}${index + 1}`}>
                <th className="p-1" scope="row">
                  <strong className="form-control border-0">{index + 1}</strong>
                </th>
                <td className="p-1">
                  <input
                    type="text"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
                    defaultValue={unit.unit_no}
                    onChange={(e) => handleFieldChange(index, "unit_no", e.target.value)}
                    placeholder="Unit number"
                  />
                  {errors[`${index}_unit_no`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${index}_unit_no`]}</p>
                  )}
                </td>

                <td className="p-1">
                  <select
                    className={`bg-white border ${errors[`${index}_unit_type`] ? 'border-red-500' : 'border-gray-300'
                      } text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-1.5`}
                    value={unit.unit_type}
                    onChange={(e) => handleFieldChange(index, "unit_type", e.target.value)}
                    required
                  >
                    <option value="">Select Unit Type</option>
                    {unitTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors[`${index}_unit_type`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${index}_unit_type`]}</p>
                  )}
                </td>
                {renderInputField(index, "rent_amount", unit.rent_amount, "Rent amount")}
                {renderInputField(index, "deposit", unit.deposit, "Deposit")}
                {renderInputField(index, "water", unit.water, "Water")}
                {renderInputField(index, "electricity", unit.electricity, "Electricity")}
                {renderInputField(index, "garbage", unit.garbage, "Garbage")}
                <td className="w-auto p-1">
                  <select
                    className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
                    onChange={(e) => {
                      const action = e.target.value;
                      if (action === "duplicate-single") {
                        duplicateUnit(floor.floor_no, index, 1);
                      } else if (action === "duplicate-multiple") {
                        setSelectedUnitIndex(index);
                        setShowBulkDuplicate(true);
                      } else if (action === "remove") {
                        handleRemoveUnit(index, e);
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">Select Action</option>
                    <option value="duplicate-single">Duplicate Single</option>
                    <option value="duplicate-multiple">Duplicate Multiple</option>
                    <option value="remove">Remove</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showBulkDuplicate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="font-bold text-lg mb-4">Duplicate Multiple Units</h3>
            <div className="mb-4">
              <label className="block text-sm mb-2">
                Number of copies:
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => {
                    const num = parseInt(inputValue);
                    if (isNaN(num) || num < 1) {
                      setDuplicateCount(1);
                      setInputValue("1");
                    } else if (num > 20) {
                      setDuplicateCount(20);
                      setInputValue("20");
                    } else {
                      setDuplicateCount(num);
                    }
                  }}
                  className="ml-2 p-1 border rounded w-16"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkDuplicate(false)}
                className="bg-red-700 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDuplicate}
                className="bg-green-700 text-white px-3 py-1 rounded"
              >
                Create Copies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
