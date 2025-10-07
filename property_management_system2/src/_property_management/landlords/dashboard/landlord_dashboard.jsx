import { useEffect, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { DashboardHeader } from "../../properties/dashboard/page_components";
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
        {[...Array(5)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-12 mx-auto" />
            </td>
        ))}
    </tr>
);

const ViewLandlord = () => {
    const [landlords, setLandlords] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showCheckboxes, setShowCheckboxes] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [landlordsToDelete, setLandlordsToDelete] = useState([]);

    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState([]);

    const [totalUnits, setTotalUnits] = useState("");
    const [selectedUnits, setSelectedUnits] = useState(10);

    useEffect(() => {

        fetchLandlord(currentPage)
    }, [baseUrl, token, confirmedSearch, selectedUnits])

    const fetchLandlord = async (page = 1) => {
        try {
            const response = await axios.get(
                `${baseUrl}/manage-landlord/get-all-landlord?query=${confirmedSearch}&pagination=${page}&per_page=${selectedUnits}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setLandlords(response.data.result)
            setCurrentPage(response.data.pagination.current_page);
            setPagination(response.data.pagination)
            setTotalUnits(response.data.pagination.total)

        } catch (error) {
            toast.error("Failed to fetch landlords. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value); // Update the search input state
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery); // Only confirm search upon submission
        console.log("Searching for:", searchQuery); // Replace this with your API call
    };

    const toggleDropdown = (landlordId) => {
        setOpenDropdownId(openDropdownId === landlordId ? null : landlordId);
    };

    const handleAction = (landlordId, action) => {
        setOpenDropdownId(null);

        if (action === 'delete') {
            if (!showCheckboxes) setShowCheckboxes(true);
            setLandlords(landlords.map(landlord =>
                landlord.landlord_info.landlord_id === landlordId ? { ...landlord, checked: true } : landlord
            ));
        }
        // Handle other actions...
    };

    const toggleCheckbox = (landlordId) => {
        setLandlords(landlords.map(landlord =>
            landlord.landlord_info.landlord_id === landlordId ? { ...landlord, checked: !landlord.checked } : landlord
        ));
    };

    const toggleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setLandlords(landlords.map(landlord => ({ ...landlord, checked: isChecked })));
    };

    const allChecked = landlords.length > 0 && landlords.every(landlord => landlord.checked);

    const showDeleteModal = () => {
        const selected = landlords.filter(t => t.checked);
        if (selected.length === 0) return;

        setLandlordsToDelete(selected);
        setShowDeleteConfirm(true);
    };

    const deletelandlords = async (landlordIds) => {
        const dataToSend = Array.isArray(landlordIds) && landlordIds.length > 1
            ? { landlord_ids: landlordIds }
            : { landlord_id: Array.isArray(landlordIds) ? landlordIds[0] : landlordIds };
        try {
            const response = await toast.promise(
                axios.delete(`${baseUrl}/manage-landlord/delete-and-restore-landlord`, {
                    data: dataToSend,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                {
                    loading: "Deleting your landlord ...",
                    success: "Landlord deleted successfully, check your bin.",
                    error: "Failed to delete landlord. Please try again later.",
                }
            );
            if (response.status === 200) {
                toast.success = response.message
                fetchLandlord()
            }
        } catch (error) {
            console.error(error.message);
            return false;
        }
    };


    const confirmDelete = async () => {
        const landlordIds = landlordsToDelete.map(t => t.landlord_info.landlord_id);

        if (landlordIds.length === 1) {
            const success = await deletelandlords(landlordIds[0]);
            if (success) {
                setLandlords(landlords.filter(landlord => landlord.landlord_info.landlord_id !== landlordIds[0]));
            }
        }
        else {
            const success = await deletelandlords(landlordIds);
            if (success) {
                setLandlords(landlords.filter(landlord =>
                    !landlordIds.includes(landlord.landlord_info.landlord_id)
                ));
            }
        }

        setShowDeleteConfirm(false);
        setLandlordsToDelete([]);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setLandlordsToDelete([]);
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

    const handleNextPage = () => {
        if (pagination && currentPage < pagination.last_page) {
            fetchLandlord(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchLandlord(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            fetchLandlord(pageNumber);
        }
    };

    const ordinal = (n) => {
        if (!n) return "";
        const s = ["th", "st", "nd", "rd"],
            v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    const handleUnitChange = (e) => {
        const value = parseInt(e.target.value);
        setSelectedUnits(value);

    };

    const options = [10, 25, 50, 100, 150, 200, 300, 400, 500].filter((num) => num < totalUnits);



    // PDF Generation Function
    const generatePDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Landlords Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 6;
        doc.text(`Total Landlords: ${landlords.length}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Summary Totals
        const totalExpected = landlords.reduce((sum, l) => sum + l.expected_revenue, 0);
        const totalOutstanding = landlords.reduce((sum, l) => sum + l.outstanding_revenue, 0);
        const totalPending = landlords.reduce((sum, l) => sum + l.pending_balance, 0);
        const totalFines = landlords.reduce((sum, l) => sum + l.fines, 0);
        const totalProperties = landlords.reduce((sum, l) => sum + l.properties, 0);
        const totalVacant = landlords.reduce((sum, l) => sum + l.vacant_units, 0);
        const totalOccupied = landlords.reduce((sum, l) => sum + l.occupied_units, 0);

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');

        const summaryStats = [
            { label: 'Total Properties', value: totalProperties },
            { label: 'Total Vacant Units', value: totalVacant },
            { label: 'Total Occupied Units', value: totalOccupied },
            { label: 'Expected Revenue', value: `KES ${totalExpected.toLocaleString()}` },
            { label: 'Outstanding Revenue', value: `KES ${totalOutstanding.toLocaleString()}` },
            { label: 'Pending Balances', value: `KES ${totalPending.toLocaleString()}` },
            { label: 'Total Fines', value: `KES ${totalFines.toLocaleString()}` },
        ];

        summaryStats.forEach((stat, index) => {
            if (index % 2 === 0 && index > 0) yPosition += 6;
            const xPos = index % 2 === 0 ? 14 : pageWidth / 2 + 10;
            doc.text(`${stat.label}: ${stat.value}`, xPos, yPosition);
            if (index % 2 === 1) yPosition += 6;
        });

        if (summaryStats.length % 2 === 1) yPosition += 6;
        yPosition += 12;

        // Landlords Table
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Landlord Details', 14, yPosition);
        yPosition += 10;

        // Process each landlord
        landlords.forEach((landlord, landlordIndex) => {
            const estimatedHeight = 25 + (landlord.landlord_details?.length || 0) * 5;

            if (yPosition + estimatedHeight > pageHeight - 20) {
                doc.addPage();
                yPosition = 20;
            }

            // Landlord Header
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setFillColor(240, 240, 240);
            doc.rect(14, yPosition - 5, pageWidth - 28, 8, 'F');

            doc.text(`${landlord.landlord_info.name}`, 16, yPosition);
            yPosition += 5;

            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.text(`Email: ${landlord.landlord_info.email} | Phone: ${landlord.landlord_info.phone} | Payment Day: ${ordinal(landlord.landlord_info.day_of_payment)}`, 16, yPosition);
            yPosition += 8;

            // Properties list
            if (landlord.landlord_details && landlord.landlord_details.length > 0) {
                doc.setFontSize(8);
                doc.setFont(undefined, 'bold');
                doc.text(`Properties (${landlord.properties}):`, 20, yPosition);
                yPosition += 5;

                doc.setFont(undefined, 'normal');
                landlord.landlord_details.forEach((property, idx) => {
                    if (yPosition > pageHeight - 15) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(`${String.fromCharCode(97 + idx)}. ${property.property_name}`, 25, yPosition);
                    yPosition += 4;
                });
                yPosition += 3;
            }

            // Financial Summary
            doc.setFontSize(8);
            const financialData = [
                `Units: Vacant ${landlord.vacant_units} | Occupied ${landlord.occupied_units}`,
                `Expected Revenue: KES ${landlord.expected_revenue.toLocaleString()}`,
                `Outstanding Revenue: KES ${landlord.outstanding_revenue.toLocaleString()}`,
                `Pending Balance: KES ${landlord.pending_balance.toLocaleString()}`,
                `Fines: KES ${landlord.fines.toLocaleString()}`
            ];

            financialData.forEach(line => {
                if (yPosition > pageHeight - 15) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += 4;
            });

            yPosition += 8; // Space between landlords
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
        doc.save(`Landlords_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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

        // Calculate totals
        const totalExpected = landlords.reduce((sum, l) => sum + l.expected_revenue, 0);
        const totalOutstanding = landlords.reduce((sum, l) => sum + l.outstanding_revenue, 0);
        const totalPending = landlords.reduce((sum, l) => sum + l.pending_balance, 0);
        const totalFines = landlords.reduce((sum, l) => sum + l.fines, 0);
        const totalProperties = landlords.reduce((sum, l) => sum + l.properties, 0);
        const totalVacant = landlords.reduce((sum, l) => sum + l.vacant_units, 0);
        const totalOccupied = landlords.reduce((sum, l) => sum + l.occupied_units, 0);

        // Summary Statistics Sheet
        const summaryData = [
            ['Landlords Report'],
            [`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
            [`Total Landlords: ${landlords.length}`],
            [],
            ['Summary Statistics'],
            [],
            ['Metric', 'Value'],
            ['Total Properties', totalProperties],
            ['Total Vacant Units', totalVacant],
            ['Total Occupied Units', totalOccupied],
            ['Expected Revenue', `KES ${totalExpected.toLocaleString()}`],
            ['Outstanding Revenue', `KES ${totalOutstanding.toLocaleString()}`],
            ['Pending Balances', `KES ${totalPending.toLocaleString()}`],
            ['Total Fines', `KES ${totalFines.toLocaleString()}`],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // Landlords Overview Sheet
        const landlordsData = [
            ['Landlords Overview'],
            [],
            ['Name', 'Email', 'Phone', 'Payment Day', 'Properties', 'Vacant Units', 'Occupied Units', 'Expected Revenue', 'Outstanding Revenue', 'Pending Balance', 'Fines']
        ];

        landlords.forEach(landlord => {
            landlordsData.push([
                landlord.landlord_info.name,
                landlord.landlord_info.email,
                landlord.landlord_info.phone,
                ordinal(landlord.landlord_info.day_of_payment),
                landlord.properties,
                landlord.vacant_units,
                landlord.occupied_units,
                landlord.expected_revenue,
                landlord.outstanding_revenue,
                landlord.pending_balance,
                landlord.fines
            ]);
        });

        // Add totals row
        landlordsData.push([
            'TOTALS',
            '',
            '',
            '',
            totalProperties,
            totalVacant,
            totalOccupied,
            totalExpected,
            totalOutstanding,
            totalPending,
            totalFines
        ]);

        const wsLandlords = XLSX.utils.aoa_to_sheet(landlordsData);
        wsLandlords['!cols'] = [
            { wch: 30 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 12 }, // Payment Day
            { wch: 12 }, // Properties
            { wch: 12 }, // Vacant Units
            { wch: 15 }, // Occupied Units
            { wch: 18 }, // Expected Revenue
            { wch: 18 }, // Outstanding Revenue
            { wch: 15 }, // Pending Balance
            { wch: 12 }  // Fines
        ];
        XLSX.utils.book_append_sheet(wb, wsLandlords, 'Landlords Overview');

        // Properties Details Sheet
        const propertiesData = [
            ['Landlord Properties'],
            [],
            ['Landlord Name', 'Landlord Email', 'Property Name']
        ];

        landlords.forEach(landlord => {
            if (landlord.landlord_details && landlord.landlord_details.length > 0) {
                landlord.landlord_details.forEach(property => {
                    propertiesData.push([
                        landlord.landlord_info.name,
                        landlord.landlord_info.email,
                        property.property_name
                    ]);
                });
            }
        });

        const wsProperties = XLSX.utils.aoa_to_sheet(propertiesData);
        wsProperties['!cols'] = [
            { wch: 30 }, // Landlord Name
            { wch: 30 }, // Landlord Email
            { wch: 40 }  // Property Name
        ];
        XLSX.utils.book_append_sheet(wb, wsProperties, 'Properties Details');

        // Generate Excel file
        XLSX.writeFile(wb, `Landlords_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Excel file downloaded successfully!');
    };


    return (
        <>
            <DashboardHeader
                title="Landlords Listing"
                description="Real-time information and activities of your landlords."
                name="Add landlord"
                link="/add-landlord/personal-information"
                hideSelect={false}
                hideLink={true}
            />

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center px-2 my-4">

                    <h4 className="text-md text-gray-600">All landlord list</h4>

                    <div className="md:flex justify-between items-center space-x-4 space-y-2">
                        <div className="flex items-center space-x-2 text-xs">
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
                                disabled={loading || landlords.length === 0}
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
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Search landlords..."
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
                                onClick={() => setLandlords(landlords.map(t => ({ ...t, checked: true })))}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => setLandlords(landlords.map(t => ({ ...t, checked: false })))}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Deselect All
                            </button>
                            <button
                                onClick={showDeleteModal}
                                disabled={landlords.filter(t => t.checked).length === 0}
                                className={`px-4 py-2 text-white rounded ${landlords.filter(t => t.checked).length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                Delete Selected ({landlords.filter(t => t.checked).length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative overflow-auto">
                    <div className="min-w-full">
                        <table className="w-full ">
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
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Landlord Details</th>
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Properties Details</th>
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Expected Revenue</th>
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Outstanding Revenue</th>
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Pending Balances</th>
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Fines</th>
                                    <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <TableRowSkeleton key={index} />
                                    ))
                                ) : (
                                    landlords.map((landlord, index) => (
                                        <tr key={index} className="bg-white divide-y divide-gray-200">
                                            {showCheckboxes && (
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={landlord.checked}
                                                        onChange={() => toggleCheckbox(landlord.landlord_info.landlord_id)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                </td>
                                            )}
                                            <td className="text-xs px-4 py-4">
                                                <div className="font-semibold text-black">
                                                    {landlord.landlord_info.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {landlord.landlord_info.email}
                                                </div>
                                                <div className="flex space-x-10 text-xs">
                                                    <div className="mt-1">
                                                        <p>Phone</p>
                                                        <p className="font-semibold text-gray-700">
                                                            {landlord.landlord_info.phone}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1">
                                                        <p>Date to pay</p>
                                                        <p className="font-semibold text-gray-700">
                                                            {ordinal(landlord.landlord_info.day_of_payment)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm">Total Properties: {landlord.properties}</span>
                                                {landlord.landlord_details?.map((property, index) => (
                                                    <div className="text-xs text-gray-800 italic" key={index}>
                                                        {String.fromCharCode(97 + index)}. {property.property_name}
                                                    </div>
                                                ))}

                                                <div className="flex space-x-10 text-xs">
                                                    <div className="mt-1">
                                                        <p>Vacant</p>
                                                        <p className="font-semibold text-gray-700">
                                                            {landlord.vacant_units}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1">
                                                        <p>Occupied</p>
                                                        <p className="font-semibold text-gray-700">
                                                            {landlord.occupied_units}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>


                                            <td className="py-4 px-4 text-sm text-gray-700 font-mono">
                                                <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">KES {(landlord.expected_revenue.toLocaleString() || 0)}</span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-700 font-mono">
                                                <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">KES {(landlord.outstanding_revenue.toLocaleString() || 0)}</span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-700 font-mono">
                                                <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">KES {(landlord.pending_balance.toLocaleString() || 0)}</span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-700 font-mono">
                                                <span className="bg-blue-100 border border-blue-400 text-blue-600 px-2 py-1 rounded">KES {landlord.fines.toLocaleString() || 0}</span>
                                            </td>
                                            <td className="relative px-4 py-2 text-sm">
                                                {/* Dropdown button - only in Actions column */}
                                                <button
                                                    onClick={() => toggleDropdown(landlord.landlord_info.landlord_id)}
                                                    className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Actions
                                                    <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>


                                                {openDropdownId === landlord.landlord_info.landlord_id && (
                                                    <div className="absolute right-0 z-30 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => navigate(`/landlords/view-landlord/${landlord.landlord_info.landlord_id}`)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                View landlord
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/edit-landlord/personal-information?landlord_id=${landlord.landlord_info.landlord_id}`)}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit Profile
                                                            </button>

                                                            <button
                                                                onClick={() => handleAction(landlord.landlord_info.landlord_id, 'delete')}
                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                            >
                                                                Delete landlord
                                                            </button>
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
                </div>
            </div>
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete {landlordsToDelete.length} selected landlord(s)?
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
    )
}

export default ViewLandlord
