import { Link } from "react-router-dom"
import QRCode from "react-qr-code"
import { useEffect, useState } from "react"
import axios from "axios"

const DashboardHeader = ({ title, description, link, name, hideSelect, selectUnit, hideLink, properties, units, onSelectChange, onUnitSelectChange, showLink2, link2Name, link2 }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL
  const sessionId = localStorage.getItem("sessionId")
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const [packageDetails, setPackageDetails] = useState([])
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const PackageDetails = async () => {
      try {
        const response = await axios.post(`${baseUrl}/auth/package-manager`, {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setPackageDetails(response.data.package)

        if (response.data.package?.expiry_date) {
          const expiryDate = new Date(response.data.package.expiry_date)
          const now = new Date()
          setIsExpired(now > expiryDate)
        }
      } catch (error) {
        console.error(error)
      }
    }
    PackageDetails()
  }, [token, baseUrl]);

  return (
    <>
      {isExpired && (
        <div className="bg-gray-700 bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0">
          <div className="relative p-4 w-full max-w-md max-h-full">

            <div className="relative bg-white rounded-lg border border-gray-200">
              {/* <button type="button" onClick={handleClose} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button> */}
              <div className="p-4 md:p-5">
                <svg className="w-10 h-10 text-gray-400  mb-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                  <path d="M8 5.625c4.418 0 8-1.063 8-2.375S12.418.875 8 .875 0 1.938 0 3.25s3.582 2.375 8 2.375Zm0 13.5c4.963 0 8-1.538 8-2.375v-4.019c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353c-.193.081-.394.158-.6.231l-.189.067c-2.04.628-4.165.936-6.3.911a20.601 20.601 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244c-.053-.028-.113-.053-.165-.082v4.019C0 17.587 3.037 19.125 8 19.125Zm7.09-12.709c-.193.081-.394.158-.6.231l-.189.067a20.6 20.6 0 0 1-6.3.911 20.6 20.6 0 0 1-6.3-.911l-.189-.067a10.719 10.719 0 0 1-.852-.34 8.08 8.08 0 0 1-.493-.244C.112 6.035.052 6.01 0 5.981V10c0 .837 3.037 2.375 8 2.375s8-1.538 8-2.375V5.981c-.052.029-.112.054-.165.082a8.08 8.08 0 0 1-.745.353Z" />
                </svg>
                <h3 className="mb-1 text-xl font-bold text-red-700">Your {packageDetails.package_name} Package Has Expired</h3>
                <p className="text-gray-500">Choosing the right package solution is essential for maintaining continuous working.</p>
                <p className="text-gray-500 mb-4">Scan to make payment for your subscription.</p>
                <div className="flex justify-center">
                  <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "25%", width: "25%" }}
                    value={`https://billing.rentnasi.com?sessionId=${sessionId}&userId=${userId}`}
                    viewBox={`0 0 256 256`}
                  />
                </div>
                <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                  <a target="_blank" href={`https://billing.rentnasi.com?sessionId=${sessionId}&userId=${userId}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Upgrade to PRO</a>
                  {/* <button onClick={handleClose} type="button" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">Cancel</button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:flex space-y-4 justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-600">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="flex space-x-2">
          {hideLink && (
            <Link to={link}>
              <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                <p>{name}</p>
                <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
              </div>
            </Link>
          )}

          {showLink2 && (
            <Link to={link2}>
              <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                <p>{link2Name}</p>
                <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
              </div>
            </Link>
          )}

          {hideSelect && (
            <div className="">
              <select onChange={onSelectChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 py-2.5">
                <option value="">All properties</option>
                {(properties || []).map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectUnit && (
            <div className="">
              <select onChange={onUnitSelectChange} className="ml-3 bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2 py-2.5">
                <option selected>Select unit</option>
                {(units || []).map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.unit_number}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </>

  )
}

export default DashboardHeader