import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormField from "./single_unit/FormField";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "../../../shared";
import { useNavigate } from "react-router-dom";

const AddMultiSingleUnit = () => {
    const schema = z.object({
        unit_type: z.coerce.number().min(1, "Unit type is required"),
        property_id: z.coerce.number().min(1, "Unit type is required"),
        floor_id: z.coerce.number().min(1, "Unit type is required"),
        rent_amount: z.coerce.number().min(1, "Rent amount must be greater than 0"),
        rent_deposit: z.coerce.number().min(1, "Deposit cannot be negative"),
        water_amount: z.coerce.number().min(0, "Water deposit cannot be negative"),
        electricity_amount: z.coerce.number().min(0, "Electricity deposit cannot be negative"),
        garbage_amount: z.coerce.number().min(0, "Garbage deposit cannot be negative"),
        unit_no: z.string().min(2, "Unit name must be at least 2 characters long"),
    });

    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL
    const [unitTypes, setUnitTypes] = useState([])
    const [properties, setProperties] = useState([])
    const [propertyFloors, setPropertyFloors] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const fetchUnitTypes = async () => {
        try {
            const response = await axios.get(`${baseUrl}/get-unit-type`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            setUnitTypes(response.data.result);
        } catch (error) {
            toast.error(error.message || "Failed to fetch unit types");
        }
    };

    const fetchProperties = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-tenant/required-data/available-properties?multi=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });
            setProperties(response.data.result);
        } catch (error) {
            toast.error(error.message || "Failed to fetch properties");
        }
    }

    const handlePropertyChange = async (event) => {
        const propertyId = event.target.value
        setSelectedProperty(propertyId)
        try {
            const unitsResponse = await axios.get(
                `${baseUrl}/manage-property/edit-property/floors?property_id=${propertyId}&without_units=true`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            setPropertyFloors(unitsResponse.data.floors)
        } catch (error) {
            toast.error("You have floors in the property selected")
        }
    }

    const onSubmit = async (values) => {
        try {
            let dataToSend = { ...values }

            const response = await toast.promise(
                axios.post(
                    `${baseUrl}/manage-property/edit-property/unit`,
                    dataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }),
                {
                    loading: "Sending data ...",
                    success: "Single unit created successfully",
                    error: "Failed to create unit. Please try again later.",
                }
            )

            if (response.data.success) {
                navigate("/property/all-property-units")
            }

        } catch (error) {
            toast.error(error.message || "Failed to update property");
        }
    }

    useEffect(() => {
        AddMultiSingleUnit
        fetchUnitTypes()
        fetchProperties()
    }, [baseUrl, token,])

    return (


        <section className="bg-white">
            <div className="p-4 flex justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Add Property</h1>
                    <p className="text-sm text-gray-500">Properties / Add property / Single unit</p>
                </div>
            </div>
            <div className="my-1 px-4">
                <div className="border rounded p-2">
                    <p className="mt-1 text-sm font-normal text-gray-500">
                        You can now manage each unit on this floor! 🏢 Just enter the unit
                        number 📋, type 🏠, rent 💰, deposits for water 🚰, electricity ⚡,
                        and garbage 🗑️.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <table id="unitTable" className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-white uppercase bg-red-700 py-4">
                            <tr>
                                <th scope="col" className="px-5 py-3">Property</th>
                                <th scope="col" className="px-5 py-3">Floor No</th>
                                <th scope="col" className="px-5 py-3">Unit Name</th>
                                <th scope="col" className="px-5 py-3">Unit Type</th>
                                <th scope="col" className="px-5 py-3">Rent Amount</th>
                                <th scope="col" className="px-5 py-3">Deposit</th>
                                <th scope="col" className="px-5 py-3">Water</th>
                                <th scope="col" className="px-5 py-3">Electricity</th>
                                <th scope="col" className="px-5 py-3">Garbage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-1">
                                    <select
                                        className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
                                        {...register("property_id")}
                                        onChange={handlePropertyChange}
                                        value={selectedProperty}
                                    >
                                        <option value="">--Select--</option>
                                        {properties.map((property) => (
                                            <option key={property.id} value={property.id}>
                                                {property.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unit_type && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.unit_type.message}
                                        </p>
                                    )}
                                </td>
                                <td className="p-1">
                                    <select

                                        className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
                                        {...register("floor_id")}

                                    >
                                        <option value="">--Select--</option>
                                        {propertyFloors.map((floor) => (
                                            <option key={floor.id} value={floor.floor_id}>
                                                {floor.floor_number}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unit_type && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.unit_type.message}
                                        </p>
                                    )}
                                </td>
                                <FormField
                                    name="unit_no"
                                    label="Unit Name"
                                    register={register}
                                    errors={errors}
                                    type="text"
                                    placeholder="Unit no"
                                />
                                <td className="p-1">
                                    <select
                                        className="bg-white border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-1.5"
                                        {...register("unit_type")}

                                    >
                                        <option value="">--Select--</option>
                                        {unitTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unit_type && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.unit_type.message}
                                        </p>
                                    )}
                                </td>
                                <FormField
                                    name="rent_amount"
                                    label="Rent Amount"
                                    register={register}
                                    errors={errors}
                                    type="number"
                                    placeholder="Rent Amount"
                                    defaultValue={0}
                                />
                                <FormField
                                    name="rent_deposit"
                                    label="Rent Deposit"
                                    register={register}
                                    errors={errors}
                                    type="number"
                                    placeholder="Rent Deposit"
                                    defaultValue={0}
                                />
                                <FormField
                                    name="water_amount"
                                    label="Water Amount"
                                    register={register}
                                    errors={errors}
                                    type="number"
                                    placeholder="Water Deposit"
                                    defaultValue={0}
                                />
                                <FormField
                                    name="electricity_amount"
                                    label="Electricity Amount"
                                    register={register}
                                    errors={errors}
                                    type="number"
                                    placeholder="Electricity Deposit"
                                    defaultValue={0}
                                />
                                <FormField
                                    name="garbage_amount"
                                    label="Garbage Amount"
                                    register={register}
                                    errors={errors}
                                    type="number"
                                    placeholder="Garbage Deposit"
                                    defaultValue={0}
                                />
                            </tr>
                        </tbody>
                    </table>
                    <div className="flex flex-row-reverse mt-1">
                        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                            Next
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default AddMultiSingleUnit