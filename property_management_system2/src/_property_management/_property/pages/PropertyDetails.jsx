const PropertyDetails = ({ data }) => {
    const { property_name, total_units, units_breakdown, property_floors_listing } = data.result;

    return (
        <section className="m-4 p-4 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">{property_name}</h1>
            <div className="mb-4">
                <p>Total Units: {total_units}</p>
                <div className="flex gap-4">
                    {Object.entries(units_breakdown).map(([key, { color, count }]) => (
                        <div key={key} className="p-2" style={{ backgroundColor: `#${color}` }}>
                            <p className="text-white text-sm capitalize">{key.replace('_', ' ')}</p>
                            <p className="text-white font-bold">{count}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Floors</h2>
                {property_floors_listing.map(floor => (
                    <div key={floor.floor_id} className="mb-4 p-4 border rounded">
                        <h3 className="text-lg font-semibold">Floor {floor.floor_number}</h3>
                        <p>Total Units: {floor.total_units}</p>
                        <p>Occupied Units: {floor.occupied_units}</p>
                        <p>Vacant Units: {floor.vacant_units}</p>
                        <p>Under Maintenance Units: {floor.under_maintenance_units}</p>
                        <a href={floor.view_units_url} className="text-blue-500">View Units</a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PropertyDetails;
