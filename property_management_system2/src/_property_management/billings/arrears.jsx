import { useEffect, useState } from 'react';
import { Search, Download, AlertCircle, Send, Phone, Mail, Calendar, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { DashboardHeader } from '../properties/dashboard/page_components';
import axios from 'axios';

const ArrearsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedTenants, setSelectedTenants] = useState([]);

    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')

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

    // Sample arrears data
    const arrears = [
        {
            id: 1,
            tenant: 'John Kamau',
            phone: '0712345678',
            email: 'john.kamau@email.com',
            property: 'ALBA CORNER',
            unit: 'A-101',
            rentAmount: 25000,
            amountOwed: 75000,
            monthsOverdue: 3,
            lastPayment: '2025-07-15',
            daysOverdue: 85,
            severity: 'high'
        },
        {
            id: 2,
            tenant: 'Mary Wanjiku',
            phone: '0723456789',
            email: 'mary.w@email.com',
            property: 'SEASONS MANSION',
            unit: 'B-205',
            rentAmount: 35000,
            amountOwed: 70000,
            monthsOverdue: 2,
            lastPayment: '2025-08-10',
            daysOverdue: 59,
            severity: 'medium'
        },
        {
            id: 3,
            tenant: 'Peter Omondi',
            phone: '0734567890',
            email: 'peter.o@email.com',
            property: 'VICTORY A',
            unit: 'C-302',
            rentAmount: 18000,
            amountOwed: 18000,
            monthsOverdue: 1,
            lastPayment: '2025-09-05',
            daysOverdue: 33,
            severity: 'low'
        },
        {
            id: 4,
            tenant: 'Grace Akinyi',
            phone: '0745678901',
            email: 'grace.a@email.com',
            property: 'JAVA HOUSE MATANGI',
            unit: 'D-104',
            rentAmount: 42000,
            amountOwed: 168000,
            monthsOverdue: 4,
            lastPayment: '2025-06-20',
            daysOverdue: 110,
            severity: 'critical'
        },
        {
            id: 5,
            tenant: 'David Mwangi',
            phone: '0756789012',
            email: 'david.m@email.com',
            property: 'SERENE',
            unit: 'E-201',
            rentAmount: 30000,
            amountOwed: 30000,
            monthsOverdue: 1,
            lastPayment: '2025-09-12',
            daysOverdue: 26,
            severity: 'low'
        },
        {
            id: 6,
            tenant: 'Sarah Njeri',
            phone: '0767890123',
            email: 'sarah.n@email.com',
            property: 'CANAAN',
            unit: 'F-105',
            rentAmount: 22000,
            amountOwed: 44000,
            monthsOverdue: 2,
            lastPayment: '2025-08-18',
            daysOverdue: 51,
            severity: 'medium'
        },
        {
            id: 7,
            tenant: 'James Otieno',
            phone: '0778901234',
            email: 'james.o@email.com',
            property: 'THE BARN',
            unit: 'G-303',
            rentAmount: 38000,
            amountOwed: 114000,
            monthsOverdue: 3,
            lastPayment: '2025-07-22',
            daysOverdue: 78,
            severity: 'high'
        },
        {
            id: 8,
            tenant: 'Anne Mutua',
            phone: '0789012345',
            email: 'anne.m@email.com',
            property: 'KILELESHWA',
            unit: 'H-102',
            rentAmount: 45000,
            amountOwed: 225000,
            monthsOverdue: 5,
            lastPayment: '2025-05-30',
            daysOverdue: 131,
            severity: 'critical'
        }
    ];

    // Calculate statistics
    const stats = {
        totalArrears: arrears.reduce((sum, a) => sum + a.amountOwed, 0),
        totalTenants: arrears.length,
        critical: arrears.filter(a => a.severity === 'critical').length,
        high: arrears.filter(a => a.severity === 'high').length,
        medium: arrears.filter(a => a.severity === 'medium').length,
        low: arrears.filter(a => a.severity === 'low').length
    };

    // Filter arrears
    const filteredArrears = arrears.filter(arrear => {
        const matchesSearch =
            arrear.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arrear.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arrear.unit.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            selectedFilter === 'all' ||
            arrear.severity === selectedFilter;

        return matchesSearch && matchesFilter;
    });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500 text-white';
            case 'high':
                return 'bg-orange-500 text-white';
            case 'medium':
                return 'bg-yellow-500 text-white';
            case 'low':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleSelectTenant = (id) => {
        setSelectedTenants(prev =>
            prev.includes(id)
                ? prev.filter(t => t !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedTenants.length === filteredArrears.length) {
            setSelectedTenants([]);
        } else {
            setSelectedTenants(filteredArrears.map(a => a.id));
        }
    };

    return (
        <>
            <DashboardHeader
                title="Rent Arrears"
                description="Monitor and manage outstanding rent payments"
                hideSelect={true}
                properties={properties}
                onSelectChange={handleSelectChange}
            />

            <div className="py-1 px-4 mt-2">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Total Arrears */}
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded p-2 text-white shadow">
                        <div className="flex justify-between">
                            <p className="text-red-100 text-sm font-medium">Total Arrears</p>
                            <p className="text-red-100 text-xs mt-2">{stats.totalTenants} tenants with arrears</p>
                        </div>
                        <h3 className="text-xl font-mono mt-1">KES {stats.totalArrears.toLocaleString()}</h3>
                    </div>

                    {/* Critical Cases */}
                    <div className="bg-white rounded p-2 shadow-sm border-2 border-red-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <p className="text-gray-600 text-sm font-medium">Critical Cases</p>
                            <p className="text-xs text-gray-500 mt-2">4+ months overdue</p>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.critical}</h3>

                    </div>

                    {/* High Priority */}
                    <div className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <p className="text-gray-600 text-sm font-medium">High Priority</p>
                            <p className="text-xs text-gray-500 mt-2">3 months overdue</p>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.high}</h3>

                    </div>

                    {/* Medium & Low */}
                    <div className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <p className="text-gray-600 text-sm font-medium">Medium & Low</p>
                            <p className="text-xs text-gray-500 mt-2">1-2 months overdue</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.medium + stats.low}</h3>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col gap-4">
                        {/* Search and Actions Row */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by tenant, property, or unit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    disabled={selectedTenants.length === 0}
                                >
                                    <Send className="w-4 h-4" />
                                    <span className="text-sm font-medium">Send Reminder</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm font-medium">Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Filter Buttons Row */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${selectedFilter === 'all'
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({stats.totalTenants})
                            </button>
                            <button
                                onClick={() => setSelectedFilter('critical')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${selectedFilter === 'critical'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                                    }`}
                            >
                                Critical ({stats.critical})
                            </button>
                            <button
                                onClick={() => setSelectedFilter('high')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${selectedFilter === 'high'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                    }`}
                            >
                                High ({stats.high})
                            </button>
                            <button
                                onClick={() => setSelectedFilter('medium')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${selectedFilter === 'medium'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                    }`}
                            >
                                Medium ({stats.medium})
                            </button>
                            <button
                                onClick={() => setSelectedFilter('low')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${selectedFilter === 'low'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    }`}
                            >
                                Low ({stats.low})
                            </button>
                        </div>

                        {/* Selected Count */}
                        {selectedTenants.length > 0 && (
                            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                <span className="text-sm text-blue-900 font-medium">
                                    {selectedTenants.length} tenant{selectedTenants.length > 1 ? 's' : ''} selected
                                </span>
                                <button
                                    onClick={() => setSelectedTenants([])}
                                    className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                                >
                                    Clear selection
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrears Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedTenants.length === filteredArrears.length && filteredArrears.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tenant
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Property & Unit
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Monthly Rent
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount Owed
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Overdue
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Severity
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredArrears.map((arrear) => (
                                    <tr
                                        key={arrear.id}
                                        className={`hover:bg-gray-50 transition-colors ${selectedTenants.includes(arrear.id) ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedTenants.includes(arrear.id)}
                                                onChange={() => handleSelectTenant(arrear.id)}
                                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {arrear.tenant.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{arrear.tenant}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        <p className="text-xs text-gray-500">{arrear.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">{arrear.property}</div>
                                            <div className="text-xs text-gray-500">Unit {arrear.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">KES {arrear.rentAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono font-bold text-red-600">
                                                KES {arrear.amountOwed.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{arrear.monthsOverdue} month{arrear.monthsOverdue > 1 ? 's' : ''}</div>
                                            <div className="text-xs text-gray-500">{arrear.daysOverdue} days</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getSeverityBadge(arrear.severity)}`}>
                                                {arrear.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Send SMS"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Call"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* No results */}
                    {filteredArrears.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No arrears found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredArrears.length > 0 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-medium">{filteredArrears.length}</span> of{' '}
                            <span className="font-medium">{arrears.length}</span> tenants with arrears
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                Previous
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ArrearsDashboard;