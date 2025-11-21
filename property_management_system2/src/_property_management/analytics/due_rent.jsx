import { useEffect, useState } from 'react';
import { DashboardHeader } from '../properties/dashboard/page_components'
import axios from 'axios';
import { use } from 'react';
import toast from 'react-hot-toast';
import { FaDownload } from 'react-icons/fa';
import { Download, FileDown, FileSpreadsheet, Phone } from 'lucide-react';

const DueRent = () => {
    const [rentDues, setRentDues] = useState([])
    const [loading, setLoading] = useState(false)
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(10);

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);
    };

    const options = [10, 25, 50, 100, 150, 200].filter((num) => num < totalUnits);


    useEffect(() => {
        fetchRentDues();
        fetchProperties()
    }, [baseUrl, token, selectedUnits, selectedProperty])

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            setRentDues(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setRentDues(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            setRentDues(pageNumber);
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

    const fetchRentDues = async (page = 15) => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/dashboard/due-rent?limit=${selectedUnits}&per_page=${selectedUnits}&property_id=${selectedProperty}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );
            setRentDues(response.data.results);
            setLoading(false);
            setTotalUnits(response.data.pagination.total)
            setCurrentPage(response.data.pagination.current_page);
            setPagination(response.data.pagination)
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }
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
            toast.error("Failed to fetch properties")
        }
    }
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const generatePDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Rent Due Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 6;
        doc.text(`Total Records: ${rentDues.length}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Summary Totals
        const totalInitial = rentDues.reduce((sum, r) => sum + r.inial_amount_due, 0);
        const totalPaid = rentDues.reduce((sum, r) => sum + r.total_paid, 0);
        const totalDue = rentDues.reduce((sum, r) => sum + r.amount_due, 0);

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Initial Amount: KES ${totalInitial.toLocaleString()}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Total Paid: KES ${totalPaid.toLocaleString()}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Total Due: KES ${totalDue.toLocaleString()}`, 14, yPosition);
        yPosition += 12;

        // Table
        doc.setFontSize(12);
        doc.text('Detailed Rent Due List', 14, yPosition);
        yPosition += 8;

        // Table headers
        doc.setFontSize(8);
        const headers = ['Unit/Property', 'Tenant', 'Initial Amount', 'Total Paid', 'Amount Due'];
        const colWidths = [70, 60, 40, 40, 40];
        let xPos = 14;

        doc.setFont(undefined, 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(14, yPosition - 5, pageWidth - 28, 7, 'F');

        headers.forEach((header, index) => {
            doc.text(header, xPos, yPosition, { maxWidth: colWidths[index] - 2 });
            xPos += colWidths[index];
        });

        yPosition += 8;
        doc.setFont(undefined, 'normal');

        // Table rows
        rentDues.forEach((rentDue, index) => {
            const rowHeight = 8 + (rentDue.bills?.length || 0) * 4;

            if (yPosition + rowHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;

                // Repeat headers
                doc.setFont(undefined, 'bold');
                doc.setFillColor(240, 240, 240);
                doc.rect(14, yPosition - 5, pageWidth - 28, 7, 'F');
                xPos = 14;
                headers.forEach((header, idx) => {
                    doc.text(header, xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
                    xPos += colWidths[idx];
                });
                yPosition += 8;
                doc.setFont(undefined, 'normal');
            }

            // Alternating row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(14, yPosition - 5, pageWidth - 28, rowHeight, 'F');
            }

            xPos = 14;

            // Unit/Property column
            doc.text(`${rentDue.floor} Floor - ${rentDue.unit_number}`, xPos, yPosition, { maxWidth: colWidths[0] - 2 });
            doc.setFontSize(7);
            doc.text(rentDue.property_name || '', xPos, yPosition + 4, { maxWidth: colWidths[0] - 2 });
            doc.setFontSize(8);
            xPos += colWidths[0];

            // Tenant column
            doc.text(rentDue.tenant_name || 'N/A', xPos, yPosition, { maxWidth: colWidths[1] - 2 });
            doc.setFontSize(7);
            doc.text(rentDue.tenant_phone || '', xPos, yPosition + 4, { maxWidth: colWidths[1] - 2 });
            doc.setFontSize(8);
            xPos += colWidths[1];

            // Initial Amount
            doc.text(rentDue.inial_amount_due.toLocaleString(), xPos, yPosition, { maxWidth: colWidths[2] - 2 });
            if (rentDue.bills && rentDue.bills.length > 0) {
                let billYPos = yPosition + 4;
                doc.setFontSize(7);
                rentDue.bills.forEach(bill => {
                    doc.text(`${bill.bill_type}: ${bill.amount_due?.toLocaleString() || 0}`, xPos, billYPos, { maxWidth: colWidths[2] - 2 });
                    billYPos += 4;
                });
                doc.setFontSize(8);
            }
            xPos += colWidths[2];

            // Total Paid
            doc.text(rentDue.total_paid.toLocaleString(), xPos, yPosition, { maxWidth: colWidths[3] - 2 });
            if (rentDue.bills && rentDue.bills.length > 0) {
                let billYPos = yPosition + 4;
                doc.setFontSize(7);
                rentDue.bills.forEach(bill => {
                    doc.text(`${bill.bill_type}: ${bill.amount_paid?.toLocaleString() || 0}`, xPos, billYPos, { maxWidth: colWidths[3] - 2 });
                    billYPos += 4;
                });
                doc.setFontSize(8);
            }
            xPos += colWidths[3];

            // Amount Due
            doc.text(rentDue.amount_due.toLocaleString(), xPos, yPosition, { maxWidth: colWidths[4] - 2 });

            yPosition += rowHeight;
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`Rent_Due_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF downloaded successfully!');
    };

    // Excel Generation Function
    const generateExcel = () => {
        if (typeof XLSX === 'undefined') {
            toast.error('Excel library not loaded. Please refresh the page.');
            return;
        }

        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const totalInitial = rentDues.reduce((sum, r) => sum + r.inial_amount_due, 0);
        const totalPaid = rentDues.reduce((sum, r) => sum + r.total_paid, 0);
        const totalDue = rentDues.reduce((sum, r) => sum + r.amount_due, 0);

        const summaryData = [
            ['Rent Due Report'],
            [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
            [`Total Records: ${rentDues.length}`],
            [],
            ['Summary'],
            [],
            ['Metric', 'Amount'],
            ['Total Initial Amount', `KES ${totalInitial.toLocaleString()}`],
            ['Total Paid', `KES ${totalPaid.toLocaleString()}`],
            ['Total Amount Due', `KES ${totalDue.toLocaleString()}`],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Detailed Rent Due Sheet
        const detailData = [
            ['Rent Due Details'],
            [],
            ['Floor', 'Unit Number', 'Unit Type', 'Property Name', 'Location', 'Tenant Name', 'Tenant Phone', 'Initial Amount', 'Total Paid', 'Amount Due']
        ];

        rentDues.forEach(rentDue => {
            detailData.push([
                rentDue.floor,
                rentDue.unit_number,
                rentDue.unit_type,
                rentDue.property_name,
                rentDue.location_name,
                rentDue.tenant_name,
                rentDue.tenant_phone,
                rentDue.inial_amount_due,
                rentDue.total_paid,
                rentDue.amount_due
            ]);
        });

        // Add totals row
        detailData.push([
            'TOTALS',
            '',
            '',
            '',
            '',
            '',
            '',
            totalInitial,
            totalPaid,
            totalDue
        ]);

        const wsDetails = XLSX.utils.aoa_to_sheet(detailData);

        wsDetails['!cols'] = [
            { wch: 10 }, // Floor
            { wch: 15 }, // Unit Number
            { wch: 15 }, // Unit Type
            { wch: 30 }, // Property Name
            { wch: 25 }, // Location
            { wch: 25 }, // Tenant Name
            { wch: 15 }, // Tenant Phone
            { wch: 15 }, // Initial Amount
            { wch: 15 }, // Total Paid
            { wch: 15 }  // Amount Due
        ];

        XLSX.utils.book_append_sheet(wb, wsDetails, 'Rent Due Details');

        // Bills Breakdown Sheet (if there are bills)
        const billsData = [
            ['Bills Breakdown'],
            [],
            ['Unit Number', 'Property Name', 'Tenant Name', 'Bill Type', 'Amount Due', 'Amount Paid']
        ];

        rentDues.forEach(rentDue => {
            if (rentDue.bills && rentDue.bills.length > 0) {
                rentDue.bills.forEach(bill => {
                    billsData.push([
                        rentDue.unit_number,
                        rentDue.property_name,
                        rentDue.tenant_name,
                        bill.bill_type,
                        bill.amount_due || 0,
                        bill.amount_paid || 0
                    ]);
                });
            }
        });

        if (billsData.length > 3) {
            const wsBills = XLSX.utils.aoa_to_sheet(billsData);
            wsBills['!cols'] = [
                { wch: 15 },
                { wch: 30 },
                { wch: 25 },
                { wch: 20 },
                { wch: 15 },
                { wch: 15 }
            ];
            XLSX.utils.book_append_sheet(wb, wsBills, 'Bills Breakdown');
        }

        XLSX.writeFile(wb, `Rent_Due_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel file downloaded successfully!');
    };


    return (
        <>
            <DashboardHeader
                title="Outstanding Rent & Bills"
                description="View and manage all units with rent or bills due."
                // name="New property"
                // link="/add-property/general-information"
                hideSelect={true}
                hideLink={false}
                properties={properties}
                onSelectChange={handleSelectChange}
            />
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center my-4 px-2">
                    <h4 className="text-md text-gray-600">All property List</h4>
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdownId(openDropdownId === 'download' ? null : 'download')}
                                disabled={loading || rentDues.length === 0}
                                className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            {openDropdownId === 'download' && (
                                <div className="absolute left-0 z-50 w-48 mt-2 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                generatePDF();
                                                setOpenDropdownId(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <FileDown className="w-4 h-4 text-red-600" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Export as PDF</div>
                                                <div className="text-xs text-gray-500">Download PDF report</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                generateExcel();
                                                setOpenDropdownId(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">Export as Excel</div>
                                                <div className="text-xs text-gray-500">Download XLSX file</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
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

                {loading ? (
                    <p className="text-center py-4">Loading...</p>
                ) : (
                    <div className="w-full">
                        <div className="overflow-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100 text-left text-xs border-y ">
                                    <tr className="py-2">
                                        <th className="px-4 py-2">Tenant</th>
                                        <th className="px-4 py-2">Property & Unit</th>
                                        <th className="px-4 py-2">Initial Amount</th>
                                        <th className="px-4 py-2">Total Paid</th>
                                        <th className="px-4 py-2">Amount Due</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {rentDues.map((rentDue, index) => (
                                        <tr key={index} className="border-b text-sm odd:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {rentDue.tenant_name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">{rentDue.tenant_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <p className="text-xs text-gray-500">{rentDue.tenant_phone}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">{rentDue.property_name}</div>
                                                <div className="text-xs text-gray-500">{rentDue.floor} Floor - {rentDue.unit_number}, {rentDue.unit_type}</div>
                                            </td>

                                            <td className="px-4 py-2 font-mono">
                                                {rentDue.inial_amount_due.toLocaleString()}
                                                <br />
                                                {rentDue.bills?.map((bill, i) => (
                                                    <span key={i} className="capitalize text-gray-500 text-xs block">
                                                        {bill.bill_type} — {bill.amount_due?.toLocaleString()}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-green-500">{rentDue.total_paid.toLocaleString()}
                                                <br />
                                                {rentDue.bills?.map((bill, i) => (
                                                    <span key={i} className="capitalize text-gray-500 text-xs block">
                                                        {bill.bill_type} — {bill.amount_paid?.toLocaleString()}
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-red-500">{rentDue.amount_due.toLocaleString()}</td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                )}
            </div>

            {
                pagination && pagination.last_page > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 gap-4">
                        {/* Pagination Info */}
                        <div className="text-sm text-gray-700">
                            Showing page {pagination.from} to {pagination.last_page} of {pagination.total} results
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center space-x-2">
                            {/* Previous Button */}
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

                            {/* Page Numbers */}
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

                            {/* Next Button */}
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
                )
            }
        </>
    )
}

export default DueRent
