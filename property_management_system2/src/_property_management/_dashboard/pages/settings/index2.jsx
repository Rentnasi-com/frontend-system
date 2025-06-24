import React from 'react'

const index2 = () => {
    return (
        <div>
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
                            <h6 className="text-sm font-medium text-gray-900">1. Do you prefer Rentalpay as your primary payment method</h6>
                            <label>
                                <input
                                    {...register("rent_received_by_rentnasi")}
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="true"
                                />
                                True
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
                        {errors.rent_received_by_rentnasi && (
                            <p className="text-xs text-red-500">
                                {errors.rent_received_by_rentnasi.message}
                            </p>
                        )}
                        {rent_received_by_rentnasi === "true" && (
                            <>
                                <h4 className="text-sm font-medium text-gray-900 my-4">2. All your properties list</h4>
                                <div className="rounded-lg border border-gray-200 bg-white mt-5">

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
                                                            <th className="px-4 py-2">Account Number</th>
                                                            <th className="px-4 py-2">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {properties.map((property, index) => (
                                                            <tr key={index} className="border-b text-sm">
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
                                                                <td className="px-4 py-2">
                                                                    <input
                                                                        type="text"
                                                                        className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full px-1.5 py-3"

                                                                        placeholder="Account number"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-2 space-x-4">
                                                                    <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5">
                                                                        Save
                                                                    </button>
                                                                    <button className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5">
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {rent_received_by_rentnasi === "false" && (
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
                    </form>
                </div>
            </div>
        </div>
    )
}

export default index2
