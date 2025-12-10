import { Bell, CreditCard, FileText, HelpCircle, Home, Recycle, Settings, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SettingsAside = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        {
            title: 'Dashboard',
            path: '/settings',
            icon: Home,
            description: 'Overview and settings'
        },
        {
            title: 'Property Payments',
            path: '/settings/payment_details',
            icon: CreditCard,
            description: 'Manage payment details'
        },
        {
            title: 'Make Paybill PDF',
            path: '/settings/make-paybill-pdf',
            icon: FileText,
            description: 'Generate paybill documents'
        },
        {
            title: 'Notifications',
            path: '/settings/notifications',
            icon: Bell,
            description: 'Notification preferences'
        },
        {
            title: 'Help & Support',
            path: '/settings/help-center',
            icon: HelpCircle,
            description: 'Get help and support'
        },
        {
            path: "/settings/recycle",
            title: "Recycle",
            icon: Recycle,
            description: "Manage deleted items",
            permission: { module: "trash", action: "view" }
        },
        {
            title: 'Security',
            path: '/settings/security',
            icon: Shield,
            description: 'Security settings'
        }
    ];

    return (
        <div className="">
            <aside className="w-64 rounded-lg bg-white border border-gray-200 min-h-screen p-4">
                <div className="mb-6">
                    <div className="flex items-center gap-2 px-3 py-2">
                        <Settings className="w-6 h-6 text-yellow-600" />
                        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                    </div>
                    <p className="text-sm text-gray-500 px-3 mt-1">Manage your property system</p>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${active
                                    ? 'bg-yellow-50 text-yellow-700 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${active ? 'text-yellow-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                                <div className="flex-1 min-w-0 text-left">
                                    <div className={`font-medium text-sm ${active ? 'text-yellow-700' : 'text-gray-900'}`}>
                                        {item.title}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {item.description}
                                    </div>
                                </div>
                                {active && (
                                    <div className="w-1 h-8 bg-yellow-600 rounded-full absolute right-0" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-8 px-3 py-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">Need Help?</h3>
                    <p className="text-xs text-gray-600 mb-3">Check our documentation or contact support</p>
                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors">
                        Contact Support
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default SettingsAside;