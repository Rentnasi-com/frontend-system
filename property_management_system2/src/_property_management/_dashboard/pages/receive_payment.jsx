import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"


const ReceivePayment = () => {
    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedFloor, setSelectedFloor] = useState('')
    const [propertyFloors, setPropertyFloors] = useState([])
    const [selectedUnit, setSelectedUnit] = useState('')
    const [propertyUnits, setPropertyUnits] = useState([])

    const [unitDetails, setUnitDetails] = useState([])
    const [unitTenantDetails, setTenantDetails] = useState([])

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')

    useEffect(() => {
        fetchProperties()
    }, [token, baseUrl])

    const fetchProperties = async () => {
        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/payment/data/properties`,
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

        setSelectedFloor(null);
        setSelectedUnit(null);
        setPropertyUnits([]);
        setPropertyFloors([]);

        try {
            const floorsResponse = await axios.get(
                `${baseUrl}/payment/data/floors?property_id=${propertyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            if (floorsResponse.data.has_floors) {
                setPropertyFloors(floorsResponse.data.result)
            } else {
                const unitsResponse = await axios.get(
                    `${baseUrl}/payment/data/units?property_id=${propertyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setPropertyUnits(unitsResponse.data.result);
            }

        } catch (error) {
            toast.error("You have no units in the property selected")
            setPropertyFloors([]);
            setPropertyUnits([]);
        }
    }

    const handleFloorChange = async (event) => {
        const floorId = event.target.value
        setSelectedFloor(floorId)

        try {
            const unitsResponse = await axios.get(`${baseUrl}/payment/data/units?floor_id=${floorId}&property_id=${selectedProperty}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            )
            setPropertyUnits(unitsResponse.data.result)
        } catch (error) {
            toast.error("You have no units in the floor selected")
        }

    }


    const handleUnitChange = async (event) => {
        const unitId = event.target.value
        setSelectedUnit(unitId)

        try {
            const unitDetailsResponse = await axios.get(`${baseUrl}/manage-property/single-unit/details?unit_id=${unitId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            setUnitDetails(unitDetailsResponse.data.unit_details)
            setTenantDetails(unitDetailsResponse.data.tenant_details || "")
        } catch (error) {
            toast.error("No unit details found")
        }
    }

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Receive Tenant Payment</h1>
                    <p className="text-sm text-gray-500">Receive new payment and link them to a property unit </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Tenant Payment</h3>
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
                                    <option defaultValue>Select property</option>
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
                                    Select property floors
                                    {propertyFloors.length === 0 && (
                                        <span className="text-red-500 text-xs"> (The selected property has no floors)</span>
                                    )}
                                </label>
                                <select
                                    value={selectedFloor}
                                    onChange={handleFloorChange}
                                    disabled={propertyFloors.length === 0}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                                    <option defaultValue>Select property floor</option>
                                    {
                                        propertyFloors.map((floor) => (
                                            <option key={floor.floor_id} value={floor.floor_id}>{floor.floor_number}</option>
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
                                    <option defaultValue>Select property unit</option>
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
                                    <th scope="col" className="px-5 py-3">Tenant name</th>
                                    <th scope="col" className="px-5 py-3">Unit name</th>
                                    <th scope="col" className="px-5 py-3">Unit type</th>
                                    <th scope="col" className="px-5 py-3">Rent amount</th>
                                    <th scope="col" className="px-5 py-3">Water</th>
                                    <th scope="col" className="px-5 py-3">Electricity</th>
                                    <th scope="col" className="px-5 py-3">Garbage</th>
                                    <th scope="col" className="px-5 py-3">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="border border-gray-200 py-3">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                        {unitTenantDetails.name}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                        {unitDetails.name}
                                    </td>

                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {unitDetails.unit_type}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50">
                                        {unitDetails.rent_amount}
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
                            </tbody>
                        </table>
                    </form>
                </div >
            </div >
        </>
    )
}

export default ReceivePayment