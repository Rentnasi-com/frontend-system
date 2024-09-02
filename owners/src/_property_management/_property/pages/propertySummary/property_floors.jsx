const PropertyFloors = ({ propertyDetails, handleViewProperty }) => (
    <div className="relative overflow-x-auto shadow-md sm:rounded col-span-3">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Floor number
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Total Units
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Occupied Units
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Vacant Units
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Units under maintenance
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Action
                    </th>
                </tr>
            </thead>
            <tbody>
                {propertyDetails.property_floors_listing.map((floor) => (
                    <tr key={floor.floor_id} className="bg-white border border-b">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {floor.floor_number}
                        </th>
                        <td className="px-6 py-4">{floor.total_units}</td>
                        <td className="px-6 py-4">{floor.occupied_units}</td>
                        <td className="px-6 py-4">{floor.vacant_units}</td>
                        <td className="px-6 py-4">{floor.under_maintenance_units}</td>
                        <td className="flex space-x-2 px-6 py-4">
                            <button
                                className="text-red-600"
                                onClick={() => handleViewProperty(propertyDetails.property_id, floor.floor_id)}
                            >
                                View units
                            </button>
                            <img width={16} height={16} src="/assets/icons/png/redirect.png" alt="redirect" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default PropertyFloors