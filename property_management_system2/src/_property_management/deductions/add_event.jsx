import { useState } from 'react';
import { Calendar, DollarSign, FileText, User, Building2, Save, X, Plus, Trash2 } from 'lucide-react';
import { DashboardHeader } from '../properties/dashboard/page_components';

const AddEvent = () => {
    const [events, setEvents] = useState([
        {
            id: 1,
            description: '',
            time: '',
            amount: '',
            paidBy: 'landlord',
            eventType: 'repair'
        }
    ]);

    const eventTypes = [
        { value: 'repair', label: 'Repair', icon: '🔧' },
        { value: 'maintenance', label: 'Maintenance', icon: '🛠️' },
        { value: 'loan_deduction', label: 'Loan Deduction', icon: '💳' },
        { value: 'utility', label: 'Utility Payment', icon: '💡' },
        { value: 'insurance', label: 'Insurance', icon: '🛡️' },
        { value: 'tax', label: 'Tax Payment', icon: '📋' },
        { value: 'service_fee', label: 'Service Fee', icon: '💼' },
        { value: 'renovation', label: 'Renovation', icon: '🏗️' },
        { value: 'legal', label: 'Legal Fee', icon: '⚖️' },
        { value: 'other', label: 'Other', icon: '📝' }
    ];

    const addNewEvent = () => {
        setEvents([
            ...events,
            {
                id: Date.now(),
                description: '',
                time: '',
                amount: '',
                paidBy: 'landlord',
                eventType: 'repair'
            }
        ]);
    };

    const removeEvent = (id) => {
        if (events.length > 1) {
            setEvents(events.filter(event => event.id !== id));
        }
    };

    const updateEvent = (id, field, value) => {
        setEvents(events.map(event =>
            event.id === id ? { ...event, [field]: value } : event
        ));
    };

    const handleSubmit = () => {
        console.log('Events to save:', events);
        alert('Events saved successfully!');
        setEvents([{
            id: Date.now(),
            description: '',
            time: '',
            amount: '',
            paidBy: 'landlord',
            eventType: 'repair'
        }]);
    };

    const getTotalAmount = () => {
        return events.reduce((sum, event) => {
            const amount = parseFloat(event.amount) || 0;
            return sum + amount;
        }, 0);
    };

    return (
        <div>
            <DashboardHeader
                title="Add Property Events"
                description="Record repairs, deductions, and other property-related expenses"
                link="/tenants/add-personal-details"
                name="Add tenant"
                hideSelect={false}
                hideLink={false}
            />


            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div>
                    {/* Events List */}
                    <div className="space-y-4 mb-6">
                        {events.map((event, index) => (
                            <div key={event.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                                {/* Event Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                                            {index + 1}
                                        </span>
                                        Event {index + 1}
                                    </h3>
                                    {events.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeEvent(event.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Event Form Fields */}
                                <div className="p-6 space-y-5">
                                    {/* Event Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Event Type
                                        </label>
                                        <select
                                            value={event.eventType}
                                            onChange={(e) => updateEvent(event.id, 'eventType', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {eventTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.icon} {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FileText size={16} />
                                            Description
                                        </label>
                                        <textarea
                                            value={event.description}
                                            onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                                            placeholder="Enter detailed description of the event..."
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        {/* Date & Time */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Calendar size={16} />
                                                Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={event.time}
                                                onChange={(e) => updateEvent(event.id, 'time', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Amount */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <DollarSign size={16} />
                                                Amount (KES)
                                            </label>
                                            <input
                                                type="number"
                                                value={event.amount}
                                                onChange={(e) => updateEvent(event.id, 'amount', e.target.value)}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Paid By Radio Buttons */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <User size={16} />
                                            Paid By
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-3 cursor-pointer bg-blue-50 px-6 py-3 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors">
                                                <input
                                                    type="radio"
                                                    name={`paidBy-${event.id}`}
                                                    value="landlord"
                                                    checked={event.paidBy === 'landlord'}
                                                    onChange={(e) => updateEvent(event.id, 'paidBy', e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="font-medium text-gray-900">Landlord</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer bg-purple-50 px-6 py-3 rounded-lg border-2 border-purple-200 hover:bg-purple-100 transition-colors">
                                                <input
                                                    type="radio"
                                                    name={`paidBy-${event.id}`}
                                                    value="property_manager"
                                                    checked={event.paidBy === 'property_manager'}
                                                    onChange={(e) => updateEvent(event.id, 'paidBy', e.target.value)}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                                <span className="font-medium text-gray-900">Property Manager</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Another Event Button */}
                    <button
                        type="button"
                        onClick={addNewEvent}
                        className="w-full mb-6 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={20} />
                        Add Another Event
                    </button>

                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Total Events</p>
                                <p className="text-3xl font-bold">{events.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm mb-1">Total Amount</p>
                                <p className="text-3xl font-bold">KES {getTotalAmount().toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Save Events
                        </button>
                        <button
                            type="button"
                            onClick={() => setEvents([{
                                id: Date.now(),
                                description: '',
                                time: '',
                                amount: '',
                                paidBy: 'landlord',
                                eventType: 'repair'
                            }])}
                            className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <X size={20} />
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddEvent;