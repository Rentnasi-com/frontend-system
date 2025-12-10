import { Briefcase, Building2, Calendar, CreditCard, FileText, Globe, Image, Mail, MapPin, Phone, Shield, User, UserCheck2 } from "lucide-react";
import { DashboardHeader } from "../properties/dashboard/page_components";

const SettingsDashboard = () => {
    const organization = JSON.parse(localStorage.getItem("organization"));
    const user = JSON.parse(localStorage.getItem("userProfile"));

    console.log(user)

    const formatValue = (value) => {
        return value || <span className="text-gray-400 italic">Not provided</span>;
    };
    return (
        <div>
            
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <UserCheck2 className="w-5 h-5 text-yellow-600" />
                    Personal Information
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className="relative">
                            <img
                                src={`${user?.image}=s128`}
                                alt={`${user?.firstname || 'User'}'s profile`}
                                className="w-24 h-24 rounded-full object-cover border-4 border-yellow-100"
                            />
                            {user?.image && (
                                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-1.5 rounded-full">
                                    <Image className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center md:text-left">
                            <p className="text-sm text-gray-500">Profile Picture</p>
                            <button className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                                Change Photo
                            </button>
                        </div>
                    </div>

                    {/* User Details Section */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <User className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium text-gray-800">
                                        {formatValue(user?.firstname)} {formatValue(user?.lastname)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <Mail className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-gray-800">{formatValue(user?.email)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <Phone className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="font-medium text-gray-800">{formatValue(user?.phone)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* <div className="flex items-start gap-3">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <User className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Username</p>
                                    <p className="font-medium text-gray-800">{formatValue(user?.user_name)}</p>
                                </div>
                            </div> */}

                            {/* Account Status (you can customize this based on your app logic) */}
                            <div className="flex items-start gap-3">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <Shield className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Status</p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                            Verified
                                        </span>
                                        <span className="text-xs text-gray-500">Google Account</span>
                                    </div>
                                </div>
                            </div>

                            {/* Last Login (if you have this data) */}
                            <div className="flex items-start gap-3">
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account Type</p>
                                    <p className="font-medium text-gray-800">Google Authentication</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Edit Profile
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                        Change Password
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                        Update Email
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 my-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-yellow-600" />
                    Company Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Building2 className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Company Name</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.name)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <FileText className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Legal Name</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.legal_name)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Briefcase className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Industry</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.industry)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <CreditCard className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Registration Number</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.registration_number)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <CreditCard className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tax ID</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.tax_id)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Mail className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.email)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Phone className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.phone)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Globe className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Website</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.website)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <MapPin className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <div className="font-medium text-gray-800">
                                    {organization?.address_line1 || organization?.address_line2 || organization?.city ? (
                                        <div className="space-y-1">
                                            {organization?.address_line1 && <p>{organization.address_line1}</p>}
                                            {organization?.address_line2 && <p>{organization.address_line2}</p>}
                                            {organization?.city && <p>{organization.city}, {organization.country}</p>}
                                            {organization?.postal_code && <p>Postal Code: {organization.postal_code}</p>}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Not provided</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Calendar className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Billing Cycle</p>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800 capitalize">{formatValue(organization?.billing_cycle)}</span>
                                    {organization?.billing_cycle && (
                                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                            {organization.billing_cycle}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-yellow-50 p-2 rounded-lg">
                                <Mail className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Billing Email</p>
                                <p className="font-medium text-gray-800">{formatValue(organization?.billing_email)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Account Status</p>
                            <p className="text-lg font-semibold capitalize">{formatValue(organization?.status)}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${organization?.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {organization?.status === 'active' ? 'Active' : 'Inactive'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-yellow-600" />
                    Payment Configuration
                </h2>
            </div>
        </div>
    );
};

export default SettingsDashboard;