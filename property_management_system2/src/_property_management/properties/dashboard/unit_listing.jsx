import { useEffect, useState } from "react";
import { DashboardHeader, PropertyCard, TableRow } from "./page_components";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { ChevronDown, Download, FileDown, FileSpreadsheet } from "lucide-react";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">

        {[...Array(7)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-32 mx-auto" />
            </td>
        ))}

    </tr>
);
const StatCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="flex justify-between items-center">
            <SkeletonLoader className="h-8 w-8 rounded" />
            <SkeletonLoader className="h-6 w-6 rounded" />
        </div>
        <div className="mt-3">
            <SkeletonLoader className="h-4 w-24 mb-2" />
            {/* <SkeletonLoader className="h-6 w-16" /> */}
        </div>
    </div>
);
const UnitListing = () => {
    const [propertiesBreakdown, setPropertiesBreakdown] = useState([])
    const [propertiesRevenue, setPropertiesRevenue] = useState([])
    const [propertiesUnits, setPropertiesUnits] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status') || '';

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(10);

    const fetchPropertiesDetails = async (page = 1) => {
        try {
            const response = await axios.get(`${baseUrl}/manage-property/view-properties/units?status=${status}&pagination=${page}&property_id=${selectedProperty}&per_page=${selectedUnits}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            if (response.data.success) {
                setPropertiesBreakdown(response.data.details.breakdown)
                setPropertiesRevenue(response.data.details)
                setPropertiesUnits(response.data.result.data)
                setCurrentPage(response.data.result.current_page);
                setPagination(response.data.result)
                setTotalUnits(response.data.result.total)
            }
        } catch (error) {
            toast.error("An error occurred while fetching property details!")
        } finally {
            setLoading(false)
        }
    }

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

    useEffect(() => {
        fetchPropertiesDetails(currentPage)
        fetchProperties()
    }, [currentPage, status, token, selectedProperty, selectedUnits])

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchPropertiesDetails(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchPropertiesDetails(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchPropertiesDetails(pageNumber);
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

    const handleSelectChange = (event) => {
        setSelectedProperty(event.target.value);
    };

    const stats = [
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            label: "Total Units",
            value: propertiesBreakdown.all_property_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            label: "Occupied Units",
            value: propertiesBreakdown.occupied_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=available",
            iconSrc: "../../../assets/icons/png/vacate.png",
            label: "Vacant units",
            value: propertiesBreakdown.vacant_units?.count,
        },
    ];

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    const setWhoToRecievePayment = async (tenantId, unitId, toLandlord) => {
        try {
            const response = await axios.patch(`${baseUrl}/manage-tenant/settings/payment`, {
                tenant_id: tenantId,
                unit_id: unitId,
                payments_to_landlord: toLandlord,
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );
            if (response.status === 200) {
                toast.success("Payment details updated successfully.");
                await fetchPropertiesDetails()
                setOpenDropdownId(null);
            }
        } catch (error) {
            setOpenDropdownId(null);
        }
    };

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);

    };

    const options = [10, 25, 50, 100, 150, 200].filter((num) => num < totalUnits);

    const generatePDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('All Units Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 6;
        doc.text(`Total Units: ${propertiesUnits.length}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Summary Statistics
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        const summaryStats = [
            { label: 'Total Units', value: propertiesBreakdown.all_property_units?.count || 0 },
            { label: 'Occupied Units', value: propertiesBreakdown.occupied_units?.count || 0 },
            { label: 'Vacant Units', value: propertiesBreakdown.vacant_units?.count || 0 },
            { label: 'Total Payable', value: `KES ${(propertiesRevenue.revenue?.amounts?.expected_income?.count || 0).toLocaleString()}` },
            { label: 'Total Rent', value: `KES ${(propertiesRevenue.revenue?.amounts?.total_rent?.count || 0).toLocaleString()}` },
            { label: 'Amount Paid', value: `KES ${(propertiesRevenue.revenue?.amounts?.amount_paid?.count || 0).toLocaleString()}` },
            { label: 'Total Arrears', value: `KES ${Number(propertiesRevenue.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}` },
            { label: 'Total Fines', value: `KES ${(propertiesRevenue.revenue?.amounts?.total_fines?.count || 0).toLocaleString()}` },
            { label: 'Total Bills', value: `KES ${(propertiesRevenue.revenue?.amounts?.total_bills?.count || 0).toLocaleString()}` },
            { label: 'Total Balance', value: `KES ${(propertiesRevenue.revenue?.amounts?.total_balance?.count || 0).toLocaleString()}` },
        ];

        summaryStats.forEach((stat, index) => {
            if (index % 2 === 0 && index > 0) yPosition += 6;
            const xPos = index % 2 === 0 ? 14 : pageWidth / 2 + 10;
            doc.text(`${stat.label}: ${stat.value}`, xPos, yPosition);
            if (index % 2 === 1) yPosition += 6;
        });

        if (summaryStats.length % 2 === 1) yPosition += 6;
        yPosition += 12;

        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
        }

        // Units Table
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Unit Details', 14, yPosition);
        yPosition += 8;

        // Table headers
        doc.setFontSize(7);
        const headers = ['Property', 'Unit', 'Tenant', 'Exp Rent', 'Arrears', 'Fines', 'Bills', 'Paid', 'Rent', 'Balance', 'Status'];
        const colWidths = [35, 25, 30, 18, 18, 16, 16, 18, 18, 18, 23];
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
        propertiesUnits.forEach((unit, index) => {
            const rowHeight = 12;

            if (yPosition + rowHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;

                // Repeat headers on new page
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

            xPos = 14;

            // Determine status
            let statusText = 'Vacant';
            if (unit.availability_status !== 'available') {
                statusText = unit.pending_balances === 0 ? 'No Balance' : 'With Balance';
            }

            const rowData = [
                unit.property_name,
                `${unit.unit_number}\n${unit.unit_type}`,
                unit.tenant || 'N/A',
                unit.expected.toLocaleString(),
                unit.arrears.toLocaleString(),
                unit.fines.toLocaleString(),
                unit.bills.toLocaleString(),
                unit.received.toLocaleString(),
                unit.rent_amount.toLocaleString(),
                unit.pending_balances.toLocaleString(),
                statusText
            ];

            // Alternating row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(14, yPosition - 5, pageWidth - 28, rowHeight, 'F');
            }

            rowData.forEach((data, idx) => {
                doc.text(String(data), xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
                xPos += colWidths[idx];
            });

            yPosition += rowHeight;
        });

        // Totals
        yPosition += 5;
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.setFillColor(255, 255, 200);
        doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');

        xPos = 14;
        const totals = [
            'TOTALS',
            '',
            '',
            propertiesUnits.reduce((sum, u) => sum + u.expected, 0).toLocaleString(),
            propertiesUnits.reduce((sum, u) => sum + u.arrears, 0).toLocaleString(),
            propertiesUnits.reduce((sum, u) => sum + u.fines, 0).toLocaleString(),
            propertiesUnits.reduce((sum, u) => sum + u.bills, 0).toLocaleString(),
            propertiesUnits.reduce((sum, u) => sum + u.received, 0).toLocaleString(),
            propertiesUnits.reduce((sum, u) => sum + u.rent_amount, 0).toLocaleString(),
            propertiesUnits.reduce((sum, u) => sum + u.pending_balances, 0).toLocaleString(),
            ''
        ];

        totals.forEach((total, idx) => {
            doc.text(String(total), xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
            xPos += colWidths[idx];
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        // Save the PDF
        doc.save(`All_Units_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF downloaded successfully!');
    };

    // Excel Generation Function
    const generateExcel = () => {
        if (typeof XLSX === 'undefined') {
            toast.error('Excel library not loaded. Please refresh the page.');
            return;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Summary Statistics Sheet
        const summaryData = [
            ['All Units Report'],
            [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
            [`Total Units: ${propertiesUnits.length}`],
            [],
            ['Summary Statistics'],
            [],
            ['Metric', 'Value'],
            ['Total Units', propertiesBreakdown.all_property_units?.count || 0],
            ['Occupied Units', propertiesBreakdown.occupied_units?.count || 0],
            ['Vacant Units', propertiesBreakdown.vacant_units?.count || 0],
            ['Total Payable', `KES ${(propertiesRevenue.revenue?.amounts?.expected_income?.count || 0).toLocaleString()}`],
            ['Total Rent', `KES ${(propertiesRevenue.revenue?.amounts?.total_rent?.count || 0).toLocaleString()}`],
            ['Amount Paid', `KES ${(propertiesRevenue.revenue?.amounts?.amount_paid?.count || 0).toLocaleString()}`],
            ['Total Arrears', `KES ${Number(propertiesRevenue.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}`],
            ['Total Fines', `KES ${(propertiesRevenue.revenue?.amounts?.total_fines?.count || 0).toLocaleString()}`],
            ['Total Bills', `KES ${(propertiesRevenue.revenue?.amounts?.total_bills?.count || 0).toLocaleString()}`],
            ['Total Balance', `KES ${(propertiesRevenue.revenue?.amounts?.total_balance?.count || 0).toLocaleString()}`],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Unit Details Sheet
        const unitData = [
            ['Unit Details'],
            [],
            ['Property Name', 'Unit Number', 'Unit Type', 'Floor', 'Tenant Name', 'Tenant Phone', 'Expected Rent', 'Previous Arrears', 'Fines', 'Bills', 'Amount Paid', 'Rent Amount', 'Pending Balance', 'Availability Status', 'Payment Status']
        ];

        propertiesUnits.forEach(unit => {
            unitData.push([
                unit.property_name,
                unit.unit_number,
                unit.unit_type,
                unit.floor_number,
                unit.tenant || 'N/A',
                unit.tenant_phone || 'N/A',
                unit.expected,
                unit.arrears,
                unit.fines,
                unit.bills,
                unit.received,
                unit.rent_amount,
                unit.pending_balances,
                unit.availability_status === 'available' ? 'Vacant' : 'Occupied',
                unit.payments_to_landlord ? 'To Landlord' : 'To Manager'
            ]);
        });

        // Add totals row
        unitData.push([
            'TOTALS',
            '',
            '',
            '',
            '',
            '',
            propertiesUnits.reduce((sum, u) => sum + u.expected, 0),
            propertiesUnits.reduce((sum, u) => sum + u.arrears, 0),
            propertiesUnits.reduce((sum, u) => sum + u.fines, 0),
            propertiesUnits.reduce((sum, u) => sum + u.bills, 0),
            propertiesUnits.reduce((sum, u) => sum + u.received, 0),
            propertiesUnits.reduce((sum, u) => sum + u.rent_amount, 0),
            propertiesUnits.reduce((sum, u) => sum + u.pending_balances, 0),
            '',
            ''
        ]);

        const wsUnits = XLSX.utils.aoa_to_sheet(unitData);

        // Set column widths
        wsUnits['!cols'] = [
            { wch: 30 }, // Property Name
            { wch: 15 }, // Unit Number
            { wch: 20 }, // Unit Type
            { wch: 10 }, // Floor
            { wch: 25 }, // Tenant Name
            { wch: 15 }, // Tenant Phone
            { wch: 15 }, // Expected Rent
            { wch: 15 }, // Previous Arrears
            { wch: 12 }, // Fines
            { wch: 12 }, // Bills
            { wch: 15 }, // Amount Paid
            { wch: 15 }, // Rent Amount
            { wch: 15 }, // Pending Balance
            { wch: 18 }, // Availability Status
            { wch: 18 }  // Payment Status
        ];

        XLSX.utils.book_append_sheet(wb, wsUnits, 'Unit Details');

        // Generate Excel file
        XLSX.writeFile(wb, `All_Units_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel file downloaded successfully!');
    };

    return (
        <>
            <DashboardHeader
                title="All your units"
                description="Manage All Your Properties in One Place"
                name="New unit"
                link="/add-property/multi-single-unit"
                hideSelect={true}
                hideLink={true}
                properties={properties}
                onSelectChange={handleSelectChange}

            />
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 py-1 px-4 mt-2">
                {loading ? (
                    Array(3).fill(0).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <div key={index}>
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))
                )}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5 ">
                <div className="flex justify-between items-center px-2">
                    <h4 className="text-md text-gray-600 my-4">All property List</h4>
                    <div className="md:flex justify-between space-x-2 space-y-2 my-2 md:my-0">
                        <div className="relative">

                            <button
                                onClick={() => setOpenDropdownId(openDropdownId === 'download' ? null : 'download')}
                                disabled={loading || propertiesUnits.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mt-2"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Export</span>
                                <ChevronDown className="w-4 h-4" />
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
                                                <div className="text-xs text-gray-500">Download CSV file</div>
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

                <div className="overflow-auto">
                    <table className="min-w-full  border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-3 text-left">Property</th>
                                <th className="px-6 py-3 text-left">Unit</th>
                                <th className="px-6 py-3 text-left">Tenant</th>

                                <th className="px-6 py-3 text-right">Exp Rent</th>
                                <th className="px-6 py-3 text-right">Prev Arrears</th>
                                <th className="px-6 py-3 text-right">Fines</th>
                                <th className="px-6 py-3 text-right">Bills</th>
                                <th className="px-6 py-3 text-right">Paid</th>
                                <th className="px-6 py-3 text-right">Rent</th>
                                <th className="px-6 py-3 text-right">Balances</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {loading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : (
                                propertiesUnits.map((unit, index) => (
                                    <tr key={index} className="odd:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">{unit.property_name}</td>

                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {unit.unit_number}
                                            <p className="text-gray-500 text-xs">{unit.unit_type}</p>
                                            <p className="text-gray-500 text-xs">Floor: {unit.floor_number}</p>
                                        </td>

                                        {/* Tenant */}
                                        <td className="px-4 py-2 text-xs">
                                            {unit.tenant}

                                            <p className="text-gray-700 text-xs">
                                                {unit.tenant_phone}
                                            </p>

                                            {unit.availability_status === 'available' ? (
                                                <>

                                                </>

                                            ) : (
                                                <>
                                                    <br />
                                                    <span className="bg-red-100 border border-red-400 text-red-600 px-2 text-xs rounded">
                                                        Occupied
                                                    </span>
                                                </>
                                            )}
                                            {unit.payments_to_landlord === false ? (
                                                <p className="text-green-600 text-xs whitespace-nowrap mt-1">Payment to Managers</p>

                                            ) : (
                                                <p className="text-red-600 text-xs whitespace-nowrap mt-1">Payment to Landlord</p>
                                            )}
                                        </td>

                                        {/* Rent Info */}
                                        <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                            {(unit.expected).toLocaleString()}
                                        </td>

                                        <td className="px-6 py-3 text-right font-mono text-orange-600">
                                            {unit.arrears.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                            {unit.fines.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-yellow-600">

                                            {unit.bills.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono">
                                            {unit.received.toLocaleString()}
                                        </td>

                                        <td className="px-6 py-3 text-right font-mono text-green-600">
                                            {(unit.rent_amount).toLocaleString()}
                                        </td>

                                        <td className="px-6 py-3 text-right font-mono text-red-600">
                                            {unit.pending_balances.toLocaleString()}
                                        </td>

                                        <td className="px-6 py-3 text-right text-xs whitespace-nowrap">
                                            {unit.availability_status === "available" ? (
                                                <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                                                    Vacant
                                                </span>
                                            ) : unit.pending_balances === 0 ? (
                                                <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                                                    No Balance
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">
                                                    With Balance
                                                </span>
                                            )}
                                        </td>
                                        {/* Actions Dropdown */}
                                        < td className="relative px-4 py-2 text-sm">
                                            <button
                                                onClick={() => toggleDropdown(unit.unit_id)}
                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                            >
                                                Actions
                                                <svg
                                                    className="w-5 h-5 ml-2 -mr-1"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>

                                            {openDropdownId === unit.unit_id && (
                                                <div className="absolute right-0 z-50 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="py-1">
                                                        {/* View Unit */}
                                                        <Link
                                                            to={`/property/single-unit/unit_id:${unit.unit_id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            View Unit
                                                        </Link>

                                                        {/* Add Tenant - Only if Available */}
                                                        {unit.availability_status === 'available' && (
                                                            <Link
                                                                to={`/tenants/add-personal-details/?property_id=${unit.property_id}&unit_id=${unit.unit_id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                                            >
                                                                Add Tenant
                                                            </Link>
                                                        )}

                                                        {/* Market Unit - Only if in market */}
                                                        {unit.availability_status === 'available' && (
                                                            <Link
                                                                to={`/property/market-unit?property_id=${unit.property_id}&unit_id=${unit.unit_id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-yellow-700 hover:bg-yellow-50"
                                                            >
                                                                Market Unit
                                                            </Link>
                                                        )}
                                                        <Link
                                                            to={`/tenants/edit-tenant-unit?tenant_id=${unit.tenant_id}&unit_id=${unit.unit_id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Edit Unit
                                                        </Link>
                                                        {unit.payments_to_landlord === false ? (
                                                            <button
                                                                onClick={() => setWhoToRecievePayment(unit.tenant_id, unit.unit_id, true)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-100"
                                                            >
                                                                Rent To Landlord
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setWhoToRecievePayment(unit.tenant_id, unit.unit_id, false)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-gray-100"
                                                            >
                                                                Rent To Us
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                        {propertiesUnits.length > 0 && (
                            <tfoot className="sticky bottom-0 bg-yellow-100 font-mono text-sm border-t-2 border-yellow-400 shadow-inner">
                                <tr>
                                    <td colSpan="3" className="px-4 py-2 text-center">Totals</td>

                                    <td className="px-4 py-2 text-right text-blue-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.expected, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-orange-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.arrears, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-yellow-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.fines, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-yellow-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.bills, 0).toLocaleString()}
                                    </td>

                                    <td className="px-4 py-2 text-right text-blue-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.received, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-green-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.rent_amount, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-indigo-600">
                                        {propertiesUnits.reduce((sum, u) => sum + u.pending_balances, 0).toLocaleString()}
                                    </td>
                                    <td colSpan="2"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {pagination && pagination.last_page > 1 && (
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
            )}
        </>
    );
};

export default UnitListing;
