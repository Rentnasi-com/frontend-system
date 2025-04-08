const SelectField = ({ label, options, name, value, onChange }) => {
    return (
        <div className="mb-4 text-sm">
            <label className="block text-gray-500 font-semibold mb-1 ">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:ring focus:ring-blue-300"
            >
                <option value="">Select {label.toLowerCase()}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectField;
