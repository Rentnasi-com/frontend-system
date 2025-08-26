import { FaArrowRight } from "react-icons/fa"
import { useEffect, useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const EditTenantProperty = () => {
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
  const unitId = searchParams.get('unit_id')

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
    tax_percentage: z.string().optional().nullable().transform(val => val === null ? undefined : val),
    initial_meter_reading: z.string().optional().nullable().transform(val => val === null ? undefined : val),

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

    is_electricity_meter_read: z.enum(['1', '0'], {
      errorMap: () => ({ message: "You must select either 'Yes' or 'No'" })
    }),

    electricity_unit_price: z.coerce.string().optional(),
    initial_electricity_reading: z.coerce.string().optional(),

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

      // Electricity meter reading validation
      if (data.is_electricity_meter_read === "1") {
        // Validate electricity_unit_price is required
        if (!data.electricity_unit_price || data.electricity_unit_price.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Electricity unit price is required when electricity meter read is enabled",
            path: ["electricity_unit_price"],
          });
        } else {
          // Validate electricity_unit_price is a positive number
          const unitPrice = parseFloat(data.electricity_unit_price);
          if (isNaN(unitPrice) || unitPrice <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Electricity unit price must be a positive number",
              path: ["electricity_unit_price"],
            });
          }
        }

        // Validate initial_electricity_reading is required
        if (!data.initial_electricity_reading || data.initial_electricity_reading.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Initial electricity reading is required when electricity meter read is enabled",
            path: ["initial_electricity_reading"],
          });
        } else {
          // Validate initial_electricity_reading is a non-negative number
          const reading = parseFloat(data.initial_electricity_reading);
          if (isNaN(reading) || reading < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Initial electricity reading must be a non-negative number",
              path: ["initial_electricity_reading"],
            });
          }
        }
      }

      // Clear electricity fields if meter read is disabled
      if (data.is_electricity_meter_read === "0") {
        // Optional: Clear the fields when electricity meter is disabled
        // You can remove this validation if you want to allow values to persist
        if (data.electricity_unit_price && data.electricity_unit_price.trim() !== "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Electricity unit price should be empty when electricity meter read is disabled",
            path: ["electricity_unit_price"],
          });
        }
        if (data.initial_electricity_reading && data.initial_electricity_reading.trim() !== "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Initial electricity reading should be empty when electricity meter read is disabled",
            path: ["initial_electricity_reading"],
          });
        }
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

    })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const mode_for_late_payment = watch("mode_for_late_payment");
  const is_taxable = watch("is_taxable");
  const is_meter_read = watch("is_meter_read");
  const is_rent_agreed = watch("is_rent_agreed");
  const is_electricity_meter_read = watch("is_electricity_meter_read");


  useEffect(() => {
    fetchProperties()
    fetchTenantDetails()
  }, [token, baseUrl, tenantId, unitId])

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

  const fetchTenantDetails = async () => {
    try {
      const tenantResponse = await axios.get(
        `${baseUrl}/manage-tenant/create-tenant/other-info?unit_id=${unitId}&tenant_id=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = tenantResponse.data.result;
      if (!tenantResponse.data.success || !data) {
        toast.error("Failed to load tenant details");
        return;
      }

      // Pre-fill form with tenant info
      reset({
        ...data,
        is_rent_agreed: String(data.is_rent_agreed),
        is_taxable: String(data.is_taxable),
        is_meter_read: String(data.is_meter_read),
        tax_percentage: String(data.tax_percentage),
        initial_meter_reading: data.initial_meter_reading,

        rent_amount: data.rent_amount,
        rent_deposit: data.rent_deposit,
        water: data.water,
        garbage: data.garbage,
        electricity: data.electricity,

        rent_due_date: data.rent_due_date,
        due_rent_reminder_date: data.due_rent_reminder_date,
        due_rent_fine_start_date: data.due_rent_fine_start_date,
        mode_for_late_payment: data.mode_for_late_payment,
        amount_criteria: data.amount_criteria,
        criteria_percentage: data.criteria_percentage,
        late_payment_fixed_amount: data.late_payment_fixed_amount,

        is_electricity_meter_read: String(data.is_electricity_meter_read),
        initial_electricity_reading: data.initial_electricity_reading,
        electricity_unit_price: data.electricity_unit_price

      });

      // Proceed to fetch unit, property, and units under the selected property
      if (data.unit_id) {
        const [unitDetailsRes, propertyRes] = await Promise.all([
          axios.get(`${baseUrl}/manage-tenant/required-data/selected-unit?unit_id=${data.unit_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseUrl}/manage-tenant/required-data/available-properties`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const unitDetails = unitDetailsRes.data.result;
        const propertyList = propertyRes.data.result;

        setUnitDetails(unitDetails);
        setSelectedUnit(data.unit_id);
        setProperties(propertyList);

        const propertyForUnit = propertyList.find(prop => prop.id === unitDetails.property_id);
        if (propertyForUnit) {
          setSelectedProperty(propertyForUnit.id);

          const unitsResponse = await axios.get(
            `${baseUrl}/manage-tenant/required-data/available-units?property_id=${propertyForUnit.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          setPropertyUnits(unitsResponse.data.result);
        }
      }
    } catch (error) {
      console.error("Unable to fetch tenant details:", error);
      toast.error("Unable to fetch tenant details");
    }
  };

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
      toast.error("You have no units in the property selected")
    }
  }

  const handleUnitChange = async (event) => {
    const unitId = event.target.value
    setSelectedUnit(unitId)
    localStorage.setItem("unit_id", unitId)

    try {

      const unitDetailsResponse = await axios.get(`${baseUrl}/manage-tenant/required-data/selected-unit?unit_id=${unitId}`, {
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
      const unit_id = selectedUnit;
      const dataToSend = {
        ...values,
        is_rent_agreed: values.is_rent_agreed === "1",
        is_taxable: values.is_taxable === "1",
        is_meter_read: values.is_meter_read === "1",
        tenant_id: Number(tenantId),
        unit_id,

        ...(values.mode_for_late_payment === "percentage" ? {
          criteria_percentage: values.criteria_percentage,
          late_payment_fixed_amount: null
        } : {}),
        ...(values.mode_for_late_payment === "fixed_amount" ? {
          late_payment_fixed_amount: values.late_payment_fixed_amount,
          amount_criteria: null,
          criteria_percentage: null
        } : {})
      }



      const response = await axios.patch(
        `${baseUrl}/manage-tenant/create-tenant/other-info`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/tenants')
      } else {
        toast.error(response.data.message || "Failed to update tenant")
      }
    } catch (error) {
      console.error("Submission error:", error)
      if (error.response) {
        // Handle specific field errors from the API
        if (error.response.data.errors) {
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            messages.forEach(message => toast.error(`${field}: ${message}`))
          })
        } else {
          toast.error(error.response.data.message || "An error occurred")
        }
      } else {
        toast.error("Network error or server not responding")
      }
    }
  }

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // toast.error("🚨 Form Errors:", errors);
      Object.entries(errors).forEach(([field, error]) => {
        toast.error(`${field}: ${error.message}`);
      });
    }
  }, [errors]);

  return (
    <>
      <div className="p-4 flex justify-between mx-4">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Edit Assign tenant unit</h1>
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
                  <option value="">Select property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
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
                  <option value="">Select property unit</option>
                  {propertyUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.unit_number}</option>
                  ))}
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

            <h3 className="font-bold text-gray-600 mt-2">(d) Other unit settings</h3>
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
              <div className="col-span-3">
                <div className="flex space-x-6">
                  <h6 className="text-sm font-medium text-gray-900">Do you charge electricity by meter reading</h6>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="1"
                      {...register("is_electricity_meter_read")}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value="0"
                      {...register("is_electricity_meter_read")}
                    />
                    No
                  </label>
                  {errors.is_electricity_meter_read && (
                    <p className="text-xs text-red-500">
                      {errors.is_electricity_meter_read.message}
                    </p>
                  )}
                </div>
                {is_electricity_meter_read === "1" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between space-x-4">
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900">
                          Enter electricity unit price
                        </label>
                        <input
                          {...register('electricity_unit_price')}
                          aria-label="electricity_unit_price"
                          type="number"
                          placeholder="e.g 1000"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.electricity_unit_price && (
                          <p className="text-xs text-red-500">
                            {errors.electricity_unit_price.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <div className="w-full">
                        <label
                          htmlFor="property-name"
                          className="block my-2 text-sm font-medium text-gray-900">
                          Enter initial electricity meter reading
                        </label>
                        <input
                          {...register('initial_electricity_reading')}
                          aria-label="initial_electricity_reading"
                          type="number" step="any"
                          placeholder="e.g 1000"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        />
                        {errors.initial_electricity_reading && (
                          <p className="text-xs text-red-500">
                            {errors.initial_electricity_reading.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <h3 className="font-bold text-gray-600 mt-2">(e) Fines payment settings</h3>

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
                className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2"
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center gap-2">
                    <Loader className="animate-spin" /> Loading ...
                  </div>
                ) : (
                  <div className="flex justify-center items-center space-x-2">
                    <p>Submit</p>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default EditTenantProperty