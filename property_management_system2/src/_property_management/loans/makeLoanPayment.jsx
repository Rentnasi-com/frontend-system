// src/components/loans/LoanPayment.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LoanPayment = () => {
    const { loanId } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState(null);
    const [step, setStep] = useState('amount'); // amount -> review -> confirmation
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        schedulePayment: false
    });
    const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);

    useEffect(() => {
        // Mock data
        const mockLoan = {
            id: 'LN-2023-001',
            property: 'Kilimani Apartments',
            outstanding: 1875000,
            nextDueDate: '2024-01-15',
            monthlyPayment: 57500,
            currency: 'KES'
        };
        setLoan(mockLoan);

        const mockPaymentMethods = [
            { id: '1', type: 'bank', name: 'KCB Bank', last4: '1234', isDefault: true },
            { id: '2', type: 'bank', name: 'Equity Bank', last4: '5678', isDefault: false },
            { id: '3', type: 'mobile', name: 'M-Pesa', phone: '0712 *** 456', isDefault: false }
        ];
        setSavedPaymentMethods(mockPaymentMethods);
    }, [loanId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleAmountSelect = (amountType) => {
        let amount = 0;
        switch (amountType) {
            case 'minimum':
                amount = loan.monthlyPayment;
                break;
            case 'custom':
                // Will be handled by input
                return;
            case 'full':
                amount = loan.outstanding;
                break;
        }
        setPaymentData({ ...paymentData, amount: amount.toString() });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 'amount') {
            setStep('review');
        } else if (step === 'review') {
            // Simulate API call
            setTimeout(() => {
                setStep('confirmation');
            }, 2000);
        }
    };

    const isOverdue = (dueDate) => {
        return new Date(dueDate) < new Date();
    };

    if (!loan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/landlords/view-loans" className="inline-flex items-center text-blue-600 hover:text-blue-900 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Loan Details
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Process Payment</h1>
                    <p className="text-gray-600 mt-2">
                        You are making a payment for <strong>Loan {loan.id}</strong> ({loan.property})
                    </p>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">
                            Current Outstanding Balance: <span className="text-lg">{formatCurrency(loan.outstanding)}</span>
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex items-center justify-between mb-8">
                        {['amount', 'review', 'confirmation'].map((stepName, index) => (
                            <div key={stepName} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === stepName
                                        ? 'bg-blue-600 text-white'
                                        : step === 'confirmation' && index < 2
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {step === 'confirmation' && index < 2 ? (
                                        <CheckCircleIcon className="w-5 h-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span
                                    className={`ml-2 text-sm font-medium ${step === stepName ? 'text-blue-600' : 'text-gray-500'
                                        }`}
                                >
                                    {stepName === 'amount' && 'Amount'}
                                    {stepName === 'review' && 'Review'}
                                    {stepName === 'confirmation' && 'Confirmation'}
                                </span>
                                {index < 2 && (
                                    <div
                                        className={`w-12 h-0.5 mx-4 ${step === 'confirmation' ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Payment Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Amount Selection */}
                        {step === 'amount' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Amount</h3>

                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => handleAmountSelect('minimum')}
                                            className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${paymentData.amount === loan.monthlyPayment.toString()
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900">Pay Minimum Amount</p>
                                                    <p className="text-sm text-gray-600">Next installment due</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{formatCurrency(loan.monthlyPayment)}</p>
                                                    <p className={`text-sm ${isOverdue(loan.nextDueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                                                        Due {new Date(loan.nextDueDate).toLocaleDateString('en-KE')}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAmountSelect('full')}
                                            className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${paymentData.amount === loan.outstanding.toString()
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900">Pay Full Balance</p>
                                                    <p className="text-sm text-gray-600">Settle entire loan</p>
                                                </div>
                                                <p className="font-bold text-gray-900">{formatCurrency(loan.outstanding)}</p>
                                            </div>
                                        </button>

                                        <div className={`p-4 border-2 rounded-lg ${paymentData.amount && paymentData.amount !== loan.monthlyPayment.toString() && paymentData.amount !== loan.outstanding.toString()
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                            }`}>
                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="radio"
                                                    checked={paymentData.amount && paymentData.amount !== loan.monthlyPayment.toString() && paymentData.amount !== loan.outstanding.toString()}
                                                    onChange={() => setPaymentData({ ...paymentData, amount: '' })}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <label className="ml-2 font-medium text-gray-900">Pay Custom Amount</label>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-gray-700 font-medium">KES</span>
                                                <input
                                                    type="number"
                                                    value={paymentData.amount}
                                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                                    placeholder="Enter amount"
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    min={loan.monthlyPayment}
                                                    max={loan.outstanding}
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Minimum payment: {formatCurrency(loan.monthlyPayment)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Date */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Date</h3>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="date"
                                            value={paymentData.paymentDate}
                                            onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={paymentData.schedulePayment}
                                                onChange={(e) => setPaymentData({ ...paymentData, schedulePayment: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Schedule for due date</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                                    <div className="space-y-3">
                                        {savedPaymentMethods.map((method) => (
                                            <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={paymentData.paymentMethod === method.id}
                                                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <p className="font-medium text-gray-900">{method.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {method.type === 'bank' ? `Account ending in ${method.last4}` : method.phone}
                                                    </p>
                                                </div>
                                                {method.isDefault && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        Default
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                        <button
                                            type="button"
                                            className="w-full text-center p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors"
                                        >
                                            + Add New Payment Method
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!paymentData.amount || !paymentData.paymentMethod}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Continue to Review
                                </button>
                            </div>
                        )}

                        {/* Step 2: Review */}
                        {step === 'review' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Payment</h3>

                                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Amount:</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(parseFloat(paymentData.amount))}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Date:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(paymentData.paymentDate).toLocaleDateString('en-KE')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Funding Account:</span>
                                        <span className="font-medium text-gray-900">
                                            {savedPaymentMethods.find(m => m.id === paymentData.paymentMethod)?.name}
                                            (•••• {savedPaymentMethods.find(m => m.id === paymentData.paymentMethod)?.last4})
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estimated Completion:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(paymentData.paymentDate).toLocaleDateString('en-KE')}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            required
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                        />
                                        <span className="ml-3 text-sm text-yellow-800">
                                            I authorize PropertyPro Kenya to debit the specified amount from my selected account on the chosen date,
                                            in accordance with the terms of my loan agreement and the Central Bank of Kenya regulations.
                                        </span>
                                    </label>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('amount')}
                                        className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Submit Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 'confirmation' && (
                            <div className="text-center py-8">
                                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Scheduled Successfully!</h3>
                                <p className="text-gray-600 mb-6">
                                    Your payment has been scheduled and will be processed on the selected date.
                                </p>

                                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-6">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Confirmation ID:</span>
                                            <span className="font-mono font-medium">PYMT-{loanId}-001</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-medium">{formatCurrency(parseFloat(paymentData.amount))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Scheduled Date:</span>
                                            <span className="font-medium">
                                                {new Date(paymentData.paymentDate).toLocaleDateString('en-KE')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    A confirmation email has been sent to your registered address.
                                    Your account will be updated on the completion date.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        to={`/loans/${loanId}`}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        View Loan Details
                                    </Link>
                                    <Link
                                        to="/loans"
                                        className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Back to Loan Portfolio
                                    </Link>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoanPayment;