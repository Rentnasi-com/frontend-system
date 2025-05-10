import { Link, useLocation } from 'react-router-dom'

const SettingsBreadcrumbs = () => {
    const location = useLocation();


    const isActive = (path) => {
        return location.pathname === path;
    };
    return (
        <nav className="flex px-5 py-3 text-white border border-gray-200 rounded-lg bg-red-600 m-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-5">
                <li>
                    <Link to="/settings" className={`flex py-1 px-4 items-center rounded-lg ${isActive("/settings")
                            ? "bg-white text-red-600"
                            : "hover:bg-black/30 text-white" }`}>
                        <span className="font-semibold">Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/settings/payment_details" className={`flex py-1 px-4 items-center rounded-lg ${isActive("/settings/payment_details")
                            ? "bg-white text-red-600": "hover:bg-black/30 text-white"}`}>
                        <span className="font-semibold">Payment Settings</span>
                    </Link>
                </li>
            </ol>
        </nav>
    )
}

export default SettingsBreadcrumbs
