import { PiExportThin } from "react-icons/pi"
import { SlCalender } from "react-icons/sl"
import { Link } from "react-router-dom"
import { PropertyCard, TransactionItem } from "./dashboard/pages"
import { useEffect, useState } from "react"
import axios from "axios"

const LandlordDashboard = () => {
  const [properties, setProperties] = useState([])
  const token = localStorage.getItem("token")
  const baseUrl = import.meta.env.VITE_BASE_URL
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${baseUrl}/manage-landlord/get-all-landlord`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setProperties (response.data.result)
      } catch (error) {
        console.log(error)
      }
    }
    fetchProperties()
  },[token])
  return (
    <>
      <section className="">
        <div className="p-4 flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Overview</h1>
            <p className="text-sm text-gray-500">Real-time information and activities of your property.</p>
          </div>
          <div className="">
            <div className="flex space-x-4">
              <div className="bg-white p-2 rounded-xl shadow">
                <Link to="/add-property/general-information">
                  <p className="text-xs text-gray-600 flex space-x-2 text-center">
                    <span>Add Property</span> <PiExportThin />
                  </p>
                </Link>
              </div>
              <div className="bg-white p-2 rounded-xl shadow">
                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                  <SlCalender /> <span>March 27 2024 - January 25 2025</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-4 gap-4 py-1 px-4">
          <PropertyCard
            // key={key}
            title="Total Property"
            total="20"
            iconUrl="assets/icons/png/property_details.png"
            percentChange=""
            redirectUrl=""
          />
        </div>

      </section>
      <section className="grid grid-cols-5 gap-4 my-2 mx-4">
        <div className="col-span-3">
          <div className="mt-4 p-2 bg-white rounded-xl shadow">
            <h2 className="text-sm font-semibold">All your landlords</h2>
            <table className="w-full text-gray-500">
              <thead >
                <tr>
                  <td className="py-3">Total Name</td>
                  <td className="py-3">Apartment</td>
                  <td className="py-3">Unit</td>
                  <td className="py-3">Status</td>
                  <td className="py-3">Action</td>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr className="mt-4" key={property.key}>
                    <td>
                      <th className="flex space-x-3">
                        <div className="flex justify-center items-center">
                          <img className="bg-green-600 p-1 rounded-full" width={24} height={24} src="/assets/icons/png/user.png" alt="" />
                        </div>
                        <div className="text-left">
                          <p className="text-gray-800">{property.name}</p>
                          <p className="text-xs text-gray-500">{property.email}</p>
                        </div>
                      </th>
                    </td>
                    <td className="text-xs text-gray-600">King serenity</td>
                    <td className="text-xs text-gray-600">2</td>
                    <td className="w-12 flex justify-center items-center text-xs rounded-lg p-2 bg-green-200 text-green-800">Paid</td>
                    <td className="">
                      <Link to="/tenants/view-tenants">
                        <img width={24} src="/assets/icons/png/dots.png" alt="" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-span-2 bg-white p-2 shadow rounded-xl space-y-3">
          <h2 className="text-sm font-semibold">Transactions</h2>
          <TransactionItem
            description="Rent Deposit (James Kanyiri W) - King Serenity - Unit: MK240"
            date="Jul 21 2024 - 15:13 PM"
            status="Completed"
            transactionId="ADEFHNJT43GGF"
          />
        </div>
      </section>
    </>
  )
}

export default LandlordDashboard