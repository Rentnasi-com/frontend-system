import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast";
import { DashboardHeader } from "../../properties/dashboard/page_components";

const SkeletonLoader = ({ className, rounded = false }) => (
  <div
    className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
  ></div>
);

const TableRowSkeleton = () => (
  <tr className="border-b">
    <td className="px-4 py-3"><SkeletonLoader className="w-12 h-12" rounded /></td>
    <td className="px-4 py-3">
      <SkeletonLoader className="h-4 w-32 mb-1" />
      <SkeletonLoader className="h-3 w-24" />
    </td>
    {[...Array(7)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonLoader className="h-6 w-12 mx-auto" />
      </td>
    ))}
    <td className="px-4 py-3 flex space-x-4">
      <SkeletonLoader className="h-5 w-5 rounded" />
      <SkeletonLoader className="h-5 w-5 rounded" />
      <SkeletonLoader className="h-5 w-5 rounded" />
    </td>
  </tr>
);

const TenantHistory = () => {
  const [tenantHistoryDetails, setTenantHistoryDetails] = useState([])
  const [properties, setProperties] = useState([])
  const [propertyUnits, setPropertyUnits] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const baseUrl = import.meta.env.VITE_BASE_URL
  const { unit_id } = useParams();
  const unitIdFromUrl = unit_id.split('=')[1]
  const [loading, setLoading] = useState(true);
  const unitId = selectedUnitId || unitIdFromUrl

  const handleSelectChange = (event) => {
    setSelectedPropertyId(event.target.value);
  };
  const handleUnitSelectChange = (event) => {
    setSelectedUnitId(event.target.value);
  };

  const fetchTenantHistory = async () => {
    try {
      const res = await axios.get(`${baseUrl}/manage-property/single-unit/tenant-history?unit_id=${unitId}&property_id=${selectedPropertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      if (res.data.success) {
        setTenantHistoryDetails(res.data.result || [])
      }
    } catch (error) {
      toast.error("Error fetching tenant history");
    } finally {
      setLoading(false);
    }
  }
  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${baseUrl}/manage-tenant/required-data/available-properties`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      if (res.data.success) {
        setProperties(res.data.result)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${baseUrl}/manage-tenant/required-data/available-units?property_id=${selectedPropertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      if (res.data.success) {
        setPropertyUnits(Array.isArray(res.data.result) ? res.data.result : [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchTenantHistory()
    fetchProperties()
    fetchUnits()
  }, [unitId, selectedPropertyId, baseUrl])

  return (
    <>
      <DashboardHeader
        title="Tenancy history"
        description={`View all previous tenants`}
        hideSelect={true}
        selectUnit={true}
        onSelectChange={handleSelectChange}
        properties={properties}
        units={propertyUnits}
        onUnitSelectChange={handleUnitSelectChange}
      />
      <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
        <h4 className="text-md text-gray-600 my-4 px-2">Tenant list</h4>
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-left text-xs">
                <tr>
                  <th className="px-4 py-2">Property Name</th>
                  <th className="px-4 py-2">Tenant Name</th>
                  <th className="px-4 py-2">Unit No</th>
                  <th className="px-4 py-2">Phone No</th>
                  <th className="px-4 py-2">Arrears</th>
                  <th className="px-4 py-2">Date Vacated</th>
                  {/* <th className="px-4 py-2">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                ) : (
                  tenantHistoryDetails.map((tenant, index) => (
                    <>
                      {/* <TableRow
                        key={index}
                        title={tenant.name}
                        name={tenant.property_name}

                        unit={tenant.unit_no}
                        phone_no={tenant.phone}
                        arrears={tenant.arrears}
                        date_vacated={tenant.date_vacated === null ? (
                          <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                            current tenant
                          </span>
                        ) : (tenant.date_vacated)}
                        isShowing={true}
                      /> */}
                      <tr key={index} className="border-b text-sm">
                        <td className="px-4 py-2">{tenant.property_name}</td>
                        <td className="px-4 py-2">{tenant.name}</td>
                        <td className="px-4 py-2">{tenant.unit_no}</td>
                        <td className="px-4 py-2">{tenant.phone}</td>
                        <td className="px-4 py-2">KES {(tenant.arrears).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          {tenant.date_vacated === null ? (
                            <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                              Current Tenant
                            </span>
                          ) : (tenant.date_vacated)}
                        </td>
                      </tr>
                    </>
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

export default TenantHistory