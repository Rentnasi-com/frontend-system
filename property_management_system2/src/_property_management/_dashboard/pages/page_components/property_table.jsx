import TableRow from './table_row';

const PropertyTable = () => {
    const properties = [
        {
            photo: "../../../assets/images/property.png",
            name: "King Serenity - Ongata Rongai",
            vacant: 80,
            occupied: 20,
            openIssues: 50,
            expectedRevenue: "KES 200,2000",
            outstandingRevenue: "KES 100,000",
            pendingBalances: "KES 100,2000",
        },
        // Add more property data here
    ];

    return (
        <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
            <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
            <div className="w-full">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100 text-left text-xs">
                            <tr>
                                <th className="px-4 py-2">Photo</th>
                                <th className="px-4 py-2">Property name</th>
                                <th className="px-4 py-2">Vacant</th>
                                <th className="px-4 py-2">Occupied</th>
                                <th className="px-4 py-2">Open issues</th>
                                <th className="px-4 py-2">Expected revenue</th>
                                <th className="px-4 py-2">Outstanding revenue</th>
                                <th className="px-4 py-2">Pending balances</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((property, index) => (
                                <TableRow
                                    key={index}
                                    name={property.name}
                                    photo={property.photo}
                                    vacant={property.vacant}
                                    occupied={property.occupied}
                                    openIssues={property.openIssues}
                                    expectedRevenue={property.expectedRevenue}
                                    outstandingRevenue={property.outstandingRevenue}
                                    pendingBalances={property.pendingBalances}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PropertyTable;
