import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DashboardHeader, PropertyCard } from "../../properties/dashboard/page_components";
import { useAuth } from "../../../AuthContext";
import { FaDownload } from "react-icons/fa";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        <td className="px-4 py-3"><SkeletonLoader className="w-12 h-5" /></td>
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
        </td>

        {[...Array(1)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-12" />
            </td>
        ))}
    </tr>
);

const StatCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="flex justify-between items-center">
            {/* <SkeletonLoader className="h-8 w-8 rounded" /> */}
            <SkeletonLoader className="h-6 w-6 rounded" />
        </div>
        <div className="mt-3">
            <SkeletonLoader className="h-4 w-24 mb-2" />
            {/* <SkeletonLoader className="h-6 w-16" /> */}
        </div>
    </div>
);

const Tenants = () => {
    const [properties, setProperties] = useState([])
    const [tenants, setTenants] = useState([])
    const [tenantsStats, setTenantsStats] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([])

    const [selectedProperty, setSelectedProperty] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [tenantsToDelete, setTenantsToDelete] = useState([]);
    const { hasPermission } = useAuth();

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(10);

    useEffect(() => {
        fetchProperties()
        fetchTenants(currentPage, selectedProperty)

    }, [currentPage, baseUrl, token, selectedProperty, confirmedSearch, selectedUnits])

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

    const fetchTenants = async (page = 1) => {
        try {
            const response = await axios.get(`${baseUrl}/manage-tenant/get-all-tenants?property_id=${selectedProperty}&query=${confirmedSearch}&pagination=${page}&per_page=${selectedUnits}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (response.data.success) {
                setTenants(response.data.result.data)
                setTenantsStats(response.data.tenant_stats)
                setCurrentPage(response.data.result.current_page);
                setPagination(response.data.result)
                setTotalUnits(response.data.result.total)
            }
        } catch (error) {
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchTenants(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchTenants(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchTenants(pageNumber);
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

    const handleSearch = (event) => {
        setSearchQuery(event.target.value); // Update the search input state
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery); // Only confirm search upon submission
        console.log("Searching for:", searchQuery); // Replace this with your API call
    };

    const stats = [
        {
            redirectUrl: "/property/property-listing",
            iconSrc: "../../../assets/icons/png/total_property.png",
            progress: 2.2,
            label: "Total Expected",
            value: `KES ${(tenantsStats?.total_expected || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/property-listing",
            iconSrc: "../../../assets/icons/png/total_property.png",
            progress: 2.2,
            label: "Total Rent",
            value: `KES ${(tenantsStats?.total_rent || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            progress: 4.2,
            label: "Total Bills",
            value: `KES ${(tenantsStats?.total_bills || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/all-property-units?status=",
            iconSrc: "../../../assets/icons/png/total_units.png",
            progress: 4.2,
            label: "Total Arrears",
            value: `KES ${(tenantsStats?.total_arrears || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            progress: 3.2,
            label: "Total Fines",
            value: `KES ${(tenantsStats?.total_fines || 0).toLocaleString()}`,
        },
        {
            redirectUrl: "/property/all-property-units?status=occupied",
            iconSrc: "../../../assets/icons/png/occupied_units.png",
            progress: 3.2,
            label: "Received Amount",
            value: `KES ${(tenantsStats?.total_received || 0).toLocaleString()}`,
        }
    ]

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    const handleAction = (tenantId, action) => {
        setOpenDropdownId(null);

        if (action === 'delete') {
            if (!showCheckboxes) setShowCheckboxes(true);
            setTenants(tenants.map(tenant =>
                tenant.id === tenantId ? { ...tenant, checked: true } : tenant
            ));
        }
        // Handle other actions...
    };

    const toggleCheckbox = (tenantId) => {
        setTenants(tenants.map(tenant =>
            tenant.id === tenantId ? { ...tenant, checked: !tenant.checked } : tenant
        ));
    };

    const toggleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setTenants(tenants.map(tenant => ({ ...tenant, checked: isChecked })));
    };

    const allChecked = tenants.length > 0 && tenants.every(tenant => tenant.checked);

    const showDeleteModal = () => {
        const selected = tenants.filter(t => t.checked);
        if (selected.length === 0) return; // Don't show if nothing selected

        setTenantsToDelete(selected);
        setShowDeleteConfirm(true);
    };

    const deleteTenants = async (tenantIds) => {
        const dataToSend = Array.isArray(tenantIds) && tenantIds.length > 1
            ? { tenant_ids: tenantIds }
            : { tenant_id: Array.isArray(tenantIds) ? tenantIds[0] : tenantIds };
        try {
            const response = await toast.promise(
                axios.delete(`${baseUrl}/manage-tenant/delete-and-restore-tenant`,
                    {
                        data: dataToSend,
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                {
                    loading: "Deleting your tenant ...",
                    success: "Tenant deleted successfully, check your bin.",
                    error: "Failed to delete tenant. Please try again later.",
                }
            )
            if (response.status === 200) {
                toast.success = response.message
                fetchTenants()
            }
        } catch (error) {
            console.error(error.message);
            return false;
        }
    };

    const confirmDelete = async () => {
        const tenantIds = tenantsToDelete.map(t => t.id);

        if (tenantIds.length === 1) {
            const success = await deleteTenants(tenantIds[0]);
            if (success) {
                setTenants(tenants.filter(tenant => tenant.id !== tenantIds[0]));
            }
        }
        else {
            const success = await deleteTenants(tenantIds);
            if (success) {
                setTenants(tenants.filter(tenant =>
                    !tenantIds.includes(tenant.id)
                ));
            }
        }

        setShowDeleteConfirm(false);
        setTenantsToDelete([]);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setTenantsToDelete([]);
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
        doc.text('Tenants Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 6;
        doc.text(`Total Tenants: ${tenants.length}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Summary Statistics
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        const summaryStats = [
            { label: 'Total Expected', value: `KES ${(tenantsStats?.total_expected || 0).toLocaleString()}` },
            { label: 'Total Rent', value: `KES ${(tenantsStats?.total_rent || 0).toLocaleString()}` },
            { label: 'Total Bills', value: `KES ${(tenantsStats?.total_bills || 0).toLocaleString()}` },
            { label: 'Total Arrears', value: `KES ${(tenantsStats?.total_arrears || 0).toLocaleString()}` },
            { label: 'Total Fines', value: `KES ${(tenantsStats?.total_fines || 0).toLocaleString()}` },
            { label: 'Received Amount', value: `KES ${(tenantsStats?.total_received || 0).toLocaleString()}` },
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

        // Tenants Table
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Tenant Details', 14, yPosition);
        yPosition += 10;

        // Process each tenant
        tenants.forEach((tenant, tenantIndex) => {
            // Check if we need a new page
            const estimatedHeight = 20 + (tenant.tenant_units?.length || 0) * 8;
            if (yPosition + estimatedHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }

            // Tenant Header
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setFillColor(240, 240, 240);
            doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');

            doc.text(`${tenant.name}`, 16, yPosition);
            yPosition += 5;

            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text(`Phone: ${tenant.phone} | Email: ${tenant.email || 'None'} | ID: ${tenant.id_or_passport_number}`, 16, yPosition);
            yPosition += 8;

            // Units table for this tenant
            if (tenant.tenant_units && tenant.tenant_units.length > 0) {
                // Units table headers
                doc.setFontSize(7);
                doc.setFont(undefined, 'bold');
                const headers = ['Property', 'Unit', 'Expected', 'Arrears', 'Rent', 'Bills', 'Fines'];
                const colWidths = [55, 40, 30, 30, 30, 30, 30];
                let xPos = 20;

                doc.setFillColor(250, 250, 250);
                doc.rect(20, yPosition - 4, pageWidth - 40, 6, 'F');

                headers.forEach((header, index) => {
                    doc.text(header, xPos, yPosition, { maxWidth: colWidths[index] - 2 });
                    xPos += colWidths[index];
                });

                yPosition += 6;
                doc.setFont(undefined, 'normal');

                // Units rows
                tenant.tenant_units.forEach((unit, unitIndex) => {
                    if (yPosition > pageHeight - 15) {
                        doc.addPage();
                        yPosition = 20;

                        // Repeat headers
                        doc.setFont(undefined, 'bold');
                        doc.setFillColor(250, 250, 250);
                        doc.rect(20, yPosition - 4, pageWidth - 40, 6, 'F');
                        xPos = 20;
                        headers.forEach((header, idx) => {
                            doc.text(header, xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
                            xPos += colWidths[idx];
                        });
                        yPosition += 6;
                        doc.setFont(undefined, 'normal');
                    }

                    xPos = 20;
                    const rowData = [
                        unit.property_name,
                        unit.unit_number,
                        unit.expected.toLocaleString(),
                        unit.arrears.toLocaleString(),
                        unit.rent.toLocaleString(),
                        unit.bills.toLocaleString(),
                        unit.fines.toLocaleString()
                    ];

                    // Alternating row colors
                    if (unitIndex % 2 === 0) {
                        doc.setFillColor(252, 252, 252);
                        doc.rect(20, yPosition - 4, pageWidth - 40, 7, 'F');
                    }

                    rowData.forEach((data, idx) => {
                        doc.text(String(data), xPos, yPosition, { maxWidth: colWidths[idx] - 2 });
                        xPos += colWidths[idx];
                    });

                    yPosition += 7;
                });
            } else {
                doc.setFontSize(8);
                doc.setTextColor(200, 0, 0);
                doc.text('No units assigned', 20, yPosition);
                doc.setTextColor(0, 0, 0);
                yPosition += 6;
            }

            yPosition += 5; // Space between tenants
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
        doc.save(`Tenants_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
            ['Tenants Report'],
            [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
            [`Total Tenants: ${tenants.length}`],
            [],
            ['Summary Statistics'],
            [],
            ['Metric', 'Value'],
            ['Total Expected', `KES ${(tenantsStats?.total_expected || 0).toLocaleString()}`],
            ['Total Rent', `KES ${(tenantsStats?.total_rent || 0).toLocaleString()}`],
            ['Total Bills', `KES ${(tenantsStats?.total_bills || 0).toLocaleString()}`],
            ['Total Arrears', `KES ${(tenantsStats?.total_arrears || 0).toLocaleString()}`],
            ['Total Fines', `KES ${(tenantsStats?.total_fines || 0).toLocaleString()}`],
            ['Received Amount', `KES ${(tenantsStats?.total_received || 0).toLocaleString()}`],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Tenants Overview Sheet
        const tenantsData = [
            ['Tenants Overview'],
            [],
            ['Tenant Name', 'Phone', 'Email', 'ID/Passport Number', 'Number of Units']
        ];

        tenants.forEach(tenant => {
            tenantsData.push([
                tenant.name,
                tenant.phone,
                tenant.email || 'None',
                tenant.id_or_passport_number,
                tenant.tenant_units?.length || 0
            ]);
        });

        const wsTenants = XLSX.utils.aoa_to_sheet(tenantsData);
        wsTenants['!cols'] = [
            { wch: 30 }, // Tenant Name
            { wch: 15 }, // Phone
            { wch: 30 }, // Email
            { wch: 20 }, // ID/Passport
            { wch: 15 }  // Number of Units
        ];
        XLSX.utils.book_append_sheet(wb, wsTenants, 'Tenants Overview');

        // Detailed Units Sheet
        const unitsData = [
            ['Tenant Units Details'],
            [],
            ['Tenant Name', 'Phone', 'Email', 'Property', 'Unit Number', 'Expected', 'Arrears', 'Rent', 'Bills', 'Fines']
        ];

        tenants.forEach(tenant => {
            if (tenant.tenant_units && tenant.tenant_units.length > 0) {
                tenant.tenant_units.forEach(unit => {
                    unitsData.push([
                        tenant.name,
                        tenant.phone,
                        tenant.email || 'None',
                        unit.property_name,
                        unit.unit_number,
                        unit.expected,
                        unit.arrears,
                        unit.rent,
                        unit.bills,
                        unit.fines
                    ]);
                });
            }
        });

        const wsUnits = XLSX.utils.aoa_to_sheet(unitsData);
        wsUnits['!cols'] = [
            { wch: 30 }, // Tenant Name
            { wch: 15 }, // Phone
            { wch: 30 }, // Email
            { wch: 30 }, // Property
            { wch: 15 }, // Unit Number
            { wch: 15 }, // Expected
            { wch: 15 }, // Arrears
            { wch: 15 }, // Rent
            { wch: 12 }, // Bills
            { wch: 12 }  // Fines
        ];
        XLSX.utils.book_append_sheet(wb, wsUnits, 'Unit Details');

        // Generate Excel file
        XLSX.writeFile(wb, `Tenants_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel file downloaded successfully!');
    };

    return (
        <>
            <DashboardHeader
                title="All your tenants"
                description="Manage all your tenant here"
                link="/tenants/add-personal-details"
                name="Add tenant"
                hideSelect={true}
                hideLink={true}
                properties={properties}
                onSelectChange={handleSelectChange}
            />

            {/* <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 py-1 px-4">
                {loading ? (
                    Array(3).fill(0).map((_, index) => (
                        <StatCardSkeleton key={index} />
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <div key={index} className={` `}>
                            <PropertyCard
                                redirectUrl={stat.redirectUrl}
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                                value={stat.value}
                            />
                        </div>
                    ))
                )}
            </div> */}

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center px-2 my-4">
                    <h4 className="text-md text-gray-600">All tenant list</h4>

                    <div className="md:flex justify-between items-center space-x-2 space-y-2">
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
                                disabled={loading || tenants.length === 0}
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
                        <form onSubmit={handleSubmitSearch} className="">
                            <label className="text-sm font-medium text-gray-900 sr-only">Search</label>
                            <div className="relative">
                                <div className="w-full absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Search Tenants..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="flex justify-between items-center px-4 text-xs">
                    {showCheckboxes && (
                        <div className="my-2 space-x-2">
                            <button
                                onClick={() => setTenants(tenants.map(t => ({ ...t, checked: true })))}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => setTenants(tenants.map(t => ({ ...t, checked: false })))}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Deselect All
                            </button>
                            <button
                                onClick={showDeleteModal}
                                disabled={tenants.filter(t => t.checked).length === 0}
                                className={`px-4 py-2 text-white rounded ${tenants.filter(t => t.checked).length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                Delete Selected ({tenants.filter(t => t.checked).length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative overflow-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100 text-left text-xs border-b sticky top-0 z-20">
                            <tr className="px-4 py-2">
                                {showCheckboxes && (
                                    <th className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Tenant Name</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Units</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : (
                                tenants.map((tenant, index) => (
                                    <tr key={index} className="border-b text-sm">
                                        {showCheckboxes && (
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={tenant.checked}
                                                    onChange={() => toggleCheckbox(tenant.id)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </td>
                                        )}
                                        <td className="px-4 py-2">
                                            {tenant.name}
                                            <br />
                                            <span className="text-gray-500 text-xs">
                                                Phone: {tenant.phone}
                                            </span>
                                            <br />
                                            <span className="text-gray-500 text-xs">
                                                Email: {tenant.email || 'None'}
                                            </span>
                                            <br />
                                            <span className="text-gray-500 text-xs">
                                                Id No: {tenant.id_or_passport_number}
                                            </span>
                                        </td>

                                        {tenant.tenant_units.length > 0 ? (
                                            <td className="px-4 py-2">
                                                <table className="w-full text-xs border rounded border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="px-2 py-1 text-left">Property</th>
                                                            <th className="px-2 py-1 text-left">Unit</th>
                                                            <th className="px-2 py-1 text-left">Expected</th>
                                                            <th className="px-2 py-1 text-left">Arrears</th>
                                                            <th className="px-2 py-1 text-left">Rent</th>
                                                            <th className="px-2 py-1 text-left">Bills</th>
                                                            <th className="px-2 py-1 text-left">Fines</th>
                                                            <th className="px-2 py-1 text-left">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tenant.tenant_units.map((unit, index) => (
                                                            <tr key={index} className="border-t border-gray-200 odd:bg-gray-50">
                                                                <td className="px-2 py-1 capitalize">{unit.property_name}</td>
                                                                <td className="px-2 py-1 capitalize">{unit.unit_number}</td>
                                                                <td className="px-2 py-1 font-mono">{(unit.expected).toLocaleString()}</td>
                                                                <td className="px-2 py-1 font-mono">{(unit.arrears).toLocaleString()}</td>
                                                                <td className="px-2 py-1 font-mono">{(unit.rent).toLocaleString()}</td>
                                                                <td className="px-2 py-1 font-mono">{(unit.bills).toLocaleString()}</td>
                                                                <td className="px-2 py-1 font-mono">{(unit.fines).toLocaleString()}</td>

                                                                <td className="relative px-2 py-1 text-xs">
                                                                    <Link to={`/property/single-unit/unit_id:${unit.unit_id}`} className="text-blue-600">View</Link>
                                                                </td>

                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        ) : (
                                            <td className="px-4 py-2 text-red-700">No units assigned.</td>
                                        )}

                                        <td className="relative px-4 py-2 text-sm">
                                            {/* Dropdown button - only in Actions column */}
                                            <button
                                                onClick={() => toggleDropdown(tenant.id)}
                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                            >
                                                Actions
                                                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>


                                            {openDropdownId === tenant.id && (
                                                <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="py-1">
                                                        <Link
                                                            to={`/tenants/view-tenant-units?tenant_id=${tenant.id}`}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            View Tenant
                                                        </Link>

                                                        {hasPermission("tenants", "edit") &&
                                                            <Link
                                                                to={`/tenants/edit-personal-details?tenant_id=${tenant.id}`}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit Profile
                                                            </Link>
                                                        }
                                                        {hasPermission("tenants", "delete") &&
                                                            <button
                                                                onClick={() => handleAction(tenant.id, 'delete')}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete Tenant
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
                    </table>
                </div>
            </div >

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
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete {tenantsToDelete.length} selected tenant(s)?
                            to recycle bin? This action can be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Tenants