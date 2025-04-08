import { DashboardHeader, StatCard } from "./pages/page_components";
import { Bar, } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, } from 'chart.js';


const PropertyDashboard = () => {
  const stats = [
    {
      redirectUrl: "/property/property-listing",
      iconSrc: "../../../assets/icons/png/total_property.png",
      progress: 20,
      label: "Total Property",
      value: 20,
    },
    {
      redirectUrl: "/property/all-property-units",
      iconSrc: "../../../assets/icons/png/total_units.png",
      progress: 20,
      label: "Total Units",
      value: 2000,
    },
    {
      redirectUrl: "/dashboard/inquiries",
      iconSrc: "../../../assets/icons/png/inquiries.png",
      progress: 20,
      label: "Inquiries",
      value: 20,
    },
  ];

  const chartData = {
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
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
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

  return (
    <>
      <section>

        <DashboardHeader
          title="Overview"
          description="Welcome to your Property Dashboard: Access real-time information and stay updated on all activities related to your property."
          name="New property"
          link="/add-property/general-information"
          hideSelect={false}
          hideLink={true}
        />
        <div className="w-full grid grid-cols-4 gap-4 py-1 px-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              redirectUrl={stat.redirectUrl}
              iconSrc={stat.iconSrc}
              progress={stat.progress}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>
      </section>
      <section className="my-2 mx-4">
        <div className="">
          <div>
            <ChartCard title="Occupancy Rate" chartType={Bar} data={chartData.occupancyRate} />
          </div>
        </div>
      </section>
    </>
  );
};

export default PropertyDashboard;
