
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, } from 'chart.js';
import { DashboardHeader, PropertyCard } from '../properties/dashboard/page_components';

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

const stats = [
  {
    redirectUrl: "/dashboard/reports/revenue-breakdown",
    iconSrc: "../../../assets/icons/png/expected_income.png",
    progress: 20,
    label: "Total revenue collected",
    value: 2000,
  },
  {
    redirectUrl: "/property/all-property-units",
    iconSrc: "../../../assets/icons/png/wallet_1.png",
    progress: 20,
    label: "Total Expenses",
    value: 20,
  },
  {
    redirectUrl: "/property/all-property-units",
    iconSrc: "../../../assets/icons/png/enquiry_1.png",
    progress: 20,
    label: "Total Pending Payments",
    value: 20,
  },
  {
    redirectUrl: "/property/revenue-breakdown",
    iconSrc: "../../../assets/icons/png/expected_income.png",
    progress: 20,
    label: "Occupancy Rate",
    value: 20,
  },
  {
    redirectUrl: "/property/revenue-breakdown",
    iconSrc: "../../../assets/icons/png/dashboard_properties.png",
    progress: 20,
    label: "Number of Properties",
    value: 2000,
  },
  {
    redirectUrl: "/property/revenue-breakdown",
    iconSrc: "../../../assets/icons/png/total_units.png",
    progress: 20,
    label: "Number of Tenants",
    value: 20,
  },
  {
    redirectUrl: "/property/revenue-breakdown",
    iconSrc: "../../../assets/icons/png/total_fines.png",
    progress: 20,
    label: "Number of Active Inquiries",
    value: 20,
  },
];

const chartData = {
  revenueVsExpenses: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Last Month',
        data: [20, 30, 40, 20, 50, 30, 40, 30, 50, 30, 40, 60],
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        tension: 0.3,
        borderWidth: 1,
      },
      {
        label: 'Current Month',
        data: [25, 35, 45, 35, 55, 45, 35, 45, 55, 35, 55, 65],
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: false,
        tension: 0.3,
        borderWidth: 1,
      },
    ],
  },
  occupancyRate: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Last Month',
        data: [15, 25, 35, 50, 40, 45, 30, 35, 45, 40, 25, 50],
        backgroundColor: 'rgba(255, 99, 132, 1)',
        barThickness: 10
      },
      {
        label: 'Current Month',
        data: [20, 30, 40, 55, 45, 50, 35, 40, 50, 45, 30, 55],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        barThickness: 10
      },
    ],
  },
  maintenanceRequests: {
    labels: ['New', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [30, 40, 30],
        backgroundColor: ['#ff6384', '#36a2eb', '#4caf50'],
        hoverBackgroundColor: ['#ff6384', '#36a2eb', '#4caf50'],
      },
    ],
  },
  inquiriesStatus: {
    labels: ['General', 'Billing', 'Maintenance'],
    datasets: [
      {
        label: 'Open',
        data: [50, 40, 30],
        backgroundColor: '#ff6384',
        barThickness: 10
      },
      {
        label: 'In Progress',
        data: [30, 35, 25],
        backgroundColor: '#36a2eb',
        barThickness: 10
      },
      {
        label: 'Resolved',
        data: [20, 25, 45],
        backgroundColor: '#4caf50',
        barThickness: 10
      },
    ],
  },
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  aspectRatio: 2.5,
};

const StatCard = ({ stat }) => (
  <div className="bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2">
    <PropertyCard
      redirectUrl={stat.redirectUrl}
      iconSrc={stat.iconSrc}
      label={stat.label}
      value={stat.value}
    />
  </div>
);

const ChartCard = ({ title, chartType: ChartComponent, data }) => (
  <div className="w-full bg-white border rounded p-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <ChartComponent data={data} options={chartOptions} />
  </div>
);

const Reports = () => {
  return (
    <>
      <DashboardHeader
        title="Your finance report"
        description="Your Business Financial Data"
        hideSelect={true}
      />
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 py-1 px-4">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 py-1 px-4 mt-6">
        <ChartCard title="Revenue vs Expenses" chartType={Line} data={chartData.revenueVsExpenses} />
        <ChartCard title="Occupancy Rate" chartType={Bar} data={chartData.occupancyRate} />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 py-1 px-4 mt-6">
        <div className="">
          <ChartCard title="Maintenance Requests" chartType={Doughnut} data={chartData.maintenanceRequests} />
        </div>


        <div className="">
          <ChartCard title="Inquiries Status" chartType={Bar} data={chartData.inquiriesStatus} />
        </div>
      </div>
    </>
  );
};

export default Reports;
