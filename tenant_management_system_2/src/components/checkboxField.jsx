// CheckboxField.js
import React from "react";

const CheckboxField = ({ label, name, checked, onChange }) => {
    return (
        <div className="flex items-center mb-4">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700">{label}</label>
        </div>
    );
};

export default CheckboxField;
