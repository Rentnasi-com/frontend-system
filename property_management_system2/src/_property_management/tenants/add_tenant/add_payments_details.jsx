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
import { useNavigate, useSearchParams } from "react-router-dom";

const AddTenantProperty = () => {
  const [properties, setProperties] = useState([])
  const [propertyUnits, setPropertyUnits] = useState([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [unitDetails, setUnitDetails] = useState(null)
  const navigate = useNavigate()
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token')

  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id')

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
    first_time_billing: z.string().optional(),

    rent_amount: z.string().min(1, "Rent amount is required"),
    rent_deposit: z.string().min(1, "Deposit must be a positive number"),
    water: z.string().min(1, "Water deposit must be a positive number"),
    garbage: z.string().min(1, "Garbage deposit must be a positive number"),
    electricity: z.string().min(1, "Electricity deposit must be a positive number"),

    is_the_tenant_have_previous_arrears: z.enum(["1", "0"], {
      errorMap: () => ({ message: "You must select either 'Yes' or 'No'" })
    }),

    is_arrears_cumulative: z.enum(["1", "0"], {
      errorMap: () => ({ message: "You must select either 'Yes' or 'No'" })
    }).optional(),

    arrears_rent_amount: z.string().optional(),
    arrears_rent_deposit: z.string().optional(),
    arrears_water: z.string().optional(),
    arrears_garbage: z.string().optional(),
    arrears_electricity: z.string().optional(),

    arrears_total: z.string().optional(),

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
    .superRefine((data, ctx) => {
      // Tax validation
      if (data.is_taxable === "1" && !data.tax_percentage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tax percentage is required when taxable is 'Yes'",
          path: ["tax_percentage"],
        });
      }

      // Meter reading validation
      if (data.is_meter_read === "1" && !data.initial_meter_reading) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Initial meter reading is required when meter read is 'Yes'",
          path: ["initial_meter_reading"],
        });
      }

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

      // Arrears validation logic
      if (data.is_the_tenant_have_previous_arrears === "0") {
        // If tenant has no previous arrears, clear is_arrears_cumulative and all arrears fields
        if (data.is_arrears_cumulative) {
          data.is_arrears_cumulative = undefined;
        }

        // Clear all arrears-related fields when tenant has no previous arrears
        const arrearsFieldsToCheck = [
          { field: data.arrears_total, name: "arrears_total" },
          { field: data.arrears_rent_amount, name: "arrears_rent_amount" },
          { field: data.arrears_rent_deposit, name: "arrears_rent_deposit" },
          { field: data.arrears_water, name: "arrears_water" },
          { field: data.arrears_garbage, name: "arrears_garbage" },
          { field: data.arrears_electricity, name: "arrears_electricity" }
        ];

        arrearsFieldsToCheck.forEach(({ field, name }) => {
          if (field && (typeof field === 'string' ? field.trim() !== "" : field !== undefined)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "This field should be empty when tenant has no previous arrears",
              path: [name],
            });
          }
        });

      } else if (data.is_the_tenant_have_previous_arrears === "1") {
        // Tenant has previous arrears - require is_arrears_cumulative
        if (!data.is_arrears_cumulative) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "You must specify if arrears are cumulative when tenant has previous arrears",
            path: ["is_arrears_cumulative"],
          });
        } else if (data.is_arrears_cumulative === "1") {
          // If arrears are cumulative, require arrears_total
          if (!data.arrears_total || data.arrears_total.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Cumulative arrears total is required when arrears are cumulative",
              path: ["arrears_total"],
            });
          }
          // Validate arrears_total is a positive number
          if (data.arrears_total && data.arrears_total.trim() !== "") {
            const arrearsTotal = parseFloat(data.arrears_total);
            if (isNaN(arrearsTotal) || arrearsTotal <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cumulative arrears must be a positive number",
                path: ["arrears_total"],
              });
            }
          }

          // Clear individual arrears fields when cumulative
          const individualArrearsFields = [
            { field: data.arrears_rent_amount, name: "arrears_rent_amount" },
            { field: data.arrears_rent_deposit, name: "arrears_rent_deposit" },
            { field: data.arrears_water, name: "arrears_water" },
            { field: data.arrears_garbage, name: "arrears_garbage" },
            { field: data.arrears_electricity, name: "arrears_electricity" }
          ];

          individualArrearsFields.forEach(({ field, name }) => {
            if (field && field.trim() !== "") {
              data[name] = undefined;
            }
          });

        } else if (data.is_arrears_cumulative === "0") {
          // If arrears are not cumulative, validate individual arrears fields and calculate total
          const arrearsFields = [
            { field: data.arrears_rent_amount, name: "arrears_rent_amount", label: "rent amount" },
            { field: data.arrears_rent_deposit, name: "arrears_rent_deposit", label: "rent deposit" },
            { field: data.arrears_water, name: "arrears_water", label: "water" },
            { field: data.arrears_garbage, name: "arrears_garbage", label: "garbage" },
            { field: data.arrears_electricity, name: "arrears_electricity", label: "electricity" }
          ];

          const hasAtLeastOneArrears = arrearsFields.some(
            ({ field }) => field && field.trim() !== ""
          );

          if (!hasAtLeastOneArrears) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "At least one arrears field (rent amount, rent deposit, water, garbage, or electricity) is required when arrears are not cumulative",
              path: ["arrears_rent_amount"],
            });
          }

          // Validate each provided arrears field is a positive number
          arrearsFields.forEach(({ field, name, label }) => {
            if (field && field.trim() !== "") {
              const value = parseFloat(field);
              if (isNaN(value) || value <= 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${label.charAt(0).toUpperCase() + label.slice(1)} arrears must be a positive number`,
                  path: [name],
                });
              }
            }
          });

          // Calculate and set arrears_total automatically
          const calculatedTotal = arrearsFields.reduce((total, { field }) => {
            if (field && field.trim() !== "") {
              const value = parseFloat(field);
              if (!isNaN(value) && value > 0) {
                return total + value;
              }
            }
            return total;
          }, 0);

          // Update arrears_total in the data object
          if (calculatedTotal > 0) {
            data.arrears_total = calculatedTotal.toString();
          }
        }
      }
    })
    .transform((data) => {
      // Remove is_the_tenant_have_previous_arrears from final data since you don't want to send it
      const { is_the_tenant_have_previous_arrears, ...finalData } = data;

      // Additional transformation to ensure arrears_total calculation for non-cumulative arrears
      if (finalData.is_arrears_cumulative === "0") {
        const arrearsFields = [
          finalData.arrears_rent_amount,
          finalData.arrears_rent_deposit,
          finalData.arrears_water,
          finalData.arrears_garbage,
          finalData.arrears_electricity
        ];

        const calculatedTotal = arrearsFields.reduce((total, field) => {
          if (field && field.trim() !== "") {
            const value = parseFloat(field);
            if (!isNaN(value) && value > 0) {
              return total + value;
            }
          }
          return total;
        }, 0);

        if (calculatedTotal > 0) {
          finalData.arrears_total = calculatedTotal.toString();
        }
      }

      return finalData;
    });

  const defaultValues = {
    is_rent_agreed: "1",
    is_meter_read: "0",
    is_taxable: "0",
    is_the_tenant_have_previous_arrears: "0",
    first_time_billing: "0",
    amount_criteria: "current_full_month_rent",
    due_rent_reminder_date: "1",
    mode_for_late_payment: "percentage",
    criteria_percentage: "10",
    rent_due_date: "10",
    due_rent_fine_start_date: "11"
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
  const is_arrears_cumulative = watch("is_arrears_cumulative");
  const is_the_tenant_have_previous_arrears = watch("is_the_tenant_have_previous_arrears");
  const is_rent_agreed = watch("is_rent_agreed");

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
      const dataToSend = {
        ...values,
        tenant_id: tenantId,
        unit_id: selectedUnit,
        is_taxable: values.is_taxable === "1",
        is_meter_read: values.is_meter_read === "1",
      }

      console.log(dataToSend)

      const response = await axios.post(`${baseUrl}/manage-tenant/create-tenant/other-info`, dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/tenants')
        console.log(response)
      }
    } catch (error) {
      toast.error(error.response.error.due_rent_reminder_date || error.response.error.due_rent_fine_start_date || error.response.message)

    }
  }

  return (
    <>
      <div className="p-4 flex justify-between mx-4">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Assign tenant unit</h1>
          <p className="text-sm text-gray-500">Assign tenant to a property unit </p>
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
            {errors.is_rent_agreed && (
              <p className="text-xs text-red-500">
                {errors.is_rent_agreed.message}
              </p>
            )}

            {is_rent_agreed === "0" && (
              <>
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
              </>
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

            <h3 className="font-bold text-gray-600 mt-2">(d) Tenant previous balances</h3>
            <div className="flex space-x-6">
              <h6 className="text-sm font-medium text-gray-900">Does the tenant have any arrears</h6>
              <label>
                <input
                  className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                  type="radio"
                  value="1"
                  {...register("is_the_tenant_have_previous_arrears")}
                />
                Yes
              </label>
              <label>
                <input
                  className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                  type="radio"
                  value="0"
                  {...register("is_the_tenant_have_previous_arrears")}
                />
                No
              </label>
            </div>

            {is_the_tenant_have_previous_arrears === "1" && (
              <>
                <div className="flex space-x-6">
                  <h6 className="text-sm font-medium text-gray-900">Is the tenant arrears cumulative?</h6>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="1"
                      {...register("is_arrears_cumulative")}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="0"
                      {...register("is_arrears_cumulative")}
                    />
                    No
                  </label>
                </div>
                {is_arrears_cumulative === "0" && (
                  <div>
                    <div className="flex justify-between space-x-4">
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900">
                          Enter rent arrears
                        </label>
                        <input
                          aria-label="arrears_rent_amount"
                          {...register("arrears_rent_amount")}
                          type="number"
                          placeholder="Enter monthly rent arrears"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.arrears_rent_amount && (
                          <p className="text-xs text-red-500">
                            {errors.arrears_rent_amount.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900"
                        >
                          Enter rent deposit arrears
                        </label>
                        <input
                          aria-label="rent_deposit"
                          {...register("arrears_rent_deposit")}
                          type="number"
                          placeholder="Enter deposit arrears"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.arrears_rent_deposit && (
                          <p className="text-xs text-red-500">
                            {errors.arrears_rent_deposit.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900">
                          Enter tenant water arrears
                        </label>
                        <input
                          aria-label="water"
                          {...register("arrears_water")}
                          type="number"
                          placeholder="Enter arrears_water arrears"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.arrears_water && (
                          <p className="text-xs text-red-500">
                            {errors.arrears_water.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900">
                          Enter tenant garbage arrears
                        </label>
                        <input
                          aria-label="garbage"
                          {...register("arrears_garbage")}
                          type="number"
                          placeholder="Enter water arrears"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.arrears_garbage && (
                          <p className="text-xs text-red-500">
                            {errors.arrears_garbage.message}
                          </p>
                        )}
                      </div>
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900"
                        >
                          Enter tenant electricity arrears
                        </label>
                        <input
                          aria-label="electricity"
                          {...register("arrears_electricity")}
                          type="number"
                          placeholder="Enter electricity arrears"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.arrears_electricity && (
                          <p className="text-xs text-red-500">
                            {errors.arrears_electricity.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {is_arrears_cumulative === "1" && (
                  <div className="w-full">
                    <label
                      htmlFor="property-name"
                      className="block my-2 text-sm font-medium text-gray-900">
                      Enter the cumulative arrears
                    </label>
                    <input
                      aria-label="arrears_total"
                      {...register("arrears_total")}
                      type="number"
                      placeholder="Enter cumulative arrears"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                    {errors.arrears_total && (
                      <p className="text-xs text-red-500">
                        {errors.arrears_total.message}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            <h3 className="font-bold text-gray-600 mt-2">(e) Other unit settings</h3>
            <div className="grid grid-cols-3 gap-4">
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
                        Enter the current water meter reading
                      </label>
                      <input
                        {...register('initial_meter_reading')}
                        aria-label="initial_meter_reading"
                        type="string"
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
              <div className="flex space-x-6">
                <h6 className="text-sm font-medium text-gray-900">Make initial billings (Deposits)</h6>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="1"
                    {...register("first_time_billing")}
                  />
                  Yes
                </label>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="0"
                    {...register("first_time_billing")}
                  />
                  No
                </label>
                {errors.first_time_billing && (
                  <p className="text-xs text-red-500">
                    {errors.first_time_billing.message}
                  </p>
                )}
              </div>
            </div>
            <h3 className="font-bold text-gray-600 mt-2">(f) Fines payment settings</h3>

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
                  <option value={"Select rent due date"}>Select rent due date</option>
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
                  <option value={"Select due rent reminder date"}>Select due rent reminder date</option>
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
                  <option value={"Select due rent reminder date"}>Select due rent reminder date</option>
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
                  <option selected>Select mode for late payment</option>
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