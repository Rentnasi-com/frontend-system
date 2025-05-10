import {
  BellIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const TenantDashboard = () => {

  return (
    <div className="bg-gray-50">
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-xl shadow-lg text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
          <p className="opacity-90">You're all caught up. Next rent payment due in 12 days.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rent Balance</p>
                <p className="text-xl font-semibold">$1,200</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lease Ends</p>
                <p className="text-xl font-semibold">May 15, 2024</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Maintenance</p>
                <p className="text-xl font-semibold">2 Open</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <div key={item} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <BellIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Rent payment received</p>
                    <p className="text-sm text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;