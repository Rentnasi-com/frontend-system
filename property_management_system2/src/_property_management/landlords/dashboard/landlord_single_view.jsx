import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "../../../shared";
import { DashboardHeader, PropertyCard } from "../../properties/dashboard/page_components";

const LandlordSingleView = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState([]);
  const [landlordDetails, setLandlordDetails] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate()
  const { landlord_id } = useParams();

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/manage-property/view-properties/saved?pagination=${page}&landlord_id=${landlord_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = response.data;
      setProperties(result.result.data);
      setDetails(response.data.details.breakdown);
      setRevenue(response.data.details.revenue.amounts);
      setLandlordDetails(response.data.details.landlord_details);
      setCurrentPage(result.current_page);
      setNextPageUrl(result.next_page_url);
      setPrevPageUrl(result.prev_page_url);
      setLastPage(result.last_page);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(currentPage);
  }, [currentPage, token, landlord_id]);

  const handleNextPage = () => {
    if (nextPageUrl) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (prevPageUrl) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const stats = [

    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: details.all_properties?.images,
      progress: 20,
      label: "All Properties",
      value: details.all_properties?.count || 0,
    },

    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: details.all_property_units?.images || "",
      progress: 20,
      label: "All Property Units",
      value: details.all_property_units?.count || 0,
    },
    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: details.occupied_units?.images || "",
      progress: 20,
      label: "Occupied Units",
      value: details.occupied_units?.count || 0,
    },
    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: details.vacant_units?.images || "",
      progress: 20,
      label: "Vacant Units",
      value: details.vacant_units?.count || 0,
    },
    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: revenue.amount_paid?.images,
      progress: 20,
      label: "Amount Paid",
      value: revenue.amount_paid?.count || 0,
    },

    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: revenue.expected_amount?.images || "",
      progress: 20,
      label: "Expected Amounts",
      value: revenue.expected_amount?.count || 0,
    },
    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: revenue.fines?.images || "",
      progress: 20,
      label: "Fines",
      value: revenue.fines?.count || 0,
    },
    {
      // redirectUrl: "/property/revenue-breakdown",
      iconSrc: revenue.outstanding_balance?.images || "",
      progress: 20,
      label: "Outstanding Balance",
      value: revenue.outstanding_balance?.count || 0,
    },
  ];
  const openDeleteModal = (property) => {
    setItemToDelete(property);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        const deleteItem = await axios.post(
          `${baseUrl}/manage-property/delete?property_id=${itemToDelete.id}`, {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              // "Content-Type": "application/json",
            },
          }
        );

        if (deleteItem.status === 200 || deleteItem.status === 204) {
          setProperties((prevProperties) =>
            prevProperties.filter((property) => property.id !== itemToDelete.id)
          );
          toast.success(`${itemToDelete.property_name} moved to recycle bin successfully.`);
        } else {
          console.error("Failed to delete item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setIsModalOpen(false); // Close the modal
        setItemToDelete(null);
      }
    }
  };
  return (
    <>
      <DashboardHeader
        title="Landlord View"
        description="View all information about your landlord"
        name="Add landlord"
        link="/add-landlord/personal-information"
        hideSelect={false}
        hideLink={true}
      />
      <div className="m-4 py-2 bg-white rounded border">
        <div className="flex flex-col md:flex-row">
          <div className="w-full px-4 mt-4 md:mt-0">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{landlordDetails.name}</h2>
                <div className="flex justify-between space-x-4 mt-2">
                  <p className="text-gray-500 text-sm">{landlordDetails.email}</p>
                  <p className="text-gray-500 text-sm">Phone: {landlordDetails.phone}</p>
                </div>
              </div>
              {/* Add New Tenant Button */}
              <Link to={`/edit-landlord/personal-information?landlord_id=${landlord_id}`}>
                <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                  <p>Edit landlord</p>
                  <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-12 gap-4 py-1 px-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 col-span-3">
            <PropertyCard
              redirectUrl={stat.redirectUrl}
              iconSrc={stat.iconSrc}
              label={stat.label}
              value={stat.value}
            />
          </div>
        ))}
      </div>
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
                    <th className="px-4 py-2">Photo</th>
                    <th className="px-4 py-2">Property Name</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Vacant</th>
                    <th className="px-4 py-2">Occupied</th>
                    <th className="px-4 py-2">Open Issues</th>
                    <th className="px-4 py-2">Expected Revenue</th>
                    <th className="px-4 py-2">Outstanding Revenue</th>
                    <th className="px-4 py-2">Pending Balances</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property, index) => (
                    <tr key={index} className="border-b text-sm">
                      <td className="px-4 py-2">
                        <img src={property.cover_image} alt={property.property_name} className="w-12 h-12 rounded-full" />
                      </td>

                      <td className="px-4 py-2">
                        {property.property_name}
                        <br />
                        <span className="text-gray-500 text-xs">
                          {property.property_location}
                        </span>
                      </td>
                      <td className="px-4 py-2">{property.total_units}</td>
                      <td className="px-4 py-2">{property.vacant_units}</td>
                      <td className="px-4 py-2">{property.occupied_units}</td>
                      <td className="px-4 py-2">
                        <span className="bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded">{property.open_issues}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">{property.expected_revenue}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-blue-100 border border-blue-400 text-blue-600 px-2 py-1 rounded">{property.outstanding_revenue}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="bg-blue-100 border border-blue-400 text-blue-600 px-2 py-1 rounded">{property.pending_balance}</span>
                      </td>

                      <td className="flex py-5 px-2 space-x-4">
                        <FaEye onClick={() => navigate(`/property/view-property/${property.id}`)} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
                        <FaEdit onClick={() => navigate(`/edit-property/general-information?property_id=${property.id}`)} className="text-purple-500 hover:text-purple-700 cursor-pointer" />
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

      {isModalOpen && (
        <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl text-center font-semibold text-gray-800">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 text-center mt-2">
              Are you sure you want to move this property{" "}
              <span className="font-bold">{itemToDelete?.property_name}</span> to recycle bin? This action
              cannot be undone.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {(nextPageUrl || currentPage > 1) && (
        <div className="flex justify-between items-center mt-4 px-4">

          {prevPageUrl && (
            <button
              onClick={handlePreviousPage}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-red-800 rounded-s hover:bg-red-900"
            >
              <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
              </svg>
              Previous
            </button>
          )}

          {/* Pagination Info */}
          <span className="text-sm text-gray-600">
            Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{lastPage}</span>
          </span>

          {/* Next Button */}
          {nextPageUrl && (
            <button
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-red-800 border-0 border-s border-red-700 rounded-e hover:bg-red-900"
              onClick={handleNextPage}

            >
              Next
              <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}

export default LandlordSingleView