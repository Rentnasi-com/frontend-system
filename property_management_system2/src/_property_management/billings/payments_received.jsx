import { useEffect, useState } from 'react';
import { Search, Download, Filter, CreditCard, Building2, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { DashboardHeader } from '../properties/dashboard/page_components';
import axios from 'axios';

const PaymentsReceived = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedProperty, setSelectedProperty] = useState('')

    useEffect(() => {
        fetchProperties();
    }, [token, baseUrl])

    const handleSelectChange = (event) => {
        setSelectedProperty(event.target.value);
    };


    const fetchProperties = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-landlord/required-data/available-properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setProperties(response.data.result)
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    // Sample payment data
    const payments = [
        {
            id: 'PAY001',
            tenant: 'John Kamau',
            property: 'ALBA CORNER',
            unit: 'A-101',
            amount: 25000,
            method: 'mpesa',
            reference: 'RFK8H7G2M1',
            date: '2025-10-08',
            time: '10:30 AM',
            status: 'completed'
        },
        {
            id: 'PAY002',
            tenant: 'Mary Wanjiku',
            property: 'SEASONS MANSION',
            unit: 'B-205',
            amount: 35000,
            method: 'bank',
            reference: 'BNK20251008001',
            date: '2025-10-08',
            time: '09:15 AM',
            status: 'completed'
        },
        {
            id: 'PAY003',
            tenant: 'Peter Omondi',
            property: 'VICTORY A',
            unit: 'C-302',
            amount: 18000,
            method: 'cash',
            reference: 'CASH001',
            date: '2025-10-07',
            time: '02:45 PM',
            status: 'completed'
        },
        {
            id: 'PAY004',
            tenant: 'Grace Akinyi',
            property: 'JAVA HOUSE MATANGI',
            unit: 'D-104',
            amount: 42000,
            method: 'mpesa',
            reference: 'RFK9J8K3N2',
            date: '2025-10-07',
            time: '11:20 AM',
            status: 'completed'
        },
        {
            id: 'PAY005',
            tenant: 'David Mwangi',
            property: 'SERENE',
            unit: 'E-201',
            amount: 30000,
            method: 'bank',
            reference: 'BNK20251007002',
            date: '2025-10-06',
            time: '03:30 PM',
            status: 'completed'
        },
        {
            id: 'PAY006',
            tenant: 'Sarah Njeri',
            property: 'CANAAN',
            unit: 'F-105',
            amount: 22000,
            method: 'cash',
            reference: 'CASH002',
            date: '2025-10-06',
            time: '01:15 PM',
            status: 'completed'
        },
        {
            id: 'PAY007',
            tenant: 'James Otieno',
            property: 'THE BARN',
            unit: 'G-303',
            amount: 38000,
            method: 'mpesa',
            reference: 'RFK7L6M4P3',
            date: '2025-10-05',
            time: '04:50 PM',
            status: 'completed'
        },
        {
            id: 'PAY008',
            tenant: 'Anne Mutua',
            property: 'KILELESHWA',
            unit: 'H-102',
            amount: 45000,
            method: 'bank',
            reference: 'BNK20251005003',
            date: '2025-10-05',
            time: '10:00 AM',
            status: 'completed'
        }
    ];

    // Calculate totals
    const totals = {
        mpesa: payments.filter(p => p.method === 'mpesa').reduce((sum, p) => sum + p.amount, 0),
        bank: payments.filter(p => p.method === 'bank').reduce((sum, p) => sum + p.amount, 0),
        cash: payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0)
    };
    totals.all = totals.mpesa + totals.bank + totals.cash;

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesMethod = selectedPaymentMethod === 'all' || payment.method === selectedPaymentMethod;
        const matchesSearch =
            payment.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMethod && matchesSearch;
    });

    const getMethodIcon = (method) => {
        switch (method) {
            case 'mpesa':
                return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-600" />
                </div>;
            case 'bank':
                return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                </div>;
            case 'cash':
                return <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                </div>;
            default:
                return null;
        }
    };

    const getMethodBadgeColor = (method) => {
        switch (method) {
            case 'mpesa':
                return 'bg-green-100 text-green-800';
            case 'bank':
                return 'bg-blue-100 text-blue-800';
            case 'cash':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <DashboardHeader
                title="Payments Received"
                description="Track and manage all property payments"
                hideSelect={true}
                properties={properties}
                onSelectChange={handleSelectChange}
            />

            <div className="py-1 px-4 mt-2">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Total Payments */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded p-2 text-white shadow">
                        <div className="flex justify-between">
                            <p className="text-purple-100 text-sm font-medium">Total Received</p>
                            <p className="text-purple-100 text-xs mt-2">{payments.length} transactions</p>
                        </div>
                        <h3 className="font-mono mt-1">KES {totals.all.toLocaleString()}</h3>
                    </div>

                    {/* M-Pesa */}
                    <div className="bg-white rounded p-2 shadow-sm border der-gray-200 hover:shadow-md transition-shadow">
                        <p className="text-gray-600 text-sm font-medium">M-Pesa Payments</p>
                        <h3 className="font-mono text-gray-900 mt-1">KES {totals.mpesa.toLocaleString()}</h3>
                    </div>

                    {/* Bank Transfer */}
                    <div className="bg-white rounded p-2 shadow-sm border der-gray-200 hover:shadow-md transition-shadow">
                        <p className="text-gray-600 text-sm font-medium">Bank Transfers</p>
                        <h3 className="font-mono text-gray-900 mt-1">KES {totals.bank.toLocaleString()}</h3>
                    </div>

                    {/* Cash */}
                    <div className="bg-white rounded p-2 shadow-sm border der-gray-200 hover:shadow-md transition-shadow">
                        <p className="text-gray-600 text-sm font-medium">Cash Payments</p>
                        <h3 className="font-mono text-gray-900 mt-1">KES {totals.cash.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 relative w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by tenant, property, or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Date Range Filter */}
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Payment Method Filter */}
                        <div className="flex gap-2">
                            {['all', 'mpesa', 'bank', 'cash'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setSelectedPaymentMethod(method)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedPaymentMethod === method
                                        ? method === 'mpesa'
                                            ? 'bg-green-600 text-white'
                                            : method === 'bank'
                                                ? 'bg-blue-600 text-white'
                                                : method === 'cash'
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {method === 'all'
                                        ? 'All'
                                        : method.charAt(0).toUpperCase() + method.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Export Button */}
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-medium">Export</span>
                        </button>
                    </div>
                </div>


                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tenant
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Property & Unit
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Reference
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">{payment.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {payment.tenant.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{payment.tenant}</p>
                                                    <p className="text-xs font-medium text-gray-900">071234567</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-900 font-medium">{payment.property}</div>
                                            <div className="text-xs text-gray-500">Unit {payment.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(payment.method)}
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodBadgeColor(payment.method)}`}>
                                                    {payment.method.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-gray-600 font-mono">{payment.reference}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-900">{payment.date}</div>
                                            <div className="text-xs text-gray-500">{payment.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-xs font-mono text-gray-900">
                                                KES {payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* No results */}
                    {filteredPayments.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredPayments.length > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-medium">{filteredPayments.length}</span> of{' '}
                            <span className="font-medium">{payments.length}</span> payments
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                Previous
                            </button>
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentsReceived;