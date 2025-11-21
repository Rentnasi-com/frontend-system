// src/components/loans/LoanDetails.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    BanknotesIcon,
    DocumentTextIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const LoanDetails = () => {
    const { loanId } = useParams();
    const [loan, setLoan] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [amortizationSchedule, setAmortizationSchedule] = useState([]);

    useEffect(() => {
        // Mock data fetch
        const mockLoan = {
            id: 'LN-2023-001',
            property: 'Kilimani Apartments',
            propertyId: 'PROP-001',
            purpose: 'Renovation',
            principal: 2500000,
            outstanding: 1875000,
            interestRate: 14.5,
            monthlyPayment: 57500,
            nextDueDate: '2024-01-15',
            status: 'active',
            lender: 'KCB Bank',
            lenderContact: 'customercare@kcb.co.ke',
            originationDate: '2023-01-15',
            maturityDate: '2028-01-15',
            currency: 'KES',
            term: 60, // months
            collateral: 'Title Deed No. 12345 for Kilimani Apartments'
        };
        setLoan(mockLoan);

        // Mock payment history
        const mockPayments = [
            { id: 1, date: '2023-12-15', amount: 57500, principal: 35417, interest: 22083, remaining: 1875000, status: 'completed' },
            { id: 2, date: '2023-11-15', amount: 57500, principal: 34982, interest: 22518, remaining: 1910417, status: 'completed' },
            { id: 3, date: '2024-01-15', amount: 57500, principal: 35855, interest: 21645, remaining: 1839145, status: 'upcoming' },
        ];
        setPaymentHistory(mockPayments);

        // Mock amortization schedule (first 12 months)
        const mockAmortization = Array.from({ length: 12 }, (_, i) => {
            const date = new Date('2023-01-15');
            date.setMonth(date.getMonth() + i);
            return {
                paymentNumber: i + 1,
                date: date.toISOString().split('T')[0],
                paymentAmount: 57500,
                principal: Math.round(57500 * (i / 100 + 0.7)),
                interest: Math.round(57500 * (1 - (i / 100 + 0.7))),
                remaining: 2500000 - (i * 57500)
            };
        });
        setAmortizationSchedule(mockAmortization);
    }, [loanId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!loan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading loan details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb and Header */}
                <div className="mb-6">
                    <Link to="/loans/view-loans" className="inline-flex items-center text-blue-600 hover:text-blue-900 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Loan Portfolio
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Loan Details: {loan.id}</h1>
                            <p className="text-gray-600 mt-2">Secured against {loan.property}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-3">
                            <Link
                                to={`/loans/${loan.id}/payment`}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Make a Payment
                            </Link>
                            <button className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                Print Summary
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loan Summary Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loan Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Purpose:</span>
                                    <span className="font-medium">{loan.purpose}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Amounts</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Principal:</span>
                                    <span className="font-medium">{formatCurrency(loan.principal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Outstanding:</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(loan.outstanding)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Interest Rate:</span>
                                    <span className="font-medium">{loan.interestRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Monthly Payment:</span>
                                    <span className="font-medium">{formatCurrency(loan.monthlyPayment)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Payment</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Due Date:</span>
                                    <span className="font-medium">{formatDate(loan.nextDueDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount Due:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(loan.monthlyPayment)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed Interface */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {[
                                { id: 'overview', name: 'Overview & Terms', icon: BuildingOfficeIcon },
                                { id: 'payments', name: 'Payment History', icon: BanknotesIcon },
                                { id: 'schedule', name: 'Amortization', icon: ChartBarIcon },
                                { id: 'documents', name: 'Documents', icon: DocumentTextIcon }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <tab.icon className="h-5 w-5 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lender Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-gray-600">Lender:</span>
                                            <p className="font-medium">{loan.lender}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Contact:</span>
                                            <p className="font-medium">{loan.lenderContact}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Loan Terms</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Origination Date:</span>
                                            <span className="font-medium">{formatDate(loan.originationDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Maturity Date:</span>
                                            <span className="font-medium">{formatDate(loan.maturityDate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Frequency:</span>
                                            <span className="font-medium">Monthly</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Monthly Payment:</span>
                                            <span className="font-medium">{formatCurrency(loan.monthlyPayment)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Term:</span>
                                            <span className="font-medium">{loan.term} months</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Collateral Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700">{loan.collateral}</p>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Property Details</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-gray-600">Property Name:</span>
                                            <p className="font-medium">{loan.property}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Property ID:</span>
                                            <p className="font-medium">{loan.propertyId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment History Tab */}
                        {activeTab === 'payments' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                        Export to CSV
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paymentHistory.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(payment.date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.principal)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.interest)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.remaining)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {payment.status === 'completed' ? 'Completed' : 'Upcoming'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Amortization Schedule Tab */}
                        {activeTab === 'schedule' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Amortization Schedule</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {amortizationSchedule.map((payment) => (
                                                <tr key={payment.paymentNumber}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {payment.paymentNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(payment.date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(payment.paymentAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.principal)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.interest)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(payment.remaining)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan Documents</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center">
                                            <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-4" />
                                            <div>
                                                <p className="font-medium text-gray-900">Signed Loan Agreement.pdf</p>
                                                <p className="text-sm text-gray-500">Uploaded on {formatDate('2023-01-10')}</p>
                                            </div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                                            Download
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center">
                                            <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-4" />
                                            <div>
                                                <p className="font-medium text-gray-900">Property Valuation Report.pdf</p>
                                                <p className="text-sm text-gray-500">Uploaded on {formatDate('2023-01-08')}</p>
                                            </div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                                            Download
                                        </button>
                                    </div>

                                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <div className="flex flex-col items-center">
                                            <DocumentTextIcon className="h-8 w-8 text-gray-400 mb-2" />
                                            <p className="text-gray-600">Upload New Document</p>
                                            <p className="text-sm text-gray-500">PDF, DOC, JPG up to 10MB</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanDetails;