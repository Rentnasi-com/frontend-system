import { useState } from 'react';
import {
    CreditCardIcon,
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowDownTrayIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const PaymentsTab = () => {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');

    // Sample payment data
    const payments = [
        {
            id: 1,
            date: '2023-06-01',
            amount: 1200,
            status: 'completed',
            method: 'Credit Card',
            receipt: true
        },
        {
            id: 2,
            date: '2023-05-01',
            amount: 1200,
            status: 'completed',
            method: 'Bank Transfer',
            receipt: true
        },
        {
            id: 3,
            date: '2023-04-01',
            amount: 1200,
            status: 'failed',
            method: 'Credit Card',
            receipt: false
        }
    ];

    const upcomingPayment = {
        dueDate: '2023-07-01',
        amount: 1200,
        daysRemaining: 12
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        // Handle payment submission logic
        console.log(`Paying $${paymentAmount} via ${paymentMethod}`);
        setShowPaymentModal(false);
        setPaymentAmount('');
    };

    return (
        <div className="space-y-6 p-4">
            {/* Payment Summary Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-pink-500 to-red-600 text-white">
                    <h2 className="text-xl font-bold mb-1">Rent Payment</h2>
                    <p className="text-blue-100">Next payment due in {upcomingPayment.daysRemaining} days</p>
                </div>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Due Date</p>
                            <p className="text-lg font-semibold">{new Date(upcomingPayment.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Amount Due</p>
                            <p className="text-2xl font-bold text-blue-600">${upcomingPayment.amount}</p>
                        </div>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Make Payment
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-full bg-blue-100 mr-3">
                                <CreditCardIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-medium">Credit Card</span>
                        </div>
                        <p className="text-sm text-gray-600">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-500 mt-2">Expires 04/2025</p>
                    </div>
                    <div className="border rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="flex items-center mb-3">
                            <div className="p-2 rounded-full bg-green-100 mr-3">
                                <BanknotesIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="font-medium">Bank Account</span>
                        </div>
                        <p className="text-sm text-gray-600">•••• •••• 1234</p>
                        <p className="text-sm text-gray-500 mt-2">Chase Bank</p>
                    </div>
                    <div className="border-2 border-dashed rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-center text-blue-600">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        <span>Add New Method</span>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="rounded-lg border border-gray-200 bg-white mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">Payment Overview</h4>
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Rent</th>
                                    <th className="px-4 py-2">Fines</th>
                                    <th className="px-4 py-2">Balance</th>
                                    <th className="px-4 py-2">Total</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Make a Payment</h3>
                            <form onSubmit={handlePaymentSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="pl-8 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="bank">Bank Account</option>
                                        <option value="wallet">Digital Wallet</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
                                    >
                                        Confirm Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsTab