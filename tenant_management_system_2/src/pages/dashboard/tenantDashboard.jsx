import { DashboardHeader, StatCard } from '../pages_components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const TenantDashboard = () => {
  const stats = [
    {
      redirectUrl: "/tenants",
      iconSrc: "/assets/icons/png/total_property.png",
      progress: 20,
      label: "Total Units",
      value: 20,
    },
    {
      redirectUrl: "/property/all-property-units",
      iconSrc: "/assets/icons/png/total_units.png",
      progress: 20,
      label: "Total Tenants",
      value: 2000,
    },
    {
      redirectUrl: "/dashboard/inquiries",
      iconSrc: "/assets/icons/png/inquiries.png",
      progress: 20,
      label: "Vacant Units",
      value: 20,
    },
  ];

  const data = {
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    datasets: [
      {
        label: 'Tenant Occupancy Rate',
        data: [0, 0, 0, 0, 0, 2, 5, 7, 7, 7, 10],
        borderColor: '#3b82f6',
        borderWidth: 2,
        fill: false,
        
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tenants',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
    },
  };


  return (
    <>
      <section>
        <DashboardHeader
          title="Tenant Management Center - All properties"
          description="Manage Your Properties, Tenants, and Payments Effortlessly – Your Central Hub for All Property Management Needs."
          link="/tenants/add-personal-details"
          name = "Add tenant"
          hideSelect={true}
          hideLink={true}
        />
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-1 px-4">
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
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-2">Tenant Occupancy Rate</h2>
          <Line data={data} options={options} />
        </div>
      </section>
    </>
  );
};

export default TenantDashboard;
