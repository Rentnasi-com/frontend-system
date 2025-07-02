import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import DatePicker from "react-datepicker"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { FaArrowRight } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

const AddLandlordPaymentsDetails = () => {
    const navigate = useNavigate()
    const [properties, setProperties] = useState([])
    const [selectedProperties, setSelectedProperties] = useState([])
    const [isLoadingProperties, setIsLoadingProperties] = useState(true)
    const token = localStorage.getItem('token')

    const [selectedDate, setSelectedDate] = useState(null);

    const landlord_id = localStorage.getItem("landlord_id")
    const [fetchError, setFetchError] = useState(null)
    const baseUrl = import.meta.env.VITE_BASE_URL

    const schema = z.object({
        payment_method: z.enum(["mpesa", "bank"]).optional(),
        date_of_payment: z.number().min(1, "Day must be at least 1").max(31, "Day must be at most 31"),

        mpesa_method: z.enum(["send_money", "pay_bill", "buy_goods"]).optional(),
        mpesa_phone_number: z.string().optional(),
        mpesa_hakikisha_name: z.string().optional(),
        mpesa_pay_bill_number: z.string().optional(),
        mpesa_account_number: z.string().optional(),
        mpesa_till_number: z.string().optional(),

        bank_account_number: z.string().optional(),
        bank_account_name: z.string().optional(),
        bank_name: z.string().optional(),
        bank_branch: z.string().optional(),
        bank_code: z.string().optional(),

        is_property_created: z.enum(["0", "1"]).optional(),
        properties: z.array(z.string().min(1)).optional(),
    }).superRefine((data, ctx) => {

        if (!data.date_of_payment || data.date_of_payment < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Select a valid date",
                path: ["date_of_payment"]
            });
        }

        // Payment method validation
        if (!data.payment_method) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a payment method",
                path: ["payment_method"]
            });
            return; // Early return if no payment method selected
        }

        // Mpesa validation
        if (data.payment_method === "mpesa") {
            if (!data.mpesa_method) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Please select an Mpesa payment method",
                    path: ["mpesa_method"]
                });
                return;
            }

            switch (data.mpesa_method) {
                case "send_money":
                    if (!data.mpesa_phone_number || data.mpesa_phone_number.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Phone number is required",
                            path: ["mpesa_phone_number"]
                        });
                    }
                    if (!data.mpesa_hakikisha_name || data.mpesa_hakikisha_name.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Hakikisha name is required",
                            path: ["mpesa_hakikisha_name"]
                        });
                    }
                    break;

                case "pay_bill":
                    if (!data.mpesa_pay_bill_number || data.mpesa_pay_bill_number.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Paybill number is required",
                            path: ["mpesa_pay_bill_number"]
                        });
                    }
                    if (!data.mpesa_account_number || data.mpesa_account_number.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Account number is required",
                            path: ["mpesa_account_number"]
                        });
                    }
                    break;

                case "buy_goods":
                    if (!data.mpesa_till_number || data.mpesa_till_number.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Till number is required",
                            path: ["mpesa_till_number"]
                        });
                    }
                    break;
            }
        }
        // Bank validation
        else if (data.payment_method === "bank") {
            const bankFields = [
                { field: "bank_account_number", message: "Bank account number is required" },
                { field: "bank_account_name", message: "Bank account name is required" },
                { field: "bank_name", message: "Bank name is required" },
                { field: "bank_branch", message: "Bank branch is required" },
                { field: "bank_code", message: "Bank code is required" }
            ];

            bankFields.forEach(({ field, message }) => {
                if (!data[field] || data[field].trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message,
                        path: [field]
                    });
                }
            });
        }
    });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },

    } = useForm({
        resolver: zodResolver(schema),
    })

    const payment_method = watch("payment_method")
    const mpesa_method = watch("mpesa_method")
    const is_property_created = watch("is_property_created")

    useEffect(() => {
        fetchProperty()
    }, [token, baseUrl])

    const fetchProperty = async () => {
        setIsLoadingProperties(true);
        setFetchError(null);

        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/manage-landlord/required-data/available-properties`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setProperties(propertyResponse.data.result)
        } catch (error) {
            setFetchError("Failed to fetch properties. Please try again.")
        } finally {
            setIsLoadingProperties(false)
        }
    }

    const handleSelectChange = (event) => {
        const selectedOption = Number(event.target.value); // Convert to number
        if (selectedOption && !selectedProperties.includes(selectedOption)) {
            setSelectedProperties((prev) => {
                const updatedProperties = [...prev, selectedOption];
                return updatedProperties;
            });
        }
    };

    const handleRemoveProperty = (propertyId) => {
        setSelectedProperties((prev) => prev.filter((id) => id !== propertyId));
    };

    const propertiesOptions = useMemo(() => (
        properties
            .filter(property => !selectedProperties.includes(property.id)) // Filter out selected properties
            .map((property) => (
                <option value={property.id} key={property.id}>{property.name}</option>
            ))
    ), [properties, selectedProperties]);

    const onSubmit = async (values) => {
        try {
            const dataToSend = {
                ...values,
                properties: selectedProperties,
                landlord_id
            }

            console.log(dataToSend)

            const response = await axios.post(`${baseUrl}/manage-landlord/create-landlord/other-info`, dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            if (response.data.success) {
                navigate('/landlords')
                toast.success(response.data.message)
            }
        } catch (error) {
            toast.success(error.data.message)
        }
    }
    // Add this somewhere in your component to debug
    console.log("Current form values:", watch());
    console.log("Form errors:", errors);
    console.log("Is form valid:", Object.keys(errors).length === 0);
    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Add landlord account</h1>
                    <p className="text-sm text-gray-500">Add landlord account to your preference </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Landlord details</h3>
                    <h3 className="font-bold text-gray-600 mt-2">(c) Payment information</h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900" htmlFor="date">1. Select date to receive payment</label>
                            <select
                                {...register("date_of_payment", { valueAsNumber: true })}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            >
                                <option value="">Select due rent reminder date</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <option key={day} value={day.toString()}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            {errors.date_of_payment && (
                                <p className="text-xs text-red-500">
                                    {errors.date_of_payment.message}
                                </p>
                            )}
                        </div>
                        <div className="flex space-x-6">
                            <h6 className="text-sm font-medium text-gray-900">2. What is your preferred method of payment</h6>
                            <label>
                                <input
                                    {...register("payment_method")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="mpesa"
                                />
                                Mpesa
                            </label>
                            <label>
                                <input
                                    {...register("payment_method")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="bank"
                                />
                                Bank
                            </label>
                        </div>
                        {errors.payment_method && (
                            <p className="text-xs text-red-500">
                                {errors.payment_method.message}
                            </p>
                        )}
                        {payment_method === "mpesa" && (
                            <>
                                <div className="w-full">
                                    <label
                                        htmlFor="property-name"
                                        className="block my-2 text-sm font-medium text-gray-600"
                                    >
                                        Select mode of payment
                                    </label>
                                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        {...register("mpesa_method")}
                                    >
                                        <option selected>Select model for payment</option>
                                        <option value="send_money">Phone number</option>
                                        <option value="buy_goods">Buy goods</option>
                                        <option value="pay_bill">Paybill</option>
                                    </select>

                                </div>

                                {mpesa_method === "pay_bill" && (
                                    <>
                                        <div className="flex justify-between space-x-4">
                                            <div className="w-full">
                                                <label
                                                    htmlFor="property-name"
                                                    className="block my-2 text-sm font-medium text-gray-900"
                                                >
                                                    Business Number
                                                </label>
                                                <input
                                                    {...register("mpesa_pay_bill_number")}
                                                    type="text"
                                                    placeholder="Enter paybill number"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                                />
                                                {errors.mpesa_pay_bill_number && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.mpesa_pay_bill_number.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-full">
                                                <label
                                                    htmlFor="property-name"
                                                    className="block my-2 text-sm font-medium text-gray-900"
                                                >
                                                    Account Number
                                                </label>
                                                <input
                                                    {...register("mpesa_account_number")}
                                                    type="text"
                                                    placeholder="Select account number"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                                />
                                                {errors.mpesa_account_number && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.mpesa_account_number.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {mpesa_method === "buy_goods" && (
                                    <div className="flex justify-between space-x-4">

                                        <div className="w-full">
                                            <label
                                                htmlFor="property-name"
                                                className="block my-2 text-sm font-medium text-gray-900"
                                            >
                                                Till number
                                            </label>
                                            <input
                                                {...register("mpesa_till_number")}
                                                type="text"
                                                placeholder="Enter phone number"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            />
                                            {errors.mpesa_till_number && (
                                                <p className="text-xs text-red-500">
                                                    {errors.mpesa_till_number.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {mpesa_method === "send_money" && (
                                    <div className="flex justify-between space-x-4">
                                        <div className="w-full">
                                            <label
                                                htmlFor="property-name"
                                                className="block my-2 text-sm font-medium text-gray-900"
                                            >
                                                Hakikisha name
                                            </label>
                                            <input
                                                {...register("mpesa_hakikisha_name")}
                                                type="text"
                                                placeholder="e.g John Doe"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            />
                                            {errors.mpesa_hakikisha_name && (
                                                <p className="text-xs text-red-500">
                                                    {errors.mpesa_hakikisha_name.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <label
                                                htmlFor="property-name"
                                                className="block my-2 text-sm font-medium text-gray-900"
                                            >
                                                Phone number
                                            </label>
                                            <input
                                                {...register("mpesa_phone_number")}
                                                type="text"
                                                placeholder="Enter phone number"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            />
                                            {errors.mpesa_phone_number && (
                                                <p className="text-xs text-red-500">
                                                    {errors.mpesa_phone_number.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </>
                        )}

                        {payment_method === "bank" && (
                            <>
                                <div className="flex justify-between space-x-4">
                                    <div className="w-full">
                                        <label
                                            htmlFor="property-name"
                                            className="block my-2 text-sm font-medium text-gray-900"
                                        >
                                            Account name
                                        </label>
                                        <input
                                            {...register("bank_account_name")}
                                            type="text"
                                            placeholder="e.g Penda Agency"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        />
                                        {errors.bank_account_name && (
                                            <p className="text-xs text-red-500">
                                                {errors.bank_account_name.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <label
                                            htmlFor="property-name"
                                            className="block my-2 text-sm font-medium text-gray-900"
                                        >
                                            Account number
                                        </label>
                                        <input
                                            {...register("bank_account_number")}
                                            type="text"
                                            placeholder="Enter account number"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        />
                                        {errors.bank_account_number && (
                                            <p className="text-xs text-red-500">
                                                {errors.bank_account_number.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between space-x-4">
                                    <div className="w-full">
                                        <label
                                            htmlFor="property-name"
                                            className="block my-2 text-sm font-medium text-gray-900"
                                        >
                                            Bank name
                                        </label>
                                        <input
                                            {...register("bank_name")}
                                            type="text"
                                            placeholder="Enter bank name"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        />
                                        {errors.bank_name && (
                                            <p className="text-xs text-red-500">
                                                {errors.bank_name.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <label
                                            htmlFor="property-name"
                                            className="block my-2 text-sm font-medium text-gray-900"
                                        >
                                            Bank branch
                                        </label>
                                        <input
                                            {...register("bank_branch")}
                                            type="text"
                                            placeholder="Enter bank branch"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        />
                                        {errors.bank_branch && (
                                            <p className="text-xs text-red-500">
                                                {errors.bank_branch.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <label
                                            htmlFor="property-name"
                                            className="block my-2 text-sm font-medium text-gray-900"
                                        >
                                            Bank code
                                        </label>
                                        <input
                                            {...register("bank_code")}
                                            type="text"
                                            placeholder="Enter bank code"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                        />
                                        {errors.bank_code && (
                                            <p className="text-xs text-red-500">
                                                {errors.bank_code.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex space-x-6">
                            <h6 className="text-sm font-medium text-gray-900">3. Is the property already created</h6>
                            <label>
                                <input
                                    {...register("is_property_created")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="1"
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    {...register("is_property_created")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="0"
                                />
                                No
                            </label>
                            {errors.is_property_created && (
                                <p className="text-xs text-red-500">
                                    {errors.is_property_created.message}
                                </p>
                            )}
                        </div>

                        {is_property_created === "1" && (
                            <>
                                <div className="w-full">
                                    <label
                                        htmlFor="property-name"
                                        className="block my-2 text-sm font-medium text-gray-900"
                                    >
                                        Select landlord property
                                    </label>
                                    {isLoadingProperties ? (
                                        <Loader className="animate-spin" />
                                    ) : (
                                        <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            onChange={handleSelectChange}
                                        >
                                            <option value="">Select property to link to this landloard</option>
                                            {propertiesOptions}
                                        </select>
                                    )}

                                    {fetchError && (
                                        <p className="text-xs text-red-500">
                                            {fetchError}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {selectedProperties.map((propertyId) => {
                                        const property = properties.find((property) => String(property.id) === String(propertyId));

                                        return (
                                            < span
                                                key={propertyId}
                                                className="inline-flex items-center px-2 py-1 mr-2 text-sm font-medium text-green-800 bg-green-100 rounded"
                                            >
                                                {property ? property.name : "unknown"}

                                                <button
                                                    type="button"
                                                    className="inline-flex items-center p-1 ml-2 text-sm text-green-400 bg-transparent rounded-sm hover:bg-green-200 hover:text-green-900"
                                                    onClick={() => handleRemoveProperty(propertyId)}
                                                    aria-label="Remove"
                                                >
                                                    <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                    </svg>
                                                    <span className="sr-only">Remove badge</span>
                                                </button>
                                            </span>
                                        )
                                    })}
                                </div>
                            </>
                        )}

                        <div className="flex flex-row-reverse mt-4">
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5">
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
                    </form >
                </div >

            </div >
        </>
    )
}

export default AddLandlordPaymentsDetails