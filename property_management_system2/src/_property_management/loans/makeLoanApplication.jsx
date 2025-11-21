// src/components/loans/NewLoanApplication.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    BuildingOfficeIcon,
    DocumentTextIcon,
    CalculatorIcon,
    BanknotesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const NewLoanApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [properties, setProperties] = useState([]);
    const [lenders, setLenders] = useState([]);
    const [formData, setFormData] = useState({
        // Step 1: Basic Information
        propertyId: '',
        loanPurpose: '',
        loanAmount: '',
        currency: 'KES',

        // Step 2: Loan Terms
        interestRate: '',
        loanTerm: '',
        termType: 'months',
        repaymentFrequency: 'monthly',

        // Step 3: Lender Details
        lenderId: '',
        lenderName: '',
        lenderContact: '',
        lenderEmail: '',

        // Step 4: Documents & Submission
        documents: [],
        termsAccepted: false
    });

    const [calculations, setCalculations] = useState({
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0
    });

    // Mock data for Kenyan context
    useEffect(() => {
        // Mock properties
        const mockProperties = [
            { id: 'PROP-001', name: 'Kilimani Apartments', value: 45000000, location: 'Kilimani, Nairobi' },
            { id: 'PROP-002', name: 'Westlands Office Complex', value: 85000000, location: 'Westlands, Nairobi' },
            { id: 'PROP-003', name: 'Karen Villa Estate', value: 120000000, location: 'Karen, Nairobi' },
            { id: 'PROP-004', name: 'Thika Residential Flats', value: 28000000, location: 'Thika, Kiambu' },
            { id: 'PROP-005', name: 'Runda Luxury Homes', value: 95000000, location: 'Runda, Nairobi' }
        ];
        setProperties(mockProperties);

        // Mock lenders (Kenyan banks)
        const mockLenders = [
            { id: 'LDR-001', name: 'KCB Bank Kenya', type: 'bank', interestRange: '12% - 16%', contact: 'customercare@kcb.co.ke' },
            { id: 'LDR-002', name: 'Equity Bank Kenya', type: 'bank', interestRange: '11.5% - 15.5%', contact: 'info@equitybank.co.ke' },
            { id: 'LDR-003', name: 'Cooperative Bank', type: 'bank', interestRange: '13% - 16.5%', contact: 'customerservice@co-opbank.co.ke' },
            { id: 'LDR-004', name: 'NCBA Bank Kenya', type: 'bank', interestRange: '12.5% - 17%', contact: 'contactcentre@ncbagroup.com' },
            { id: 'LDR-005', name: 'Absa Bank Kenya', type: 'bank', interestRange: '12% - 16%', contact: 'absakenya@absa.africa' },
            { id: 'LDR-006', name: 'Standard Chartered Kenya', type: 'bank', interestRange: '13.5% - 17.5%', contact: 'customercare@sc.com' },
            { id: 'LDR-007', name: 'Other Financial Institution', type: 'other', interestRange: 'Varies', contact: '' }
        ];
        setLenders(mockLenders);
    }, []);

    // Calculate loan payments when relevant fields change
    useEffect(() => {
        if (formData.loanAmount && formData.interestRate && formData.loanTerm) {
            calculatePayments();
        }
    }, [formData.loanAmount, formData.interestRate, formData.loanTerm, formData.repaymentFrequency]);

    const calculatePayments = () => {
        const principal = parseFloat(formData.loanAmount);
        const annualRate = parseFloat(formData.interestRate) / 100;
        const term = parseInt(formData.loanTerm);

        let periodicRate, paymentsPerYear;

        switch (formData.repaymentFrequency) {
            case 'monthly':
                periodicRate = annualRate / 12;
                paymentsPerYear = 12;
                break;
            case 'quarterly':
                periodicRate = annualRate / 4;
                paymentsPerYear = 4;
                break;
            case 'annually':
                periodicRate = annualRate;
                paymentsPerYear = 1;
                break;
            default:
                periodicRate = annualRate / 12;
                paymentsPerYear = 12;
        }

        const totalPayments = term * paymentsPerYear;
        const monthlyPayment = principal * periodicRate * Math.pow(1 + periodicRate, totalPayments) /
            (Math.pow(1 + periodicRate, totalPayments) - 1);

        const totalPayment = monthlyPayment * totalPayments;
        const totalInterest = totalPayment - principal;

        setCalculations({
            monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
            totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
            totalPayment: isNaN(totalPayment) ? 0 : totalPayment
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Auto-fill lender details when a pre-defined lender is selected
        if (field === 'lenderId' && value) {
            const selectedLender = lenders.find(lender => lender.id === value);
            if (selectedLender && selectedLender.id !== 'LDR-007') {
                setFormData(prev => ({
                    ...prev,
                    lenderName: selectedLender.name,
                    lenderContact: selectedLender.contact,
                    lenderEmail: selectedLender.contact
                }));
            } else if (selectedLender && selectedLender.id === 'LDR-007') {
                // Reset for other financial institution
                setFormData(prev => ({
                    ...prev,
                    lenderName: '',
                    lenderContact: '',
                    lenderEmail: ''
                }));
            }
        }
    };

    const handleDocumentUpload = (event) => {
        const files = Array.from(event.target.files);
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, ...files]
        }));
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.propertyId && formData.loanPurpose && formData.loanAmount;
            case 2:
                return formData.interestRate && formData.loanTerm;
            case 3:
                return formData.lenderId && formData.lenderName;
            case 4:
                return formData.termsAccepted;
            default:
                return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simulate API call
        try {
            console.log('Submitting loan application:', formData);

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirect to loans dashboard with success message
            navigate('/loans', {
                state: {
                    message: 'Loan application submitted successfully! Your application is under review.'
                }
            });
        } catch (error) {
            console.error('Error submitting application:', error);
        }
    };

    const selectedProperty = properties.find(p => p.id === formData.propertyId);
    const selectedLender = lenders.find(l => l.id === formData.lenderId);

    const steps = [
        { number: 1, title: 'Basic Information', icon: BuildingOfficeIcon },
        { number: 2, title: 'Loan Terms', icon: CalculatorIcon },
        { number: 3, title: 'Lender Details', icon: BanknotesIcon },
        { number: 4, title: 'Review & Submit', icon: DocumentTextIcon }
    ];

    return (
        <div className=" p-6">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/loans" className="inline-flex items-center text-blue-600 hover:text-blue-900 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Loan Portfolio
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">New Loan Application</h1>
                    <p className="text-gray-600 mt-2">Apply for property financing with Kenyan financial institutions</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((stepItem, index) => (
                            <div key={stepItem.number} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === stepItem.number
                                        ? 'bg-blue-600 text-white'
                                        : currentStep > stepItem.number
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {currentStep > stepItem.number ? (
                                        <CheckCircleIcon className="w-5 h-5" />
                                    ) : (
                                        stepItem.number
                                    )}
                                </div>
                                <span
                                    className={`ml-3 font-medium ${currentStep === stepItem.number ? 'text-blue-600' :
                                        currentStep > stepItem.number ? 'text-green-600' : 'text-gray-500'
                                        }`}
                                >
                                    {stepItem.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-12 h-0.5 mx-6 ${currentStep > stepItem.number ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Loan Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Property Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Property *
                                    </label>
                                    <select
                                        value={formData.propertyId}
                                        onChange={(e) => handleInputChange('propertyId', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Choose a property...</option>
                                        {properties.map(property => (
                                            <option key={property.id} value={property.id}>
                                                {property.name} - {property.location} ({formatCurrency(property.value)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Loan Purpose */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Purpose *
                                    </label>
                                    <select
                                        value={formData.loanPurpose}
                                        onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select purpose of loan...</option>
                                        <option value="Renovation">Property Renovation</option>
                                        <option value="Expansion">Property Expansion</option>
                                        <option value="Maintenance">Routine Maintenance</option>
                                        <option value="Emergency Repair">Emergency Repair</option>
                                        <option value="Capital Investment">Capital Investment</option>
                                        <option value="New Construction">New Construction</option>
                                        <option value="Debt Consolidation">Debt Consolidation</option>
                                        <option value="Other">Other Purpose</option>
                                    </select>
                                </div>

                                {/* Loan Amount */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Amount (KES) *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            KES
                                        </span>
                                        <input
                                            type="number"
                                            value={formData.loanAmount}
                                            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter loan amount"
                                            min="100000"
                                            max={selectedProperty ? selectedProperty.value * 0.7 : 1000000000}
                                            required
                                        />
                                    </div>
                                    {selectedProperty && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Maximum recommended: {formatCurrency(selectedProperty.value * 0.7)}
                                            (70% of property value)
                                        </p>
                                    )}
                                </div>

                                {/* Property Preview */}
                                {selectedProperty && (
                                    <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="font-medium text-blue-900 mb-2">Selected Property Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-blue-700">Property:</span>
                                                <p className="font-medium">{selectedProperty.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Location:</span>
                                                <p className="font-medium">{selectedProperty.location}</p>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Current Value:</span>
                                                <p className="font-medium">{formatCurrency(selectedProperty.value)}</p>
                                            </div>
                                            <div>
                                                <span className="text-blue-700">Loan-to-Value Ratio:</span>
                                                <p className="font-medium">
                                                    {formData.loanAmount ? ((formData.loanAmount / selectedProperty.value) * 100).toFixed(1) : '0'}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <div></div> {/* Spacer */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!validateStep(1)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Continue to Loan Terms
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Loan Terms */}
                    {currentStep === 2 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Terms & Conditions</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Interest Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Annual Interest Rate (%) *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.interestRate}
                                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                            className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 14.5"
                                            step="0.1"
                                            min="1"
                                            max="30"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Typical rates in Kenya: 12% - 18%</p>
                                </div>

                                {/* Loan Term */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loan Term *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={formData.loanTerm}
                                            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 60"
                                            min="1"
                                            max="360"
                                            required
                                        />
                                        <select
                                            value={formData.termType}
                                            onChange={(e) => handleInputChange('termType', e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Repayment Frequency */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Repayment Frequency *
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {['monthly', 'quarterly', 'annually'].map(frequency => (
                                            <label key={frequency} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="repaymentFrequency"
                                                    value={frequency}
                                                    checked={formData.repaymentFrequency === frequency}
                                                    onChange={(e) => handleInputChange('repaymentFrequency', e.target.value)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                />
                                                <span className="ml-3 font-medium text-gray-900 capitalize">
                                                    {frequency}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Calculation Preview */}
                                {calculations.monthlyPayment > 0 && (
                                    <div className="md:col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                                        <h4 className="font-medium text-green-900 mb-3">Payment Calculation</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-green-700">Estimated {formData.repaymentFrequency} Payment</p>
                                                <p className="text-lg font-bold text-green-900">
                                                    {formatCurrency(calculations.monthlyPayment)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-green-700">Total Interest</p>
                                                <p className="text-lg font-bold text-green-900">
                                                    {formatCurrency(calculations.totalInterest)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-green-700">Total Repayment</p>
                                                <p className="text-lg font-bold text-green-900">
                                                    {formatCurrency(calculations.totalPayment)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    disabled={!validateStep(2)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Continue to Lender Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Lender Details */}
                    {currentStep === 3 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Lender Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Lender Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Lender *
                                    </label>
                                    <select
                                        value={formData.lenderId}
                                        onChange={(e) => handleInputChange('lenderId', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Choose a lender...</option>
                                        {lenders.map(lender => (
                                            <option key={lender.id} value={lender.id}>
                                                {lender.name} - {lender.interestRange}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lender Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lender Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lenderName}
                                        onChange={(e) => handleInputChange('lenderName', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter lender's full name"
                                        required
                                    />
                                </div>

                                {/* Lender Contact */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lenderContact}
                                        onChange={(e) => handleInputChange('lenderContact', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Contact person's name"
                                    />
                                </div>

                                {/* Lender Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.lenderEmail}
                                        onChange={(e) => handleInputChange('lenderEmail', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="lender@email.com"
                                    />
                                </div>

                                {/* Lender Preview */}
                                {selectedLender && selectedLender.id !== 'LDR-007' && (
                                    <div className="md:col-span-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <h4 className="font-medium text-purple-900 mb-2">Lender Information</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-purple-700">Institution:</span>
                                                <p className="font-medium">{selectedLender.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-purple-700">Interest Range:</span>
                                                <p className="font-medium">{selectedLender.interestRange}</p>
                                            </div>
                                            <div>
                                                <span className="text-purple-700">Contact:</span>
                                                <p className="font-medium">{selectedLender.contact}</p>
                                            </div>
                                            <div>
                                                <span className="text-purple-700">Type:</span>
                                                <p className="font-medium capitalize">{selectedLender.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(4)}
                                    disabled={!validateStep(3)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Review & Submit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Submit */}
                    {currentStep === 4 && (
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit Application</h2>

                            <div className="space-y-6">
                                {/* Application Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Loan Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Property:</span>
                                                <span className="font-medium">{selectedProperty?.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Purpose:</span>
                                                <span className="font-medium">{formData.loanPurpose}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Loan Amount:</span>
                                                <span className="font-bold text-blue-600">{formatCurrency(parseFloat(formData.loanAmount))}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900">Financial Terms</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Interest Rate:</span>
                                                <span className="font-medium">{formData.interestRate}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Term:</span>
                                                <span className="font-medium">{formData.loanTerm} {formData.termType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Repayment:</span>
                                                <span className="font-medium capitalize">{formData.repaymentFrequency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                {calculations.monthlyPayment > 0 && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h3 className="text-lg font-medium text-blue-900 mb-3">Payment Summary</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-blue-700 text-sm">{formData.repaymentFrequency.charAt(0).toUpperCase() + formData.repaymentFrequency.slice(1)} Payment</p>
                                                <p className="text-xl font-bold text-blue-900">{formatCurrency(calculations.monthlyPayment)}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-700 text-sm">Total Interest</p>
                                                <p className="text-xl font-bold text-blue-900">{formatCurrency(calculations.totalInterest)}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-700 text-sm">Total Payment</p>
                                                <p className="text-xl font-bold text-blue-900">{formatCurrency(calculations.totalPayment)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lender Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Lender Information</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-gray-600">Lender:</span>
                                                <p className="font-medium">{formData.lenderName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Contact:</span>
                                                <p className="font-medium">{formData.lenderContact || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Email:</span>
                                                <p className="font-medium">{formData.lenderEmail || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Upload */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Supporting Documents</h3>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleDocumentUpload}
                                            className="hidden"
                                            id="document-upload"
                                        />
                                        <label
                                            htmlFor="document-upload"
                                            className="cursor-pointer flex flex-col items-center text-gray-600 hover:text-gray-700"
                                        >
                                            <DocumentTextIcon className="h-8 w-8 mb-2" />
                                            <p className="font-medium">Upload supporting documents</p>
                                            <p className="text-sm">PDF, DOC, JPG up to 10MB each</p>
                                        </label>
                                    </div>

                                    {/* Uploaded Documents List */}
                                    {formData.documents.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {formData.documents.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center">
                                                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                        <span className="font-medium text-sm">{file.name}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Terms Acceptance */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={formData.termsAccepted}
                                            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                            required
                                        />
                                        <span className="ml-3 text-sm text-yellow-800">
                                            I hereby declare that the information provided in this application is true and accurate.
                                            I understand that this application is subject to approval by the lender and compliance
                                            with Kenyan banking regulations. I authorize the verification of all provided information
                                            and agree to the terms and conditions of the loan facility.
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={!validateStep(4)}
                                    className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NewLoanApplication;