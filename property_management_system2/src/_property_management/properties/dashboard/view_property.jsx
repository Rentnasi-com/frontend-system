import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { DashboardHeader, PropertyCard, QuickLinksCard } from "./page_components";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../../../AuthContext";
const Property = () => {
    const { property_id } = useParams();
    const [property, setProperty] = useState([]);
    const [propertyUnits, setPropertyUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status') || '';

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(15);
    const { hasPermission } = useAuth();

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);
    };

    const options = [10, 25, 50, 100, 150, 200].filter((num) => num < totalUnits);

    const fetchPropertyUnits = async (page = 1) => {
        const response = await axios.get(
            `${baseUrl}/manage-property/single-property/unit-listing?property_id=${property_id}&pagination=${page}&status=${status}&per_page=${selectedUnits}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
        setPropertyUnits(response.data.result);
        setLoading(false);
        setCurrentPage(response.data.pagination.current_page);
        setPagination(response.data.pagination)
        setTotalUnits(response.data.pagination.total)
    };

    const fetchPropertyDetails = async () => {
        const response = await axios.get(
            `${baseUrl}/manage-property/single-property/details?property_id=${property_id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );
        setProperty(response.data.result);
        setLoading(false);
    };

    useEffect(() => {
        if (property_id) {
            fetchPropertyDetails();
            fetchPropertyUnits();
        }
    }, [property_id, baseUrl, token, status, selectedUnits]);


    const stats = [
        {
            redirectUrl: `/property/view-property/${property_id}?status=`,
            iconSrc: property?.units_breakdown?.all_units?.images || "",
            label: "Total Units",
            value: property?.units_breakdown?.all_units?.count || 0,
        },
        {
            redirectUrl: `/property/view-property/${property_id}?status=occupied`,
            iconSrc: property?.units_breakdown?.occupied?.images || "",
            label: "Occupied Units",
            value: property?.units_breakdown?.occupied?.count || 0,
        },
        {
            redirectUrl: `/property/view-property/${property_id}?status=available`,
            iconSrc: property?.units_breakdown?.vacant?.images || "",
            label: "Vacant Units",
            value: property?.units_breakdown?.vacant?.count || 0,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.expected_income?.images || "",
            label: "Rent Payable",
            value: `KES ${(property?.revenue?.amounts?.total_rent?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.outstanding_balance?.images || "",
            label: "Previous Arrears",
            value: `KES ${Number(property?.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}`
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.total_fines?.images || "",
            label: "Total Bills",
            value: `KES ${(property?.revenue?.amounts?.total_bills?.count || "0").toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.total_fines?.images || "",
            label: "Total Fines",
            value: `KES ${(property?.revenue?.amounts?.total_fines?.count || "0").toLocaleString()}`,
        },

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.expected_income?.images || "",
            label: "Total Payable",
            value: `KES ${(property?.revenue?.amounts?.expected_income?.count || "0").toLocaleString()}`,
        },

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.amount_paid?.images || "",
            label: "Amount Paid",
            value: `KES ${(property?.revenue?.amounts?.amount_paid?.count || "0").toLocaleString()}`,
        },

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: property?.revenue?.amounts?.total_fines?.images || "",
            label: "Total Balance",
            value: `KES ${(property?.revenue?.amounts?.total_balance?.count || "0").toLocaleString()}`,
        },
    ];
    const quicks = [
        {
            url: "/reports",
            icon: "./../../../../assets/icons/png/reports.png",
            title: "Reports",
            description: "View all your property reports",
            bgColor: "bg-[#BAE5F5]"
        },
        {
            url: "/maintenance",
            icon: "./../../../../assets/icons/png/maintenance.png",
            title: "Maintenance",
            description: "Manage your maintenance request",
            bgColor: "bg-[#CCF0C0]"
        },
        {
            url: "/inquiries",
            icon: "./../../../../assets/icons/png/inquiries-1.png",
            title: "Inquiries",
            description: "View all your tenant inquiries",
            bgColor: "bg-[#E1D3FE]"
        }
    ]

    const generatePDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`${property?.property_name || 'Property'} - Units Report`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${property?.location_name || ''}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 6;
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Summary Statistics
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        const summaryStats = [
            { label: 'Total Units', value: property?.units_breakdown?.all_units?.count || 0 },
            { label: 'Occupied Units', value: property?.units_breakdown?.occupied?.count || 0 },
            { label: 'Vacant Units', value: property?.units_breakdown?.vacant?.count || 0 },
            { label: 'Rent Payable', value: `KES ${(property?.revenue?.amounts?.total_rent?.count || 0).toLocaleString()}` },
            { label: 'Previous Arrears', value: `KES ${Number(property?.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}` },
            { label: 'Total Bills', value: `KES ${(property?.revenue?.amounts?.total_bills?.count || 0).toLocaleString()}` },
            { label: 'Total Fines', value: `KES ${(property?.revenue?.amounts?.total_fines?.count || 0).toLocaleString()}` },
            { label: 'Total Payable', value: `KES ${(property?.revenue?.amounts?.expected_income?.count || 0).toLocaleString()}` },
            { label: 'Amount Paid', value: `KES ${(property?.revenue?.amounts?.amount_paid?.count || 0).toLocaleString()}` },
            { label: 'Total Balance', value: `KES ${(property?.revenue?.amounts?.total_balance?.count || 0).toLocaleString()}` },
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
        doc.setFontSize(8);
        const headers = ['Unit', 'Tenant', 'Rent', 'Arrears', 'Bills', 'Fines', 'Payable', 'Paid', 'Balance', 'Status'];
        const colWidths = [25, 35, 20, 20, 18, 18, 22, 20, 22, 25];
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
        propertyUnits.forEach((unit, index) => {
            if (yPosition > pageHeight - 20) {
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
            const statusText = unit.availability_status === 'available' ? 'Vacant' :
                (unit.pending_balances === 0 ? 'No Balance' : 'With Balance');

            const rowData = [
                `${unit.unit_number}\n${unit.unit_type}`,
                unit.tenant || 'N/A',
                unit.rent_amount.toLocaleString(),
                unit.arrears.toLocaleString(),
                unit.bills.toLocaleString(),
                unit.fines.toLocaleString(),
                unit.expected.toLocaleString(),
                unit.received.toLocaleString(),
                unit.pending_balances.toLocaleString(),
                statusText
            ];

            // Alternating row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(14, yPosition - 5, pageWidth - 28, 12, 'F');
            }

            rowData.forEach((data, idx) => {
                doc.text(String(data), xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
                xPos += colWidths[idx];
            });

            yPosition += 12;
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
            propertyUnits.reduce((sum, u) => sum + u.rent_amount, 0).toLocaleString(),
            propertyUnits.reduce((sum, u) => sum + u.arrears, 0).toLocaleString(),
            propertyUnits.reduce((sum, u) => sum + u.bills, 0).toLocaleString(),
            propertyUnits.reduce((sum, u) => sum + u.fines, 0).toLocaleString(),
            propertyUnits.reduce((sum, u) => sum + u.expected, 0).toLocaleString(),
            propertyUnits.reduce((sum, u) => sum + u.received, 0).toLocaleString(),
            propertyUnits.reduce((sum, u) => sum + u.pending_balances, 0).toLocaleString(),
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
        doc.save(`${property?.property_name || 'Property'}_Units_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
            [`${property?.property_name || 'Property'} - Units Report`],
            [`Location: ${property?.location_name || 'N/A'}`],
            [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
            [],
            ['Summary Statistics'],
            [],
            ['Metric', 'Value'],
            ['Property Type', property?.property_type || 'N/A'],
            ['Payment Status', property?.payments_to_landlord ? 'To Landlord' : 'To Manager'],
            ['Total Units', property?.units_breakdown?.all_units?.count || 0],
            ['Occupied Units', property?.units_breakdown?.occupied?.count || 0],
            ['Vacant Units', property?.units_breakdown?.vacant?.count || 0],
            ['Rent Payable', `KES ${(property?.revenue?.amounts?.total_rent?.count || 0).toLocaleString()}`],
            ['Previous Arrears', `KES ${Number(property?.revenue?.amounts?.total_arrears?.count ?? 0).toLocaleString()}`],
            ['Total Bills', `KES ${(property?.revenue?.amounts?.total_bills?.count || 0).toLocaleString()}`],
            ['Total Fines', `KES ${(property?.revenue?.amounts?.total_fines?.count || 0).toLocaleString()}`],
            ['Total Payable', `KES ${(property?.revenue?.amounts?.expected_income?.count || 0).toLocaleString()}`],
            ['Amount Paid', `KES ${(property?.revenue?.amounts?.amount_paid?.count || 0).toLocaleString()}`],
            ['Total Balance', `KES ${(property?.revenue?.amounts?.total_balance?.count || 0).toLocaleString()}`],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Unit Details Sheet
        const unitData = [
            ['Unit Details'],
            [],
            ['Unit Number', 'Unit Type', 'Floor', 'Tenant Name', 'Tenant Phone', 'Rent Amount', 'Arrears', 'Bills', 'Fines', 'Total Payable', 'Amount Paid', 'Balance', 'Availability Status', 'Payment Status']
        ];

        propertyUnits.forEach(unit => {
            unitData.push([
                unit.unit_number,
                unit.unit_type,
                unit.floor_number,
                unit.tenant || 'N/A',
                unit.tenant_phone || 'N/A',
                unit.rent_amount,
                unit.arrears,
                unit.bills,
                unit.fines,
                unit.expected,
                unit.received,
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
            propertyUnits.reduce((sum, u) => sum + u.rent_amount, 0),
            propertyUnits.reduce((sum, u) => sum + u.arrears, 0),
            propertyUnits.reduce((sum, u) => sum + u.bills, 0),
            propertyUnits.reduce((sum, u) => sum + u.fines, 0),
            propertyUnits.reduce((sum, u) => sum + u.expected, 0),
            propertyUnits.reduce((sum, u) => sum + u.received, 0),
            propertyUnits.reduce((sum, u) => sum + u.pending_balances, 0),
            '',
            ''
        ]);

        const wsUnits = XLSX.utils.aoa_to_sheet(unitData);

        // Set column widths
        wsUnits['!cols'] = [
            { wch: 15 }, // Unit Number
            { wch: 20 }, // Unit Type
            { wch: 10 }, // Floor
            { wch: 25 }, // Tenant Name
            { wch: 15 }, // Tenant Phone
            { wch: 15 }, // Rent Amount
            { wch: 15 }, // Arrears
            { wch: 12 }, // Bills
            { wch: 12 }, // Fines
            { wch: 15 }, // Total Payable
            { wch: 15 }, // Amount Paid
            { wch: 15 }, // Balance
            { wch: 18 }, // Availability Status
            { wch: 18 }  // Payment Status
        ];

        XLSX.utils.book_append_sheet(wb, wsUnits, 'Unit Details');

        // Generate Excel file
        XLSX.writeFile(wb, `${property?.property_name || 'Property'}_Units_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel file downloaded successfully!');
    };

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchPropertyUnits(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchPropertyUnits(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchPropertyUnits(pageNumber);
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
                await fetchPropertyUnits()
                setOpenDropdownId(null);
            }
        } catch (error) {
            setOpenDropdownId(null);
        }
    };

    return (
        <>
            <DashboardHeader
                title="Property details"
                description="View all information about your property"
            />
            <div className="m-4 p-2 bg-white rounded border">
                <div className="flex flex-col md:flex-row">

                    <div className="w-full md:w-1/3">
                        <img
                            src={property?.cover_image || "https://via.placeholder.com/300"}
                            alt={property?.property_name || "Property"}
                            className="rounded w-full h-44 object-cover"
                        />
                    </div>


                    <div className="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold text-lg">{property?.property_name}</h2>
                                <p className="text-gray-500 text-sm">{property?.location_name}</p>
                            </div>
                            <div className="flex space-x-3">
                                {hasPermission("tenant", "add") &&
                                    <Link
                                        to="/tenants/add-personal-details"
                                        className="flex space-x-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded text-xs px-2 py-2.5"
                                    >
                                        Add Tenant
                                    </Link>
                                }
                                {hasPermission("property", "edit") &&
                                    <Link
                                        to={`/edit-property/general-information?property_id=${property_id}`}
                                        className="flex space-x-3 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded text-xs px-2 py-2.5"
                                    >
                                        Edit Property
                                    </Link>
                                }
                                {hasPermission("property", "add") &&
                                    <Link
                                        to="/add-property/multi-single-unit"
                                        className="flex space-x-3 focus:outline-none text-white bg-yellow-700 hover:bg-yellow-800 focus:ring-4 focus:ring-yellow-300 font-medium rounded text-xs px-2 py-2.5"
                                    >
                                        Add Unit
                                    </Link>
                                }
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-semibold">Property Type: <span className="font-normal">{property?.property_type}</span></p>
                            <p className="text-xs font-semibold">Payment Status: <span className="font-normal">
                                {property?.payments_to_landlord === true ? "Payment to Landlord" : "Payment to Managers"}
                            </span>
                            </p>
                        </div>


                        <div className="mt-4">
                            <h3 className="text-red-500 font-semibold text-xs">Quick action</h3>
                            <div className="md:flex justify-between items-center gap-2 space-y-3 mt-2">
                                {quicks.map((quick, index) => (
                                    <QuickLinksCard
                                        key={index}
                                        url={quick.url}
                                        icon={quick.icon}
                                        title={quick.title}
                                        description={quick.description}
                                        bgColor={quick.bgColor}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full gap-4 py-1 px-4">
                {/* First 3 cards in grid-cols-3 */}
                <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-4">
                    {stats.slice(0, 3).map((stat, index) => (
                        <div key={index} className="">
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))}
                </div>

                {/* Remaining cards in grid-cols-5 */}
                <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                    {stats.slice(3).map((stat, index) => (
                        <div key={index + 3}>
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))}
                </div>

            </div >
            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5 ">
                <div className="flex justify-between item-center my-4 px-2">
                    <h4 className="text-md text-gray-600 ">All property List</h4>
                    <div className="grid md:grid-cols-2 gap-2 grid-cols-1">
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
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdownId(openDropdownId === 'download' ? null : 'download')}
                                disabled={loading || propertyUnits.length === 0}
                                className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaDownload className="w-4 h-4" />
                                Download
                                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {openDropdownId === 'download' && (
                                <div className="absolute left-0 z-50 w-40 mt-2 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                generatePDF();
                                                setOpenDropdownId(null);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                        >
                                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                            </svg>
                                            PDF Format
                                        </button>
                                        <button
                                            onClick={() => {
                                                generateExcel();
                                                setOpenDropdownId(null);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                        >
                                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                            </svg>
                                            Excel Format
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <div className="w-full overflow-auto">
                    <div className="">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-6 py-3 text-left">Property</th>
                                    <th className="px-6 py-3 text-left">Tenant</th>
                                    <th className="px-6 py-3 text-right">Exp Rent</th>
                                    <th className="px-6 py-3 text-right">Pre Arrears</th>
                                    <th className="px-6 py-3 text-right">Bills</th>
                                    <th className="px-6 py-3 text-right">Fines</th>
                                    <th className="px-6 py-3 text-right">Total Payable</th>
                                    <th className="px-6 py-3 text-right">Paid</th>
                                    <th className="px-6 py-3 text-right">Balances</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {propertyUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center text-sm my-3">No data found.</td>
                                    </tr>
                                ) : (
                                    propertyUnits.map((unit, index) => (
                                        <tr key={index} className="odd:bg-gray-50">
                                            <td className="px-4 py-2">
                                                {unit.unit_number}
                                                <p className="text-gray-500 text-xs">{unit.unit_type}</p>
                                                <p className="text-gray-500 text-xs">{unit.floor_number}</p>

                                            </td>
                                            <td className="px-4 py-2 text-xs">
                                                {unit.tenant}
                                                <p className="text-gray-700 text-xs">{unit.tenant_phone}</p>

                                                {unit.availability_status === 'available' ? (
                                                    <>
                                                    </>
                                                ) : (
                                                    <>
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
                                            <td className="px-6 py-3 text-right font-mono text-yellow-600">

                                                {(unit.rent_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-orange-600">

                                                {unit.arrears.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                                {unit.bills.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                                {unit.fines.toLocaleString()}
                                            </td>

                                            <td className="px-6 py-3 text-right font-mono">
                                                {(unit.expected).toLocaleString()}
                                            </td>


                                            <td className="px-6 py-3 text-right font-mono text-green-600">
                                                {unit.received.toLocaleString()}
                                            </td>

                                            <td className="px-6 py-3 text-right font-mono text-red-600">
                                                {unit.pending_balances.toLocaleString()}
                                            </td>


                                            <td className="px-6 py-3 text-xs text-right">
                                                {unit.availability_status === 'available' ? (
                                                    <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded whitespace-nowrap">
                                                        Vacant
                                                    </span>
                                                ) : (
                                                    <>
                                                        {unit.pending_balances === 0 ? (
                                                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded whitespace-nowrap">
                                                                No Balance
                                                            </span>
                                                        ) : (
                                                            <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded whitespace-nowrap">
                                                                With Balance
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </td>


                                            <td className="relative px-4 py-2 text-sm">
                                                {/* Dropdown button - only in Actions column */}
                                                <button
                                                    onClick={() => toggleDropdown(unit.unit_id)}
                                                    className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Actions
                                                    <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>


                                                {openDropdownId === unit.unit_id && (
                                                    <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                        <div className="py-1">
                                                            <Link
                                                                to={`/property/single-unit/unit_id:${unit.unit_id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                View Unit
                                                            </Link>
                                                            {unit.availability_status === 'available' && (
                                                                <Link
                                                                    to={`/property/market-unit?property_id=${unit.property_id}&unit_id=${unit.unit_id}`}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-yellow-700 hover:bg-yellow-50"
                                                                >
                                                                    Market Unit
                                                                </Link>
                                                            )}

                                                            {hasPermission("properties", "edit") &&
                                                                <Link
                                                                    to={`/tenants/edit-tenant-unit?tenant_id=${unit.tenant_id}&unit_id=${unit.unit_id}`}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Edit Unit
                                                                </Link>
                                                            }
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
                            {propertyUnits.length > 0 && (
                                <tfoot className="sticky bottom-0 bg-yellow-100 font-mono text-sm border-t-2 border-yellow-400 shadow-inner">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-2 text-center">Totals</td>
                                        <td className="px-4 py-2 text-right text-blue-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.rent_amount, 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right text-orange-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.arrears, 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right text-yellow-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.bills, 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right text-yellow-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.fines, 0).toLocaleString()}
                                        </td>

                                        <td className="px-4 py-2 text-right text-blue-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.expected, 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right text-green-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.received, 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-right text-indigo-600">
                                            {propertyUnits.reduce((sum, u) => sum + u.pending_balances, 0).toLocaleString()}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div >
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
    );
};

export default Property;
