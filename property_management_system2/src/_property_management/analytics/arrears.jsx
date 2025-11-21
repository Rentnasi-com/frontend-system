import { useEffect, useState } from 'react';
import { Search, Download, Send, Phone, Mail, FileDown, FileSpreadsheet, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { DashboardHeader } from '../properties/dashboard/page_components';
import toast from 'react-hot-toast';

const ArrearsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedTenants, setSelectedTenants] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const [billItems, setBillItems] = useState([]);
    const [billType, setBillType] = useState("")

    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [arrears, setArrears] = useState([]);
    const [statistics, setStatistics] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(15);

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);
    };

    const options = [10, 25, 50, 100, 150, 200].filter((num) => num < totalUnits);

    useEffect(() => {
        fetchProperties();
        fetchArrears(currentPage)
        fetchBillItems()
    }, [token, baseUrl, selectedProperty, selectedUnits, currentPage, billType])

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

    const fetchArrears = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/arrears?property_id=${selectedProperty}&pagination=${page}&per_page=${selectedUnits}&bill_type=${billType}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setArrears(response.data.result)
            setStatistics(response.data.totals)
            setCurrentPage(response.data.pagination.current_page);
            setPagination(response.data.pagination)
            setTotalUnits(response.data.pagination.total)
        } catch (error) {
            console.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    const fetchBillItems = async () => {
        try {
            const response = await axios.get(`${baseUrl}/get-bill-types`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                setBillItems(response.data.bill_types)
            }
        } catch (error) {
            toast.error("Bill items details not found");
        }
    }
    // Export to PDF function
    const exportToPDF = () => {
        const printContent = document.createElement('div');
        printContent.innerHTML = `
            <html>
                <head>
                    <title>Rent Arrears Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; margin-bottom: 10px; }
                        .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #4a5568; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .severity { padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
                        .critical { background: #fee; color: #c00; }
                        .high { background: #ffedd5; color: #c2410c; }
                        .medium { background: #fef9c3; color: #854d0e; }
                        .low { background: #dbeafe; color: #1e40af; }
                    </style>
                </head>
                <body>
                    <h1>Rent Arrears Report</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    
                    <div class="summary">
                        <h2>Summary</h2>
                        <p><strong>Total Arrears Due:</strong> KES ${statistics?.total_arrears?.toLocaleString() || 0}</p>
                        <p><strong>Arrears Paid:</strong> KES ${statistics?.arraers_paid?.toLocaleString() || 0}</p>
                        <p><strong>Total Outstanding:</strong> KES ${statistics?.arraers_due?.toLocaleString() || 0}</p>
                        <p><strong>Number of Tenants:</strong> ${pagination.total || 0}</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Phone</th>
                                <th>Property & Unit</th>
                                <th>Amount Owed</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Severity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arrears.map(arrear => `
                                <tr>
                                    <td>${arrear.tenant}</td>
                                    <td>${arrear.phone}</td>
                                    <td>${arrear.property_name} - Unit ${arrear.unit_number}</td>
                                    <td>KES ${arrear.arrears_due.toLocaleString()}</td>
                                    <td>KES ${arrear.arrears_paid.toLocaleString()}</td>
                                    <td>KES ${arrear.arrears.toLocaleString()}</td>
                                    <td><span class="severity ${getSeverityLevel(arrear.arrears_due)}">${getSeverityLevel(arrear.arrears_due)}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.close();
        printWindow.print();
        setShowExportMenu(false);
    };

    // Export to Excel function
    const exportToExcel = () => {
        // Prepare data for Excel
        const excelData = [
            ['Rent Arrears Report'],
            ['Generated on:', new Date().toLocaleString()],
            [''],
            ['Summary'],
            ['Total Arrears Due:', `KES ${statistics?.total_arrears?.toLocaleString() || 0}`],
            ['Arrears Paid:', `KES ${statistics?.arraers_paid?.toLocaleString() || 0}`],
            ['Total Outstanding:', `KES ${statistics?.arraers_due?.toLocaleString() || 0}`],
            ['Number of Tenants:', pagination.total || 0],
            [''],
            ['Tenant', 'Phone', 'Property', 'Unit Number', 'Unit Type', 'Amount Owed', 'Paid', 'Balance', 'Severity'],
            ...arrears.map(arrear => [
                arrear.tenant,
                arrear.phone,
                arrear.property_name,
                arrear.unit_number,
                arrear.unit_type,
                arrear.arrears_due,
                arrear.arrears_paid,
                arrear.arrears,
                getSeverityLevel(arrear.arrears_due)
            ])
        ];

        // Convert to CSV
        const csvContent = excelData.map(row =>
            row.map(cell => {
                const cellStr = String(cell);
                return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
            }).join(',')
        ).join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `rent_arrears_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const getSeverityLevel = (arrearsDue) => {
        if (arrearsDue >= 50000) return 'critical';
        if (arrearsDue >= 10000) return 'high';
        if (arrearsDue >= 1000) return 'medium';
        if (arrearsDue >= 1) return 'low';
        return 'none';
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchArrears(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchArrears(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchArrears(pageNumber);
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

    return (
        <div className="min-h-screen bg-gray-100">
            <DashboardHeader
                title="Rent Arrears"
                description="Monitor and manage outstanding rent payments"
                hideSelect={true}
                properties={properties}
                onSelectChange={handleSelectChange}
            />

            <div className="py-1 px-4 mt-2">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded p-2 text-white shadow">
                        <div className="flex justify-between">
                            <p className="text-red-100 text-sm font-medium">Arrears Due</p>
                            <p className="text-red-100 text-xs mt-2">{pagination.total} tenants with arrears</p>
                        </div>
                        <h3 className="text-xl font-mono mt-1">KES {statistics?.total_arrears?.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white rounded p-2 shadow-sm border-2 border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <p className="text-gray-600 text-sm font-medium">Arrears Paid</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">KES {statistics?.arraers_paid?.toLocaleString()}</h3>
                    </div>

                    <div className="bg-white rounded p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between">
                            <p className="text-gray-600 text-sm font-medium">Total Arrears</p>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">KES {statistics?.arraers_due?.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex justify-between gap-4">
                        <div className=""></div>
                        <div className="flex gap-2">
                            <div className="">
                                {billItems?.length > 0 && (
                                    <>
                                        <select
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            value={billType}
                                            onChange={(e) => setBillType(e.target.value)}
                                        >
                                            <option value="">Select a bill type</option>
                                            {billItems?.map((item) => (
                                                <option key={item} value={item}>
                                                    {item
                                                        .split("_")
                                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(" ")}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>

                            {/* Export Button with Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm font-medium">Export</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {showExportMenu && (
                                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
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
                                                <div className="text-xs text-gray-500">Download CSV file</div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center text-xs mt-1">
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
                                        Amount Owed
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Paid
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Balance
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
                                {arrears.map((arrear) => (
                                    <tr
                                        key={arrear.id}
                                        className={`hover:bg-gray-50 transition-colors ${selectedTenants.includes(arrear.id) ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedTenants.includes(arrear.id)}
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
                                            <div className="text-sm text-gray-900 font-medium">{arrear.property_name}</div>
                                            <div className="text-xs text-gray-500">Unit {arrear.unit_number} - {arrear.unit_type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">KES {arrear.arrears_due.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono  text-green-600">
                                                KES {arrear.arrears_paid.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-red-600">
                                                KES {arrear.arrears.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(() => {
                                                const severity = getSeverityLevel(arrear.arrears_due);
                                                const colorClass = getSeverityColor(severity);
                                                return (
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${colorClass}`}>
                                                        {severity}
                                                    </span>
                                                );
                                            })()}
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

                    {arrears.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No arrears found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 gap-4">
                        <div className="text-sm text-gray-700">
                            Showing page {pagination.current_page} to {pagination.last_page} of {pagination.total} results
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
        </div>
    );
};

export default ArrearsDashboard;