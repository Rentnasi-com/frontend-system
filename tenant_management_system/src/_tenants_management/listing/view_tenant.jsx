import { PiExportThin } from "react-icons/pi"
import { SlCalender } from "react-icons/sl"
import { Link } from "react-router-dom"
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

const ViewTenant = () => {
    return (
        <section className="">
            <div className="p-4 flex justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Overview</h1>
                    <p className="text-sm text-gray-500">Real-time information and activities of your tenants.</p>
                </div>
                <div className="">
                    <div className="flex space-x-4">
                        <div className="bg-white p-2 rounded-xl shadow">
                            <Link to="/tenants/add-personal-details">
                                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                                    <span>Add Tenants</span> <PiExportThin />
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
            <div className="grid grid-cols-5 gap-4 p-4">
                <div className="col-span-2">
                    <div className="bg-white p-2 shadow rounded space-y-3">
                        <div className="flex flex-col justify-center items-center">
                            <img className="w-32 h-32 rounded-full border border-green-400 p-2" src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" alt="Rounded avatar" />
                            <h2 className="text-sm font-semibold mt-2">Simon Mburu</h2>
                            <h2 className="text-sm text-gray-400">K19-39IUJDSOS</h2>
                            <div className="flex justify-center items-center space-x-4 mt-4">
                                <button type="button" className="flex text-red-900 bg-white border border-red-600 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"><FaPhoneAlt className="mr-2 mt-1" />Call</button>
                                <button type="button" className="flex text-red-900 bg-white border border-red-600 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"><MdEmail className="mr-2 mt-1" /> Email</button>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Name:</p>
                            <p className="font-normal">Simeon Mwangi</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Property:</p>
                            <p className="font-normal">Workbee Plaza</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Unit:</p>
                            <p className="font-normal">5</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Tenant from:</p>
                            <p className="font-normal">01/12/2007</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Phone number:</p>
                            <p className="font-normal">0704662432</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Email:</p>
                            <p className="font-normal">simeon@rentnasi.com</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Next of kin:</p>
                            <p className="font-normal">Simeon Kariuki</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Next of phone:</p>
                            <p className="font-normal">0769283482</p>
                        </div>
                        <div className="flex space-x-3">
                            <p className="font-semibold">Next of email:</p>
                            <p className="font-normal">kariuki@rentnasi.com</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-3">
                    <div className="p-2 flex justify-between space-x-4">
                        <div className="flex space-x-3 items-center bg-white rounded shadow w-full h-16 p-2">
                            <div className="">
                                <img className="bg-green-300 p-2 rounded" height={35} width={30} src="/assets/icons/png/wallet.png" alt="" />
                            </div>
                            <div className="mx-2">
                                <p className="text-md font-semibold text-gray-800">Ksh 100,000</p>
                                <p className="text-xs text-gray-400">Total  Amount Paid</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white rounded shadow w-full h-16 p-2">
                            <div className="">
                                <img className="bg-indigo-200 p-2 rounded" height={35} width={30} src="/assets/icons/png/pending.png" alt="" />
                            </div>
                            <div className="mx-2">
                                <p className="text-md font-semibold text-gray-800">Ksh 100,000</p>
                                <p className="text-xs text-gray-400">Monthly Amount</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white rounded shadow w-full h-16 p-2">
                            <div className="">
                                <img className="bg-pink-200 p-2 rounded" height={35} width={30} src="/assets/icons/png/wallet2.png" alt="" />
                            </div>
                            <div className="mx-2">
                                <p className="text-md font-semibold text-gray-800">Ksh 500,000</p>
                                <p className="text-xs text-gray-400">Due Amount</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-2 bg-white rounded shadow">
                        <h2 className="text-sm font-semibold">Payment History</h2>
                        <table className="w-full text-gray-500">
                            <thead >
                                <tr>
                                    <td className="py-3">Date</td>
                                    <td className="py-3">Receipt No</td>
                                    <td className="py-3">Description</td>
                                    <td className="py-3">Action</td>
                                </tr>
                            </thead>
                            <tbody>

                                <tr className="mt-4">
                                    <td>
                                        <th className="text-xs text-gray-600">
                                            21 May 2024
                                        </th>
                                    </td>
                                    <td className="text-xs text-gray-600">102122010102</td>
                                    <td className="text-xs text-gray-600">Last month rent payment</td>
                                    <td className="">
                                        <Link to="/tenants/view-tenants">
                                            <img width={24} src="/assets/icons/png/dots.png" alt="" />
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ViewTenant