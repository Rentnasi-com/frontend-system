import toast from "react-hot-toast"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { Loader } from "lucide-react"
import { FaArrowRight } from "react-icons/fa"
import { Input, SelectField, } from "../../shared"
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
            <div>
                <div>
                    
                    {loading ? (
                        <p className="text-center py-4">Loading<span className="animate-pulse">...</span></p>
                    ) : (
                        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Property
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Details
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Payment Information
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {properties.length > 0 ? (
                                            properties.map((property, index) => (
                                                <tr
                                                    key={property.property_id || index}
                                                    className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                                >
                                                    {/* Property Photo & Name */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-12 relative">
                                                                <img
                                                                    src={property.cover_image || "https://via.placeholder.com/48"}
                                                                    alt={property.property_name}
                                                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                                />
                                                                {property.property_type && (
                                                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                                                        {property.property_type.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Property Details */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                <h4 className="text-sm font-semibold text-gray-900">
                                                                    {property.property_name || "Unnamed Property"}
                                                                </h4>
                                                            </div>

                                                            {property.location && (
                                                                <div className="flex items-start">
                                                                    <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    <span className="text-xs text-gray-600">{property.location}</span>
                                                                </div>
                                                            )}

                                                            {property.property_type && (
                                                                <div className="flex items-center">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                        {property.property_type}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Payment Details */}
                                                    <td className="px-6 py-4 text-xs">
                                                        {property.payment_data ? (
                                                            <div className="space-y-2">
                                                                {/* Payment Method Badge */}
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        {property.payment_data.payment_method === "bank" ? "Bank Transfer" :
                                                                            property.payment_data.payment_method === "mpesa" ? "M-Pesa" :
                                                                                property.payment_data.payment_method === "" ? "Rentnasi Paybill" :
                                                                                    "Payment Method"}
                                                                    </span>
                                                                </div>

                                                                {/* Bank Details */}
                                                                {property.payment_data.payment_method === "bank" && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center">
                                                                            <div className="bg-blue-50 rounded p-1.5 mr-2">
                                                                                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="text-sm">
                                                                                <span className="text-gray-700 font-medium">{property.payment_data.bank_name}</span>
                                                                                <br />
                                                                                <span className="text-gray-500 text-xs">{property.payment_data.bank_account_number}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 pl-8">
                                                                            {property.payment_data.bank_account_name}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* M-Pesa Details */}
                                                                {property.payment_data.payment_method === "mpesa" && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center">
                                                                            <div className="bg-green-50 rounded p-1.5 mr-2">
                                                                                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="text-sm">
                                                                                <span className="text-gray-700 font-medium capitalize">
                                                                                    {property.payment_data.mpesa_method?.replace("_", " ") || "M-Pesa"}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {property.payment_data.mpesa_method === "pay_bill" && (
                                                                            <div className="pl-8 space-y-1">
                                                                                <div className="text-sm">
                                                                                    <span className="text-gray-600">Paybill: </span>
                                                                                    <span className="font-medium text-gray-900">{property.payment_data.mpesa_pay_bill_number}</span>
                                                                                </div>
                                                                                <div className="text-sm">
                                                                                    <span className="text-gray-600">Account: </span>
                                                                                    <span className="font-medium text-gray-900">{property.payment_data.mpesa_account_number}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {property.payment_data.mpesa_method === "buy_goods" && (
                                                                            <div className="pl-8">
                                                                                <div className="text-sm">
                                                                                    <span className="text-gray-600">Till: </span>
                                                                                    <span className="font-medium text-gray-900">{property.payment_data.mpesa_till_number}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {property.payment_data.mpesa_method === "send_money" && (
                                                                            <div className="pl-8 space-y-1">
                                                                                <div className="text-sm">
                                                                                    <span className="text-gray-600">Phone: </span>
                                                                                    <span className="font-medium text-gray-900">{property.payment_data.mpesa_phone_number}</span>
                                                                                </div>
                                                                                <div className="text-sm">
                                                                                    <span className="text-gray-600">Name: </span>
                                                                                    <span className="font-medium text-gray-900">{property.payment_data.mpesa_hakikisha_name}</span>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Rentnasi Paybill */}
                                                                {(!property.payment_data.payment_method || property.payment_data.payment_method === "") && (
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center">
                                                                            
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                Rentnasi Paybill
                                                                            </div>
                                                                        </div>
                                                                        <div className="pl-8 space-y-1">
                                                                            <div className="text-sm">
                                                                                <span className="text-gray-600">Paybill: </span>
                                                                                <span className="font-medium text-gray-900">{property.payment_data.business_number}</span>
                                                                            </div>
                                                                            <div className="text-sm">
                                                                                <span className="text-gray-600">Account: </span>
                                                                                <span className="font-medium text-gray-900">{property.payment_data.account_number}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    No payment method set
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {property.payment_data ? (
                                                                <button
                                                                    onClick={() => handleOpen(property)}
                                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                                >
                                                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleOpen(property)}
                                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                                >
                                                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    Set Payment
                                                                </button>
                                                            )}

                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => toggleDropdown(property.property_id)}
                                                                    className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                                    </svg>
                                                                </button>

                                                                {openDropdownId === property.property_id && (
                                                                    <div className="absolute right-0 z-10 mt-1 w-40 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                        <div className="py-1">
                                                                            <button
                                                                                onClick={() => handleOpen(property)}
                                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                                                            >
                                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                                Edit Payment
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {/* Handle view details */ }}
                                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                                                            >
                                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                </svg>
                                                                                View Details
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {/* Handle generate statement */ }}
                                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center"
                                                                            >
                                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                </svg>
                                                                                Generate PDF
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
                                                        <p className="text-gray-500">Add properties to manage payment details</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
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
            </div>
        </>
    )
}

export default PaymentsDetails
