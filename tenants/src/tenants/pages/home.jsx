import {
  BellIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CreditCardIcon,
  LightBulbIcon,
  // DropletIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';
import { WaterDropIcon } from '../../icons';

const TenantDashboard = () => {
  // Financial data
  const financials = {
    rent: 12000,
    previousBalances: {
      water: 85,
      electricity: 120,
      fines: 50,
      garbage: 25,
      rent: 25000
    },
    currentBills: {
      water: 75,
      electricity: 110,
      garbage: 25
    }
  };

  // Calculate totals
  const totalPreviousBalances = Object.values(financials.previousBalances).reduce((a, b) => a + b, 0);
  const totalCurrentBills = Object.values(financials.currentBills).reduce((a, b) => a + b, 0);
  const totalPayables = financials.rent + totalPreviousBalances + totalCurrentBills;

  // Activity data
  const recentActivity = [
    {
      id: 1,
      type: 'payment',
      title: 'Rent payment received',
      date: '3 days ago',
      amount: 1200,
      icon: <CreditCardIcon className="h-5 w-5 text-green-500" />
    },
    {
      id: 2,
      type: 'bill',
      title: 'Water bill issued',
      date: '5 days ago',
      amount: 75,
      // icon: <DropletIcon className="h-5 w-5 text-blue-500" />
    },
    {
      id: 3,
      type: 'notification',
      title: 'Maintenance scheduled',
      date: '1 week ago',
      icon: <WrenchIcon className="h-5 w-5 text-amber-500" />
    }
  ];

  // Messages data
  const messages = [
    {
      id: 1,
      sender: 'Property Manager',
      subject: 'Upcoming building inspection',
      preview: 'Please ensure your unit is accessible on...',
      date: '2 days ago',
      read: false
    },
    {
      id: 2,
      sender: 'Landlord',
      subject: 'Rent receipt confirmation',
      preview: 'Your payment for June has been processed...',
      date: '1 week ago',
      read: true
    }
  ];

  return (
    <div className="bg-gray-50">
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-red-600 to-pink-700 rounded-xl shadow-lg text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>

          <h2 className="text-md font-semibold">Property Name: Vista Apartment</h2>
          <h2 className="text-md font-semibold">Unit No: 3A</h2>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rent Balance */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Payable Rent</p>
                <p className="text-xl font-semibold">KES {financials.rent}</p>
              </div>
            </div>
          </div>

          {/* Lease End */}
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

          {/* Outstanding Balances */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Previous Balances</p>
                <p className="text-xl font-semibold">KES {totalPreviousBalances}</p>
              </div>
            </div>
          </div>

          {/* Current Bills */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Bills</p>
                <p className="text-xl font-semibold">KES {totalCurrentBills}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bills Breakdown */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Bill Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Previous Balances */}
            <div>
              <h4 className="font-medium text-gray-900  flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
                Previous Balances
              </h4>
              <div className="mb-3 border border-gray-200 w-44" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rent</span>
                  <span className="font-medium">KES {financials.previousBalances.rent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Water</span>
                  <span className="font-medium">KES {financials.previousBalances.water}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Electricity</span>
                  <span className="font-medium">KES {financials.previousBalances.electricity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fines</span>
                  <span className="font-medium">KES {financials.previousBalances.fines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Garbage</span>
                  <span className="font-medium">KES {financials.previousBalances.garbage}</span>
                </div>
              </div>
            </div>

            {/* Current Bills */}
            <div>
              <h4 className="font-medium text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                Current Bills
              </h4>
              <div className="mb-3 border border-gray-200 w-32" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-400 mr-2" >
                      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                    </svg>
                    <span className="text-gray-600">Rent</span>
                  </div>
                  <span className="font-medium">KES {financials.currentBills.water}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <WaterDropIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="text-gray-600">Water</span>
                  </div>
                  <span className="font-medium">KES {financials.currentBills.water}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Electricity</span>
                  </div>
                  <span className="font-medium">KES {financials.currentBills.electricity}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <TrashIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">Garbage</span>
                  </div>
                  <span className="font-medium">KES {financials.currentBills.garbage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Activity & Messages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.date} {activity.amount && `• KES {activity.amount}`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Messages</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {messages.filter(m => !m.read).length} Unread
              </span>
            </div>
            <div className="divide-y divide-gray-200">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer KES {!message.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">{message.sender}</h4>
                    <p className="text-xs text-gray-500">{message.date}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{message.subject}</p>
                  <p className="text-sm text-gray-500 truncate">{message.preview}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;

