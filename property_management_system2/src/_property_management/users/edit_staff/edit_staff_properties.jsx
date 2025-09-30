import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { FaArrowRight } from "react-icons/fa"
import { useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"

const EditStaffProperties = () => {
    const [properties, setProperties] = useState([])
    const [prevProperties, setPrevProperties] = useState([])
    const [selectedProperties, setSelectedProperties] = useState([])
    const [isLoadingProperties, setIsLoadingProperties] = useState(true)
    const [isLoadingPrevProperties, setIsLoadingPrevProperties] = useState(true)
    const [fetchError, setFetchError] = useState(null)
    const [searchParams] = useSearchParams();
    const staffId = searchParams.get('staff_id')

    const navigate = useNavigate();

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL

    const schema = z.object({
        properties: z.array(z.string()).optional(),
    });

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            properties: [],
        },
    });

    useEffect(() => {
        fetchProperties()
        if (staffId) {
            getStaffPreviousProperties()
        }
    }, [token, baseUrl, staffId])

    const getStaffPreviousProperties = async () => {
        if (!staffId) return

        setIsLoadingPrevProperties(true)
        try {
            const response = await axios.get(
                `${baseUrl}/manage-org/user/properties?user_id=${staffId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setPrevProperties(response.data.result)


            const propertyIds = response.data.result.map(property => property.property_id)
            setSelectedProperties(propertyIds)


        } catch (error) {
            console.error('Error fetching previous properties:', error)
            toast.error("Failed to fetch staff's current properties")
        } finally {
            setIsLoadingPrevProperties(false)
        }
    }

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
            toast.error("Failed to fetch available properties")
        } finally {
            setIsLoadingProperties(false)
        }
    }

    const handleSelectChange = (event) => {
        const selectedOption = Number(event.target.value);
        if (selectedOption && !selectedProperties.includes(selectedOption)) {
            setSelectedProperties((prev) => {
                const updatedProperties = [...prev, selectedOption];
                return updatedProperties;
            });
        }
        // Reset the select dropdown
        event.target.value = "";
    };

    const handleRemoveProperty = (propertyId) => {
        setSelectedProperties((prev) => prev.filter((id) => id !== propertyId));
    };

    const propertiesOptions = useMemo(() => (
        properties
            .filter(property => !selectedProperties.includes(property.id))
            .map((property) => (
                <option value={property.id} key={property.id}>{property.name}</option>
            ))
    ), [properties, selectedProperties]);

    const onSubmit = async (values) => {
        const dataToSend = {
            properties: selectedProperties,
            user_id: Number(staffId),
        }

        try {
            const response = await axios.put(`${baseUrl}/manage-org/user/properties`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                toast.success("Staff properties updated successfully")
                navigate("/staffs/staff-listings")
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update properties"
            toast.error(errorMessage)
        }
    }

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, error]) => {
                toast.error(`${field}: ${error.message}`);
            });
        }
    }, [errors]);

    const isLoading = isLoadingProperties || isLoadingPrevProperties;

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">
                        Edit Staff Properties
                    </h1>
                    <p className="text-sm text-gray-500">
                        Update properties assigned to staff member
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Staff Property Assignment</h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader className="animate-spin mr-2" />
                            Loading properties...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <h3 className="font-bold text-gray-600 mt-2">Update Assigned Properties</h3>

                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Add more properties
                                </label>

                                <select
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                    onChange={handleSelectChange}
                                    defaultValue=""
                                >
                                    <option value="">Select additional property to assign</option>
                                    {propertiesOptions}
                                </select>

                                {fetchError && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {fetchError}
                                    </p>
                                )}
                            </div>

                            {/* Currently assigned properties */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Currently Assigned Properties ({selectedProperties.length})
                                </h4>

                                {selectedProperties.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No properties assigned</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProperties.map((propertyId) => {
                                            const property = properties.find((property) => property.id === propertyId);

                                            return (
                                                <span
                                                    key={propertyId}
                                                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full"
                                                >
                                                    {property ? property.name : "Unknown Property"}

                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center p-1 ml-2 text-sm text-green-600 bg-transparent rounded-full hover:bg-green-200 hover:text-green-900"
                                                        onClick={() => handleRemoveProperty(propertyId)}
                                                        aria-label="Remove property"
                                                    >
                                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Summary section */}
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <h4 className="font-medium text-blue-800 mb-2">Summary:</h4>
                                <p className="text-sm text-blue-700">
                                    Previous properties: {prevProperties.length}
                                </p>
                                <p className="text-sm text-blue-700">
                                    Current properties: {selectedProperties.length}
                                </p>
                            </div>

                            <div className="flex flex-row-reverse mt-6">
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5"
                                >
                                    {isSubmitting ? (
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader className="animate-spin" />
                                            Updating...
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center space-x-2">
                                            <p>Update Properties</p>
                                            <FaArrowRight />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}

export default EditStaffProperties