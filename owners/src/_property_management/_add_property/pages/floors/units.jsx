import { useState, useEffect } from "react";

const Units = ({ floor, updateUnitField, removeUnit, unitTypes }) => {
  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    if (!value && field === "unit_no") {
      return "Unit number is required";
    }
    if (["rent_amount", "deposit", "water", "electricity", "garbage"].includes(field)) {
      if (value !== "" && (isNaN(value) || value < 0)) {
        return `${field.replace("_", " ")} must be a non-negative number`;
      }
    }
    return "";
  };

  const handleFieldChange = (unitIndex, field, value) => {
    const sanitizedValue = value === "" ? "" : Number(value);

    // Validate and update field if no errors
    const error = validateField(field, sanitizedValue);
    if (!error) {
      updateUnitField(floor.floor_no, unitIndex, field, sanitizedValue);

      // Update deposit to match rent_amount dynamically
      if (field === "rent_amount") {
        updateUnitField(floor.floor_no, unitIndex, "deposit", sanitizedValue);
      }

      // Clear error for valid field
      setErrors((prevErrors) => ({ ...prevErrors, [`${unitIndex}_${field}`]: "" }));
    } else {
      // Set error for invalid field
      setErrors((prevErrors) => ({ ...prevErrors, [`${unitIndex}_${field}`]: error }));
    }
  };

  const handleRemoveUnit = (unitIndex, event) => {
    event.preventDefault();
    removeUnit(floor.floor_no, unitIndex);
  };

  useEffect(() => {
    // Ensure garbage value is set to 0 if not defined
    floor.units.forEach((unit, index) => {
      if (unit.garbage === undefined) {
        updateUnitField(floor.floor_no, index, "garbage", 0);
      }
    });
  }, [floor.units, floor.floor_no, updateUnitField]);

  const renderInputField = (unitIndex, field, value, placeholder) => (
    <td className="p-1">
      <input
        type="number"
        className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
        value={value}
        onChange={(e) => handleFieldChange(unitIndex, field, e.target.value)}
        placeholder={placeholder}
        min="0"
      />
      {errors[`${unitIndex}_${field}`] && (
        <p className="text-red-500 text-xs mt-1">{errors[`${unitIndex}_${field}`]}</p>
      )}
    </td>
  );

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
                    value={unit.unit_no}
                    onChange={(e) => handleFieldChange(index, "unit_no", e.target.value)}
                    placeholder="Unit number"
                  />
                  {errors[`${index}_unit_no`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`${index}_unit_no`]}</p>
                  )}
                </td>
                <td className="p-1">
                  <select
                    className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
                    value={unit.unit_type}
                    onChange={(e) => handleFieldChange(index, "unit_type", e.target.value)}
                  >
                    <option value="">--Select--</option>
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
                  <button
                    onClick={(e) => handleRemoveUnit(index, e)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Units;
