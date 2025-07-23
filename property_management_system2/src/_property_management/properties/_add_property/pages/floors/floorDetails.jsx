import toast from "react-hot-toast";

const FloorDetails = ({ floor, updateUnits, removeFloor }) => {
  const handleUnitsCountChange = (e) => {
    const value = e.target.value;

    // Allow empty string (when user deletes the 0)
    if (value === "") {
      updateUnits(floor.floor_no, "");
      return;
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      updateUnits(floor.floor_no, numValue);
    } else {
      toast.error("Please enter a valid number of units.");
    }
  };

  return (
    <tr>
      <td className="px-16 py-3">
        <strong>{floor.floor_no}</strong>
      </td>
      <td className="px-16 py-3">
        <input
          placehoulder=""
          type="number"
          className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
          value={floor.units_count}
          onChange={handleUnitsCountChange}
          min="0"
        />
      </td>
      <td className="px-16 py-3">
        <button
          type="button"
          className="bg-red-500 text-white py-1 px-2 rounded"
          onClick={() => removeFloor(floor.floor_no)}
        >
          Remove Floor
        </button>

      </td>
    </tr>
  );
};

export default FloorDetails;
