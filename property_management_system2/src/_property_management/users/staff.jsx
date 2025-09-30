import { useState } from 'react';
import { z } from 'zod';
import { DashboardHeader } from '../properties/dashboard/page_components';

// Define the staff schema with Zod validation
const staffSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    role: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),
    salary: z.number().min(30000, "Salary must be at least $30,000").max(200000, "Salary cannot exceed $200,000"),
    hire_date: z.string().min(1, "Hire date is required"),
    assigned_properties: z.array(z.string()).optional(),
    status: z.enum(["active", "on_leave", "inactive"]),
    is_manager: z.boolean(),
    address: z.string().optional(),
    emergency_contact: z.object({
        name: z.string(),
        phone: z.string(),
        relationship: z.string()
    }).optional()
});

const SingleStaffPage = ({ staffId, onBack }) => {
    // Sample staff data - in a real app, this would come from an API
    const [staff, setStaff] = useState({
        staff_id: staffId || "STF001",
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
        is_manager: true,
        address: "123 Main St, Anytown, USA",
        emergency_contact: {
            name: "John Johnson",
            phone: "(555) 987-6543",
            relationship: "Spouse"
        },
        performance_rating: 4.5,
        notes: "Sarah has been an excellent property manager with great tenant relationships."
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...staff });
    const [errors, setErrors] = useState({});
    const [currentProperty, setCurrentProperty] = useState("");

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith("emergency_contact.")) {
            const field = name.split(".")[1];
            setEditData(prev => ({
                ...prev,
                emergency_contact: {
                    ...prev.emergency_contact,
                    [field]: value
                }
            }));
        } else {
            setEditData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleAddProperty = () => {
        if (currentProperty.trim()) {
            setEditData(prev => ({
                ...prev,
                assigned_properties: [...prev.assigned_properties, currentProperty.trim()]
            }));
            setCurrentProperty("");
        }
    };

    const handleRemoveProperty = (index) => {
        setEditData(prev => ({
            ...prev,
            assigned_properties: prev.assigned_properties.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        try {
            // Validate the data
            const validatedData = staffSchema.parse({
                ...editData,
                salary: Number(editData.salary)
            });

            // Update the staff data
            setStaff(validatedData);
            setIsEditing(false);
            setErrors({});
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors = {};
                error.errors.forEach(err => {
                    newErrors[err.path[0]] = err.message;
                });
                setErrors(newErrors);
            }
        }
    };

    const handleCancel = () => {
        setEditData({ ...staff });
        setIsEditing(false);
        setErrors({});
    };

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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Calculate years of service
    const yearsOfService = () => {
        const hireDate = new Date(staff.hire_date);
        const today = new Date();
        const years = today.getFullYear() - hireDate.getFullYear();
        const months = today.getMonth() - hireDate.getMonth();

        if (months < 0) {
            return years - 1;
        }
        return years;
    };

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
                                    {staff.name.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800">{staff.name}</h2>
                            <p className="text-gray-600">{staff.role}</p>

                            <div className={`mt-4 px-3 py-1 rounded-full text-sm font-medium ${staff.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : staff.status === 'on_leave'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Inactive'}
                            </div>

                            {staff.is_manager && (
                                <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Manager
                                </div>
                            )}
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>

                            {isEditing ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editData.email}
                                            onChange={handleEditChange}
                                            className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-2`}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={editData.phone}
                                            onChange={handleEditChange}
                                            className={`w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-2`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={editData.address || ''}
                                            onChange={handleEditChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-envelope text-gray-400 mr-2 w-5"></i>
                                        <span>{staff.email}</span>
                                    </div>

                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-phone text-gray-400 mr-2 w-5"></i>
                                        <span>{staff.phone}</span>
                                    </div>

                                    {staff.address && (
                                        <div className="flex items-center mb-2">
                                            <i className="fas fa-map-marker-alt text-gray-400 mr-2 w-5"></i>
                                            <span>{staff.address}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Emergency Contact */}
                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-medium text-gray-700 mb-2">Emergency Contact</h3>

                            {isEditing ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            name="emergency_contact.name"
                                            value={editData.emergency_contact?.name || ''}
                                            onChange={handleEditChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            name="emergency_contact.phone"
                                            value={editData.emergency_contact?.phone || ''}
                                            onChange={handleEditChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                        <input
                                            type="text"
                                            name="emergency_contact.relationship"
                                            value={editData.emergency_contact?.relationship || ''}
                                            onChange={handleEditChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {staff.emergency_contact ? (
                                        <>
                                            <div className="flex items-center mb-1">
                                                <i className="fas fa-user text-gray-400 mr-2 w-5"></i>
                                                <span>{staff.emergency_contact.name}</span>
                                            </div>

                                            <div className="flex items-center mb-1">
                                                <i className="fas fa-phone text-gray-400 mr-2 w-5"></i>
                                                <span>{staff.emergency_contact.phone}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <i className="fas fa-link text-gray-400 mr-2 w-5"></i>
                                                <span>{staff.emergency_contact.relationship}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No emergency contact information</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Employment Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            name="role"
                                            value={editData.role}
                                            onChange={handleEditChange}
                                            className={`w-full rounded-md border ${errors.role ? 'border-red-500' : 'border-gray-300'} p-2`}
                                        />
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            name="department"
                                            value={editData.department}
                                            onChange={handleEditChange}
                                            className={`w-full rounded-md border ${errors.department ? 'border-red-500' : 'border-gray-300'} p-2`}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Management">Management</option>
                                            <option value="Leasing">Leasing</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Administration">Administration</option>
                                        </select>
                                        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                                        <input
                                            type="number"
                                            name="salary"
                                            value={editData.salary}
                                            onChange={handleEditChange}
                                            className={`w-full rounded-md border ${errors.salary ? 'border-red-500' : 'border-gray-300'} p-2`}
                                        />
                                        {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                                        <input
                                            type="date"
                                            name="hire_date"
                                            value={editData.hire_date}
                                            onChange={handleEditChange}
                                            className={`w-full rounded-md border ${errors.hire_date ? 'border-red-500' : 'border-gray-300'} p-2`}
                                        />
                                        {errors.hire_date && <p className="text-red-500 text-xs mt-1">{errors.hire_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={editData.status}
                                            onChange={handleEditChange}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                        >
                                            <option value="active">Active</option>
                                            <option value="on_leave">On Leave</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            name="is_manager"
                                            checked={editData.is_manager}
                                            onChange={handleEditChange}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Is Manager</label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-600">Role</p>
                                        <p className="font-medium">{staff.role}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Department</p>
                                        <p className="font-medium">{staff.department}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Salary</p>
                                        <p className="font-medium">{formatCurrency(staff.salary)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Hire Date</p>
                                        <p className="font-medium">{formatDate(staff.hire_date)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Years of Service</p>
                                        <p className="font-medium">{yearsOfService()} years</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Manager Status</p>
                                        <p className="font-medium">{staff.is_manager ? "Yes" : "No"}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Assigned Properties */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Assigned Properties</h2>

                        {isEditing ? (
                            <div>
                                <div className="flex mb-4">
                                    <input
                                        type="text"
                                        value={currentProperty}
                                        onChange={(e) => setCurrentProperty(e.target.value)}
                                        className="flex-1 rounded-md border border-gray-300 p-2"
                                        placeholder="Enter property name"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddProperty}
                                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {editData.assigned_properties.map((property, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                                            {property}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProperty(index)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                {editData.assigned_properties.length === 0 && (
                                    <p className="text-gray-500">No properties assigned</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                {staff.assigned_properties.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {staff.assigned_properties.map((property, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                {property}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No properties assigned</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Performance & Notes */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Performance & Notes</h2>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Performance Rating</p>
                            <div className="flex items-center">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={`fas fa-star ${star <= staff.performance_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        ></i>
                                    ))}
                                </div>
                                <span className="ml-2 font-medium">{staff.performance_rating}/5</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Notes</p>
                            <p className="text-gray-800">{staff.notes}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleStaffPage;