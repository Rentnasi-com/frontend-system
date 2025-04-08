import { DashboardHeader, PropertyCard, TableRow } from "../pages_components";

const Inquiries = () => {
    const stats = [
        {
            redirectUrl: "/inquiries",
            iconSrc: "../../../assets/icons/png/inquiries.png",
            progress: 20,
            label: "Total Inquiries",
            value: 20,
        },
        {
            redirectUrl: "/inquiries",
            iconSrc: "../../../assets/icons/png/inquiries_progress.png",
            progress: 20,
            label: "Inquiries on progress",
            value: 2000,
        },
        {
            redirectUrl: "/inquiries",
            iconSrc: "../../../assets/icons/png/inquiries _hold.png",
            progress: 20,
            label: "Inquiries on hold",
            value: 20,
        },
        {
            redirectUrl: "/inquiries",
            iconSrc: "../../../assets/icons/png/inquiries_completed.png",
            progress: 20,
            label: "Complete Inquiries",
            value: 20,
        },
    ];

    const properties = [
        {
            inquiryDescription: "Electrical problem cons...",
            propertyName: "King serenity plaza",
            unitNo: "B1, 4th floor",
            taskCare: "Mr Simon",
            inquiryPriority: "HIGH",
            inquiryStatus: "In progress",
        },
    ];
    return (
        <>
            <DashboardHeader
                title="All your property"
                description="Manage All Your Properties in One Place"
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
                <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs">
                                <tr>
                                    <th className="px-4 py-2">Title</th>
                                    <th className="px-4 py-2">Property name</th>
                                    <th className="px-4 py-2">Unit name</th>
                                    <th className="px-4 py-2">Responsible</th>
                                    <th className="px-4 py-2">Priority</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((property, index) => (
                                    <TableRow
                                        key={index}
                                        inquiryDescription={property.inquiryDescription}
                                        propertyName={property.propertyName}
                                        unitNo={property.unitNo}
                                        taskCare={property.taskCare}
                                        inquiryPriority={property.inquiryPriority}
                                        inquiryStatus={property.inquiryStatus}
                                        eyeLink="/chatroom"
                                        isShowingActions={true}
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

export default Inquiries