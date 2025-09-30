import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Building2,
    Users,
    UserCheck,
    BarChart3,
    MessageCircle,
    Settings,
    HelpCircle,
    LogOut,
    Recycle,
    Crown,
    ChevronRight,
    Sparkles,
    ChevronDown,
    Wallet,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";

const Aside = ({ collapsed, setCollapsed }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const links = [
        { to: "/dashboard", label: "Dashboard", iconPath: "Home" },
        {
            label: "Properties",
            iconPath: "Building2",
            submenu: [
                { to: "/property/property-listing", label: "Properties" },
                { to: "/property/all-property-units", label: "Units" },
                { to: "/add-property/general-information", label: "Add Property" }
            ]
        },
        {
            label: "Tenants",
            iconPath: "Users",
            submenu: [
                { to: "/tenants", label: "Tenants" },
                { to: "/tenants/add-personal-details", label: "Add Tenant" }
            ]
        },
        {
            label: "Landlords",
            iconPath: "UserCheck",
            submenu: [
                { to: "/landlords", label: "Landlords" },
                { to: "/add-landlord/personal-information", label: "Add Landlord" }
            ]
        },
        {
            label: "Billings",
            iconPath: "Wallet",
            submenu: [
                { to: "/property/receive-water", label: "Water Billing" },
                { to: "/property/receive-bulk-electricity", label: "Electricity Billing" },
                { to: "/property/receive-payment", label: "Receive Payment" }
            ]
        },
        {
            label: "Staff",
            iconPath: "Users",
            submenu: [
                { to: "/staffs/staff-listings", label: "Users" },
                { to: "/staffs/add-personal-info", label: "Add Users" }
            ]
        },
        { to: "/dashboard/reports", label: "Reports", iconPath: "BarChart3" },
        { to: "/dashboard/inquiries", label: "Inquiries", iconPath: "MessageCircle" },
        { to: "/settings", label: "Settings", iconPath: "Settings" },
        { to: "/help-center", label: "Help Center", iconPath: "HelpCircle" },
        { to: "/recycle", label: "Recycle", iconPath: "Recycle" },
        { to: "/logout", label: "Logout", iconPath: "LogOut" }
    ];

    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    const handleLinkClick = (path) => setActiveLink(path);
    const toggleDropdown = (label) =>
        setOpenDropdown(openDropdown === label ? null : label);

    const iconMap = {
        Home,
        Building2,
        Users,
        UserCheck,
        BarChart3,
        MessageCircle,
        Settings,
        HelpCircle,
        LogOut,
        Recycle,
        Crown,
        ChevronRight,
        Sparkles,
        ChevronDown,
        Wallet
    };

    return (
        <aside
            className={`hidden fixed z-20 h-full top-0 left-0 flex-col transition-all duration-300 bg-white border-r
        ${collapsed ? "w-16" : "w-64"} md:flex`}
            aria-label="Sidebar"
        >
            {/* Header with collapse button */}
            <div className="flex items-center justify-between py-4 px-3 border-b">
                {!collapsed && (
                    <a href="https://rentalpay.africa" target="_blank" rel="noreferrer">
                        <img
                            className="w-auto h-[50px]"
                            src="/assets/images/rentalpay.png"
                            alt="logo"
                        />
                    </a>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded hover:bg-gray-100"
                >
                    {collapsed ? (
                        <PanelLeftOpen className="w-5 h-5 text-gray-600" />
                    ) : (
                        <PanelLeftClose className="w-5 h-5 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-4 text-sm">
                {links.map((item) => {
                    const isActive = activeLink === item.to;
                    const Icon = iconMap[item.iconPath];

                    if (item.submenu) {
                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => toggleDropdown(item.label)}
                                    className={`flex items-center w-full py-2 px-3 rounded-lg ${isActive ? "bg-yellow-100 text-yellow-500" : "text-gray-700"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {!collapsed && <span className="ml-3">{item.label}</span>}
                                    {!collapsed && (
                                        <ChevronDown
                                            className={`ml-auto w-4 h-4 transition-transform ${openDropdown === item.label ? "rotate-180" : ""
                                                }`}
                                        />
                                    )}
                                </button>
                                {openDropdown === item.label && !collapsed && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {item.submenu.map((subItem) => (
                                            <Link
                                                key={subItem.to}
                                                to={subItem.to}
                                                className={`block py-2 px-4 rounded ${activeLink === subItem.to
                                                    ? "bg-yellow-50 text-yellow-500"
                                                    : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                onClick={() => handleLinkClick(subItem.to)}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center px-3 py-2 rounded-lg ${isActive ? "bg-yellow-100 text-yellow-500" : "text-gray-700"
                                }`}
                            onClick={() => handleLinkClick(item.to)}
                        >
                            <Icon className="w-5 h-5" />
                            {!collapsed && <span className="ml-3">{item.label}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Upgrade Section (hide in collapsed mode) */}
            {!collapsed && (
                <div className="text-white text-center border rounded mx-5 p-2 mt-6 mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
                    <h5 className="text-lg font-semibold">Upgrade to Pro</h5>
                    <p className="text-xs mt-2">
                        Get one month free when you subscribe to Pro
                    </p>
                    <div className="mt-4 w-full bg-white rounded text-yellow-500 text-xs px-2 py-2 ">
                        <Link to="#">Subscribe Now</Link>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Aside;
