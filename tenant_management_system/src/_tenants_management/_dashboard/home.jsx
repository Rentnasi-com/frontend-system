import { PiExportThin } from "react-icons/pi"
import { SlCalender } from "react-icons/sl"
import { Link } from "react-router-dom"
import { ActivityItem, TransactionItem } from "./components"
import { useEffect, useState } from "react"
import axios from "axios"

const TenantDashboard = () => {
  const [tenants, setTenants] = useState([])
  const baseURL = import.meta.env.VITE_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/manage-tenant/get-all-tenants`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        )

        if (response.data.success) {
          setTenants(response.data.result)
          console.log(response.data.result)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchTenants()
  }, [token, baseURL])
  return (
    <section className="">
      <div className="p-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Overview</h1>
          <p className="text-sm text-gray-500">Real-time information and activities of your tenants.</p>
        </div>
        <div className="">
          <div className="flex space-x-4">
            <div className="bg-white p-2 rounded-xl shadow">
              <Link to="/tenants/add-personal-details">
                <p className="text-xs text-gray-600 flex space-x-2 text-center">
                  <span>Add Tenants</span> <PiExportThin />
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
      <div className="grid grid-cols-5 gap-4 p-4">
        <div className="col-span-3">
          <div className="p-2 flex justify-between bg-white rounded-xl shadow">
            <div className="flex justify-between items-center">
              <div className="">
                <img className="bg-green-200 p-2 rounded" height={35} width={30} src="/assets/icons/png/persons.png" alt="" />
              </div>
              <div className="mx-2">
                <p className="text-md font-semibold text-gray-800">70</p>
                <p className="text-xs text-gray-400">Total Tenants</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="">
                <img className="bg-indigo-200 p-2 rounded" height={35} width={30} src="/assets/icons/png/persons_plus.png" alt="" />
              </div>
              <div className="mx-2">
                <p className="text-md font-semibold text-gray-800">65</p>
                <p className="text-xs text-gray-400">Tenants Requests</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="">
                <img className="bg-pink-200 p-2 rounded" height={35} width={30} src="/assets/icons/png/persons_pink.png" alt="" />
              </div>
              <div className="mx-2">
                <p className="text-md font-semibold text-gray-800">10</p>
                <p className="text-xs text-gray-400">Renewal Tenants</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-2 bg-white rounded-xl shadow">
            <h2 className="text-sm font-semibold">All your tenants</h2>
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
                {tenants.map((tenant) => (
                  <tr className="mt-4" key={tenant.key}>
                    <td>
                      <th className="flex space-x-3">
                        <div className="flex justify-center items-center">
                          <img className="bg-green-600 p-1 rounded-full" width={24} height={24} src="/assets/icons/png/user.png" alt="" />
                        </div>
                        <div className="text-left">
                          <p className="text-gray-800">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.email}</p>
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
        <div className="col-span-2">
          <div className="bg-white p-2 shadow rounded-xl space-y-3">
            <div className="flex justify-between">
              <h2 className="text-sm font-semibold">Transactions</h2>
            </div>
            <TransactionItem
              description="Rent Deposit (James Kanyiri W) - King Serenity - Unit: MK240"
              date="Jul 21 2024 - 15:13 PM"
              status="Completed"
              transactionId="ADEFHNJT43GGF"
            />
          </div>
          <div className="bg-white p-2 shadow rounded-xl space-y-3 mt-4">
            <h2 className="text-sm font-semibold">Activities</h2>
            <ActivityItem
              description="Hector Ngetich"
              date="My toilet not going plus bathroom"
              status="Completed"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TenantDashboard
