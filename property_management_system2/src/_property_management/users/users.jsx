import { useState } from 'react';
import { z } from 'zod';
import { DashboardHeader } from '../properties/dashboard/page_components';

const StaffManagement = () => {
    const [staffs, setStaffs] = useState([
        {
            staff_id: "STF001",
            name: "Sarah Johnson",
            email: "sarah.j@example.com",
            phone: "(555) 123-4567",
            profile_picture: "",
            role: "Property Manager",
            department: "Management",
            salary: 65000,
            hire_date: "2021-03-15",
            assigned_properties: ["Oak Apartments", "Pine Condos"],
            status: "active",
            is_manager: true
        },
        {
            staff_id: "STF002",
            name: "Michael Chen",
            email: "michael.c@example.com",
            phone: "(555) 234-5678",
            profile_picture: "",
            role: "Leasing Agent",
            department: "Leasing",
            salary: 45000,
            hire_date: "2022-01-10",
            assigned_properties: ["Maple Heights", "Elm Towers"],
            status: "active",
            is_manager: false
        },
        {
            staff_id: "STF003",
            name: "Jessica Williams",
            email: "jessica.w@example.com",
            phone: "(555) 345-6789",
            profile_picture: "",
            role: "Maintenance Supervisor",
            department: "Maintenance",
            salary: 58000,
            hire_date: "2020-11-05",
            assigned_properties: ["Cedar Commons", "Birch Manor"],
            status: "active",
            is_manager: true
        }
    ]);


    const [searchTerm, setSearchTerm] = useState("");

    // Filter staff based on search term
    const filteredStaffs = staffs.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(searchTerm.toLowerCase())
    );



    // Function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                            <p className="text-2xl font-bold text-blue-800 mt-2">{staffs.length}</p>
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
                                {staffs.filter(s => s.status === 'active').length}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                {Math.round((staffs.filter(s => s.status === 'active').length / staffs.length) * 100)}% of total staff
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
                                {staffs.filter(s => s.status === 'on_leave').length}
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
                                {staffs.filter(s => s.status === 'inactive').length}
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
                                    {filteredStaffs.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-sm my-3 py-4">No staff members found.</td>
                                        </tr>
                                    ) : (
                                        filteredStaffs.map((staff, index) => (
                                            <tr key={staff.staff_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
                                                    {staff.role}
                                                    {staff.is_manager && (
                                                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                            Manager
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {staff.department}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-green-600">
                                                    {formatCurrency(staff.salary)}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {formatDate(staff.hire_date)}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="text-xs">
                                                        {staff.assigned_properties && staff.assigned_properties.length > 0 ? (
                                                            <>
                                                                <span className="font-medium">{staff.assigned_properties.length}</span> properties
                                                                <div className="mt-1 text-gray-500 truncate max-w-xs">
                                                                    {staff.assigned_properties.join(', ')}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">Not assigned</span>
                                                        )}
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
                                                    <div className="dropdown relative inline-block">
                                                        <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none">
                                                            Actions
                                                            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        <div className="dropdown-content absolute right-0 hidden mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                            <div className="py-1">
                                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</a>
                                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Details</a>
                                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Assign Properties</a>
                                                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Payroll History</a>
                                                                {staff.status === 'active' ? (
                                                                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Deactivate</a>
                                                                ) : (
                                                                    <a href="#" className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100">Activate</a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
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