import { useEffect, useState } from 'react';
import { Search, Download, Filter, CreditCard, Building2, Wallet, TrendingUp, Calendar, FileDown, FileSpreadsheet } from 'lucide-react';
import { DashboardHeader } from '../properties/dashboard/page_components';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const PaymentsReceived = () => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [properties, setProperties] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [receivedPayments, setReceivedPayments] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const [selectedProperty, setSelectedProperty] = useState('')

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])
    const [loading, setLoading] = useState(true);

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(15);

    const [openPaymentDropdownId, setOpenPaymentDropdownId] = useState(null);
    const [deletePayment, setDeletePayment] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { hasPermission } = useAuth();

    const itemToDelete = receivedPayments.find(item => item.money_id === deletePayment);

    const handleSingleDelete = async () => {
        if (!deletePayment) return;

        try {
            await axios.delete(`${baseUrl}/payment/received`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { money_id: deletePayment.money_id },
            });

            setIsDeleteModalOpen(false);
            setDeletePayment(null);
            fetchPaymentReceived(currentPage);
        } catch (error) {
            console.error(error.message);
        }
    };

    const togglePaymentDropdown = (id) => {
        setOpenPaymentDropdownId(openPaymentDropdownId === id ? null : id);
    };

    useEffect(() => {
        fetchProperties();
        fetchPaymentReceived(currentPage)
    }, [token, baseUrl, selectedProperty, currentPage, searchTerm, selectedUnits, endDate]);

    const handleSelectChange = (event) => {
        setSelectedProperty(event.target.value);
    };

    const formatStartDate = (date) => {
        if (!date) return null;
        return `${date} 00:00:00`;
    };

    const formatEndDate = (date) => {
        if (!date) return null;
        return `${date} 23:59:59`;
    };


    const fetchPaymentReceived = async (page = 1) => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${baseUrl}/payment/received`,
                {
                    params: {
                        property_id: selectedProperty,
                        pagination: page,
                        query: searchTerm,
                        per_page: selectedUnits,
                        start_date_time: formatStartDate(startDate),
                        end_date_time: formatEndDate(endDate),
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setReceivedPayments(response.data.results);
            setCurrentPage(response.data.pagination.current_page);
            setPagination(response.data.pagination);
            setTotalUnits(response.data.pagination.total);

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
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

    // Calculate totals from receivedPayments
    const totals = {
        mpesa: receivedPayments.filter(p => p.method?.toLowerCase() === 'mpesa').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        bank: receivedPayments.filter(p => p.method?.toLowerCase().includes('bank')).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        cash: receivedPayments.filter(p => p.method?.toLowerCase() === 'cash').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    };
    totals.all = totals.mpesa + totals.bank + totals.cash;

    const getMethodIcon = (method) => {
        const normalized = method?.toLowerCase() || '';

        if (normalized.includes('bank')) {
            return (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                </div>
            );
        }

        switch (normalized) {
            case 'mpesa':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-green-600" />
                    </div>
                );
            case 'cash':
                return (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                );
            default:
                return null;
        }
    };

    const getMethodBadgeColor = (method) => {
        const normalized = method?.toLowerCase() || '';

        if (normalized.includes('bank')) {
            return 'bg-blue-100 text-blue-800';
        }

        switch (normalized) {
            case 'mpesa':
                return 'bg-green-100 text-green-800';
            case 'cash':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text('Payments Received Report', 14, 22);

        // Add generation date
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Add summary
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Payments: KES ${totals.all.toLocaleString()}`, 14, 40);
        doc.text(`M-Pesa: KES ${totals.mpesa.toLocaleString()}`, 14, 47);
        doc.text(`Bank: KES ${totals.bank.toLocaleString()}`, 90, 47);
        doc.text(`Cash: KES ${totals.cash.toLocaleString()}`, 140, 47);

        // Prepare table data
        const tableData = receivedPayments.map(payment => [
            payment.name || 'N/A',
            payment.unit_details?.property_name || 'N/A',
            payment.unit_details?.unit_number || 'N/A',
            (payment.method || 'N/A').toUpperCase(),
            payment.reference || 'N/A',
            new Date(payment.date_received?.replace('Z', '')).toLocaleDateString(),
            `KES ${parseFloat(payment.amount || 0).toLocaleString()}`
        ]);

        // Add table
        autoTable(doc, {
            head: [['Tenant', 'Property', 'Unit', 'Method', 'Reference', 'Date', 'Amount']],
            body: tableData,
            startY: 55,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [147, 51, 234] },
        });

        // Save the PDF
        doc.save(`payments-received-${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportMenu(false);
    };

    // Export to Excel
    const exportToExcel = () => {
        // Prepare data for Excel
        const excelData = receivedPayments.map(payment => ({
            'Tenant Name': payment.name || 'N/A',
            'Phone': payment.phone || 'N/A',
            'Property': payment.unit_details?.property_name || 'N/A',
            'Unit Number': payment.unit_details?.unit_number || 'N/A',
            'Payment Method': (payment.method || 'N/A').toUpperCase(),
            'Reference': payment.reference || 'N/A',
            'Date': new Date(payment.date_received?.replace('Z', '')).toLocaleDateString(),
            'Time': new Date(payment.date_received?.replace('Z', '')).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
            'Amount (KES)': parseFloat(payment.amount || 0)
        }));

        // Add summary row
        excelData.push({});
        excelData.push({
            'Tenant Name': 'SUMMARY',
            'Amount (KES)': ''
        });
        excelData.push({
            'Tenant Name': 'Total Payments',
            'Amount (KES)': totals.all
        });
        excelData.push({
            'Tenant Name': 'M-Pesa Total',
            'Amount (KES)': totals.mpesa
        });
        excelData.push({
            'Tenant Name': 'Bank Total',
            'Amount (KES)': totals.bank
        });
        excelData.push({
            'Tenant Name': 'Cash Total',
            'Amount (KES)': totals.cash
        });

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Payments Received');

        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Tenant Name
            { wch: 15 }, // Phone
            { wch: 25 }, // Property
            { wch: 12 }, // Unit Number
            { wch: 15 }, // Payment Method
            { wch: 20 }, // Reference
            { wch: 12 }, // Date
            { wch: 10 }, // Time
            { wch: 15 }, // Amount
        ];

        // Save the file
        XLSX.writeFile(wb, `payments-received-${new Date().toISOString().split('T')[0]}.xlsx`);
        setShowExportMenu(false);
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchPaymentReceived(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchPaymentReceived(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchPaymentReceived(pageNumber);
        }
    };

    const generatePageNumbers = () => {
        if (!pagination) return [];

        const { current_page, last_page } = pagination;
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);

    };

    const options = [10, 25, 50, 100, 150, 200].filter((num) => num < totalUnits);

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
                            <p className="text-purple-100 text-xs mt-2">{receivedPayments.length} transactions</p>
                        </div>
                        <h3 className="font-mono mt-1">KES {totals.all.toLocaleString()}</h3>
                    </div>

                    {/* M-Pesa */}
                    <div className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <p className="text-gray-600 text-sm font-medium">M-Pesa Payments</p>
                        <h3 className="font-mono text-gray-900 mt-1">KES {totals.mpesa.toLocaleString()}</h3>
                    </div>

                    {/* Bank Transfer */}
                    <div className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <p className="text-gray-600 text-sm font-medium">Bank Transfers</p>
                        <h3 className="font-mono text-gray-900 mt-1">KES {totals.bank.toLocaleString()}</h3>
                    </div>

                    {/* Cash */}
                    <div className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                                placeholder="Search by tenant or reference..."
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
                                max={endDate || undefined} // Prevent start date from going beyond end date
                            />

                            <span className="text-gray-500">to</span>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min={startDate || undefined} // Restrict end date so it cannot be before start date
                            />
                        </div>


                        {/* Payment Method Filter */}
                        {/* <div className="flex gap-2">
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
                        </div> */}

                        {/* Export Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Export</span>
                            </button>

                            {/* Dropdown Menu */}
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                    <button
                                        onClick={exportToPDF}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <FileDown className="w-4 h-4 text-red-600" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Export as PDF</div>
                                            <div className="text-xs text-gray-500">Download PDF report</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={exportToExcel}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Export as Excel</div>
                                            <div className="text-xs text-gray-500">Download XLSX file</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center text-xs">
                            <label htmlFor="unitSelect" className="text-xs font-medium text-gray-700">
                                Show Units:
                            </label>
                            <select
                                id="unitSelect"
                                value={selectedUnits}
                                onChange={handleUnitChange}
                                className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                {options.map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                                <option value={totalUnits}>{totalUnits} (All)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
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
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {receivedPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors odd:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {payment.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{payment.name}</p>
                                                    <p className="text-xs font-medium text-gray-900">{payment.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-900 font-medium">{payment.unit_details?.property_name}</div>
                                            <div className="text-xs text-gray-500">Unit {payment.unit_details?.unit_number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getMethodIcon(payment.method)}
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodBadgeColor(payment.method)}`}>
                                                    {payment.method?.toUpperCase() || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs text-gray-600 font-mono">{payment.reference}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-900">
                                                {new Date(payment.date_received?.replace('Z', '')).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(payment.date_received?.replace('Z', '')).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false,
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-xs font-mono text-gray-900">
                                                KES {parseFloat(payment.amount || 0).toLocaleString()}
                                            </span>
                                        </td>

                                        <td className="relative px-4 py-2 text-sm">
                                            {/* Dropdown button - only in Actions column */}
                                            <button
                                                onClick={() => togglePaymentDropdown(payment.money_id)}
                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                            >
                                                Actions
                                                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {openPaymentDropdownId === payment.money_id && (
                                                <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="py-1">
                                                        {hasPermission("tenants", "edit") && (
                                                            <button
                                                                onClick={() => {
                                                                    setDeletePayment(payment); // store full payment object
                                                                    setIsDeleteModalOpen(true); // open modal
                                                                }}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete Payment
                                                            </button>
                                                        )}
                                                        <Link to={`/payments/transfer?money_id=${payment.money_id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-gray-100"
                                                        >
                                                            Transfer Payment
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* No results */}
                    {receivedPayments.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>

                {isDeleteModalOpen && (
                    <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center backdrop-blur-sm">
                        <div className="bg-white rounded-lg p-6 w-1/3">
                            <h2 className="text-xl text-center font-semibold text-gray-800">
                                Confirm Deletion
                            </h2>
                            <p className="text-gray-600 mt-2 text-center">
                                Are you sure you want to delete this payment by{" "}
                                <span className="font-bold">{deletePayment?.name}</span> permanently? This action cannot be undone.
                            </p>
                            <div className="mt-4 flex justify-center gap-2">
                                <button
                                    className="px-4 py-2.5 text-xs font-medium rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md transition-all"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSingleDelete}
                                    className="px-4 py-2.5 text-xs font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {pagination && pagination.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 gap-4">
                        <div className="text-sm text-gray-700">
                            Showing page {pagination.from} to {pagination.last_page} of {pagination.total} results
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                className={`flex items-center justify-center px-3 h-8 text-sm font-medium rounded-l ${currentPage === 1
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-white bg-red-800 hover:bg-red-900'
                                    }`}
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || loading}
                            >
                                <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
                                </svg>
                                Previous
                            </button>

                            {generatePageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    className={`flex items-center justify-center px-3 h-8 text-sm font-medium ${pageNum === currentPage
                                        ? 'text-white bg-red-800'
                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100'
                                        }`}
                                    onClick={() => handlePageClick(pageNum)}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                className={`flex items-center justify-center px-3 h-8 text-sm font-medium rounded-r ${currentPage === pagination.last_page
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-white bg-red-800 hover:bg-red-900'
                                    }`}
                                onClick={handleNextPage}
                                disabled={currentPage === pagination.last_page || loading}
                            >
                                Next
                                <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentsReceived;