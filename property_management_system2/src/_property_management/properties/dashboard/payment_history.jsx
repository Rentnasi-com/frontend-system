import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { DashboardHeader } from "./page_components";

const PaymentHistory = () => {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [searchParams] = useSearchParams();
  const extractedUnitId = searchParams.get('unit_id');

  const [properties, setProperties] = useState([]);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [unitDetails, setUnitDetails] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showBillItemDeleteModal, setShowBillItemDeleteModal] = useState(false);
  const [billItemToDelete, setBillItemToDelete] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      const propertyResponse = await axios.get(
        `${baseUrl}/manage-tenant/required-data/available-properties`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperties(propertyResponse.data.result);
    } catch (error) {
      toast.error("Failed to fetch properties");
    }
  }, [baseUrl, token]);

  const fetchBillItems = useCallback(async (unitId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/manage-tenant/bills?unit_id=${unitId || extractedUnitId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBillItems(response.data.result || []);
    } catch (error) {
      toast.error("Failed to fetch bill items");
    }
  }, [baseUrl, token, extractedUnitId]);

  const fetchUnitDetails = useCallback(async (unitId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/manage-tenant/required-data/selected-unit?unit_id=${unitId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnitDetails(response.data.result);
    } catch (error) {
      toast.error("Failed to fetch unit details");
    }
  }, [baseUrl, token]);

  const fetchUnitsForProperty = useCallback(async (propertyId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/manage-tenant/required-data/available-units?property_id=${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPropertyUnits(response.data.result);
    } catch (error) {
      toast.error("No units available in the selected property");
    }
  }, [baseUrl, token]);

  useEffect(() => {
    fetchProperties();
    if (extractedUnitId) {
      fetchBillItems(extractedUnitId);
    }
  }, [fetchProperties, fetchBillItems, extractedUnitId]);

  const handlePropertyChange = async (event) => {
    const propertyId = event.target.value;
    setSelectedProperty(propertyId);
    setSelectedUnit('');
    setPropertyUnits([]);

    if (propertyId) {
      await fetchUnitsForProperty(propertyId);
    }
  };

  const handleUnitChange = async (event) => {
    const unitId = event.target.value;
    setSelectedUnit(unitId);

    if (unitId) {
      await fetchBillItems(unitId);
      await fetchUnitDetails(unitId);
    }
  };
  return (
    <>
      <DashboardHeader
        title={`${unitDetails?.unit_number || "Unit" || null} Payment breakdown`}
        description="Connect and Thrive: Engage with Your Tenants Now!"
        hideSelect={true}
        properties={properties}
        onSelectChange={handlePropertyChange}
        selectUnit={true}
        units={propertyUnits}
        onUnitSelectChange={handleUnitChange}
      />
      <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
        .
        <div className="w-full">
          <div className="">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-left text-xs">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Tenant</th>
                  <th className="px-4 py-2">Amounts</th>
                  <th className="px-4 py-2">Bill Items</th>
                </tr>
              </thead>
              <tbody>
                {billItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-sm my-3">Select unit...</td>
                  </tr>
                ) : (
                  billItems.map((item, index) => (
                    <tr key={index} className="border-b text-xs">
                      <td className="px-4 py-2">{item.date}</td>
                      <td className="px-4 py-2">{(item.tenant_name)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 space-y-1">
                        <div>Arrears - {Number(item.arrears).toLocaleString()}</div>
                        <div>Rent - {Number(item.rent).toLocaleString()}</div>
                        <div>Paid - {Number(item.paid).toLocaleString()}</div>
                        <div>Fines - {Number(item.fines).toLocaleString()}</div>
                        <div className="font-semibold text-blue-800">
                          Total - {Number(item.total_balance).toLocaleString()}
                        </div>
                      </td>

                      {item.bill_items.length > 0 ? (
                        <td className="px-4 py-2">
                          <table className="w-full text-xs border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 py-1 text-left">Type</th>
                                <th className="px-2 py-1 text-left">Expected</th>
                                <th className="px-2 py-1 text-left">Paid</th>
                                <th className="px-2 py-1 text-left">Balance</th>
                                <th className="px-2 py-1 text-left">Status</th>
                                <th className="px-2 py-1 text-left">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.bill_items.map((billItem, index) => (
                                <tr key={index} className="border-t border-gray-200">
                                  <td className="px-2 py-1 capitalize">{billItem.bill_type}</td>
                                  <td className="px-2 py-1">{(billItem.amount_expected).toLocaleString()}</td>
                                  <td className="px-2 py-1">{(billItem.amount_paid).toLocaleString()}</td>
                                  <td className="px-2 py-1">{(billItem.amount_due).toLocaleString()}</td>
                                  <td className="px-2 py-1">
                                    <span
                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                                ${billItem.status === "Unpaid"
                                          ? "bg-red-100 text-red-800"
                                          : billItem.status === "Partial"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                      {billItem.status}
                                    </span>
                                  </td>
                                  {/* <td className="relative px-2 py-1 text-xs">
                                    <button
                                      onClick={() => toggleDropdown(billItem.bill_item_id)}
                                      className="inline-flex justify-center w-full px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none"
                                    >
                                      Actions
                                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>

                                    {openDropdownId === billItem.bill_item_id && (
                                      <div className="absolute right-0 z-50 w-36 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                          {editItemId === billItem.bill_item_id ? (
                                            <>
                                              <button
                                                onClick={() => handleBillItemPatch(billItem)}
                                                className="block w-full px-3 py-1 text-xs text-left text-green-600 hover:bg-green-100"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() => setEditItemId(null)}
                                                className="block w-full px-3 py-1 text-xs text-left text-gray-600 hover:bg-gray-100"
                                              >
                                                Cancel
                                              </button>
                                            </>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setEditItemId(billItem.bill_item_id);
                                                setEditedAmount(billItem.amount_expected);
                                              }}
                                              className="block w-full px-3 py-1 text-xs text-left text-gray-700 hover:bg-gray-100"
                                            >
                                              Edit
                                            </button>
                                          )}

                                          <button
                                            onClick={() => {
                                              setBillItemToDelete({
                                                unit_id: extractedUnitId,
                                                tenant_id: tenantId,
                                                bill_item_id: billItem.bill_item_id
                                              });
                                              setShowBillItemDeleteModal(true);
                                            }}
                                            className="block w-full px-3 py-1 text-xs text-left text-red-600 hover:bg-red-100"
                                          >
                                            Delete
                                          </button>

                                        </div>
                                      </div>
                                    )}
                                  </td> */}

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      ) : (
                        <td className="px-4 py-2">No data found.</td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentHistory