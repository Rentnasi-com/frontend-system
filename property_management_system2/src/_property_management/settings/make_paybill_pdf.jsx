import { useState } from 'react';
import DashboardHeader from "../properties/dashboard/page_components/dashboard_header";

const MakePaybillPdf = () => {
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    // Sample data - replace with your actual data
    const units = [
        {
            id: 1,
            unit: "2B, 1st Floor, Ebenezer God's Dwellings",
            address: "Diamond in the sky, Kasarani, Nairobi, Kenya",
            paybillNumber: "522522",
            accountNumber: "62628#17"
        },
        {
            id: 2,
            unit: "3A, 2nd Floor, Grace Apartments",
            address: "Paradise Estate, Westlands, Nairobi, Kenya",
            paybillNumber: "522522",
            accountNumber: "62628#18"
        },
        // Add more units as needed
    ];

    const generatePDF = async (unitData, fileName = null) => {
        // Dynamic import of jsPDF
        const { jsPDF } = await import('jspdf');

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Set up the green background for header (full width in landscape)
        doc.setFillColor(76, 175, 80); // M-Pesa green
        doc.rect(0, 0, 297, 80, 'F');

        // LIPA NA text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.text('LIPA NA MPESA', 20, 45);


        // White background for payment details
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 80, 297, 130, 'F');

        // PAYBILL NUMBER section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(76, 175, 80);
        doc.text('PAYBILL NUMBER', 20, 110);

        // Paybill number boxes - larger and more prominent
        const paybillDigits = unitData.paybillNumber.split('');
        let startX = 20;
        const boxWidth = 25;
        const boxHeight = 25;

        paybillDigits.forEach((digit, index) => {
            // Green border for boxes
            doc.setDrawColor(76, 175, 80);
            doc.setLineWidth(2);
            doc.rect(startX + (index * (boxWidth + 5)), 120, boxWidth, boxHeight, 'S');

            // Large bold digits
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            const textWidth = doc.getTextWidth(digit);
            doc.text(digit, startX + (index * (boxWidth + 5)) + (boxWidth - textWidth) / 2, 138);
        });

        // ACCOUNT NUMBER section
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(76, 175, 80);
        doc.text('ACCOUNT NUMBER', 20, 170);

        // Account number box - large single box
        doc.setDrawColor(76, 175, 80);
        doc.setLineWidth(2);
        doc.rect(20, 180, 250, 25, 'S');

        // Account number text
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);
        doc.text(unitData.accountNumber, 25, 198);

        // Save the PDF with custom filename if provided
        const pdfFileName = fileName || `Paybill_${unitData.unit.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(pdfFileName);
    };

    const generateMultiplePDFs = async () => {
        const selectedUnitData = units.filter(unit => selectedUnits.includes(unit.id));

        for (let i = 0; i < selectedUnitData.length; i++) {
            const unit = selectedUnitData[i];
            const fileName = `${i + 1}.pdf`;
            await generatePDF(unit, fileName);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    };

    const handleUnitSelection = (unitId) => {
        setSelectedUnits(prev =>
            prev.includes(unitId)
                ? prev.filter(id => id !== unitId)
                : [...prev, unitId]
        );
    };

    const handleSelectAll = () => {
        setSelectedUnits(selectedUnits.length === units.length ? [] : units.map(unit => unit.id));
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value); // Update the search input state
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery); // Only confirm search upon submission
        console.log("Searching for:", searchQuery); // Replace this with your API call
    };

    return (
        <>
            <div className="">
                <div className="">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Properties List</h4>
                        <div className="flex space-x-2">
                            {selectedUnits.length > 0 && (
                                <button
                                    onClick={generateMultiplePDFs}
                                    className="focus:outline-none text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                >
                                    Generate {selectedUnits.length} PDFs
                                </button>
                            )}
                            <form onSubmit={handleSubmitSearch} className="w-72">
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
                                        placeholder="Search Tenants..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </form>
                        </div>

                    </div>
                    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th scope="col" className="pl-6 pr-3 py-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUnits.length === units.length && units.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition"
                                                />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Unit Details
                                        </th>
                                        <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Payment Information
                                        </th>
                                        <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {units.length > 0 ? (
                                        units.map((unit, index) => (
                                            <tr
                                                key={unit.id}
                                                className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                            >
                                                <td className="pl-6 pr-3 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUnits.includes(unit.id)}
                                                        onChange={() => handleUnitSelection(unit.id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-start">
                                                        <div className="bg-blue-50 rounded-lg p-2 mr-3">
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{unit.unit}</div>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {unit.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center">
                                                            <div className="bg-green-50 rounded-lg p-1.5 mr-2">
                                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500">Paybill:</span>
                                                                <span className="text-sm font-semibold text-gray-900 ml-2">{unit.paybillNumber}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="bg-purple-50 rounded-lg p-1.5 mr-2">
                                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500">Account:</span>
                                                                <span className="text-sm font-semibold text-gray-900 ml-2">{unit.accountNumber}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => generatePDF(unit)}
                                                        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Generate PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="bg-gray-100 rounded-full p-3 mb-3">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No units found</h3>
                                                    <p className="text-gray-500">Add units to see them listed here</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Optional: Table footer with bulk actions */}
                        {selectedUnits.length > 0 && (
                            <div className="bg-blue-50 border-t border-blue-100 px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-sm text-blue-700 font-medium">
                                            {selectedUnits.length} unit{selectedUnits.length !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                            Bulk Generate PDF
                                        </button>
                                        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                                            Export Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MakePaybillPdf;