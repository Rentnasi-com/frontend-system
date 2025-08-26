import React, { useState } from 'react';
import { SettingsBreadcrumbs } from "../../shared";
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
            <DashboardHeader
                title="Paybill PDF"
                description="Make Paybill PDF for single or multiple units"
            />
            <SettingsBreadcrumbs />
            <div className="bg-white border rounded border-gray-100 col-span-2 py-4 mx-4 h-full">
                <div className="flex justify-between items-center m-4">
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
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs border-y">
                                <tr className="py-2">
                                    <th className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedUnits.length === units.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                    </th>
                                    <th className="px-4 py-2">Unit</th>
                                    <th className="px-4 py-2">Payment Details</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.map((unit) => (
                                    <tr key={unit.id} className="border-b text-xs">
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedUnits.includes(unit.id)}
                                                onChange={() => handleUnitSelection(unit.id)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            {unit.unit}
                                            <br />
                                            <span className="text-gray-600 text-xs">
                                                {unit.address}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            Paybill Number: {unit.paybillNumber}
                                            <br />
                                            Account Number: {unit.accountNumber}
                                        </td>
                                        <td className="px-4 py-2 space-x-4">
                                            <button
                                                onClick={() => generatePDF(unit)}
                                                className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-5 py-2.5"
                                            >
                                                Generate PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MakePaybillPdf;