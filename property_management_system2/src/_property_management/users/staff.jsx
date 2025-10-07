import { useEffect, useState } from 'react';
import { DashboardHeader } from '../properties/dashboard/page_components';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Settings, Shield, User } from 'lucide-react';


const SingleStaffPage = () => {
    const [staff, setStaff] = useState({});

    const [searchParams] = useSearchParams();
    const staffId = searchParams.get('staff_id')

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchStaff()
    }, [token, baseUrl, staffId]);

    const fetchStaff = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-org/user?user_id=${staffId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setStaff(response.data.result);
            }
        } catch (error) {
            toast.error("An error occurred while fetching staff!");
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <DashboardHeader
                title="Staff Management"
                description="Real-time information and activities of your staff."

            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 mx-4 p-2">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex flex-col items-center">
                            <div className="h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl text-blue-800 font-bold">
                                    {staff?.staff?.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800">{staff?.staff?.name}</h2>
                            <p className="text-gray-600">{staff?.profile?.role}</p>

                            <div className={`mt-4 px-3 py-1 rounded-full text-sm font-medium ${staff?.staff?.active
                                ? 'bg-green-100 text-green-800'
                                : staff.status === 'on_leave'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                            </div>

                            {staff?.profile?.is_manager && (
                                <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Manager
                                </div>
                            )}
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
                            <>
                                <div className="flex items-center mb-2">
                                    <i className="fas fa-envelope text-gray-400 mr-2 w-5"></i>
                                    <span>{staff?.staff?.email}</span>
                                </div>

                                <div className="flex items-center mb-2">
                                    <i className="fas fa-phone text-gray-400 mr-2 w-5"></i>
                                    <span>{staff?.staff?.phone}</span>
                                </div>

                                {staff?.profile?.address && (
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-map-marker-alt text-gray-400 mr-2 w-5"></i>
                                        <span>{staff.profile.address}</span>
                                    </div>
                                )}
                            </>
                        </div>

                        {/* Emergency Contact */}
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-medium text-gray-700 mb-2">Emergency Contact</h3>
                            <>
                                {staff?.profile?.emergency_contact_name ? (
                                    <>
                                        <div className="flex items-center mb-1">
                                            <i className="fas fa-user text-gray-400 mr-2 w-5"></i>
                                            <span>{staff.profile.emergency_contact_name}</span>
                                        </div>

                                        <div className="flex items-center mb-1">
                                            <i className="fas fa-phone text-gray-400 mr-2 w-5"></i>
                                            <span>{staff.profile.emergency_contact_phone}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <i className="fas fa-link text-gray-400 mr-2 w-5"></i>
                                            <span>{staff.profile.emergency_contact_relationship}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm">No emergency contact information</p>
                                )}
                            </>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Employment Details</h2>
                            <Link
                                to={`/staffs/edit-personal-info?staff_id=${staff.staff?.id}`}
                                className="flex items-center gap-2 px-2 py-2 text-xs bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                <User size={14} />
                                <span>Edit Profile</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <>
                                <div>
                                    <p className="text-sm text-gray-600">Role</p>
                                    <p className="font-medium">{staff?.profile?.role}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Department</p>
                                    <p className="font-medium">{staff?.profile?.department}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Salary</p>
                                    <p className="font-medium">{(staff?.profile?.salary || "-").toLocaleString() || '—'}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Hire Date</p>
                                    <p className="font-medium">{new Date(staff?.profile?.hire_date || "-").toLocaleDateString()}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Years of Service</p>
                                    <p className="font-medium">{ } years</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Manager Status</p>
                                    <p className="font-medium">{staff.is_manager ? "Yes" : "No"}</p>
                                </div>
                            </>
                        </div>
                    </div>

                    {/* Assigned Properties */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Assigned Properties</h2>
                            <Link
                                to={`/staffs/assign-properties?staff_id=${staff.staff?.id}`}
                                className="flex items-center gap-2 px-2 py-2 text-xs bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            >
                                <Shield size={14} />
                                <span>Edit Permissions</span>
                            </Link>
                        </div>

                        <div>
                            {staff?.properties?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {staff?.properties?.map((property, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                                            {property.property_name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No properties assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Permissions</h2>
                            <Link to={`/staffs/assign-permissions?staff_id=${staff.staff?.id}`}
                                className="flex items-center gap-2 px-2 py-2 text-xs bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                <Settings size={14} />
                                <span>Edit Properties</span>
                            </Link>
                        </div>

                        {staff?.permissions && staff.permissions.length > 0 ? (
                            <div className="space-y-4">
                                {staff.permissions.map((perm, index) => (
                                    <div className='grid grid-cols-2' key={index}>
                                        <h3 className="font-semibold text-gray-700 mb-2 capitalize">
                                            {perm.module}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {perm.actions.map((action, i) => (
                                                <span
                                                    key={i}
                                                    className={`uppercase px-3 py-1 rounded-full text-xs ${action.action === "view"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : action.action === "edit"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : action.action === "add"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {action.action}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No permissions assigned</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SingleStaffPage;