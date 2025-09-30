import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { FaArrowRight } from "react-icons/fa"
import { useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"

const AddPropertiesAssignPermissions = () => {
    const [properties, setProperties] = useState([])
    const [permissions, setPermissions] = useState([])
    const [selectedProperties, setSelectedProperties] = useState([])
    const [isLoadingProperties, setIsLoadingProperties] = useState(true)
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
    const [fetchError, setFetchError] = useState(null)
    const [searchParams] = useSearchParams();
    const staffId = searchParams.get('staff_id')

    const navigate = useNavigate();

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL

    const schema = z.object({
        properties: z.array(z.string()).optional(),
        permissions: z.array(z.number()).default([]),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            permissions: [],
            properties: [],
        },
    });

    useEffect(() => {
        fetchProperties()
        fetchPermissions()
    }, [token, baseUrl])

    const fetchProperties = async () => {
        setIsLoadingProperties(true);
        setFetchError(null);

        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/manage-landlord/required-data/available-properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setProperties(propertyResponse.data.result)
        } catch (error) {
            setFetchError("Failed to fetch properties. Please try again.")
        } finally {
            setIsLoadingProperties(false)
        }
    }

    const fetchPermissions = async () => {
        setIsLoadingPermissions(true);
        try {
            const permissionsResponse = await axios.get(
                `${baseUrl}/manage-org/permissions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setPermissions(permissionsResponse.data.results)
        } catch (error) {
            setFetchError("Failed to fetch permissions. Please try again.")
        } finally {
            setIsLoadingPermissions(false)
        }
    }

    const groupByModule = (permissions) => {
        return permissions.reduce((acc, perm) => {
            if (!acc[perm.module]) acc[perm.module] = [];
            acc[perm.module].push(perm);
            return acc;
        }, {});
    };

    const modules = groupByModule(permissions || []);



    const handleSelectChange = (event) => {
        const selectedOption = Number(event.target.value); // Convert to number
        if (selectedOption && !selectedProperties.includes(selectedOption)) {
            setSelectedProperties((prev) => {
                const updatedProperties = [...prev, selectedOption];
                return updatedProperties;
            });
        }
    };

    const handleRemoveProperty = (propertyId) => {
        setSelectedProperties((prev) => prev.filter((id) => id !== propertyId));
    };

    const propertiesOptions = useMemo(() => (
        properties
            .filter(property => !selectedProperties.includes(property.id)) // Filter out selected properties
            .map((property) => (
                <option value={property.id} key={property.id}>{property.name}</option>
            ))
    ), [properties, selectedProperties]);


    const onSubmit = async (values) => {
        const dataToSend = {
            ...values,
            properties: selectedProperties,
            user_id: Number(staffId),
            permissions: selectedPermissions,
        }

        try {
            const response = await axios.post(`${baseUrl}/manage-org/users/second`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                toast.success("Staff assigned properties and permissions successfully")
                navigate("/staffs/staff-listings")
            }

        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, error]) => {
                toast.error(`${field}: ${error.message}`);
            });
        }
    }, [errors]);

    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const handlePermissionChange = (permissionId, isChecked) => {
        if (isChecked) {
            setSelectedPermissions(prev => [...prev, Number(permissionId)]);
        } else {
            setSelectedPermissions(prev => prev.filter(id => id !== Number(permissionId)));
        }
    };

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Assign properties and permissions to staff</h1>
                    <p className="text-sm text-gray-500">Create new staff and link them to a property unit </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Staff details</h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <h3 className="font-bold text-gray-600 mt-2">(b) Assign Properties</h3>
                        <div className="w-full">
                            <label
                                htmlFor="property-name"
                                className="block my-2 text-sm font-medium text-gray-900"
                            >
                                Select landlord property
                            </label>
                            {isLoadingProperties ? (
                                <Loader className="animate-spin" />
                            ) : (
                                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                    onChange={handleSelectChange}
                                >
                                    <option value="">Select property to link to this landloard</option>
                                    {propertiesOptions}
                                </select>
                            )}

                            {fetchError && (
                                <p className="text-xs text-red-500">
                                    {fetchError}
                                </p>
                            )}
                        </div>
                        <div>
                            {selectedProperties.map((propertyId) => {
                                const property = properties.find((property) => String(property.id) === String(propertyId));

                                return (
                                    < span
                                        key={propertyId}
                                        className="inline-flex items-center px-2 py-1 mr-2 text-sm font-medium text-green-800 bg-green-100 rounded"
                                    >
                                        {property ? property.name : "unknown"}

                                        <button
                                            type="button"
                                            className="inline-flex items-center p-1 ml-2 text-sm text-green-400 bg-transparent rounded-sm hover:bg-green-200 hover:text-green-900"
                                            onClick={() => handleRemoveProperty(propertyId)}
                                            aria-label="Remove"
                                        >
                                            <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                            </svg>
                                            <span className="sr-only">Remove badge</span>
                                        </button>
                                    </span>
                                )
                            })}
                        </div>
                        <h3 className="font-bold text-gray-600 mt-2">(c) Assign Permissions</h3>
                        <div className="text-sm space-y-4 rounded bg-gray-50 border p-1">
                            {Object.entries(modules).map(([module, perms]) => (
                                <div
                                    key={module}
                                    className="flex items-center justify-between px-4 py-1"
                                >
                                    <div className="font-medium text-gray-800 capitalize">
                                        {module}
                                    </div>

                                    <div className="flex space-x-6">
                                        {["view", "add", "edit", "delete"].map((action) => {
                                            const perm = perms.find((p) => p.action === action);

                                            return (
                                                <label
                                                    key={action}
                                                    className={`flex items-center space-x-1 ${perm ? "text-gray-700" : "text-gray-300"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(perm.permission_id)}
                                                        onChange={(e) => handlePermissionChange(perm.permission_id, e.target.checked)}
                                                        disabled={!perm}
                                                        className="form-checkbox text-red-500"
                                                    />
                                                    <span className="capitalize">{action}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-row-reverse mt-4">
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5">
                                {isSubmitting ? (
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader className="animate-spin" /> Loading ...
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center space-x-2">
                                        <p>Finish</p> <FaArrowRight />
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default AddPropertiesAssignPermissions