import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { MdRestore } from "react-icons/md";
import { Button } from "../../shared";
import { DashboardHeader, PropertyCard } from "../properties/dashboard/page_components";

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
        </td>
        {[...Array(1)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-4 w-32" />
            </td>
        ))}
        <td className="px-4 py-3 flex space-x-4">
            <SkeletonLoader className="h-5 w-5 rounded" />
            <SkeletonLoader className="h-5 w-5 rounded" />
        </td>
    </tr>
);

const StatCardSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="flex justify-between items-center">
            <SkeletonLoader className="h-8 w-8 rounded" />
            <SkeletonLoader className="h-6 w-6 rounded" />
        </div>
        <div className="mt-3">
            <SkeletonLoader className="h-4 w-24 mb-2" />
        </div>
    </div>
);

function Recycle() {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [itemToRestore, setItemToRestore] = useState(null);

    const [selectedType, setSelectedType] = useState(null);
    const [deleteData, setDeleteData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [bulkAction, setBulkAction] = useState(null); // 'delete' or 'restore'

    useEffect(() => {
        if (!selectedType) return;

        const fetchData = async () => {
            try {
                switch (selectedType) {
                    case "tenant":
                        await fetchDeletedTenants();
                        break;
                    case "trash":
                        await fetchDeletedProperties();
                        break;
                    case "landlord": // Fixed: was "landlords" but type is "landlord"
                        await fetchDeletedLandlords();
                        break;
                    default:
                        console.warn("Unknown type:", selectedType);
                }
            } catch (error) {
                console.error("Failed to fetch deleted data:", error);
            }
        };

        fetchData();
    }, [selectedType]);

    const fetchDeletedTenants = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/manage-tenant/delete-and-restore-${selectedType}?pagination=${page}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const result = response.data;
            setDeleteData(result.result.data.map(item => ({ ...item, checked: false })));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching deleted tenants:", err);
            setLoading(false);
        }
    };

    const fetchDeletedLandlords = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/manage-landlord/delete-and-restore-${selectedType}?pagination=${page}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const result = response.data;
            // Transform landlord data to have consistent id field
            const transformedData = result.result.map(item => ({
                ...item,
                id: item.landlord_id, // Use landlord_id as id for consistency
                checked: false
            }));
            setDeleteData(transformedData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching deleted landlords:", err);
            setLoading(false);
        }
    };

    const fetchDeletedProperties = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/manage-property/${selectedType}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const result = response.data;
            setDeleteData(result.result.map(item => ({ ...item, checked: false })));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching deleted properties:", err);
            setLoading(false);
        }
    };

    const handleSingleDelete = async () => {
        if (!itemToDelete) return;

        try {
            let deleteUrl = "";

            switch (selectedType) {
                case "trash":
                    deleteUrl = `${baseUrl}/manage-property/permanently-delete?property_id=${itemToDelete.id}`;
                    break;
                case "tenant":
                    deleteUrl = `${baseUrl}/manage-tenant/permanently-delete?tenant_id=${itemToDelete.id}`;
                    break;
                case "landlord":
                    // Use the original landlord_id if available, otherwise use id
                    const landlordId = itemToDelete.landlord_id || itemToDelete.id;
                    deleteUrl = `${baseUrl}/manage-landlord/permanently-delete?landlord_id=${landlordId}`;
                    break;
                default:
                    toast.error("Unsupported type for deletion.");
                    return;
            }

            const deleteItem = await axios.post(deleteUrl, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (deleteItem.status === 200 || deleteItem.status === 204) {
                setDeleteData((prevData) =>
                    prevData.filter((item) => item.id !== itemToDelete.id)
                );
                toast.success(`${itemToDelete.name} deleted permanently.`);
            } else {
                toast.error("Failed to delete item.");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("An error occurred during deletion.");
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleSingleRestore = async () => {
        if (!itemToRestore || !selectedType) return;

        try {
            let restoreUrl = "";
            let requestBody = {};
            let method = "patch"; // default for tenant and landlord

            switch (selectedType) {
                case "trash":
                    restoreUrl = `${baseUrl}/manage-property/restore?property_id=${itemToRestore.id}`;
                    method = "post";
                    break;

                case "tenant":
                    restoreUrl = `${baseUrl}/manage-tenant/delete-and-restore-tenant`;
                    requestBody = { tenant_id: itemToRestore.id, action: "restore" };
                    break;

                case "landlord":
                    const landlordId = itemToRestore.landlord_id || itemToRestore.id;
                    restoreUrl = `${baseUrl}/manage-landlord/delete-and-restore-landlord`;
                    requestBody = { landlord_id: landlordId, action: "restore" };
                    break;

                default:
                    toast.error("Unsupported type for restoration.");
                    return;
            }

            const restoreItem = await axios[method](restoreUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (restoreItem.status === 200 || restoreItem.status === 204) {
                setDeleteData((prev) =>
                    prev.filter((item) => item.id !== itemToRestore.id)
                );
                toast.success(`${itemToRestore.name} restored successfully.`);
            } else {
                toast.error("Failed to restore item.");
            }
        } catch (error) {
            console.error("Restore error:", error);
            toast.error("An error occurred during restoration.");
        } finally {
            setIsRestoreModalOpen(false);
            setItemToRestore(null);
        }
    };


    const handleBulkDelete = async () => {
        const selectedItems = deleteData.filter(item => item.checked);
        if (selectedItems.length === 0) return;

        try {
            const deletePromises = selectedItems.map(async (item) => {
                let deleteUrl = "";

                switch (selectedType) {
                    case "trash":
                        deleteUrl = `${baseUrl}/manage-property/permanently-delete?property_id=${item.id}`;
                        break;
                    case "tenant":
                        deleteUrl = `${baseUrl}/manage-tenant/permanently-delete?tenant_id=${item.id}`;
                        break;
                    case "landlord":
                        // Use the original landlord_id if available, otherwise use id
                        const landlordId = item.landlord_id || item.id;
                        deleteUrl = `${baseUrl}/manage-landlord/permanently-delete?landlord_id=${landlordId}`;
                        break;
                    default:
                        throw new Error("Unsupported type for deletion.");
                }

                return axios.post(deleteUrl, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
            });

            await Promise.all(deletePromises);

            setDeleteData(prev => prev.filter(item => !item.checked));
            toast.success(`${selectedItems.length} items deleted permanently.`);
            setShowCheckboxes(false);
            setBulkAction(null);
        } catch (error) {
            console.error("Error in bulk delete:", error);
            toast.error("An error occurred during bulk deletion.");
        }
    };

    const handleBulkRestore = async () => {
        const selectedItems = deleteData.filter(item => item.checked);
        if (selectedItems.length === 0) return;

        try {
            const restorePromises = selectedItems.map(async (item) => {
                let restoreUrl = "";
                let requestBody = {};
                let method = "patch"; // default for tenant & landlord

                switch (selectedType) {
                    case "trash":
                        restoreUrl = `${baseUrl}/manage-property/restore?property_id=${item.id}`;
                        method = "post";
                        break;
                    case "tenant":
                        restoreUrl = `${baseUrl}/manage-tenant/delete-and-restore-tenant`;
                        requestBody = { tenant_id: item.id, action: "restore" };
                        break;
                    case "landlord":
                        restoreUrl = `${baseUrl}/manage-landlord/delete-and-restore-landlord`;
                        requestBody = { landlord_id: item.id, action: "restore" };
                        break;
                    default:
                        throw new Error("Unsupported type for restoration.");
                }

                return axios[method](restoreUrl, requestBody, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
            });

            await Promise.all(restorePromises);

            setDeleteData(prev => prev.filter(item => !item.checked));
            toast.success(`${selectedItems.length} item(s) restored successfully.`);
            setShowCheckboxes(false);
            setBulkAction(null);
        } catch (error) {
            console.error("Error in bulk restore:", error);
            toast.error("An error occurred during bulk restoration.");
        }
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const openRestoreModal = (item) => {
        setItemToRestore(item);
        setIsRestoreModalOpen(true);
    };

    const handleDeleteIconClick = (item) => {
        if (!showCheckboxes) {
            setShowCheckboxes(true);
            setBulkAction('delete');
            setDeleteData(prev => prev.map(dataItem =>
                dataItem.id === item.id ? { ...dataItem, checked: true } : dataItem
            ));
        } else {
            openDeleteModal(item);
        }
    };

    const handleRestoreIconClick = (item) => {
        if (!showCheckboxes) {
            setShowCheckboxes(true);
            setBulkAction('restore');
            setDeleteData(prev => prev.map(dataItem =>
                dataItem.id === item.id ? { ...dataItem, checked: true } : dataItem
            ));
        } else {
            openRestoreModal(item);
        }
    };

    const recycleStats = [
        {
            iconSrc: "../../../assets/recycleBin/properties.svg",
            progress: 20,
            label: "Deleted Properties",
            value: 20,
            type: "trash"
        },
        {
            iconSrc: "../../../assets/recycleBin/floor.svg",
            progress: 20,
            label: "Deleted Floors",
            value: 15,
            type: "floor"
        },
        {
            iconSrc: "../../../assets/recycleBin/unit.svg",
            progress: 20,
            label: "Deleted Units",
            value: 45,
            type: "unit"
        },
        {
            iconSrc: "../../../assets/recycleBin/tenants.svg",
            progress: 20,
            label: "Deleted Tenants",
            value: 12,
            type: "tenant"
        },
        {
            iconSrc: "../../../assets/recycleBin/landlord.svg",
            progress: 20,
            label: "Deleted Landlords",
            value: 5,
            type: "landlord"
        },
    ];

    const toggleCheckbox = (itemId) => {
        setDeleteData(prev => prev.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        ));
    };

    const toggleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setDeleteData(prev => prev.map(item => ({ ...item, checked: isChecked })));
    };

    const allChecked = deleteData.length > 0 && deleteData.every(item => item.checked);
    const selectedCount = deleteData.filter(item => item.checked).length;

    const cancelBulkAction = () => {
        setShowCheckboxes(false);
        setBulkAction(null);
        setDeleteData(prev => prev.map(item => ({ ...item, checked: false })));
    };

    return (
        <>
            <DashboardHeader
                title="Recycle bin"
                description="Your deleted properties, tenants and landlords"
                hideSelect={false}
            />

            <div className="w-full space-y-4 py-1 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recycleStats.slice(0, 3).map((stat, index) => (
                        <div
                            onClick={() => setSelectedType(stat.type)}
                            key={index}
                            className={`bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${selectedType === stat.type ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            <PropertyCard
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recycleStats.slice(3).map((stat, index) => (
                        <div
                            onClick={() => setSelectedType(stat.type)}
                            key={index + 3}
                            className={`bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${selectedType === stat.type ? 'ring-2 ring-blue-500' : ''
                                }`}
                        >
                            <PropertyCard
                                iconSrc={stat.iconSrc}
                                label={stat.label}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {selectedType && (
                <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                    <h4 className="text-md text-gray-600 my-4 px-4">
                        {selectedType === 'trash' ? 'Deleted Properties' :
                            selectedType === 'tenant' ? 'Deleted Tenants' :
                                selectedType === 'landlord' ? 'Deleted Landlords' :
                                    'Deleted Items'}
                    </h4>

                    {showCheckboxes && (
                        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setDeleteData(prev => prev.map(item => ({ ...item, checked: true })))}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={() => setDeleteData(prev => prev.map(item => ({ ...item, checked: false })))}
                                    className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Deselect All
                                </button>
                                <button
                                    onClick={cancelBulkAction}
                                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {selectedCount} selected
                                </span>
                                {bulkAction === 'delete' && (
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={selectedCount === 0}
                                        className={`px-3 py-1 text-sm text-white rounded ${selectedCount === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                    >
                                        Delete Selected ({selectedCount})
                                    </button>
                                )}
                                {bulkAction === 'restore' && (
                                    <button
                                        onClick={handleBulkRestore}
                                        disabled={selectedCount === 0}
                                        className={`px-3 py-1 text-sm text-white rounded ${selectedCount === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                    >
                                        Restore Selected ({selectedCount})
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="w-full">
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100 text-left text-xs border-y">
                                    <tr className="py-2">
                                        {showCheckboxes && (
                                            <th className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={allChecked}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Date Deleted</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array(5).fill(0).map((_, index) => (
                                            <TableRowSkeleton key={index} />
                                        ))
                                    ) : (
                                        deleteData.map((item, index) => (
                                            <tr key={index} className="border-b text-sm">
                                                {showCheckboxes && (
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.checked || false}
                                                            onChange={() => toggleCheckbox(item.landlord_id || item.id)}
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-4 py-2">{item.name}</td>
                                                <td className="px-4 py-2">
                                                    {new Date(item.deleted_at).toLocaleString('en-US', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="flex py-5 px-2 space-x-4">
                                                    <MdRestore
                                                        onClick={() => handleRestoreIconClick(item)}
                                                        className="text-green-500 hover:text-green-700 cursor-pointer"
                                                        title="Restore"
                                                    />
                                                    {/* <FaTrash
                                                        onClick={() => handleDeleteIconClick(item)}
                                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                                        title="Delete Permanently"
                                                    /> */}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to delete {" "}
                            <span className="font-bold">{itemToDelete?.name}</span> permanently? This action
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSingleDelete} className="bg-red-500 hover:bg-red-600">
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Restore Modal */}
            {isRestoreModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Restoration
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to restore {" "}
                            <span className="font-bold">{itemToRestore?.name}</span>?
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsRestoreModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSingleRestore} className="bg-green-500 hover:bg-green-600">
                                Restore
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Recycle