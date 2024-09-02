import { SlCalender } from "react-icons/sl";
import { DoughnutChart, PropertyCard, TransactionItem } from "./pages/page_components";

const PropertyDashboard = () => {

  return (
    <>
      <section className="">
        <div className="p-4 flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Overview</h1>
            <p className="text-sm text-gray-500">Real-time information and activities of your property.</p>
          </div>
          <div className="">
            <div className="flex space-x-4">

              <div className="bg-white p-2 rounded-xl shadow">
                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                  <SlCalender /> <span>March 27 2024 - January 25 2025</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-4 gap-4 py-1 px-4">
          <PropertyCard
            title="Properties"
            total="10"
            iconUrl="data:image/png;base64,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"
            percentChange="20%"
            redirectUrl="/property/property-listing"
          />
          <PropertyCard
            title="Tenants"
            total="20"
            iconUrl="data:image/png;base64,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"
            percentChange="30%"
            redirectUrl=""
          />
          <PropertyCard
            title="Enquiry messages"
            total="200"
            iconUrl="data:image/png;base64,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"
            percentChange="30%"
            redirectUrl=""
          />
          <PropertyCard
            title="Maintenance request"
            total="42"
            iconUrl="data:image/png;base64,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"
            percentChange="30%"
            redirectUrl=""
          />
        </div>

      </section>
      <section className="grid grid-cols-6 gap-4 my-2 mx-4">
        <div className="col-span-3 shadow rounded-xl bg-white p-2 space-y-3">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Your Properties</h2>
            <h2 className="text-sm font-semibold text-blue-600 hover:underline">View All</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Property Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Floors
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Occupied Units
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Vacant Units
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Total Units
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4">
                    Plaza Machete
                  </th>
                  <td className="px-6 py-4">
                    React Developer
                  </td>
                  <td className="px-6 py-4">
                    10
                  </td>
                  <td className="px-6 py-4">
                    10
                  </td>
                  <td className="px-6 py-4">
                    3
                  </td>
                  <td className="px-6 py-4">
                    13
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-span-3 shadow rounded-xl bg-white p-2 space-y-3">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Your Tenants</h2>
            <h2 className="text-sm font-semibold text-blue-600 hover:underline">View All</h2>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Floor No
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Unit
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Monthly Rent
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Notification
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                    <div className="">
                      <div className="text-base font-semibold">Neil Sims</div>
                      <div className="font-normal text-gray-500">+25470662432</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    Plaza Machete
                  </td>
                  <td className="px-6 py-4">
                    4th
                  </td>
                  <td className="px-6 py-4">
                    10
                  </td>
                  <td className="px-6 py-4">
                    <div className="rounded-xl font-semibold text-center text-red-900 bg-red-200 px-2 py-1">
                      Pending
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-green-500 bg-green-100 font-semibold">
                      2
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-span-6">
          <DoughnutChart />
        </div>

        <div className="col-span-4 bg-white p-2 shadow rounded-xl space-y-3">
          <h2 className="text-sm font-semibold">Transactions</h2>
          <TransactionItem
            description="Rent Deposit (James Kanyiri W) - King Serenity - Unit: MK240"
            date="Jul 21 2024 - 15:13 PM"
            status="Completed"
            transactionId="ADEFHNJT43GGF"
          />
        </div>
      </section>
    </>
  );
};

export default PropertyDashboard;
