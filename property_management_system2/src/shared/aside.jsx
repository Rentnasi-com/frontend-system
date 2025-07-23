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
  Wallet
} from "lucide-react";

const Aside = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      iconPath: "Home",
      bg: "bg-red-100"
    },
    {
      label: "Properties",
      iconPath: "Building2",
      bg: "hover:bg-red-100",
      submenu: [
        { to: "/property/property-listing", label: "Properties" },
        { to: "/add-property/general-information", label: "Add Property" },
        { to: "/property/all-property-units", label: "Properties Units" }
      ]
    },
    {
      label: "Tenants",
      iconPath: "Users",
      bg: "hover:bg-red-100",
      submenu: [
        { to: "/tenants", label: "Tenants" },
        { to: "/tenants/add-personal-details", label: "Add Tenant" },
      ]
    },
    {
      label: "Landlords",
      iconPath: "UserCheck",
      bg: "hover:bg-red-100",
      submenu: [
        { to: "/landlords", label: "Landlords" },
        { to: "/tenants/add-personal-details", label: "Add Landlord" },
      ]
    },
    {
      label: "Billings",
      iconPath: "Wallet",
      bg: "hover:bg-red-100",
      submenu: [
        { to: "/property/receive-water", label: "Pay Water Billing" },
        { to: "/property/receive-payment", label: "Pay Billing" },
      ]
    },
    {
      to: "/dashboard/reports",
      label: "Reports",
      iconPath: "BarChart3",
      bg: "hover:bg-red-100"
    },

    {
      to: "/dashboard/inquiries",
      label: "Inquiries",
      iconPath: "MessageCircle",
      bg: "hover:bg-red-100"
    },

    {
      to: "/settings",
      label: "Settings",
      iconPath: "Settings",
      bg: "hover:bg-red-100"
    },
    {
      to: "/help-center",
      label: "Help Center",
      iconPath: "HelpCircle",
      bg: "hover:bg-red-100"
    },
    {
      to: "/recycle",
      label: "Recycle",
      iconPath: "Recycle",
      bg: "hover:bg-red-100"
    },
    {
      to: "/reports",
      label: "Logout",
      iconPath: "LogOut",
      bg: "hover:bg-red-100"
    },
  ];

  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

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
    <aside className="hidden md:w-64 border-r border-gray-200 fixed z-20 h-full top-0 left-0 pt-10 md:flex lg:flex flex-shrink-0 flex-col transition-width duration-75" aria-label="Sidebar">
      <div className="h-full py-4 overflow-y-auto">
        <div className="space-y-3 text-sm">
          {links.map((item) => {
            const isActive = activeLink === item.to;
            const Icon = iconMap[item.iconPath];

            if (item.submenu) {
              return (
                <div key={item.label} className="px-4">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center justify-between w-full py-2 ${isActive ? 'bg-red-100 rounded-lg text-red-500' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5" />
                      <span className="ml-3">{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'transform rotate-180' : ''}`}
                    />
                  </button>

                  {openDropdown === item.label && (
                    <div className="ml-8 mt-1 space-y-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.to}
                          to={subItem.to}
                          className={`block py-2 px-4 rounded ${activeLink === subItem.to ? 'bg-red-50 text-red-500' : 'text-gray-600 hover:bg-gray-100'}`}
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
                className={`flex items-center px-4 py-2 ${isActive ? 'bg-red-100 rounded-lg text-red-500' : 'text-gray-700'}`}
                onClick={() => handleLinkClick(item.to)}
              >
                <Icon className="w-5 h-5" />
                <span className="ml-3">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Upgrade to Pro section remains the same */}
        <div className="text-white text-center border rounded mx-5 p-2 mt-20 bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br">
          <div className="bg-red-700 mx-auto w-16 h-16 relative -mt-12 border-4 border-white rounded-full overflow-hidden flex justify-center items-center">
            <h6 className="text-xs text-white">Rentnasi</h6>
          </div>
          <h5 className="text-lg font-semibold">Upgrade to Pro</h5>
          <p className="text-xs mt-4">Get one month free when
            you subscribe to pro</p>
          <div className="mt-4 w-full bg-white rounded text-red-500 text-xs px-2 py-3 ">
            <Link className=" ">Subscribe Now</Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Aside;