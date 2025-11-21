// src/components/loans/LoansDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowTrendingUpIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentChartBarIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { DashboardHeader } from '../properties/dashboard/page_components';

const LoansDashboard = () => {
    const [loans, setLoans] = useState([]);
    const [filteredLoans, setFilteredLoans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        purpose: 'all',
        property: 'all'
    });

    // Mock data for Kenya context
    useEffect(() => {
        const mockLoans = [
            {
                id: 'LN-2023-001',
                property: 'Kilimani Apartments',
                propertyId: 'PROP-001',
                purpose: 'Renovation',
                principal: 2500000,
                outstanding: 1875000,
                interestRate: 14.5,
                nextDueDate: '2024-01-15',
                status: 'active',
                lender: 'KCB Bank',
                currency: 'KES'
            },
            {
                id: 'LN-2022-015',
                property: 'Westlands Office Complex',
                propertyId: 'PROP-002',
                purpose: 'Capital Investment',
                principal: 5000000,
                outstanding: 1250000,
                interestRate: 12.8,
                nextDueDate: '2024-01-20',
                status: 'active',
                lender: 'Equity Bank',
                currency: 'KES'
            },
            {
                id: 'LN-2021-008',
                property: 'Karen Villa Estate',
                propertyId: 'PROP-003',
                purpose: 'Swimming Pool',
                principal: 1500000,
                outstanding: 0,
                interestRate: 13.2,
                nextDueDate: '2023-06-15',
                status: 'paid',
                lender: 'Cooperative Bank',
                currency: 'KES'
            },
            {
                id: 'LN-2023-042',
                property: 'Thika Residential',
                propertyId: 'PROP-004',
                purpose: 'Emergency Repair',
                principal: 750000,
                outstanding: 625000,
                interestRate: 15.0,
                nextDueDate: '2023-12-05',
                status: 'overdue',
                lender: 'NCBA Bank',
                currency: 'KES'
            }
        ];
        setLoans(mockLoans);
        setFilteredLoans(mockLoans);
    }, []);

    // Calculate KPIs
    const kpis = {
        totalOutstanding: loans.reduce((sum, loan) => sum + (loan.status === 'active' || loan.status === 'overdue' ? loan.outstanding : 0), 0),
        activeLoans: loans.filter(loan => loan.status === 'active' || loan.status === 'overdue').length,
        totalLoans: loans.length,
        nextPayment: loans
            .filter(loan => loan.status === 'active' || loan.status === 'overdue')
            .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))[0]
    };

    // Filter and search functionality
    useEffect(() => {
        let result = loans;

        if (searchTerm) {
            result = result.filter(loan =>
                loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loan.property.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.status !== 'all') {
            result = result.filter(loan => loan.status === filters.status);
        }

        if (filters.purpose !== 'all') {
            result = result.filter(loan => loan.purpose === filters.purpose);
        }

        setFilteredLoans(result);
    }, [searchTerm, filters, loans]);

    const formatCurrency = (amount, currency = 'KES') => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', text: 'Active' },
            paid: { color: 'bg-gray-100 text-gray-800', text: 'Paid Off' },
            overdue: { color: 'bg-red-100 text-red-800', text: 'Overdue' },
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
        };

        const config = statusConfig[status] || statusConfig.active;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    return (
        <>
            {/* Header */}
            <DashboardHeader
                title="All your tenants"
                description="Manage all your tenant here"
                link="/landlords/loans-payments"
                name="Loan Payments"
                hideSelect={false}
                hideLink={false}
            />

            <div className="py-1 px-4 mt-2">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 my-4">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Outstanding Balance</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {formatCurrency(kpis.totalOutstanding)}
                                </p>
                            </div>
                            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {kpis.activeLoans} <span className="text-sm font-normal text-gray-500">/ {kpis.totalLoans} total</span>
                                </p>
                            </div>
                            <DocumentChartBarIcon className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {kpis.nextPayment ? formatCurrency(kpis.nextPayment.outstanding / 100) : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {kpis.nextPayment ? `Due ${new Date(kpis.nextPayment.nextDueDate).toLocaleDateString('en-KE')}` : 'No pending payments'}
                                </p>
                            </div>
                            <ClockIcon className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Interest Rate</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {loans.length > 0 ? (loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length).toFixed(1) : '0'}%
                                </p>
                            </div>
                            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                            {/* Search */}
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by Loan ID or Property..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2">
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="pending">Pending</option>
                                </select>

                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.purpose}
                                    onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
                                >
                                    <option value="all">All Purposes</option>
                                    <option value="Renovation">Renovation</option>
                                    <option value="Capital Investment">Capital Investment</option>
                                    <option value="Emergency Repair">Emergency Repair</option>
                                    <option value="Swimming Pool">Swimming Pool</option>
                                </select>
                            </div>
                        </div>

                        <Link
                            to="/loans/make-loan-application"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + New Loan Application
                        </Link>
                    </div>
                </div>

                {/* Loans Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link to={`/loans/${loan.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                                                {loan.id}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">{loan.property}</div>
                                                <div className="text-sm text-gray-500">{loan.lender}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {loan.purpose}
                                            </span>
                                        </td>
                                        <td className="px-6 font-mono py-4 whitespace-nowrap text-gray-900">
                                            {formatCurrency(loan.principal)}
                                        </td>
                                        <td className="px-6 font-mono py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">
                                                {formatCurrency(loan.outstanding)}
                                            </div>
                                        </td>
                                        <td className="font-mono px-6 py-4 whitespace-nowrap text-gray-900">
                                            {loan.interestRate}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`${isOverdue(loan.nextDueDate) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                {new Date(loan.nextDueDate).toLocaleDateString('en-KE')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(loan.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                to="/loans/view-loan-details"
                                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLoans.length === 0 && (
                        <div className="text-center py-12">
                            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No loans found</h3>
                            <p className="mt-2 text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LoansDashboard;