import toast from "react-hot-toast"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { Loader } from "lucide-react"
import { FaArrowRight } from "react-icons/fa"
import { Input, SelectField, SettingsBreadcrumbs } from "../../shared"
import { useEffect, useState } from "react"
import DashboardHeader from './../properties/dashboard/page_components/dashboard_header'

const PaymentsDetails = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState(true)
    const [properties, setProperties] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState(null);
    const baseUrl = import.meta.env.VITE_BASE_URL

    const schema = z.object({
        rent_received_by_rentnasi: z.string().transform((val) => val === "true").pipe(z.boolean()),
        payID: z.string().optional(),

        payment_method: z.enum(["mpesa", "bank"]).optional(),

        mpesa_method: z.enum(["send_money", "pay_bill", "buy_goods"]).optional(),
        mpesa_phone_number: z.string().min(5, "Invalid mpesa phone number").optional(),
        mpesa_hakikisha_name: z.string().min(2, "Invalid mpesa hakikisha name").optional(),
        mpesa_pay_bill_number: z.string().min(3, "Invalid mpesa pay bill number").optional(),
        mpesa_account_number: z.string().min(2, "Invalid mpesa account number").optional(),
        mpesa_till_number: z.string().min(3, "Invalid mpesa till number").optional(),

        bank_account_number: z.string().min(5, "Invalid bank account number").optional(),
        bank_account_name: z.string().min(5, "Invalid bank account name").optional(),
        bank_name: z.string().min(3, "Invalid bank name").optional(),
        bank_branch: z.string().min(5, "Invalid bank branch").optional(),
        bank_code: z.string().min(3, "Invalid bank code").optional(),
    }).superRefine((data, ctx) => {
        // If rent is received by rentnasi
        if (data.rent_received_by_rentnasi === true) {
            if (!data.payID || data.payID.trim() === "" || data.payID.length < 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Enter property account number (minimum 3 characters)",
                    path: ["payID"]
                });
            }
            return;
        }

        // Only validate payment details if rent is NOT received by rentnasi
        if (data.rent_received_by_rentnasi === false) {
            if (!data.payment_method) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Please select a payment method",
                    path: ["payment_method"]
                });
                return;
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
                // Check each bank field individually
                if (!data.bank_account_number || data.bank_account_number.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Bank account number is required",
                        path: ["bank_account_number"]
                    });
                }

                if (!data.bank_account_name || data.bank_account_name.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Bank account name is required",
                        path: ["bank_account_name"]
                    });
                }

                if (!data.bank_name || data.bank_name.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Bank name is required",
                        path: ["bank_name"]
                    });
                }

                if (!data.bank_branch || data.bank_branch.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Bank branch is required",
                        path: ["bank_branch"]
                    });
                }

                if (!data.bank_code || data.bank_code.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Bank code is required",
                        path: ["bank_code"]
                    });
                }
            }
        }
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },

    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            rent_received_by_rentnasi: "true",
            payID: "",
        },
    })

    const payment_method = watch("payment_method")
    const mpesa_method = watch("mpesa_method")
    const rent_received_by_rentnasi = watch("rent_received_by_rentnasi");

    useEffect(() => {
        fetchProperties()
    }, [baseUrl, token])

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/settings/payment/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )
            if (response.data.success) {
                setProperties(response.data.result)
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
        }
    }
    const onSubmit = async (data) => {
        if (!selectedProperty) {
            toast.error("No property selected");
            return;
        }
        const submissionData = {
            property_id: selectedProperty.property_id,
            rent_received_by_rentnasi: data.rent_received_by_rentnasi,
            payment_data: {
                payID: data.payID,
                payment_method: data.payment_method,
                mpesa_method: data.mpesa_method,
                mpesa_phone_number: data.mpesa_phone_number,
                mpesa_hakikisha_name: data.mpesa_hakikisha_name,
                mpesa_pay_bill_number: data.mpesa_pay_bill_number,
                mpesa_account_number: data.mpesa_account_number,
                mpesa_till_number: data.mpesa_till_number,
                bank_account_number: data.bank_account_number,
                bank_account_name: data.bank_account_name,
                bank_name: data.bank_name,
                bank_branch: data.bank_branch,
                bank_code: data.bank_code
            }
        };
        try {
            const response = await toast.promise(
                axios.post(
                    `${baseUrl}/settings/payment/details`, submissionData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                ),
                {
                    loading: "Sending your message ...",
                    success: "Payment sent successfully",
                    error: "Failed to send message. Please try again later.",
                }
            )
            if (response.status === 200) {
                setShowModal(false)
                await fetchProperties();
                setOpenDropdownId(null);
                reset();
            }
        } catch (error) {
            toast.error("An error occurred during payment setting.");
            setOpenDropdownId(null);
            reset();
        }
    }
    const handleClose = () => {
        setShowModal(false)
        setOpenDropdownId(null);
    }

    const handleOpen = (property) => {
        setSelectedProperty(property);
        setShowModal(true)
    }

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (propertyId) => {
        setOpenDropdownId(openDropdownId === propertyId ? null : propertyId);
    };

    return (
        <>
            <DashboardHeader
                title="Payments Details"
                description="Add payments details to your preference"

            />
            <SettingsBreadcrumbs />

            <div className="bg-white border rounded border-gray-100 col-span-2 py-4 mx-4 h-full">
                <h4 className="text-lg font-medium text-gray-900 m-4">Properties List</h4>
                {loading ? (
                    <p className="text-center py-4">Loading<span className="animate-pulse">...</span></p>
                ) : (
                    <div className="w-full">
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100 text-left text-xs border-y ">
                                    <tr className="py-2">
                                        <th className="px-4 py-2">Photo</th>
                                        <th className="px-4 py-2">Property Details</th>
                                        <th className="px-4 py-2">Payments Details</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {properties.map((property, index) => (
                                        <tr key={index} className="border-b text-xs">
                                            <td className="px-4 py-2">
                                                <img src={property.cover_image} alt={property.property_name} className="w-12 h-12 rounded-full" />
                                            </td>

                                            <td className="px-4 py-2">
                                                {property.property_name}
                                                <br />
                                                <span className="text-gray-600 text-xs">
                                                    {property.location}
                                                </span>
                                                <br />
                                                <span className="text-gray-500 text-xs">
                                                    {property.property_type}
                                                </span>
                                            </td>

                                            {property.payment_data && (
                                                <div className="text-xs py-2 space-y-2">
                                                    <div className="capitalize font-medium text-gray-700">
                                                        {property.payment_data.payment_method} Details
                                                    </div>
                                                    {/* Bank Details */}
                                                    {property.payment_data.payment_method === "bank" && (
                                                        <div className="bank-details">
                                                            <p><strong>Bank:</strong> {property.payment_data.bank_name}</p>
                                                            <p><strong>Account:</strong> {property.payment_data.bank_account_number}</p>
                                                            <p><strong>Account Name:</strong> {property.payment_data.bank_account_name}</p>

                                                        </div>
                                                    )}
                                                    {/* Rent Received by Rentnasi */}
                                                    {(!property.payment_data.payment_method || property.payment_data.payment_method === "") && (
                                                        <div className="bank-details">
                                                            <p><strong>Paybill:</strong> {property.payment_data.business_number}</p>
                                                            <p><strong>Account:</strong> {property.payment_data.account_number}</p>
                                                        </div>
                                                    )}
                                                    {/* M-Pesa Details */}
                                                    {property.payment_data.payment_method === "mpesa" && (
                                                        <div className="mpesa-details">
                                                            <p><strong>Method:</strong> {property.payment_data.mpesa_method.replace("_", " ")}</p>

                                                            {property.payment_data.mpesa_method === "pay_bill" && (
                                                                <>
                                                                    <p><strong>Paybill:</strong> {property.payment_data.mpesa_pay_bill_number}</p>
                                                                    <p><strong>Account:</strong> {property.payment_data.mpesa_account_number}</p>
                                                                </>
                                                            )}

                                                            {property.payment_data.mpesa_method === "buy_goods" && (
                                                                <p><strong>Till Number:</strong> {property.payment_data.mpesa_till_number}</p>
                                                            )}

                                                            {property.payment_data.mpesa_method === "send_money" && (
                                                                <>
                                                                    <p><strong>Phone:</strong> {property.payment_data.mpesa_phone_number}</p>
                                                                    <p><strong>Name:</strong> {property.payment_data.mpesa_hakikisha_name}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <td className="relative px-4 py-2 text-sm">
                                                <button
                                                    onClick={() => toggleDropdown(property.property_id)}
                                                    className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Actions
                                                    <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>


                                                {openDropdownId === property.property_id && (
                                                    <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                        <div className="py-1">
                                                            <button onClick={() => handleOpen(property)} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                                                                Set Payments
                                                            </button>
                                                            <button className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100cd">
                                                                Edit Payments
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {showModal && (
                <div style={{ zIndex: 1000 }} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 bg-black/50 backdrop-blur-sm">
                    <div className="relative p-4 w-full max-w-lg max-h-full">
                        <div className="relative bg-white rounded-lg border border-gray-200">

                            <div className="p-4 md:p-5">
                                <button type="button" onClick={handleClose} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs w-8 h-8 ms-auto inline-flex justify-center items-center">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>


                                <h2 className="text-lg font-semibold">Set Property Payment</h2>
                                <hr />
                                <form onSubmit={handleSubmit(onSubmit)}>

                                    <div className="mt-3">
                                        <h6 className="text-xs font-medium text-gray-700">1. Do you prefer Rentalpay as your primary payment method ?</h6>
                                        <div className="py-2 space-x-2 text-gray-700">
                                            <label>
                                                <input
                                                    {...register("rent_received_by_rentnasi")}

                                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                                    type="radio"
                                                    value="true"
                                                />
                                                Yes
                                            </label>
                                            <label>
                                                <input
                                                    {...register("rent_received_by_rentnasi")}

                                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                                    type="radio"
                                                    value="false"
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                    {errors.rent_received_by_rentnasi && (
                                        <p className="text-xs text-red-500">
                                            {errors.rent_received_by_rentnasi.message}
                                        </p>
                                    )}
                                    {rent_received_by_rentnasi === "true" && (
                                        <>
                                            <h6 className="text-xs font-medium text-gray-700">2. Property account number</h6>
                                            <div className="py-2">
                                                <Input
                                                    type="text"
                                                    name="payID"
                                                    placeholder="Enter property account number"
                                                    register={register}
                                                    errors={errors}
                                                />
                                                {errors.payID && (
                                                    <p className="text-xs text-red-500">
                                                        {errors.payID.message}
                                                    </p>
                                                )}
                                            </div>

                                        </>
                                    )}
                                    {rent_received_by_rentnasi === "false" && (
                                        <>
                                            <div className="">
                                                <h6 className="text-xs font-medium text-gray-700">2. What is your preferred method of payment</h6>
                                                <div className="py-2 space-x-2 text-gray-700">
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
                                                            className="block text-xs font-medium text-gray-900"
                                                        >
                                                            3. Select mode for late payment fine
                                                        </label>
                                                        <select className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                        className="block my-2 text-xs font-medium text-gray-900"
                                                                    >
                                                                        Business Number
                                                                    </label>
                                                                    <input
                                                                        {...register("mpesa_pay_bill_number")}
                                                                        type="text"
                                                                        placeholder="Enter paybill number"
                                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                        className="block my-2 text-xs font-medium text-gray-900"
                                                                    >
                                                                        Account Number
                                                                    </label>
                                                                    <input
                                                                        {...register("mpesa_account_number")}
                                                                        type="text"
                                                                        placeholder="Select account number"
                                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                    className="block my-2 text-xs font-medium text-gray-900"
                                                                >
                                                                    Till number
                                                                </label>
                                                                <input
                                                                    {...register("mpesa_till_number")}
                                                                    type="text"
                                                                    placeholder="Enter phone number"
                                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                    className="block my-2 text-xs font-medium text-gray-900"
                                                                >
                                                                    Hakikisha name
                                                                </label>
                                                                <input
                                                                    {...register("mpesa_hakikisha_name")}
                                                                    type="text"
                                                                    placeholder="e.g John Doe"
                                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                    className="block my-2 text-xs font-medium text-gray-900"
                                                                >
                                                                    Phone number
                                                                </label>
                                                                <input
                                                                    {...register("mpesa_phone_number")}
                                                                    type="text"
                                                                    placeholder="Enter phone number"
                                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                className="block my-2 text-xs font-medium text-gray-900"
                                                            >
                                                                Bank account name
                                                            </label>
                                                            <input
                                                                {...register("bank_account_name")}
                                                                type="text"
                                                                placeholder="e.g Penda Agency"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                className="block my-2 text-xs font-medium text-gray-900"
                                                            >
                                                                Bank account number
                                                            </label>
                                                            <input
                                                                {...register("bank_account_number")}
                                                                type="text"
                                                                placeholder="Enter account number"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                className="block my-2 text-xs font-medium text-gray-900"
                                                            >
                                                                Bank name
                                                            </label>
                                                            <input
                                                                {...register("bank_name")}
                                                                type="text"
                                                                placeholder="Enter bank name"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                className="block my-2 text-xs font-medium text-gray-900"
                                                            >
                                                                Bank branch
                                                            </label>
                                                            <input
                                                                {...register("bank_branch")}
                                                                type="text"
                                                                placeholder="Enter bank branch"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                                                className="block my-2 text-xs font-medium text-gray-900"
                                                            >
                                                                Bank code
                                                            </label>
                                                            <input
                                                                {...register("bank_code")}
                                                                type="text"
                                                                placeholder="Enter bank code"
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
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
                                        </>
                                    )}
                                    <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? "Processing..." : "Send Message"}
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            type="button"
                                            className="py-2.5 px-5 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* {paymentNotToUsModal && (
                <div style={{ zIndex: 1000 }} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 bg-black/50 backdrop-blur-sm">
                    <div className="relative p-4 w-full max-w-lg max-h-full">
                        <div className="relative bg-white rounded-lg border border-gray-200">

                            <div className="p-4 md:p-5">
                                <button type="button" onClick={handleClose} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs w-8 h-8 ms-auto inline-flex justify-center items-center">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>


                                <h2 className="text-lg font-semibold">Set Property Payment</h2>
                                <hr />
                                <form onSubmit={handleSubmit(onSubmit)}>

                                    <div className="mt-3">
                                        <h6 className="text-xs font-medium text-gray-700">1. Do you prefer Rentalpay as your primary payment method ?</h6>
                                        <div className="py-2 space-x-2 text-gray-700">
                                            <label>
                                                <input
                                                    {...register("rent_received_by_rentnasi")}

                                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                                    type="radio"
                                                    value="true"
                                                />
                                                Yes
                                            </label>
                                            <label>
                                                <input
                                                    {...register("rent_received_by_rentnasi")}

                                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                                    type="radio"
                                                    value="false"
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? "Processing..." : "Send Message"}
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            type="button"
                                            className="py-2.5 px-5 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
        </>
    )
}

export default PaymentsDetails
