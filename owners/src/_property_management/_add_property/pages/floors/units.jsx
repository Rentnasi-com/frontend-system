import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const Units = ({ floor, updateUnitField, removeUnit, unitTypes }) => {
  const [errors, setErrors] = useState({});

  const handleRemoveUnit = (unitIndex, event) => {
    event.preventDefault();
    event.stopPropagation();
    removeUnit(floor.floor_no, unitIndex);
  };

  const validateField = (unitIndex, field, value) => {
    let error = "";
    if (field === "unit_no" && !value) {
      error = "Unit number is required";
    }
    if ((field === "rent_amount" || field === "deposit" || field === "water" || field === "electricity" || field === "garbage") && (value !== "" && (isNaN(value) || value < 0))) {
      error = `${field.replace("_", " ")} must be a non-negative number`;
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`${unitIndex}_${field}`]: error,
    }));
    return !error;
  };

  const handleFieldChange = (unitIndex, field, value) => {
    const sanitizedValue = value === "" ? "" : Number(value);
    if (validateField(unitIndex, field, sanitizedValue)) {
      updateUnitField(floor.floor_no, unitIndex, field, sanitizedValue);
      if (field === "rent_amount") {
        updateUnitField(floor.floor_no, unitIndex, "deposit", sanitizedValue);
      }
    }
  };

  useEffect(() => {
    floor.units.forEach((unit, index) => {
      if (unit.garbage === 0) {
        updateUnitField(floor.floor_no, index, 'garbage', 200);
      }
    });
  }, [floor.units, floor.floor_no, updateUnitField]);

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
        <table
          id="unitTable"
          className="w-full text-sm text-left text-gray-500"
        >
          <thead className="text-xs text-white uppercase bg-red-700 py-4">
            <tr>
              <th scope="col" className="px-5 py-3">No</th>
              <th scope="col" className="px-5 py-3">Unit Name</th>
              <th scope="col" className="px-5 py-3">Unit Type</th>
              <th scope="col" className="px-5 py-3">Rent Amount</th>
              <th scope="col" className="px-5 py-3">Deposit</th>
              <th scope="col" className="px-5 py-3">Water</th>
              <th scope="col" className="px-5 py-3">Electricity</th>
              <th scope="col" className="px-5 py-3">Garbage</th>
              <th scope="col" className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody id={`flRow${floor.floor_no}`}>
            {floor.units?.map((unit, index) => (
              <tr key={index} className={`unit${floor.floor_no}${index + 1}`}>
                <th className="p-1" scope="row">
                  <strong className="form-control border-0">{index + 1}</strong>
                </th>
                <td className="p-1">
                  <input
                    type="text"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 focus:outline-red-400 block w-full p-1.5"
                    value={unit.unit_no}
                    onChange={(e) =>
                      handleFieldChange(index, "unit_no", e.target.value)
                    }
                    placeholder="Unit number"
                  />
                  {errors[`${index}_unit_no`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_unit_no`]}
                    </p>
                  )}
                </td>
                <td className="p-1">
                  <select
                    className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                    value={unit.unit_type}
                    onChange={(e) =>
                      handleFieldChange(index, "unit_type", e.target.value)
                    }
                    aria-label="Default select example"
                  >
                    <option value="--Select--">--Select--</option>
                    {unitTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors[`${index}_unit_type`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_unit_type`]}
                    </p>
                  )}
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                    value={unit.rent_amount}
                    onChange={(e) =>
                      handleFieldChange(index, "rent_amount", e.target.value)
                    }
                    placeholder="Rent amount"
                    min="0"
                  />
                  {errors[`${index}_rent_amount`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_rent_amount`]}
                    </p>
                  )}
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                    value={unit.deposit}
                    onChange={(e) =>
                      handleFieldChange(index, "deposit", e.target.value)
                    }
                    placeholder="Deposit"
                    min="0"
                  />
                  {errors[`${index}_deposit`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_deposit`]}
                    </p>
                  )}
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                    value={unit.water}
                    onChange={(e) =>
                      handleFieldChange(index, "water", e.target.value)
                    }
                    placeholder="Water"
                    min="0"
                  />
                  {errors[`${index}_water`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_water`]}
                    </p>
                  )}
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                    value={unit.electricity}
                    onChange={(e) =>
                      handleFieldChange(index, "electricity", e.target.value)
                    }
                    placeholder="Electricity"
                    min="0"
                  />
                  {errors[`${index}_electricity`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_electricity`]}
                    </p>
                  )}
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                    value={unit.garbage}
                    onChange={(e) =>
                      handleFieldChange(index, "garbage", e.target.value)
                    }
                    placeholder="Garbage"
                    min="0"
                  />
                  {errors[`${index}_garbage`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[`${index}_garbage`]}
                    </p>
                  )}
                </td>
                <td className="w-auto p-1">
                  <button
                    onClick={(e) => handleRemoveUnit(index, e)}
                    className="font-medium text-red-600 hover:underline text-center"
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
