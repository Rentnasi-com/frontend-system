const PropertyStatistics = ({ propertyDetails }) => (
    <div className="grid grid-cols-3 gap-3 mt-2">
        {[
            { icon: "maintain.png", label: "Maintenance Request", value: propertyDetails.maintenance_requests },
            { icon: "enquiry.png", label: "Enquiry messages", value: propertyDetails.enquiry_messages },
            { icon: "vacate.png", label: "Vacate notice", value: propertyDetails.vacate_notices },
        ].map((item, index) => (
            <div key={index} className="bg-white border-1 border-gray-300 rounded p-2 shadow-xl">
                <div className="flex justify-between">
                    <img width={25} height={25} src={`/assets/icons/png/${item.icon}`} alt={item.label} />
                    <p className="text-xs">{item.label}</p>
                </div>
                <div className="flex justify-between">
                    <p className="font-medium">{item.value}</p>
                    <img width={24} height={24} src="/assets/icons/png/arrow.png" alt="arrow" />
                </div>
            </div>
        ))}
    </div>
);

export default PropertyStatistics
