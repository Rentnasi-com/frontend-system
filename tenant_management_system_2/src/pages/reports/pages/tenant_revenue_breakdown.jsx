import { DashboardHeader, PropertyCard, TableRow } from "../../pages_components";

const TenantRevenueBreakdown = () => {
    const stats = [
        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 20,
            label: "Expected Income",
            value: 20,
        },
        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 20,
            label: "Amount Payed",
            value: 2000,
        },
        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/outstanding_balance.png",
            progress: 20,
            label: "Outstanding Balance",
            value: 20,
        },
        {
            redirectUrl: "/tenants/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 20,
            label: "Total fines",
            value: 20,
        },
    ];

    const properties = [
        {
            propertyName: "King Serenity - Ongata Rongai",
            unitNo: "MK 01",
            unitType: "1 Bedroom",
            rentAmount: "KES 20,200",
            additionalCharges: "KES 10,200",
            dueDate: "20 May 2024",
            fines: "KES 1,000",
            balance: "KES 1,000",
            rentStatus: "Pending",
            isShowingActions: true,
        },
    ];
    return (
        <>
            <DashboardHeader
                title="Revenue breakdown"
                description="The total income expected from tenants or properties over a specified period."
                
                hideSelect={true}
                hideLink={false}
            />
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 py-1 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2">
                        <PropertyCard
                            redirectUrl={stat.redirectUrl}
                            iconSrc={stat.iconSrc}
                            label={stat.label}
                            value={stat.value}
                        />
                    </div>
                ))}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">Expected income</h4>
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs">
                                <tr>

                                    <th className="p-2">Property Name</th>
                                    <th className="p-2">Unit No</th>
                                    <th className="p-2">Unit Type</th>
                                    <th className="p-2">Monthly rent</th>
                                    <th className="p-2">Additional Charges</th>
                                    <th className="p-2">Due Date</th>
                                    <th className="p-2">Fines</th>
                                    <th className="p-2">Balance</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((property, index) => (
                                    <TableRow
                                        key={index}
                                        propertyName={property.propertyName}
                                        unitNo={property.unitNo}
                                        unitType={property.unitType}
                                        rentAmount={property.rentAmount}
                                        additionalCharges={property.additionalCharges}
                                        dueDate={property.dueDate}
                                        fines={property.fines}
                                        balance={property.balance}
                                        rentStatus={property.rentStatus}
                                        isShowingActions={property.isShowingActions}
                                        eyeLink='/property/payment-history'
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TenantRevenueBreakdown