import { useEffect, useState } from "react"
import { DashboardHeader, TableRow } from "./page_components"
import axios from "axios"
import { useParams } from "react-router-dom"

const TenantHistory = () => {
  const [tenantHistoryDetails, setTenantHistoryDetails] = useState([])
  const [properties, setProperties] = useState([])
  const [propertyUnits,setPropertyUnits] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const baseUrl = import.meta.env.VITE_BASE_URL
  const { unit_id } = useParams();
  const unitIdFromUrl = unit_id.split('=')[1]
  
  const unitId =  selectedUnitId || unitIdFromUrl

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
      console.error(error)
    }
  }
  const fetchProperties = async() =>{
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

  const fetchUnits = async() => {
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
        onSelectChange = {handleSelectChange}
        properties={properties}
        units ={propertyUnits}
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
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenantHistoryDetails.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-sm my-3">No data found.</td>
                  </tr>
                ) : (
                  tenantHistoryDetails.map((tenant, index) => (
                    <TableRow
                      key={index}
                      name={tenant.property_name}
                      title={tenant.name}
                      unit={tenant.unit_no}
                      phone_no={tenant.phone}
                      arrears={tenant.arrears}
                      date_vacated={tenant.date_vacated === null ? (
                        <span className="bg-green-100 border border-green-400 text-green-600 px-2 py-1 rounded">
                          current tenant
                        </span>
                      ) : (tenant.date_vacated)}
                      isShowing={true}
                    />
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