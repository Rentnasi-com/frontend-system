
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Link } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { DashboardHeader } from "../properties/dashboard/page_components";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);



const MonthlyRevenueBreakdown = () => {
    const chartData = {
        revenueBreakdownData: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    type: "bar",
                    label: "Monthly Revenue",
                    data: [50000, 30000, 70000, 50000, 65000, 80000, 60000, 70000, 40000, 50000, 55000, 60000],
                    backgroundColor: "rgba(75, 192, 192, 0.7)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    barThickness: 10
                },
                {
                    type: "line",
                    label: "Revenue Trend",
                    data: [45000, 35000, 65000, 55000, 60000, 75000, 55000, 65000, 35000, 45000, 50000, 55000],
                    borderColor: "rgba(54, 162, 235, 1)",
                    fill: false,
                    tension: 0.2,
                    borderWidth: 1,
                },
            ],
        },

        revenueSourcesData: {
            labels: ["Rent", "Maintenance", "Fines"],
            datasets: [
                {
                    data: [55, 25, 20],
                    backgroundColor: ["#4caf50", "#ff9800", "#000000"],
                    hoverBackgroundColor: ["#4caf50", "#ff9800", "#000000"],
                },
            ],
        }
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
            },
        },
        aspectRatio: 2.5,
    };

    const ChartCard = ({ title, chartType: ChartComponent, data }) => (
        <div className="w-full bg-white border rounded p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <ChartComponent data={data} options={chartOptions} />
        </div>
    );

    const expenses = [
        {
            propertyName: "King Serenity",
            jan: 25000,
            feb: 25000,
            mar: 25000,
            apr: 25000,
            may: 25000,
            jun: 25000,
            jul: 25000,
            aug: 25000,
            sep: 25000,
            oct: 25000,
            nov: 25000,
            dec: 25000,
            totalExpenses: "60,000,000",
        },
    ];

    return (
        <>
            <DashboardHeader
                title="Revenue Reports"
                description="Your revenue report"
                hideSelect={true}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-4">
                <div className="col-span-2">
                    <ChartCard title="Monthly Revenue Breakdown" chartType={Bar} data={chartData.revenueBreakdownData} />
                </div>
                <div>
                    <ChartCard title="Revenue Sources" chartType={Doughnut} data={chartData.revenueSourcesData} />
                </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">Expense Breakdown Table</h4>
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs">
                                <tr>
                                    <th className="p-4 text-left text-gray-600">Property Name</th>
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                                        <th key={month} className="p-4 text-left text-gray-600">{month}</th>
                                    ))}
                                    <th className="p-4 text-left text-gray-600">Total Revenue</th>
                                    <th className="p-4 text-left text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">

                                {expenses.map((expense, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-4 py-2">{expense.propertyName}</td>
                                        <td className="px-4 py-2">{expense.jan}</td>
                                        <td className="px-4 py-2">{expense.feb}</td>
                                        <td className="px-4 py-2">{expense.mar}</td>
                                        <td className="px-4 py-2">{expense.apr}</td>
                                        <td className="px-4 py-2">{expense.may}</td>
                                        <td className="px-4 py-2">{expense.jun}</td>
                                        <td className="px-4 py-2">{expense.jul}</td>
                                        <td className="px-4 py-2">{expense.aug}</td>
                                        <td className="px-4 py-2">{expense.sep}</td>
                                        <td className="px-4 py-2">{expense.oct}</td>
                                        <td className="px-4 py-2">{expense.nov}</td>
                                        <td className="px-4 py-2">{expense.dec}</td>
                                        <td className="px-4 py-2">{expense.totalExpenses}</td>
                                        <td className="px-4 py-2 flex space-x-4 mt-2">
                                            <Link to="/property/revenue-breakdown"><FaEye className="text-gray-500 hover:text-gray-700 cursor-pointer" /></Link>
                                            <FaEdit className="text-purple-500 hover:text-purple-700 cursor-pointer" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MonthlyRevenueBreakdown