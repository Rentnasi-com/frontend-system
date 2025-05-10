import toast from "react-hot-toast"
import { SettingsBreadcrumbs } from "../../../shared"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Loader } from "lucide-react"
import { FaArrowRight } from "react-icons/fa"

const PaymentsDetails = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const baseUrl = import.meta.env.VITE_BASE_URL
    const schema = z.object({
        payment_method: z.enum(["mpesa", "bank"]).optional(),
        preferred_method: z.enum(["yes", "no"]).optional(),

        mpesa_method: z.enum(["send_money", "pay_bill", "buy_goods"]).optional(), // Changed to match your UI values
        mpesa_phone_number: z.string().min(5, "Invalid mpesa phone number").optional(),
        mpesa_hakikisha_name: z.string().min(2, "Invalid mpesa hakikisha name").optional(),
        mpesa_pay_bill_number: z.string().min(3, "Invalid mpesa pay bill number").optional(),
        mpesa_account_number: z.string().min(2, "Invalid mpesa account number").optional(),
        mpesa_till_number: z.string().min(3, "Invalid mpesa till number").optional(),

        bank_account_number: z.string().min(5, "Invalid bank account number").optional(),
        bank_account_name: z.string().min(5, "Invalid bank account name").optional(),
        bank_name: z.string().min(5, "Invalid bank name").optional(),
        bank_branch: z.string().min(5, "Invalid bank branch").optional(),
        bank_code: z.string().min(5, "Invalid bank code").optional(),
    }).refine((data) => {
        if (data.payment_method === "mpesa") {
            if (!data.mpesa_method) {
                throw new Error("Please select an Mpesa payment method");
            }

            switch (data.mpesa_method) {
                case "send_money":
                    if (!data.mpesa_phone_number || !data.mpesa_hakikisha_name) {
                        throw new Error("Phone number and Hakikisha name are required for send money");
                    }
                    break;
                case "pay_bill":
                    if (!data.mpesa_pay_bill_number || !data.mpesa_account_number) {
                        throw new Error("Paybill number and account number are required");
                    }
                    break;
                case "buy_goods":
                    if (!data.mpesa_till_number) {
                        throw new Error("Till number is required for buy goods");
                    }
                    break;
            }
        } else if (data.payment_method === "bank") {
            if (!data.bank_account_number || !data.bank_account_name ||
                !data.bank_name || !data.bank_branch || !data.bank_code) {
                throw new Error("All bank details are required");
            }
        }

        return true;
    }, {
        message: "Please complete all required fields",
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
    const preferred_method = watch("preferred_method")

    const onSubmit = async (values) => {
        try {
            const dataToSend = {
                ...values,
            }

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
    return (
        <>
            <SettingsBreadcrumbs />
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Payments Details</h1>
                    <p className="text-sm text-gray-500">Add payments details to your preference </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex space-x-6">
                            <h6 className="text-sm font-medium text-gray-900">Do you prefer Rentalpay as your primary payment method</h6>
                            <label>
                                <input
                                    {...register("preferred_method")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="yes"
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    {...register("preferred_method")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="no"
                                />
                                No
                            </label>
                        </div>
                        {errors.preferred_method && (
                            <p className="text-xs text-red-500">
                                {errors.preferred_method.message}
                            </p>
                        )}
                        {preferred_method === "no" && (
                            <>
                                <div className="flex space-x-6">
                                    <h6 className="text-sm font-medium text-gray-900">What is your preferred method of payment</h6>
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
                                                className="block my-2 text-sm font-medium text-gray-900"
                                            >
                                                Select mode for late payment fine
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
                    </form>
                </div>
            </div>
        </>
    )
}

export default PaymentsDetails
