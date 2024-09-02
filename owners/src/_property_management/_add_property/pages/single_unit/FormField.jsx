const FormField = ({ name, label, register, errors, defaultValue }) => (
    <td className="p-1">
        <input
            type="number"
            className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
            {...register(name, { valueAsNumber: true })}
            placeholder={label}
            min="0"
            defaultValue={defaultValue}
        />
        {errors[name] && (
            <p className="text-red-500 text-xs mt-1">
                {errors[name]?.message}
            </p>
        )}
    </td>
);

export default FormField