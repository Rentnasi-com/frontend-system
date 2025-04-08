import { FaArrowRight } from "react-icons/fa"
import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddTenantProperty = () => {
  const [properties, setProperties] = useState([])
  const [propertyUnits, setPropertyUnits] = useState([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [unitDetails, setUnitDetails] = useState(null)
  const navigate = useNavigate()
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token')
  const schema = z.object({
    is_rent_agreed: z.enum(["1", "0"], {
      errorMap: () => ({ message: "You must select either 'Yes' or 'No'" })
    }),
    is_taxable: z.enum(["1", "0"], {
      errorMap: () => ({ message: "You must select either 'Yes' or 'No'" })
    }),
    is_meter_read: z.enum(["1", "0"], {
      errorMap: () => ({ message: "You must select either 'Yes' or 'No'" })
    }),
    tax_percentage: z.string().optional(),
    initial_meter_reading: z.string().optional(),
    rent_amount: z.string().min(1, "Rent amount is required"),
    rent_deposit: z.string().min(1, "Deposit must be a positive number"),
    water: z.string().min(1, "Water deposit must be a positive number"),
    garbage: z.string().min(1, "Garbage deposit must be a positive number"),
    electricity: z.string().min(1, "Electricity deposit must be a positive number"),

    rent_due_date: z.string().min(1, "Select a valid date"),
    due_rent_reminder_date: z.string().min(1, "Select a valid date"),
    due_rent_fine_start_date: z.string().min(1, "Select a valid date"),

    mode_for_late_payment: z.enum(["percentage", "fixed_amount", ""], {
      errorMap: () => ({ message: "Please select a valid mode" })
    }),

    amount_criteria: z.enum([
      "current_full_month_rent",
      "current_full_month_rent_balance",
      "total_cumulative_balances_inclusive_of_previous_month"
    ]).optional().nullable().transform(val => val === null ? undefined : val),

    criteria_percentage: z.string().optional().nullable().transform(val => val === null ? undefined : val),
    late_payment_fixed_amount: z.string().optional().nullable().transform(val => val === null ? undefined : val),
  })
    .refine(
      (data) => !(data.is_taxable === "1" && !data.tax_percentage),
      {
        message: "Tax percentage is required when taxable is 'Yes'",
        path: ["tax_percentage"]
      }
    )
    .refine(
      (data) => !(data.is_meter_read === "1" && !data.initial_meter_reading),
      {
        message: "Initial meter reading is required when meter read is 'Yes'",
        path: ["initial_meter_reading"]
      }
    )
    .superRefine((data, ctx) => {
      if (data.mode_for_late_payment === "percentage") {
        if (!data.amount_criteria) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Amount criteria is required",
            path: ["amount_criteria"],
          });
        }
        if (!data.criteria_percentage) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Percentage value is required",
            path: ["criteria_percentage"],
          });
        }
        // Ensure fixed amount is cleared
        if (data.late_payment_fixed_amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fixed amount should be empty in percentage mode",
            path: ["late_payment_fixed_amount"],
          });
        }
      } else if (data.mode_for_late_payment === "fixed_amount") {
        if (!data.late_payment_fixed_amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Fixed amount is required",
            path: ["late_payment_fixed_amount"],
          });
        }
        // Ensure percentage fields are cleared
        if (data.amount_criteria || data.criteria_percentage) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Percentage fields should be empty in fixed amount mode",
            path: ["amount_criteria"],
          });
        }
      }
    });

  const defaultValues = {
    is_rent_agreed: "1",
    is_meter_read: "1",
    is_taxable: "1"
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const mode_for_late_payment = watch("mode_for_late_payment");
  const is_taxable = watch("is_taxable");
  const is_meter_read = watch("is_meter_read");


  useEffect(() => {
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
    fetchProperties()
  }, [token, baseUrl])

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
      setValue("rent_amount", details.rent_amount)
      setValue("rent_deposit", details.rent_deposit)
      setValue("water", details.water)
      setValue("electricity", details.electricity)
      setValue("garbage", details.garbage)
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token")
      const tenant_id = localStorage.getItem("tenant_id")
      const unit_id = localStorage.getItem("unit_id")

      const dataToSend = {
        ...values,
        tenant_id,
        unit_id,
        is_taxable: values.is_taxable === "1",
        is_meter_read: values.is_meter_read === "1",
      }
      const response = await axios.post(`${baseUrl}/manage-tenant/create-tenant/other-info`, dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/tenants/view-all-tenants')
        console.log(response)
      }
    } catch (error) {
      // toast.error(error.response.error.due_rent_reminder_date || error.response.error.due_rent_fine_start_date || error.response.message)
      console.log("James error:", error)
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex space-x-6">
              <h6 className="text-sm font-medium text-gray-900">Is the rent and deposit agreed as above</h6>
              <label>
                <input
                  className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                  type="radio"
                  value="1"
                  {...register("is_rent_agreed")}
                />
                Yes
              </label>
              <label>
                <input
                  className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                  type="radio"
                  value="0"
                  {...register("is_rent_agreed")}
                />
                No
              </label>
            </div>

            {unitDetails && (
              <div>
                <div className="flex justify-between space-x-4">
                  <div className="w-full">
                    <label
                      htmlFor="property-name"
                      className="block my-2 text-sm font-medium text-gray-900">
                      Enter the monthly rent
                    </label>
                    <input
                      aria-label="rent_amount"
                      {...register("rent_amount", { required: true })}
                      type="number"
                      placeholder="Select monthly rent"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                    {errors.rent_amount && (
                      <p className="text-xs text-red-500">
                        {errors.rent_amount.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="property-name"
                      className="block my-2 text-sm font-medium text-gray-900"
                    >
                      Enter house deposit
                    </label>
                    <input
                      aria-label="rent_deposit"
                      {...register("rent_deposit")}
                      type="number"
                      placeholder="Enter deposit"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                    {errors.rent_deposit && (
                      <p className="text-xs text-red-500">
                        {errors.rent_deposit.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between space-x-4">
                  <div className="w-full">
                    <label
                      htmlFor="property-name"
                      className="block my-2 text-sm font-medium text-gray-900">
                      Enter water deposit
                    </label>
                    <input
                      aria-label="water"
                      {...register("water")}
                      type="number"
                      placeholder="Enter water deposit"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                    {errors.water && (
                      <p className="text-xs text-red-500">
                        {errors.water.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="property-name"
                      className="block my-2 text-sm font-medium text-gray-900">
                      Enter garbage deposit
                    </label>
                    <input
                      aria-label="garbage"
                      {...register("garbage")}
                      type="number"
                      placeholder="Enter water deposit"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                    {errors.garbage && (
                      <p className="text-xs text-red-500">
                        {errors.garbage.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="property-name"
                      className="block my-2 text-sm font-medium text-gray-900"
                    >
                      Enter electricity deposit
                    </label>
                    <input
                      aria-label="electricity"
                      {...register("electricity")}
                      type="number"
                      placeholder="Enter deposit"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                    {errors.electricity && (
                      <p className="text-xs text-red-500">
                        {errors.electricity.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* <div className="flex space-x-2">
              <img width={20} height={20} src="/assets/icons/svg/plus.svg" alt="" />
              <p className="text-sm font-medium text-gray-900">Add other charges if any</p>
            </div>

            <div className="flex justify-between space-x-4">
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900">
                  Enter item name
                </label>
                <input
                  type="text"
                  placeholder="Item 1"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Enter amount
                </label>
                <input
                  type="text"
                  placeholder="500"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
              </div>
              <div className="flex justify-center items-center w-1/6 mt-8">
                <img width={24} height={24} src="/assets/icons/svg/delete.svg" alt="" />
              </div>
            </div> */}

            <h3 className="font-bold text-gray-600 mt-2">(d) Other settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="">
                <div className="flex space-x-6">
                  <h6 className="text-sm font-medium text-gray-900">Is the unit taxable</h6>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="1"
                      {...register("is_taxable")}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="0"
                      {...register("is_taxable")}
                    />
                    No
                  </label>
                </div>
                {is_taxable === "1" && (
                  <div className="flex justify-between space-x-4">
                    <div className="w-full">
                      <label
                        htmlFor="property-name"
                        className="block my-2 text-sm font-medium text-gray-900">
                        Enter tax percentage
                      </label>
                      <input
                        {...register('tax_percentage')}
                        aria-label="tax_percentage"
                        type="number"
                        placeholder="e.g 1000"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                      />
                      {errors.tax_percentage && (
                        <p className="text-xs text-red-500">
                          {errors.tax_percentage.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="">
                <div className="flex space-x-6">
                  <h6 className="text-sm font-medium text-gray-900">Does the unit have a meter</h6>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="1"
                      {...register("is_meter_read")}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="0"
                      {...register("is_meter_read")}
                    />
                    No
                  </label>
                </div>
                {is_meter_read === "1" && (
                  <div className="flex justify-between space-x-4">
                    <div className="w-full">
                      <label
                        htmlFor="property-name"
                        className="block my-2 text-sm font-medium text-gray-900">
                        Enter the current meter reading
                      </label>
                      <input
                        {...register('initial_meter_reading')}
                        aria-label="initial_meter_reading"
                        type="number"
                        placeholder="e.g 1000"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                      />
                      {errors.is_meter_read && (
                        <p className="text-xs text-red-500">
                          {errors.is_meter_read.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between space-x-4">
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900">
                  Set the rent due date
                </label>

                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  {...register("rent_due_date")}
                >
                  <option disabled>Select rent due date</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day.toString()}>
                      {day}
                    </option>
                  ))}
                </select>
                {errors.rent_due_date && (
                  <p className="text-xs text-red-500">
                    {errors.rent_due_date.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Set when to send a reminder
                </label>
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  {...register("due_rent_reminder_date")}
                >
                  <option disabled>Select due rent reminder date</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day.toString()}>
                      {day}
                    </option>
                  ))}
                </select>
                {errors.due_rent_reminder_date && (
                  <p className="text-xs text-red-500">
                    {errors.due_rent_reminder_date.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-between space-x-4">
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900">
                  Set date to start fines for late payment
                </label>

                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  {...register("due_rent_fine_start_date")}
                >
                  <option disabled>Select due rent reminder date</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day.toString()}>
                      {day}
                    </option>
                  ))}
                </select>
                {errors.due_rent_fine_start_date && (
                  <p className="text-xs text-red-500">
                    {errors.due_rent_fine_start_date.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Select mode for late payment fine
                </label>
                <select {...register("mode_for_late_payment")} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                  <option selected>Select model for late payment</option>
                  <option value="fixed_amount">Fixed amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
            </div>

            {mode_for_late_payment === "percentage" && (
              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-3">
                  <label
                    htmlFor="property-name"
                    className="block my-2 text-sm font-medium text-gray-900">
                    Select percentage of?
                  </label>
                  <label className="flex">
                    <div className="flex items-center h-5">
                      <input {...register("amount_criteria")} aria-label="current_full_month_rent" type="radio" value="current_full_month_rent" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />

                    </div>
                    <div className="ms-2 text-sm">
                      <label className="font-medium text-gray-900">Current full month rent</label>
                    </div>
                  </label>
                  <label className="flex">
                    <div className="flex items-center h-5">
                      <input {...register("amount_criteria")} type="radio" value="current_full_month_rent_balance" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />

                    </div>
                    <div className="ms-2 text-sm">
                      <label className="font-medium text-gray-900">Current full month rent balance</label>
                    </div>
                  </label>
                  <div className="flex">
                    <div className="flex items-center h-5">
                      <input {...register("amount_criteria")} type="radio" value="total_cumulative_balances_inclusive_of_previous_month" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />

                    </div>
                    <div className="ms-2 text-sm">
                      <label className="font-medium text-gray-900">Total cumulative balances inclusive of previous month </label>
                    </div>
                  </div>
                  {errors.amount_criteria && (
                    <p className="text-xs text-red-500">
                      {errors.amount_criteria.message}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <label
                    htmlFor="property-name"
                    className="block my-2 text-sm font-medium text-gray-900">
                    Enter percentage
                  </label>
                  <input
                    aria-label="criteria_percentage"
                    {...register("criteria_percentage")}
                    type="text"
                    placeholder="eg. 10"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  />
                  {errors.criteria_percentage && (
                    <p className="text-xs text-red-500">
                      {errors.criteria_percentage.message}
                    </p>
                  )}
                </div>

              </div>
            )}

            {mode_for_late_payment === "fixed_amount" && (
              <div className="flex justify-between space-x-4">
                <div className="w-1/2">
                  <label
                    htmlFor="property-name"
                    className="block my-2 text-sm font-medium text-gray-900">
                    Enter fixed amount
                  </label>
                  <input
                    {...register('late_payment_fixed_amount')}
                    aria-label="late_payment_fixed_amount"
                    type="number"
                    placeholder="e.g 1000"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  />
                  {errors.late_payment_fixed_amount && (
                    <p className="text-xs text-red-500">
                      {errors.late_payment_fixed_amount.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-row-reverse mt-4">
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center gap-2">
                    <Loader className="animate-spin" /> Loading ...
                  </div>
                ) : (
                  <div className="flex justify-center items-center space-x-2">
                    <p>Finish</p> <FaArrowRight />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div >
      </div >
    </>
  )
}

export default AddTenantProperty