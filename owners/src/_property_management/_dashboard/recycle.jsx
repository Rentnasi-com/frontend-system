import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "./pages/page_components"
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaTrash } from "react-icons/fa";
import { MdRestore } from "react-icons/md";

import { Button } from "../../shared";
function Recycle() {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState([]);

    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [itemToRestore, setItemToRestore] = useState([]);

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseUrl}/manage-property/trash`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const result = response.data;
                setProperties(result.result);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [token, baseUrl]);

    const handleDelete = async () => {
        if (itemToDelete) {
            try {
                const deleteItem = await axios.post(
                    `${baseUrl}/manage-property/permanently-delete?property_id=${itemToDelete.id}`, {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (deleteItem.status === 200 || deleteItem.status === 204) {
                    setProperties((prevProperties) =>
                        prevProperties.filter((property) => property.id !== itemToDelete.id)
                    );
                    toast.success(`${itemToDelete.name} deleted from recycle bin successfully.`);
                } else {
                    console.error("Failed to delete item.");
                }
            } catch (error) {
                console.error("Error deleting item:", error);
            } finally {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            }
        }
    };
    const handleRestore = async () => {
        if (itemToRestore) {
            try {
                const restoreItem = await axios.post(
                    `${baseUrl}/manage-property/restore?property_id=${itemToRestore.id}`, {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                if (restoreItem.status === 200 || restoreItem.status === 204) {
                    setProperties((prevProperties) =>
                        prevProperties.filter((property) => property.id !== itemToRestore.id)
                    );
                    toast.success(`${itemToRestore.name} restored from recycle bin successfully.`);
                } else {
                    console.error("Failed to delete item.");
                }
            } catch (error) {
                console.error("Error deleting item:", error);
            } finally {
                setIsRestoreModalOpen(false);
                setItemToRestore(null);
            }
        }
    };

    const openDeleteModal = (property) => {
        setItemToDelete(property);
        setIsDeleteModalOpen(true);
    };

    const openRestoreModal = (property) => {
        setItemToRestore(property);
        setIsRestoreModalOpen(true);
    }

    return (
        <>
            <DashboardHeader
                title="Recycle bin"
                description="Your deleted properties"
                hideSelect={false}
            />

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <h4 className="text-md text-gray-600 my-4 px-2">All property List</h4>
                {loading ? (
                    <p className="text-center py-4">Loading...</p>
                ) : (
                <div className="w-full">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-left text-xs border-y ">
                                <tr className="py-2">
                                    <th className="px-4 py-2">Property Name</th>
                                    <th className="px-4 py-2">Date Deleted</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map((property, index) => (
                                    <tr key={index} className="border-b text-sm">

                                        <td className="px-4 py-2">{property.name}</td>
                                        <td className="px-4 py-2">{property.deleted_at}</td>
                                        <td className="flex py-5 px-2 space-x-4">
                                            <MdRestore onClick={() => openRestoreModal(property)} className="text-purple-500 hover:text-purple-700 cursor-pointer" />
                                            <FaTrash onClick={() => openDeleteModal(property)} className="text-red-500 hover:text-red-700 cursor-pointer" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>
            {isDeleteModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to delete this {" "}
                            <span className="font-bold">{itemToDelete?.name}</span> completely? This action
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleDelete}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}
            {isRestoreModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Restoration
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to restore {" "}
                            <span className="font-bold">{itemToRestore?.name}</span> completely? 
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsRestoreModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleRestore}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Recycle