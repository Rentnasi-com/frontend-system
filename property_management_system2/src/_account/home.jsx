import { PiExportThin } from "react-icons/pi"
import { SlCalender } from "react-icons/sl"
import { Link } from "react-router-dom"

const AccountDashboard = () => {
    return (
        <section className="">
            <div className="p-4 flex justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Overview</h1>
                    <p className="text-sm text-gray-500">Real-time information and activities of your account.</p>
                </div>
                <div className="">
                    <div className="flex space-x-4">
                        <div className="bg-white p-2 rounded-xl shadow">
                            <Link to="/account/edit-account">
                                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                                    <span>Edit Account</span> <PiExportThin />
                                </p>
                            </Link>
                        </div>
                        <div className="bg-white p-2 rounded-xl shadow">
                            <p className="text-xs text-gray-600 flex space-x-2 text-center">
                                <SlCalender /> <span>March 27 2024 - January 25 2025</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AccountDashboard