import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaDownload } from "react-icons/fa";
import { Button } from "../../../shared";
import toast from "react-hot-toast";
import { DashboardHeader, PropertyCard } from "./page_components";
import { useAuth } from "../../../AuthContext";
import { Building2, Home, Layers, MapPin, Plus, Sparkles, X } from "lucide-react";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
            <SkeletonLoader className="h-3 w-24" />
        </td>
        {[...Array(8)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-20 mx-auto" />
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
        </div>
    </div>
);

const PropertyListing = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState([]);
    const [revenue, setRevenue] = useState([]);

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(10);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    const { hasPermission } = useAuth();

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);

    };

    const options = [10, 25, 50, 100, 150, 200].filter((num) => num < totalUnits);

    const fetchProperties = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${baseUrl}/manage-property/view-properties/saved?pagination=${page}&query=${confirmedSearch}&per_page=${selectedUnits}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const result = response.data;

            setProperties(result.result?.data || result.data || []);
            setDetails(result.details?.breakdown || {});
            setRevenue(result.details?.revenue?.amounts || {});

            setCurrentPage(response.data.result.current_page);
            setTotalUnits(response.data.result.total);
            setPagination(response.data.result)

        } catch (err) {
            toast.error("Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties(currentPage);
    }, [token, confirmedSearch, selectedUnits]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchProperties(currentPage);
        }
    }, [currentPage]);

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchProperties(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchProperties(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchProperties(pageNumber);
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

    const generatePDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Properties Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Summary Statistics
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');

        const stats = [
            { label: 'Total Properties', value: details.all_properties?.count || 0 },
            { label: 'Total Units', value: details.all_property_units?.count || 0 },
            { label: 'Occupied Units', value: details.occupied_units?.count || 0 },
            { label: 'Vacant Units', value: details.vacant_units?.count || 0 },
            { label: 'Rent Payable', value: `KES ${(revenue.total_rent?.count || 0).toLocaleString()}` },
            { label: 'Previous Arrears', value: `KES ${(revenue.arrears?.count || 0).toLocaleString()}` },
            { label: 'Total Bills', value: `KES ${(revenue.total_bills?.count || 0).toLocaleString()}` },
            { label: 'Total Fines', value: `KES ${(revenue.fines?.count || 0).toLocaleString()}` },
            { label: 'Total Payable', value: `KES ${(revenue.expected_amount?.count || 0).toLocaleString()}` },
            { label: 'Amount Paid', value: `KES ${(revenue.amount_paid?.count || 0).toLocaleString()}` },
            { label: 'Total Balance', value: `KES ${(revenue.outstanding_balance?.count || 0).toLocaleString()}` },
        ];

        stats.forEach((stat, index) => {
            if (index % 2 === 0 && index > 0) yPosition += 6;
            const xPos = index % 2 === 0 ? 14 : pageWidth / 2 + 10;
            doc.text(`${stat.label}: ${stat.value}`, xPos, yPosition);
            if (index % 2 === 1) yPosition += 6;
        });

        if (stats.length % 2 === 1) yPosition += 6;
        yPosition += 10;

        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
        }

        // Properties Table
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Property Details', 14, yPosition);
        yPosition += 10;

        // Table headers
        doc.setFontSize(8);
        const headers = ['Property', 'Rent', 'Arrears', 'Bills', 'Fines', 'Payable', 'Paid', 'Balance'];
        const colWidths = [45, 20, 20, 18, 18, 22, 20, 22];
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
        properties.forEach((property, index) => {
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
            const rowData = [
                `${property.property_name}\n(O:${property.occupied_units} V:${property.vacant_units})`,
                property.rent.toLocaleString(),
                property.arrears.toLocaleString(),
                property.bills.toLocaleString(),
                property.fines.toLocaleString(),
                property.expected.toLocaleString(),
                property.received.toLocaleString(),
                property.balance.toLocaleString()
            ];

            // Alternating row colors
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
            }

            rowData.forEach((data, idx) => {
                doc.text(String(data), xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
                xPos += colWidths[idx];
            });

            yPosition += 10;
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
            properties.reduce((sum, u) => sum + u.rent, 0).toLocaleString(),
            properties.reduce((sum, u) => sum + u.arrears, 0).toLocaleString(),
            properties.reduce((sum, u) => sum + u.bills, 0).toLocaleString(),
            properties.reduce((sum, u) => sum + u.fines, 0).toLocaleString(),
            properties.reduce((sum, u) => sum + u.expected, 0).toLocaleString(),
            properties.reduce((sum, u) => sum + u.received, 0).toLocaleString(),
            properties.reduce((sum, u) => sum + u.balance, 0).toLocaleString()
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
        doc.save(`Property_Units_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF downloaded successfully!');
    };

    const generateExcel = () => {
        if (typeof XLSX === 'undefined') {
            toast.error('Excel library not loaded. Please refresh the page.');
            return;
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Summary Statistics Sheet
        const summaryData = [
            ['Property Units Report'],
            [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
            [],
            ['Summary Statistics'],
            [],
            ['Metric', 'Value'],
            ['Total Properties', details.all_properties?.count || 0],
            ['Total Units', details.all_property_units?.count || 0],
            ['Occupied Units', details.occupied_units?.count || 0],
            ['Vacant Units', details.vacant_units?.count || 0],
            ['Rent Payable', `KES ${(revenue.total_rent?.count || 0).toLocaleString()}`],
            ['Previous Arrears', `KES ${(revenue.arrears?.count || 0).toLocaleString()}`],
            ['Total Bills', `KES ${(revenue.total_bills?.count || 0).toLocaleString()}`],
            ['Total Fines', `KES ${(revenue.fines?.count || 0).toLocaleString()}`],
            ['Total Payable', `KES ${(revenue.expected_amount?.count || 0).toLocaleString()}`],
            ['Amount Paid', `KES ${(revenue.amount_paid?.count || 0).toLocaleString()}`],
            ['Total Balance', `KES ${(revenue.outstanding_balance?.count || 0).toLocaleString()}`],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Property Details Sheet
        const propertyData = [
            ['Property Details'],
            [],
            ['Property Name', 'Occupied Units', 'Vacant Units', 'Expected Rent', 'Previous Arrears', 'Bills', 'Fines', 'Total Payable', 'Amount Paid', 'Balance', 'Payment Status']
        ];

        properties.forEach(property => {
            propertyData.push([
                property.property_name,
                property.occupied_units,
                property.vacant_units,
                property.rent,
                property.arrears,
                property.bills,
                property.fines,
                property.expected,
                property.received,
                property.balance,
                property.payments_to_landlord ? 'To Landlord' : 'To Manager'
            ]);
        });

        // Add totals row
        propertyData.push([
            'TOTALS',
            properties.reduce((sum, p) => sum + p.occupied_units, 0),
            properties.reduce((sum, p) => sum + p.vacant_units, 0),
            properties.reduce((sum, p) => sum + p.rent, 0),
            properties.reduce((sum, p) => sum + p.arrears, 0),
            properties.reduce((sum, p) => sum + p.bills, 0),
            properties.reduce((sum, p) => sum + p.fines, 0),
            properties.reduce((sum, p) => sum + p.expected, 0),
            properties.reduce((sum, p) => sum + p.received, 0),
            properties.reduce((sum, p) => sum + p.balance, 0),
            ''
        ]);

        const wsProperties = XLSX.utils.aoa_to_sheet(propertyData);

        // Set column widths
        wsProperties['!cols'] = [
            { wch: 30 }, // Property Name
            { wch: 15 }, // Occupied Units
            { wch: 12 }, // Vacant Units
            { wch: 15 }, // Expected Rent
            { wch: 15 }, // Previous Arrears
            { wch: 12 }, // Bills
            { wch: 12 }, // Fines
            { wch: 15 }, // Total Payable
            { wch: 15 }, // Amount Paid
            { wch: 15 }, // Balance
            { wch: 15 }  // Payment Status
        ];

        XLSX.utils.book_append_sheet(wb, wsProperties, 'Property Details');

        // Generate Excel file
        XLSX.writeFile(wb, `Property_Units_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel file downloaded successfully!');
    };

    const stats = [
        {
            redirectUrl: "/property/property-listing",
            iconSrc: "../../../assets/icons/png/total_property.png",
            progress: 2.2,
            label: "Total Properties",
            value: details.all_properties?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            progress: 4.2,
            label: "Total Units",
            value: details.all_property_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            progress: 3.2,
            label: "Occupied Units",
            value: details.occupied_units?.count,
        },
        {
            redirectUrl: "/property/all-property-units?status=available",
            iconSrc: "../../../assets/icons/png/vacate.png",
            progress: 2,
            label: "Vacant units",
            value: details.vacant_units?.count,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 20,
            label: "Rent Payable",
            value: `KES ${(revenue.total_rent?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 80,
            label: "Previous Arrears",
            value: `KES ${(revenue.arrears?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/outstanding_balance.png",
            progress: 3.4,
            label: "Total Bills",
            value: `KES ${(revenue.total_bills?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Total fines",
            value: `KES ${(revenue.fines?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Total Payable",
            value: `KES ${(revenue.expected_amount?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Amount Paid",
            value: `KES ${(revenue.amount_paid?.count || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 5,
            label: "Total Balance",
            value: `KES ${(revenue.outstanding_balance?.count || 0).toLocaleString()}`,
        },
    ];

    const openDeleteModal = (property) => {
        setItemToDelete(property);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            try {
                const deleteItem = await axios.post(
                    `${baseUrl}/manage-property/delete?property_id=${itemToDelete.id}`, {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (deleteItem.status === 200 || deleteItem.status === 204) {
                    setProperties((prevProperties) =>
                        prevProperties.filter((property) => property.id !== itemToDelete.id)
                    );
                    toast.success(`${itemToDelete.property_name} moved to recycle bin successfully.`);
                } else {
                    console.error("Failed to delete item.");
                }
            } catch (error) {
                console.error("Error deleting item:", error);
            } finally {
                setIsModalOpen(false);
                setItemToDelete(null);
            }
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery);
    };

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    const setWhoToRecievePayment = async (propertyId, toLandlord) => {
        try {
            const response = await axios.patch(`${baseUrl}/settings/payment/details`, {
                property_id: propertyId,
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
                await fetchProperties()
                setOpenDropdownId(null);
            }
        } catch (error) {
            setOpenDropdownId(null);
        }
    };

    const [isOpen, setIsOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState(null);
    const [propertyId, setPropertyId] = useState(null);
    const [totalPropertyUnits, setTotalPropertyUnits] = useState(null);

    const steps = [
        {
            id: 1,
            title: 'Property Name & Location',
            description: 'Edit basic property details and address',
            icon: MapPin,
            color: 'from-blue-500 to-cyan-500',
            link: `/edit-property/general-information?property_id=${propertyId}`
        },
        {
            id: 2,
            title: 'Amenities',
            description: 'Manage property amenities and features',
            icon: Sparkles,
            color: 'from-purple-500 to-pink-500',
            link: `edit-property/amenities?property_id=${propertyId}`
        },
        {
            id: 3,
            title: 'Property Type',
            description: 'Configure property type and category',
            icon: Home,
            color: 'from-amber-500 to-orange-500',
            link: `/edit-property/property-type?property_id=${propertyId}`
        },

        {
            id: 4,
            title: totalPropertyUnits > 1 ? 'Edit Multiple Units' : 'Edit Single Unit',
            description: totalPropertyUnits > 1
                ? 'Manage floors and unit configurations'
                : 'Edit single unit details and configuration',
            icon: Layers,
            color: 'from-green-500 to-emerald-500',
            link: totalPropertyUnits > 1 ? `/edit-property/multi-unit?property_id=${propertyId}` : `/edit-property/single-unit?property_id=${propertyId}`

        }

    ];

    const additionalActions = [
        {
            id: 'add-floor',
            title: 'Add Floor',
            description: 'Add a new floor to the property',
            icon: Plus,
            color: 'from-indigo-500 to-blue-500',
            link: `/add-property/add-floors?property_id=${propertyId}`
        },
        {
            id: 'add-unit',
            title: 'Add Unit',
            description: 'Add a new unit to existing floors',
            icon: Plus,
            color: 'from-rose-500 to-red-500',
            link: '/add-property/multi-single-unit'
        }
    ];
    return (
        <>
            <DashboardHeader
                title="All your property"
                description="Manage All Your Properties in One Place"
                name="Add property"
                link="/add-property/general-information"
                hideSelect={false}
                hideLink={true}
            />
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 py-1 px-4 mt-2">
                {loading ? (
                    Array(8).fill(0).map((_, index) => (
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
                <div className="flex justify-between items-center px-2 my-4">
                    <h4 className="text-md text-gray-600">All property List</h4>
                    <div className="md:flex justify-between items-center space-x-2 space-y-2">
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
                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdownId(openDropdownId === 'download' ? null : 'download')}
                                disabled={loading || properties.length === 0}
                                className="flex items-center gap-2 px-4 py-2  w-full bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

                        <form onSubmit={handleSubmitSearch} className="">
                            <label className="text-sm font-medium text-gray-900 sr-only">Search</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Search property..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <div className="overflow-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                            <tr>
                                <th className="px-6 py-3 text-left">Property</th>
                                <th className="px-6 py-3 text-right">Exp Rent</th>
                                <th className="px-6 py-3 text-right">Pre Arrears</th>
                                <th className="px-6 py-3 text-right">Bills</th>
                                <th className="px-6 py-3 text-right">Fines</th>
                                <th className="px-6 py-3 text-right">Total Payable</th>
                                <th className="px-6 py-3 text-right">Paid</th>
                                <th className="px-6 py-3 text-right">Balances</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm">
                            {loading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : (
                                properties.map((property, index) => (
                                    <tr key={index} className="odd:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <p className="font-medium">{property.property_name}</p>
                                            <p className="text-gray-500 text-xs">Occupied: {property.occupied_units}</p>
                                            <p className="text-gray-500 text-xs">Vacant: {property.vacant_units}</p>
                                            {property.payments_to_landlord === false ? (
                                                <p className="text-green-600 text-xs">Payment to Managers</p>
                                            ) : (
                                                <p className="text-red-600 text-xs">Payment to Landlord</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                            {property.rent.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-orange-600">
                                            {property.arrears.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                            {property.bills.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                            {property.fines.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono">
                                            {property.expected.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-green-600">
                                            {property.received.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-red-600">
                                            {property.balance.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 relative text-sm">
                                            <button
                                                onClick={() => toggleDropdown(property.id)}
                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                            >
                                                Actions
                                                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {openDropdownId === property.id && (
                                                <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="py-1">
                                                        <Link
                                                            to={`/property/view-property/${property.id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            View Property
                                                        </Link>
                                                        {hasPermission("properties", "add") &&
                                                            <Link
                                                                onClick={() => {
                                                                    setPropertyId(property.id);
                                                                    setIsOpen(true);
                                                                    setTotalPropertyUnits(property.total_units)
                                                                }}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit Property
                                                            </Link>
                                                        }
                                                        {property.payments_to_landlord === false ? (
                                                            <button
                                                                onClick={() => setWhoToRecievePayment(property.id, true)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-blue-600 hover:bg-gray-100"
                                                            >
                                                                Rent To Landlord
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setWhoToRecievePayment(property.id, false)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-gray-100"
                                                            >
                                                                Rent To Us
                                                            </button>
                                                        )}
                                                        <hr />

                                                        {hasPermission("properties", "delete") &&
                                                            <button
                                                                onClick={() => openDeleteModal(property)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete Property
                                                            </button>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {properties.length > 0 && (
                            <tfoot className="sticky bottom-0 bg-yellow-100 font-mono text-sm border-t-2 border-yellow-400 shadow-inner">
                                <tr>
                                    <td className="px-4 py-2 text-center">Totals</td>
                                    <td className="px-4 py-2 text-right text-blue-600">
                                        {properties.reduce((sum, u) => sum + u.rent, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-orange-600">
                                        {properties.reduce((sum, u) => sum + u.arrears, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-yellow-600">
                                        {properties.reduce((sum, u) => sum + u.bills, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-yellow-600">
                                        {properties.reduce((sum, u) => sum + u.fines, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-blue-600">
                                        {properties.reduce((sum, u) => sum + u.expected, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-green-600">
                                        {properties.reduce((sum, u) => sum + u.received, 0).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-right text-indigo-600">
                                        {properties.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div >

            {isModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 text-center mt-2">
                            Are you sure you want to move this property{" "}
                            <span className="font-bold">{itemToDelete?.property_name}</span> to recycle bin? This action
                            can be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleDelete}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )
            }

            {
                isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
                        {/* Modal Content */}
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-6 rounded-t-2xl">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Edit Property</h2>
                                </div>
                                <p className="text-blue-100">Choose which aspect of the property you'd like to edit</p>
                            </div>

                            {/* Steps Grid */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {steps.map((step) => {
                                        const Icon = step.icon;
                                        return (
                                            <Link
                                                key={step.id}
                                                to={step.link}

                                                className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 text-left hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
                                            >
                                                {/* Gradient Background on Hover */}
                                                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                                <div className="relative z-10">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`p-3 bg-gradient-to-br ${step.color} rounded-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                                            <Icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-xs font-bold px-2 py-1 bg-gradient-to-r ${step.color} text-white rounded-full`}>
                                                                    Step {step.id}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-gray-900">
                                                                {step.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 group-hover:text-gray-700">
                                                                {step.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Arrow indicator */}
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Additional Actions */}
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {additionalActions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link
                                                key={action.id}
                                                to={action.link}
                                                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-5 text-left hover:border-solid hover:from-white hover:to-white hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 bg-gradient-to-br ${action.color} rounded-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-base font-semibold text-gray-800 mb-1">
                                                            {action.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
                                <p className="text-xs text-gray-500 text-center">
                                    Select an option above to edit your property details
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                pagination && pagination.last_page > 1 && (
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
                )
            }
        </>
    );
};

export default PropertyListing;