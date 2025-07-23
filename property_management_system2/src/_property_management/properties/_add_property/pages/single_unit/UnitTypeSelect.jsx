const UnitTypeSelect = ({ unitTypes, register, errors }) => (
    <td className="p-1">
        <select
            className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
            {...register("unit_type_id")}
        >
            <option value="" disabled>Select</option>
            {unitTypes.map((type) => (
                <option key={type.id} value={type.id}>
                    {type.name}
                </option>
            ))}
        </select>
        {errors.unit_type_id && (
            <p className="text-red-500 text-xs mt-1">
                {errors.unit_type_id?.message}
            </p>
        )}
    </td>
);

export default UnitTypeSelect