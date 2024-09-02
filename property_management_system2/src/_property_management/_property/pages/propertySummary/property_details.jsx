import { Pie } from "react-chartjs-2";

const PropertyDetails = ({ propertyDetails }) => {
    // Check if propertyDetails is null or undefined
    if (!propertyDetails) {
        return <div>Loading property details...</div>;
    }

    // Check if units_breakdown or its nested properties are null or undefined
    if (!propertyDetails.units_breakdown) {
        return <div>No units breakdown available for this property.</div>;
    }

    // Extract data from propertyDetails safely
    const { property_name, units_breakdown } = propertyDetails;

    // Check if nested properties (occupied, vacant, under_maintenance) are defined
    const occupiedCount = units_breakdown.occupied ? units_breakdown.occupied.count : 0;
    const vacantCount = units_breakdown.vacant ? units_breakdown.vacant.count : 0;
    const maintenanceCount = units_breakdown.under_maintenance ? units_breakdown.under_maintenance.count : 0;

    // Check if nested properties (occupied, vacant, under_maintenance) have colors defined
    const occupiedColor = units_breakdown.occupied ? `#${units_breakdown.occupied.color}` : '#000';
    const vacantColor = units_breakdown.vacant ? `#${units_breakdown.vacant.color}` : '#000';
    const maintenanceColor = units_breakdown.under_maintenance ? `#${units_breakdown.under_maintenance.color}` : '#000';

    const chartData = {
        labels: ["Occupied", "Vacant", "Under Maintenance"],
        datasets: [
            {
                label: "Units Breakdown",
                data: [occupiedCount, vacantCount, maintenanceCount],
                backgroundColor: [occupiedColor, vacantColor, maintenanceColor],
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="grid grid-cols-2 p-2 rounded bg-[#F2F2F2] border-3 border-white">
            <div>
                <h1 className="font-bold text-2xl">Welcome Back To {property_name}</h1>
                <p className="text-sm">This is your property portfolio report</p>
                <div className="flex space-x-3 mt-3">
                    <div className="pie-chart w-1/2 mt-2">
                        <Pie data={chartData} options={chartOptions} />
                    </div>
                    <div className="chart-labels mt-4">
                        {chartData.labels.map((label, index) => (
                            <div key={index} className="chart-label flex">
                                <div
                                    className="w-1 h-4 mr-2 label-color"
                                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                                ></div>
                                <span className="text-sm text-gray-600">
                                    {label}: {chartData.datasets[0].data[index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-xs mt-2">Last updated: 3 days ago</p>
            </div>
            <div className="flex flex-col justify-center items-center">
                <img
                    width={282}
                    height={208}
                    src="/assets/icons/png/property_details.png"
                    alt="property details"
                />
            </div>
        </div>
    );
};

export default PropertyDetails;
