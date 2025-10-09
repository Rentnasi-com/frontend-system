import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Users, UserCheck, BarChart3, MessageCircle, Settings, HelpCircle, LogOut, Recycle, Crown, ChevronRight, Sparkles, ChevronDown, Wallet, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../AuthContext";


const Aside = ({ collapsed, setCollapsed }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const { hasPermission } = useAuth();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    // Define all links with permissions
    const allLinks = [
        { to: "/dashboard", label: "Dashboard", iconPath: "Home" },
        {
            label: "Properties",
            iconPath: "Building2",
            permission: { module: "properties", action: "view" },
            submenu: [
                {
                    to: "/property/property-listing",
                    label: "Properties",
                    permission: { module: "properties", action: "view" }
                },
                {
                    to: "/property/all-property-units",
                    label: "Units",
                    permission: { module: "properties", action: "view" }
                },
                {
                    to: "/add-property/general-information",
                    label: "Add Property",
                    permission: { module: "properties", action: "add" }
                }
            ]
        },
        {
            label: "Tenants",
            iconPath: "Users",
            permission: { module: "tenants", action: "view" },
            submenu: [
                {
                    to: "/tenants",
                    label: "Tenants",
                    permission: { module: "tenants", action: "view" }
                },
                {
                    to: "/tenants/add-personal-details",
                    label: "Add Tenant",
                    permission: { module: "tenants", action: "add" }
                }
            ]
        },
        {
            label: "Landlords",
            iconPath: "UserCheck",
            permission: { module: "landlords", action: "view" },
            submenu: [
                {
                    to: "/landlords",
                    label: "Landlords",
                    permission: { module: "landlords", action: "view" }
                },
                {
                    to: "/add-landlord/personal-information",
                    label: "Add Landlord",
                    permission: { module: "landlords", action: "add" }
                }
            ]
        },
        {
            label: "Billings",
            iconPath: "Wallet",
            permission: { module: "payments", action: "view" },
            submenu: [
                {
                    to: "/property/receive-water",
                    label: "Water Billing",
                    permission: { module: "payments", action: "add" }
                },
                {
                    to: "/property/receive-bulk-electricity",
                    label: "Electricity Billing",
                    permission: { module: "payments", action: "add" }
                },
                {
                    to: "/property/receive-payment",
                    label: "Receive Payment",
                    permission: { module: "payments", action: "add" }
                },
                {
                    to: "/payments/payments-received",
                    label: "Payment Received",
                    permission: { module: "payments", action: "view" }
                },
                {
                    to: "/payments/payments-arrears",
                    label: "Arrears",
                    permission: { module: "payments", action: "view" }
                }
            ]
        },
        {
            label: "Staff",
            iconPath: "Users",
            permission: { module: "users", action: "view" },
            submenu: [
                {
                    to: "/staffs/staff-listings",
                    label: "Users",
                    permission: { module: "users", action: "view" }
                },
                {
                    to: "/staffs/add-personal-info",
                    label: "Add Users",
                    permission: { module: "users", action: "add" }
                }
            ]
        },
        {
            to: "/dashboard/reports",
            label: "Reports",
            iconPath: "BarChart3",
            permission: { module: "reports", action: "view" }
        },
        {
            to: "/dashboard/inquiries",
            label: "Inquiries",
            iconPath: "MessageCircle",
            permission: { module: "inquiries", action: "view" }
        },
        {
            to: "/settings",
            label: "Settings",
            iconPath: "Settings",
            permission: { module: "settings", action: "view" }
        },
        { to: "/help-center", label: "Help Center", iconPath: "HelpCircle" },
        {
            to: "/recycle",
            label: "Recycle",
            iconPath: "Recycle",
            permission: { module: "trash", action: "view" }
        },
        { to: "/logout", label: "Logout", iconPath: "LogOut" }
    ];

    // Filter links based on permissions
    const links = useMemo(() => {
        return allLinks
            .map(link => {
                // If link has no permission requirement, keep it
                if (!link.permission) {
                    return link;
                }

                // Check if user has permission for this link
                if (!hasPermission(link.permission.module, link.permission.action)) {
                    return null;
                }

                // If link has submenu, filter submenu items too
                if (link.submenu) {
                    const filteredSubmenu = link.submenu.filter(sublink => {
                        if (!sublink.permission) return true;
                        return hasPermission(sublink.permission.module, sublink.permission.action);
                    });

                    // Only show parent if at least one submenu item is visible
                    if (filteredSubmenu.length === 0) {
                        return null;
                    }

                    return {
                        ...link,
                        submenu: filteredSubmenu
                    };
                }

                return link;
            })
            .filter(link => link !== null);
    }, [hasPermission]);

    const handleLinkClick = (path) => setActiveLink(path);
    const toggleDropdown = (label) =>
        setOpenDropdown(openDropdown === label ? null : label);

    const iconMap = { Home, Building2, Users, UserCheck, BarChart3, MessageCircle, Settings, HelpCircle, LogOut, Recycle, Crown, ChevronRight, Sparkles, ChevronDown, Wallet };

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