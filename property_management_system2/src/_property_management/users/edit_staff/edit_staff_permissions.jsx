import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { FaArrowRight } from "react-icons/fa"
import { useNavigate, useSearchParams } from "react-router-dom"
import { z } from "zod"

const EditStaffPermissions = () => {
    const [permissions, setPermissions] = useState([])
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [prevPermissions, setPrevPermissions] = useState([])
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
    const [isLoadingPrevPermissions, setIsLoadingPrevPermissions] = useState(true)
    const [fetchError, setFetchError] = useState(null)
    const [searchParams] = useSearchParams()
    const staffId = searchParams.get('staff_id')

    const navigate = useNavigate()

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL

    const schema = z.object({
        permissions: z.array(z.number()).default([]),
    })

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            permissions: [],
        },
    })

    // Fetch all available permissions
    const fetchPermissions = async () => {
        setIsLoadingPermissions(true)
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

    // Fetch staff's current permissions
    const getStaffPreviousPermissions = async () => {
        if (!staffId) return

        setIsLoadingPrevPermissions(true)
        try {
            const response = await axios.get(
                `${baseUrl}/manage-org/user/permissions?user_id=${staffId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setPrevPermissions(response.data.results)

            // Extract permission IDs from the nested structure
            const permissionIds = []
            response.data.results.forEach(module => {
                module.actions.forEach(action => {
                    permissionIds.push(action.id)
                })
            })
            setSelectedPermissions(permissionIds)

        } catch (error) {
            toast.error("Failed to fetch staff previous permissions. Please try again.")
        } finally {
            setIsLoadingPrevPermissions(false)
        }
    }

    useEffect(() => {
        fetchPermissions()
        if (staffId) {
            getStaffPreviousPermissions()
        }
    }, [token, baseUrl, staffId])

    // Group permissions by module
    const groupByModule = (permissions) => {
        return permissions.reduce((acc, perm) => {
            if (!acc[perm.module]) acc[perm.module] = []
            acc[perm.module].push(perm)
            return acc
        }, {})
    }

    const modules = groupByModule(permissions || [])

    // Handle permission selection
    const handlePermissionChange = (permissionId, isChecked) => {
        if (isChecked) {
            setSelectedPermissions(prev => [...prev, Number(permissionId)])
        } else {
            setSelectedPermissions(prev => prev.filter(id => id !== Number(permissionId)))
        }
    }

    // Submit updated permissions
    const onSubmit = async () => {
        const dataToSend = {
            permissions: selectedPermissions,
            user_id: Number(staffId)
        }

        try {
            const response = await axios.put(
                `${baseUrl}/manage-org/user/permissions`,
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                toast.success("Permissions updated successfully")
                navigate(-1)
            }

        } catch (error) {
            console.error('Error updating permissions:', error)
            toast.error("Failed to update permissions. Please try again.")
        }
    }

    // Handle form validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, error]) => {
                toast.error(`${field}: ${error.message}`)
            })
        }
    }, [errors])

    const isLoading = isLoadingPermissions || isLoadingPrevPermissions

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">
                        Edit Staff Permissions
                    </h1>
                    <p className="text-sm text-gray-500">
                        Update permissions for staff member
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1">
                <div className="bg-white rounded-xl shadow p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800 mb-4">
                        Update Permissions
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader className="animate-spin mr-2" />
                            Loading permissions...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="text-sm space-y-4 rounded bg-gray-50 border p-4">
                                {Object.entries(modules).map(([module, perms]) => (
                                    <div
                                        key={module}
                                        className="flex items-center justify-between px-4 py-2"
                                    >
                                        <div className="font-medium text-gray-800 capitalize">
                                            {module}
                                        </div>

                                        <div className="flex space-x-6">
                                            {["view", "add", "edit", "delete"].map((action) => {
                                                const perm = perms.find((p) => p.action === action)

                                                return (
                                                    <label
                                                        key={action}
                                                        className={`flex items-center space-x-1 ${perm ? "text-gray-700" : "text-gray-300"
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={perm ? selectedPermissions.includes(perm.permission_id) : false}
                                                            onChange={(e) => perm && handlePermissionChange(perm.permission_id, e.target.checked)}
                                                            disabled={!perm}
                                                            className="form-checkbox text-red-500"
                                                        />
                                                        <span className="capitalize">{action}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {fetchError && (
                                <p className="text-xs text-red-500">
                                    {fetchError}
                                </p>
                            )}

                            {/* Show current vs new permissions summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <h4 className="font-medium text-blue-800 mb-2">Summary:</h4>
                                <p className="text-sm text-blue-700">
                                    Previous permissions: {prevPermissions.length}
                                </p>
                                <p className="text-sm text-blue-700">
                                    New permissions: {selectedPermissions.length}
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
                                            <p>Update Permissions</p>
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

export default EditStaffPermissions