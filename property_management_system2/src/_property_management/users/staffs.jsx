import { useEffect, useState } from 'react';
import { DashboardHeader } from '../properties/dashboard/page_components';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StaffManagement = () => {
    const [staffs, setStaffs] = useState([]);

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL
    const [openDropdownId, setOpenDropdownId] = useState(null);

    useEffect(() => {
        fetchStaff()
    }, [token, baseUrl])

    const fetchStaff = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-org/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            if (response.data.success) {
                setStaffs(response.data.results)
                console.log("response", response.data)
            }
        } catch (error) {
            toast.error("An error occurred while fetching staffs!")
        }
    }

    const toggleDropdown = (tenantId) => {
        setOpenDropdownId(openDropdownId === tenantId ? null : tenantId);
    };

    const formatNaturalDate = (date) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <DashboardHeader
                title="Staff Management"
                description="View all information about your staff members."

            />
            <main className="p-6">
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Staff Overview</h3>
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                <i className="fas fa-filter mr-2"></i> Filter
                            </button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                <i className="fas fa-sort mr-2"></i> Sort
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                                <i className="fas fa-download mr-2"></i> Export
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center">
                                <h4 className="text-blue-800 font-medium">Total Staff</h4>
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <i className="fas fa-users text-blue-600"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-blue-800 mt-2">10</p>
                            <p className="text-xs text-blue-600 mt-1">+2 from last month</p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex justify-between items-center">
                                <h4 className="text-green-800 font-medium">Active</h4>
                                <div className="bg-green-100 p-2 rounded-full">
                                    <i className="fas fa-user-check text-green-600"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-green-800 mt-2">
                                6
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                4 % of total staff
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <div className="flex justify-between items-center">
                                <h4 className="text-yellow-800 font-medium">On Leave</h4>
                                <div className="bg-yellow-100 p-2 rounded-full">
                                    <i className="fas fa-bed text-yellow-600"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-yellow-800 mt-2">
                                2
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">2 vacation, 1 sick</p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <div className="flex justify-between items-center">
                                <h4 className="text-red-800 font-medium">Inactive</h4>
                                <div className="bg-red-100 p-2 rounded-full">
                                    <i className="fas fa-user-slash text-red-600"></i>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-red-800 mt-2">
                                3
                            </p>
                            <p className="text-xs text-red-600 mt-1">Recently terminated</p>
                        </div>
                    </div>

                    {/* Staff Table */}
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <h4 className="text-md text-gray-600 my-4 px-2">All Staff Members</h4>
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full border border-gray-200 rounded-lg">
                                <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Staff Member</th>
                                        <th className="px-6 py-3 text-left">Contact Info</th>
                                        <th className="px-6 py-3 text-left">Role</th>
                                        <th className="px-6 py-3 text-left">Department</th>
                                        <th className="px-6 py-3 text-right">Salary</th>
                                        <th className="px-6 py-3 text-right">Hire Date</th>
                                        <th className="px-6 py-3 text-left">Properties</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {staffs === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-sm my-3 py-4">No staff members found.</td>
                                        </tr>
                                    ) : (
                                        staffs.map((staff, index) => (
                                            <tr key={staff.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-blue-800 font-medium">
                                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-gray-900">{staff.name}</div>
                                                            <div className="text-gray-500 text-xs">ID: {staff.staff_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    <p className="text-gray-900">{staff.email}</p>
                                                    <p className="text-gray-700">{staff.phone}</p>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {staff.designation && (
                                                        <span
                                                            className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded
                                                            ${staff.designation === "Manager" ? "bg-blue-100 text-blue-800" :
                                                                    staff.designation === "Staff" ? "bg-green-100 text-green-800" :
                                                                        staff.designation === "Intern" ? "bg-yellow-100 text-yellow-800" :
                                                                            "bg-gray-100 text-gray-800"}`}
                                                        >
                                                            {staff.designation}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {staff.department}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-green-600">
                                                    {(staff.salary)}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {(staff.profile.hire_date.toLocaleDateString())}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="text-xs">
                                                        {(staff.properties)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-xs text-right">
                                                    {staff.status === 'active' ? (
                                                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded whitespace-nowrap">
                                                            Active
                                                        </span>
                                                    ) : staff.status === 'on_leave' ? (
                                                        <span className="bg-yellow-100 border border-yellow-400 text-yellow-600 px-2 py-1 rounded whitespace-nowrap">
                                                            On Leave
                                                        </span>
                                                    ) : (
                                                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded whitespace-nowrap">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="relative px-4 py-2 text-sm">
                                                    {/* Dropdown button - only in Actions column */}
                                                    <button
                                                        onClick={() => toggleDropdown(staff.id)}
                                                        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                    >
                                                        Actions
                                                        <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>


                                                    {openDropdownId === staff.id && (
                                                        <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1">
                                                                <Link
                                                                    to=""
                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    View Profile
                                                                </Link>
                                                                <Link
                                                                    to={`/staffs/assign-permissions?staff_id=${staff.id}`}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Assign Permissions
                                                                </Link>
                                                                <Link
                                                                    to={`/staffs/assign-properties?staff_id=${staff.id}`}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Assign Properties
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default StaffManagement;