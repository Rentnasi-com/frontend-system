import React, { useState } from 'react';
import { Calendar, DollarSign, FileText, User, Filter, Search, Download, Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardHeader } from '../properties/dashboard/page_components';

const EventsListing = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterPaidBy, setFilterPaidBy] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const itemsPerPage = 10;

    const [events] = useState([
        {
            id: 1,
            eventType: 'repair',
            description: 'Fixed broken water pipe in Unit 3B. Replaced 2 meters of copper piping and installed new valve.',
            time: '2024-10-15T14:30:00',
            amount: 15000,
            paidBy: 'landlord',
            property: 'Sunset Apartments',
            unit: '3B'
        },
        {
            id: 2,
            eventType: 'loan_deduction',
            description: 'Monthly mortgage payment for Sunset Apartments property.',
            time: '2024-10-10T09:00:00',
            amount: 45000,
            paidBy: 'property_manager',
            property: 'Sunset Apartments',
            unit: 'N/A'
        },
        {
            id: 3,
            eventType: 'maintenance',
            description: 'Routine maintenance service - HVAC system inspection and filter replacement.',
            time: '2024-10-08T11:15:00',
            amount: 8500,
            paidBy: 'landlord',
            property: 'Green Valley',
            unit: 'All Units'
        },
        {
            id: 4,
            eventType: 'utility',
            description: 'Water bill payment for the month of September 2024.',
            time: '2024-10-05T16:45:00',
            amount: 12000,
            paidBy: 'property_manager',
            property: 'Sunset Apartments',
            unit: 'N/A'
        },
        {
            id: 5,
            eventType: 'insurance',
            description: 'Quarterly property insurance premium payment.',
            time: '2024-10-01T10:00:00',
            amount: 35000,
            paidBy: 'landlord',
            property: 'Green Valley',
            unit: 'N/A'
        },
        {
            id: 6,
            eventType: 'renovation',
            description: 'Kitchen renovation in Unit 5A - new cabinets, countertops, and appliances.',
            time: '2024-09-28T13:20:00',
            amount: 85000,
            paidBy: 'landlord',
            property: 'Sunset Apartments',
            unit: '5A'
        },
        {
            id: 7,
            eventType: 'tax',
            description: 'Property tax payment for fiscal year 2024.',
            time: '2024-09-25T08:30:00',
            amount: 52000,
            paidBy: 'property_manager',
            property: 'Green Valley',
            unit: 'N/A'
        },
        {
            id: 8,
            eventType: 'service_fee',
            description: 'Property management service fee for September 2024.',
            time: '2024-09-20T14:00:00',
            amount: 18000,
            paidBy: 'landlord',
            property: 'Sunset Apartments',
            unit: 'N/A'
        },
        {
            id: 9,
            eventType: 'legal',
            description: 'Legal consultation fees for tenant eviction process.',
            time: '2024-09-15T11:00:00',
            amount: 25000,
            paidBy: 'property_manager',
            property: 'Green Valley',
            unit: '2C'
        },
        {
            id: 10,
            eventType: 'repair',
            description: 'Replaced damaged door locks in Unit 1A for security upgrade.',
            time: '2024-09-10T15:30:00',
            amount: 6500,
            paidBy: 'landlord',
            property: 'Sunset Apartments',
            unit: '1A'
        }
    ]);

    const eventTypeConfig = {
        repair: { label: 'Repair', icon: '🔧', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        maintenance: { label: 'Maintenance', icon: '🛠️', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        loan_deduction: { label: 'Loan Deduction', icon: '💳', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        utility: { label: 'Utility', icon: '💡', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        insurance: { label: 'Insurance', icon: '🛡️', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        tax: { label: 'Tax', icon: '📋', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        service_fee: { label: 'Service Fee', icon: '💼', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
        renovation: { label: 'Renovation', icon: '🏗️', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
        legal: { label: 'Legal', icon: '⚖️', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
        other: { label: 'Other', icon: '📝', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = searchQuery === '' ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.unit.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || event.eventType === filterType;
        const matchesPaidBy = filterPaidBy === 'all' || event.paidBy === filterPaidBy;

        return matchesSearch && matchesType && matchesPaidBy;
    });

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

    const getTotalAmount = () => {
        return filteredEvents.reduce((sum, event) => sum + event.amount, 0);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Description', 'Amount', 'Paid By', 'Property', 'Unit'];
        const rows = filteredEvents.map(event => [
            formatDate(event.time),
            eventTypeConfig[event.eventType].label,
            event.description,
            event.amount,
            event.paidBy === 'landlord' ? 'Landlord' : 'Property Manager',
            event.property,
            event.unit
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events_report.csv';
        a.click();
    };

    return (
        <>
            <DashboardHeader
                title="Events Listing"
                description="View and manage events related to property deductions and payments."
                link="/payments/add-event"
                name="Add Events"
                hideSelect={false}
                hideLink={true}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by description, property, or unit..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filter by Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Types</option>
                                <option value="repair">Repair</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="loan_deduction">Loan Deduction</option>
                                <option value="utility">Utility</option>
                                <option value="insurance">Insurance</option>
                                <option value="tax">Tax</option>
                                <option value="service_fee">Service Fee</option>
                                <option value="renovation">Renovation</option>
                                <option value="legal">Legal</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Filter by Paid By */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By</label>
                            <select
                                value={filterPaidBy}
                                onChange={(e) => setFilterPaidBy(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All</option>
                                <option value="landlord">Landlord</option>
                                <option value="property_manager">Property Manager</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                    {paginatedEvents.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center shadow-md">
                            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
                        </div>
                    ) : (
                        paginatedEvents.map((event) => {
                            const config = eventTypeConfig[event.eventType];
                            return (
                                <div key={event.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left Section */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`${config.bg} ${config.color} px-3 py-1 rounded-full text-sm font-semibold border ${config.border}`}>
                                                        {config.icon} {config.label}
                                                    </span>
                                                    <span className={`${event.paidBy === 'landlord' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'} px-3 py-1 rounded-full text-sm font-medium border`}>
                                                        {event.paidBy === 'landlord' ? '👤 Landlord' : '🏢 Property Manager'}
                                                    </span>
                                                </div>

                                                <p className="text-gray-900 font-medium mb-2 leading-relaxed">{event.description}</p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={16} />
                                                        <span>{formatDate(event.time)} at {formatTime(event.time)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FileText size={16} />
                                                        <span>{event.property}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User size={16} />
                                                        <span>Unit {event.unit}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section */}
                                            <div className="text-right">
                                                <div className="text-lg font-bold font-mono text-gray-900 mb-3">
                                                    KES {event.amount.toLocaleString('en-KE')}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-4 py-2 rounded-lg font-medium ${currentPage === i + 1
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <FileText size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Event Type</label>
                                <p className="text-lg text-gray-900 mt-1">
                                    {eventTypeConfig[selectedEvent.eventType].icon} {eventTypeConfig[selectedEvent.eventType].label}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600">Description</label>
                                <p className="text-lg text-gray-900 mt-1">{selectedEvent.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Date & Time</label>
                                    <p className="text-lg text-gray-900 mt-1">
                                        {formatDate(selectedEvent.time)} at {formatTime(selectedEvent.time)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Amount</label>
                                    <p className="text-lg font-bold text-gray-900 mt-1">
                                        KES {selectedEvent.amount.toLocaleString('en-KE')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Property</label>
                                    <p className="text-lg text-gray-900 mt-1">{selectedEvent.property}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Unit</label>
                                    <p className="text-lg text-gray-900 mt-1">{selectedEvent.unit}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-600">Paid By</label>
                                <p className="text-lg text-gray-900 mt-1">
                                    {selectedEvent.paidBy === 'landlord' ? '👤 Landlord' : '🏢 Property Manager'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                Edit Event
                            </button>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EventsListing;