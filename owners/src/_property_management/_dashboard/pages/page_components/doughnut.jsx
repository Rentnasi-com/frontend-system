import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const DashboardCharts = () => {
    const doughnutData = {
        labels: ['Online Sale', 'Offline Sale', 'Agent Sale', 'Marketing Sale'],
        datasets: [
            {
                data: [3425, 3120, 2472, 5120],
                backgroundColor: ['#98d8aa', '#ffd88d', '#d4f3f0', '#acd8e3'],
                borderWidth: 0,
            },
        ],
    };

    const barData = {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Income',
                data: [50000, 100000, 75000, 125000, 90000, 95000, 100000],
                backgroundColor: ['#6fb08b', '#6fb08b', '#6fb08b', '#b4dfd0', '#6fb08b', '#6fb08b', '#6fb08b'],
            },
        ],
    };

    const doughnutOptions = {
        cutout: '70%',
        aspectRatio: 1,
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                align: 'center',
            },
        },
    };

    const barOptions = {
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Sales Analytics</h3>
                    <div className="flex justify-center items-center max-w-xs mx-auto">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div className="bg-black p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Income Statistics</h3>
                <div className="flex justify-center">
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
