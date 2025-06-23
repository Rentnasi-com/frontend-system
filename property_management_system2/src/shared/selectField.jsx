const SelectField = ({
    label,
    options,
    name,
    register,
    error,
    ...rest
}) => {
    return (
        <div className="text-sm">
            <label className="block text-sm font-medium text-gray-500 mb-1">
                {label}
            </label>
            <select
                {...register(name)}
                className={`w-full px-3 py-2 border rounded text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 ${error ? "border-red-500" : "border-gray-300"
                    }`}
                {...rest}
            >
                <option value="" disabled>
                    Select an option
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-500">
                    {typeof error === 'string' ? error : error?.message}
                </p>
            )}
        </div>
    );
};

export default SelectField;
