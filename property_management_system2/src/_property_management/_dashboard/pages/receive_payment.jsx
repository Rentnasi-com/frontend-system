import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"


const ReceivePayment = () => {
    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [unitDetails, setUnitDetails] = useState(null)
    const [selectedUnit, setSelectedUnit] = useState('')
    const [propertyUnits, setPropertyUnits] = useState([])

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchProperties()
      }, [token, baseUrl])

    const fetchProperties = async () => {
        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/manage-tenant/required-data/available-properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setProperties(propertyResponse.data.result)
        } catch (error) {
            toast.error("You have no properties")
        }
    }
    const handlePropertyChange = async (event) => {
        const propertyId = event.target.value
        setSelectedProperty(propertyId)

        try {
            const token = localStorage.getItem('token')
            const unitsResponse = await axios.get(
                `${baseUrl}/manage-tenant/required-data/available-units?property_id=${propertyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            setPropertyUnits(unitsResponse.data.result)
        } catch (error) {
            toast.error("You have no units in the property selsected")
        }
    }

    const handleUnitChange = async (event) => {
        const unitId = event.target.value
        setSelectedUnit(unitId)
        localStorage.setItem("unit_id", unitId)

        try {
            const token = localStorage.getItem('token')

            const unitDetailsResponse = await axios.get(`${baseUrl}/manage-tenant/required-data/selected-unit?unit_id=${unitId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            const details = unitDetailsResponse.data.result
            setUnitDetails(details)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Add new tenant</h1>
                    <p className="text-sm text-gray-500">Create new tenant and link them to a property unit </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Tenant details</h3>
                    <h3 className="font-bold text-gray-600 mt-2">(c) Select property and unit</h3>

                    <form className="space-y-4">
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Select property
                                </label>
                                <select
                                    value={selectedProperty}
                                    onChange={handlePropertyChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                                    <option defaultValue>Select property unit</option>
                                    {
                                        properties.map((property) => (
                                            <option key={property.id} value={property.id}>{property.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Select unit
                                </label>
                                <select
                                    value={selectedUnit}
                                    onChange={handleUnitChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                                    <option selected>Select property unit</option>
                                    {
                                        propertyUnits.map((unit) => (
                                            <option key={unit.id} value={unit.id}>{unit.unit_number}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-white uppercase bg-red-700 py-4">
                                <tr>
                                    <th scope="col" className="px-5 py-3">property name</th>
                                    <th scope="col" className="px-5 py-3">Unit number</th>
                                    <th scope="col" className="px-5 py-3">Floor</th>
                                    <th scope="col" className="px-5 py-3">Unit type</th>
                                    <th scope="col" className="px-5 py-3">Rent amount</th>
                                    <th scope="col" className="px-5 py-3">Rent deposit</th>
                                    <th scope="col" className="px-5 py-3">Water</th>
                                    <th scope="col" className="px-5 py-3">Electricity</th>
                                    <th scope="col" className="px-5 py-3">Garbage</th>
                                    <th scope="col" className="px-5 py-3">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {unitDetails && (
                                    <tr className="border border-gray-200 py-3">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                            {unitDetails.property_name}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {unitDetails.unit_number}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                            {unitDetails.floor}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {unitDetails.unit_type}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                            {unitDetails.rent_amount}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {unitDetails.rent_deposit}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                            {unitDetails.water}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {unitDetails.electricity}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                            {unitDetails.garbage}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                            {unitDetails.total}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ReceivePayment