import { useState } from "react";
import toast from "react-hot-toast";

const FloorDetails = ({ floor, updateUnits, removeFloor, duplicateFloor }) => {
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateCount, setDuplicateCount] = useState(1);
    const [inputValue, setInputValue] = useState("1");

    const handleUnitsCountChange = (e) => {
        const value = e.target.value;

        // Allow empty string for better UX when user clears input
        if (value === "") {
            updateUnits(floor.floor_no, "");
            return;
        }

        const numValue = parseInt(value, 10);

        // Validate numeric input
        if (isNaN(numValue)) {
            toast.error("Please enter a valid number.");
            return;
        }

        // Validate range (0-50 units per floor is reasonable)
        if (numValue < 0) {
            toast.error("Number of units cannot be negative.");
            return;
        }

        if (numValue > 50) {
            toast.error("Maximum 50 units per floor allowed.");
            return;
        }

        updateUnits(floor.floor_no, numValue);
    };

    const handleDuplicateClick = () => {
        if (floor.units_count === "" || floor.units_count === 0) {
            toast.error("Please add units to this floor before duplicating.");
            return;
        }
        setShowDuplicateModal(true);
    };

    const handleConfirmDuplicate = () => {
        if (duplicateCount < 1 || duplicateCount > 10) {
            toast.error("Please enter a number between 1 and 10.");
            return;
        }

        duplicateFloor(floor.floor_no, duplicateCount);
        setShowDuplicateModal(false);
        setDuplicateCount(1);
        setInputValue("1");
        toast.success(`Successfully duplicated floor ${floor.floor_no} ${duplicateCount} time(s)`);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const num = parseInt(inputValue, 10);
        if (isNaN(num) || num < 1) {
            setDuplicateCount(1);
            setInputValue("1");
        } else if (num > 10) {
            setDuplicateCount(10);
            setInputValue("10");
        } else {
            setDuplicateCount(num);
        }
    };

    const handleRemoveFloor = () => {
        // The confirmation logic is now handled in PropertyFloors component
        removeFloor(floor.floor_no);
    };

    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                    Floor {floor.floor_no}
                    {floor.floor_no === 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Ground Floor
                        </span>
                    )}
                </td>
                <td className="px-6 py-4">
                    <input
                        type="number"
                        className="bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2 transition-colors"
                        value={floor.units_count}
                        onChange={handleUnitsCountChange}
                        min="0"
                        max="50"
                        placeholder="Enter number of units"
                        aria-label={`Number of units for floor ${floor.floor_no}`}
                    />
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={handleDuplicateClick}
                            disabled={!floor.units_count || floor.units_count === 0}
                            title="Duplicate this floor"
                        >
                            Duplicate
                        </button>
                        <button
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onClick={handleRemoveFloor}

                            title={floor.floor_no === 0 ? "Ground floor cannot be removed" : "Remove this floor"}
                        >
                            Remove
                        </button>
                    </div>
                </td>
            </tr>

            {/* Duplicate Modal */}
            {showDuplicateModal && (
                <td colSpan="3">
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all">

                            <h3 className="font-extrabold text-xl text-gray-900 mb-2">
                                Clone Floor {floor.floor_no}
                            </h3>

                            <p className="text-sm text-gray-600 mb-4">
                                This will create new floor(s) with the exact same units, types, and rent details as Floor {floor.floor_no}.
                                The new floors will be added **immediately above** the existing highest floor.
                            </p>

                            {/* Input Section */}
                            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <label htmlFor="floor-copy-count" className="block text-sm font-bold text-blue-800 mb-2">
                                    Number of Floor Copies (1-10):
                                </label>
                                <input
                                    id="floor-copy-count"
                                    type="number"
                                    min="1"
                                    max="10"
                                    // Tailwind for modern, focused input and center text
                                    className="w-full p-2 border border-blue-300 rounded-lg text-lg text-center font-bold focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                />
                            </div>

                            {/* Preview Section - Clearly showing the result */}
                            <div className="mb-6 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
                                <p className="font-semibold mb-1">Floor Duplication Summary:</p>
                                <ul className="list-disc list-inside ml-2 space-y-0.5 text-xs">
                                    <li>
                                        Cloning **{floor.units.length} unit(s)** from Floor {floor.floor_no}.
                                    </li>
                                    <li>
                                        New floors will be numbered sequentially.
                                        {/* 💡 This is a hypothetical preview, you'll need the highest existing floor number (maxFloorNo) to show a better preview */}
                                        <span className="text-gray-500 block mt-1">
                                            {/* Example Preview (Replace `maxFloorNo` with your state value if available) */}
                                            e.g., New floors will start from **#{/* maxFloorNo + 1 */}**
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Reset logic remains sound
                                        setShowDuplicateModal(false);
                                        setDuplicateCount(1);
                                        setInputValue("1");
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDuplicate}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
                                >
                                    Create {duplicateCount} New Floor(s)
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            )}
        </>
    );
};

export default FloorDetails;