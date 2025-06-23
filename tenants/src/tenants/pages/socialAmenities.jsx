
import { useState } from 'react';
import {
    BuildingOffice2Icon as BuildingHospitalIcon, 
    UserIcon as BabyCarriageIcon, 
    HomeIcon as HotelIcon, 
    WrenchIcon,
    BoltIcon,
    ShoppingCartIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const SocialAmenities = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedService, setSelectedService] = useState(null);

    // Local Amenities Data (3rd World Focus)
    const amenities = [
        {
            id: 1,
            title: "General Hospital",
            category: "health",
            icon: <BuildingHospitalIcon className="h-6 w-6 text-red-500" />,
            description: "24/7 emergency services. Free maternal care on Wednesdays.",
            contact: "+123 456 7890",
            hours: "Always Open",
            distance: "1.2 km away",
            rating: 3.8,
            price: "Free (Govt.)"
        },
        {
            id: 2,
            title: "Bright Stars Daycare",
            category: "childcare",
            icon: <BabyCarriageIcon className="h-6 w-6 text-blue-500" />,
            description: "Affordable childcare for working parents. Ages 1-5.",
            contact: "+123 987 6543",
            hours: "Mon-Fri, 7AM-6PM",
            distance: "500m away",
            rating: 4.2,
            price: "KES2,000/week"
        },
        {
            id: 3,
            title: "Reliable Plumbers",
            category: "repairs",
            icon: <WrenchIcon className="h-6 w-6 text-amber-600" />,
            description: "Fast response for leaks & pipe issues. Same-day service.",
            contact: "+123 555 6789",
            hours: "7AM-9PM Daily",
            distance: "Local (call for dispatch)",
            rating: 4.5,
            price: "KES1,005-50 per job"
        },
        {
            id: 4,
            title: "City Lodge Hotel",
            category: "lodging",
            icon: <HotelIcon className="h-6 w-6 text-green-600" />,
            description: "Budget short-stay rooms. Hourly/daily rates available.",
            contact: "+123 333 4444",
            hours: "24/7 Reception",
            distance: "2.5 km away",
            rating: 3.9,
            price: "KES1,000/night"
        },
        {
            id: 5,
            title: "Emergency Electrician",
            category: "repairs",
            icon: <BoltIcon className="h-6 w-6 text-yellow-500" />,
            description: "Fixes power cuts, wiring, and meter issues.",
            contact: "+123 222 1111",
            hours: "24/7 on-call",
            distance: "Local (call for dispatch)",
            rating: 4.7,
            price: "KES2,000+ (varies)"
        },
        {
            id: 6,
            title: "Community Market",
            category: "shopping",
            icon: <ShoppingCartIcon className="h-6 w-6 text-purple-500" />,
            description: "Fresh produce, grains, and household goods.",
            contact: "N/A (Open Market)",
            hours: "5AM-8PM Daily",
            distance: "300m away",
            rating: 4.0,
            price: "Negotiable"
        }
    ];

    // Filter services
    const filteredAmenities = activeFilter === 'all'
        ? amenities
        : amenities.filter(item => item.category === activeFilter);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Local Essential Services
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                    Find nearby hospitals, repairmen, and daily-need services.
                </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {['all', 'health', 'childcare', 'repairs', 'lodging', 'shopping'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-sm font-medium KES{,00activeFilter === filter
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                            }`}
                    >
                        {filter === 'all' ? 'All Services' :
                            filter === 'health' ? 'Hospitals' :
                                filter === 'repairs' ? 'Repairs' :
                                    filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAmenities.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="p-4">
                            <div className="flex items-start mb-3">
                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{service.title}</h3>
                                    <p className="text-gray-500 text-sm">{service.distance}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                {service.description}
                            </p>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center text-amber-600">
                                    <StarIcon className="h-4 w-4 mr-1" />
                                    <span>{service.rating}</span>
                                </div>
                                <div className="text-gray-700 font-medium">
                                    {service.price}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start">
                                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                        {selectedService.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedService.title}</h2>
                                        <p className="text-gray-500">{selectedService.distance}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center text-gray-700">
                                    <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    <span>{selectedService.hours}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    <a href={`tel:KES{,00selectedService.contact}`} className="hover:text-blue-600">
                                        {selectedService.contact}
                                    </a>
                                </div>
                                <div className="flex items-center">
                                    <StarIcon className="h-5 w-5 mr-2 text-amber-400" />
                                    <span className="text-gray-700">
                                        Rating: <strong>{selectedService.rating}/5</strong>
                                    </span>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-blue-800 font-medium">Price: {selectedService.price}</p>
                                </div>

                                <p className="text-gray-700">{selectedService.description}</p>

                                <div className="pt-4 flex justify-between">
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                                        <MapPinIcon className="h-5 w-5 inline mr-1" />
                                        View Map
                                    </button>
                                    <a
                                        href={`tel:KES{,00selectedService.contact}`}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        <PhoneIcon className="h-5 w-5 inline mr-1" />
                                        Call Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialAmenities;