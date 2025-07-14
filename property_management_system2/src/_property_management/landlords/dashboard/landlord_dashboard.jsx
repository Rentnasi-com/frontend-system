import { useEffect, useState } from "react"
import axios from "axios"
import { DashboardHeader } from "../../_dashboard/pages/page_components"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const SkeletonLoader = ({ className, rounded = false }) => (
    <div
        className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    ></div>
);

const TableRowSkeleton = () => (
    <tr className="border-b">
        <td className="px-4 py-3"><SkeletonLoader className="w-12 h-5" /></td>
        <td className="px-4 py-3">
            <SkeletonLoader className="h-4 w-32 mb-1" />
        </td>
        {[...Array(1)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonLoader className="h-6 w-12 mx-auto" />
            </td>
        ))}
    </tr>
);

const ViewLandlord = () => {
    const [landlords, setLandlords] = useState([])
    const baseUrl = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("token")
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState("");

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showCheckboxes, setShowCheckboxes] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [landlordsToDelete, setLandlordsToDelete] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchLandlord()
    }, [baseUrl, token, confirmedSearch])

    const fetchLandlord = async () => {
        try {
            const response = await axios.get(
                `${baseUrl}/manage-landlord/get-all-landlord?query=${confirmedSearch}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setLandlords(response.data.result)
        } catch (error) {
            toast.error("Failed to fetch landlords. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value); // Update the search input state
    };

    const handleSubmitSearch = (event) => {
        event.preventDefault();
        setConfirmedSearch(searchQuery); // Only confirm search upon submission
        console.log("Searching for:", searchQuery); // Replace this with your API call
    };

    const toggleDropdown = (landlordId) => {
        setOpenDropdownId(openDropdownId === landlordId ? null : landlordId);
    };

    const handleAction = (landlordId, action) => {
        setOpenDropdownId(null);

        if (action === 'delete') {
            if (!showCheckboxes) setShowCheckboxes(true);
            setLandlords(landlords.map(landlord =>
                landlord.landlord_info.landlord_id === landlordId ? { ...landlord, checked: true } : landlord
            ));
        }
        // Handle other actions...
    };

    const toggleCheckbox = (landlordId) => {
        setLandlords(landlords.map(landlord =>
            landlord.landlord_info.landlord_id === landlordId ? { ...landlord, checked: !landlord.checked } : landlord
        ));
    };

    const toggleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setLandlords(landlords.map(landlord => ({ ...landlord, checked: isChecked })));
    };

    const allChecked = landlords.length > 0 && landlords.every(landlord => landlord.checked);

    const showDeleteModal = () => {
        const selected = landlords.filter(t => t.checked);
        if (selected.length === 0) return;

        setLandlordsToDelete(selected);
        setShowDeleteConfirm(true);
    };

    const deletelandlords = async (landlordIds) => {
        const dataToSend = Array.isArray(landlordIds) && landlordIds.length > 1
            ? { landlord_ids: landlordIds }
            : { landlord_id: Array.isArray(landlordIds) ? landlordIds[0] : landlordIds };
        try {
            const response = await toast.promise(
                axios.delete(`${baseUrl}/manage-landlord/delete-and-restore-landlord`, {
                    data: dataToSend,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                {
                    loading: "Deleting your landlord ...",
                    success: "Landlord deleted successfully, check your bin.",
                    error: "Failed to delete landlord. Please try again later.",
                }
            );
            if (response.status === 200) {
                toast.success = response.message
                fetchLandlord()
            }
        } catch (error) {
            console.error(error.message);
            return false;
        }
    };


    const confirmDelete = async () => {
        const landlordIds = landlordsToDelete.map(t => t.landlord_info.landlord_id);

        if (landlordIds.length === 1) {
            const success = await deletelandlords(landlordIds[0]);
            if (success) {
                setLandlords(landlords.filter(landlord => landlord.landlord_info.landlord_id !== landlordIds[0]));
            }
        }
        else {
            const success = await deletelandlords(landlordIds);
            if (success) {
                setLandlords(landlords.filter(landlord =>
                    !landlordIds.includes(landlord.landlord_info.landlord_id)
                ));
            }
        }

        setShowDeleteConfirm(false);
        setLandlordsToDelete([]);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setLandlordsToDelete([]);
    };

    return (
        <>
            <DashboardHeader
                title="Landlords Listing"
                description="Real-time information and activities of your landlords."
                name="Add landlord"
                link="/add-landlord/personal-information"
                hideSelect={false}
                hideLink={true}
            />

            <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
                    <h4 className="text-md text-gray-600">All landlord list</h4>

                    <form onSubmit={handleSubmitSearch} className="w-72">
                        <label className="text-sm font-medium text-gray-900 sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                                placeholder="Search landlords..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </form>
                </div>

                <div className="flex justify-between items-center px-4 text-xs">
                    {showCheckboxes && (
                        <div className="my-2 space-x-2">
                            <button
                                onClick={() => setLandlords(landlords.map(t => ({ ...t, checked: true })))}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Select All
                            </button>
                            <button
                                onClick={() => setLandlords(landlords.map(t => ({ ...t, checked: false })))}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Deselect All
                            </button>
                            <button
                                onClick={showDeleteModal}
                                disabled={landlords.filter(t => t.checked).length === 0}
                                className={`px-4 py-2 text-white rounded ${landlords.filter(t => t.checked).length === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                Delete Selected ({landlords.filter(t => t.checked).length})
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative max-h-[590px] overflow-auto">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100 text-left text-xs border-b sticky top-0 z-20">
                            <tr className="px-4 py-2">
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
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Landlord Details</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Properties Details</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Expected Revenue</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Outstanding Revenue</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Pending Balances</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Fines</th>
                                <th className="px-4 py-3 bg-gray-100 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <TableRowSkeleton key={index} />
                                ))
                            ) : (
                                landlords.map((landlord, index) => (
                                    <tr key={index} className="bg-white divide-y divide-gray-200">
                                        {showCheckboxes && (
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={landlord.checked}
                                                    onChange={() => toggleCheckbox(landlord.landlord_info.landlord_id)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </td>
                                        )}
                                        <td className="text-xs px-4 py-4">
                                            <div className="font-semibold text-black">
                                                {landlord.landlord_info.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {landlord.landlord_info.email}
                                            </div>
                                            <div className="flex space-x-10 text-xs">
                                                <div className="mt-1">
                                                    <p>Phone</p>
                                                    <p className="font-semibold text-gray-700">
                                                        {landlord.landlord_info.phone}
                                                    </p>
                                                </div>
                                                <div className="mt-1">
                                                    <p>Id No</p>
                                                    <p className="font-semibold text-gray-700">
                                                        {landlord.landlord_info.id_or_passport_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm">Total Properties: {landlord.properties}</span>
                                            {landlord.landlord_details?.map((property, index) => (
                                                <div className="text-xs text-gray-800" key={index}>
                                                    {property.property_name}
                                                </div>
                                            ))}

                                            <div className="flex space-x-10 text-xs">
                                                <div className="mt-1">
                                                    <p>Vacant</p>
                                                    <p className="font-semibold text-gray-700">
                                                        {landlord.vacant_units}
                                                    </p>
                                                </div>
                                                <div className="mt-1">
                                                    <p>Occupied</p>
                                                    <p className="font-semibold text-gray-700">
                                                        {landlord.occupied_units}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>


                                        <td className="py-4 px-4 text-sm text-gray-700">
                                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">KES {(landlord.expected_revenue.toLocaleString() || 0)}</span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-700">
                                            <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">KES {(landlord.outstanding_revenue.toLocaleString() || 0)}</span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-700">
                                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">KES {(landlord.pending_balance.toLocaleString() || 0)}</span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-700">
                                            <span className="bg-blue-100 border border-blue-400 text-blue-600 px-2 py-1 rounded">KES {landlord.fines.toLocaleString() || 0}</span>
                                        </td>
                                        <td className="relative px-4 py-2 text-sm">
                                            {/* Dropdown button - only in Actions column */}
                                            <button
                                                onClick={() => toggleDropdown(landlord.landlord_info.landlord_id)}
                                                className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                            >
                                                Actions
                                                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>


                                            {openDropdownId === landlord.landlord_info.landlord_id && (
                                                <div className="absolute right-0 z-10 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => navigate(`/landlords/view-landlord/${landlord.landlord_info.landlord_id}`)}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            View landlord
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/edit-landlord/personal-information?landlord_id=${landlord.landlord_info.landlord_id}`)}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Edit Profile
                                                        </button>

                                                        <button
                                                            onClick={() => handleAction(landlord.landlord_info.landlord_id, 'delete')}
                                                            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                        >
                                                            Delete landlord
                                                        </button>
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
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete {landlordsToDelete.length} selected landlord(s)?
                            to recycle bin? This action can be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ViewLandlord
