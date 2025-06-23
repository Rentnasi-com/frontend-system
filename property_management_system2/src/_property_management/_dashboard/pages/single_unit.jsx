import { Link, useParams } from "react-router-dom"
import { PropertyCard, QuickLinksCard, TableRow } from "./page_components"
import { useEffect, useState } from "react";
import { CheckboxField, SelectField, Input } from "../../../shared";
import TextArea from "../../../shared/textArea";
import axios from "axios";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DatePicker from "react-datepicker"

const Unit = () => {
    const [propertyDetails, setPropertyDetails] = useState({})
    const [unitsDetails, setUnitsDetails] = useState({})
    const [tenantsDetails, setTenantsDetails] = useState({})
    const [tenantsNextOfKinDetails, setTenantsNetOfKinDetails] = useState({})
    const [tenantsHistory, setTenantsHistory] = useState([])
    const [tenantsPaymentHistory, setTenantsPaymentHistory] = useState([])
    const [payment_details, setPaymentDetails] = useState({})

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { unit_id } = useParams();
    const extractedUnitId = unit_id.split(':')[1];
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");
    const [showModal, setShowModal] = useState(false)
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleClose = () => {
        setShowModal(false)
    }

    const handleOpen = () => {
        setShowModal(true)
    }

    useEffect(() => {
        if (extractedUnitId) {
            const fetchUnitsDetails = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/manage-property/single-unit/details?&unit_id=${extractedUnitId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setPropertyDetails(response.data.property_details || {})
                    setUnitsDetails(response.data.unit_details || {})
                    setTenantsDetails(response.data.tenant_details || {})
                    setTenantsNetOfKinDetails(response.data.tenant_details.next_of_kin || {})
                    setTenantsHistory(response.data.tenancy_history || [])
                    setPaymentDetails(response.data.payment_details)
                } catch (error) {
                    toast.error("Tenant payment details not found");
                }
            }

            const fetchTenantsPaymentHistory = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/manage-property/single-unit/payments?unit_id=${extractedUnitId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setTenantsPaymentHistory(response.data.result || [])
                } catch (error) {
                    toast.error("Tenant payment details not found");
                }
            }

            fetchUnitsDetails()
            fetchTenantsPaymentHistory()
        }
    }, [token, extractedUnitId, baseUrl])

    const quicks = [
        {
            url: "/reports",
            icon: "./../../../../assets/icons/png/reports.png",
            title: "Reports",
            description: "View all your property reports",
            bgColor: "bg-[#BAE5F5]"
        },
        {
            url: "/maintenance",
            icon: "./../../../../assets/icons/png/maintenance.png",
            title: "Maintenance",
            description: "Manage your maintenance request",
            bgColor: "bg-[#CCF0C0]"
        },
        {
            url: "/inquiries",
            icon: "./../../../../assets/icons/png/inquiries-1.png",
            title: "Inquiries",
            description: "View all your tenant inquiries",
            bgColor: "bg-[#E1D3FE]"
        }
    ]

    const stats = [

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/expected_income.png",
            progress: 20,
            label: "Expected Income",
            value: unitsDetails.rent_amount,
        },

        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/outstanding_balance.png",
            progress: 20,
            label: "Outstanding Balance",
            value: "10,000",
        },
        {
            redirectUrl: "/property/revenue-breakdown",
            iconSrc: "../../../assets/icons/png/total_fines.png",
            progress: 20,
            label: "Total fines",
            value: "1,000",
        },
    ];

    const handleCheckboxChange = (payment) => {
        setSelectedPayments((prev) =>
            prev.some((p) => p.description === payment.description)
                ? prev.filter((p) => p.description !== payment.description)
                : [...prev, payment]
        );
    };
    const getTotalAmount = () => {
        return selectedPayments.reduce((total, payment) => {
            return total + (payment.amount || payment.monthly_rent_amount || 0);
        }, 0).toLocaleString(); // Formats number with commas
    };

    const schema = z
        .object({
            payment_method: z.enum(["cash", "mpesa", "mpesa_express", "bank"], {
                errorMap: () => ({ message: "Please select a valid payment method" }),
            }),
            amount: z
                .string()
                .min(1, "Amount is required")
                .refine(
                    (val) => !isNaN(Number(val)) && Number(val) > 0,
                    "Amount must be a valid number greater than 0"
                ),
            phone: z.string().optional(),
            reference: z.string().optional(),
            notes: z.string().optional(),
        })
        .superRefine((values, ctx) => {
            if (values.payment_method === "mpesa_express") {
                if (!values.phone || values.phone.trim() === "") {
                    ctx.addIssue({
                        path: ["phone"],
                        message: "Phone number is required for Mpesa Express",
                    });
                } else {
                    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
                    if (!phoneRegex.test(values.phone.replace(/\s+/g, ''))) {
                        ctx.addIssue({
                            path: ["phone"],
                            message: "Please enter a valid Kenyan phone number",
                        });
                    }
                }
            }
        });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            payment_method: "cash",
            notes: "",
            reference: ""
        },
    });

    const paymentMethod = watch("payment_method");

    const onSubmit = async (data) => {
        if (!tenantsDetails.tenant_id) {
            toast.error("Tenant information is missing");
            return;
        }
        if (!extractedUnitId) {
            toast.error("Please select a unit");
            return;
        }

        if (selectedPayments.length === 0) {
            toast.error("Please select at least one payment item");
            return;
        }

        const isMpesaExpress = data.payment_method === "mpesa_express"

        const submissionData = {
            unit_id: extractedUnitId,
            tenant_id: tenantsDetails.tenant_id,
            description: selectedPayments.map(p => p.description.toLowerCase()),
            amount: Number(data.amount),
            payment_method: data.payment_method,
            reference: ["cash", "mpesa_express"].includes(data.payment_method)
                ? null
                : data.reference || null,
            phone: isMpesaExpress ? data.phone?.trim() : null,
            datetime: selectedDate
                ? selectedDate.toISOString().replace(/\.\d{3}Z$/, '')
                : new Date().toISOString().replace(/\.\d{3}Z$/, ''),
            notes: data.notes || null
        };

        try {
            if (submissionData.payment_method === "mpesa_express") {
                const response = await toast.promise(
                    axios.post(
                        `${baseUrl}/mpesa/init`, submissionData,
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
                    // await handleUnitChange({ target: { value: selectedUnit } });
                }
            } else {
                const response = await toast.promise(
                    axios.post(
                        `${baseUrl}/payment`, submissionData,
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
                    // await handleUnitChange({ target: { value: selectedUnit } });
                }
            }

        } catch (error) {
            toast.error("Failed to send payment. Please try again later.");
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m-4">
                <div className="p-4 bg-white border rounded">

                    <div className="flex items-center space-x-4 mb-4">
                        <img
                            src="https://images.prop24.com/ngby3ayrl5uqiicx3pkjaatr3u/Crop600x400"
                            alt="Apartment"
                            className="w-16 h-16 rounded-md"
                        />
                        <div>
                            <h2 className="font-semibold">{propertyDetails.name}</h2>
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-md">
                                {unitsDetails.availability_status || null}
                            </span>
                        </div>
                    </div>

                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-gray-700 mb-2">Unit details</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>
                                <span className="font-medium">Location:</span> {propertyDetails.location}
                            </li>
                            <li>
                                <span className="font-medium">Property type:</span> {propertyDetails.property_type}
                            </li>
                            <li>
                                <span className="font-medium">Unit number:</span> {unitsDetails.unit_number}
                            </li>
                            <li>
                                <span className="font-medium">Unit type:</span> {unitsDetails.unit_type}
                            </li>
                            <li>
                                <span className="font-medium">Floor number:</span> {unitsDetails.floor_number}
                            </li>
                        </ul>
                    </div>

                    {unitsDetails.availability_status !== 'available' && (
                        <>
                            <div className="border-b pb-4 mb-4">
                                <h3 className="font-bold text-gray-700 mb-2">Tenant details</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>
                                        <span className="font-medium">Name:</span> {tenantsDetails.name}
                                    </li>
                                    <li>
                                        <span className="font-medium">Email:</span> {tenantsDetails.email}
                                    </li>
                                    <li>
                                        <span className="font-medium">Phone number:</span> {tenantsDetails.phone}
                                    </li>
                                    <li>
                                        <span className="font-medium">ID number:</span> {tenantsDetails.id_number}
                                    </li>
                                </ul>
                            </div>

                            <div className="border-b pb-4 mb-4">
                                <h3 className="font-bold text-gray-700 mb-2">Tenant next of kin details</h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>
                                        <span className="font-medium">Name:</span> {tenantsNextOfKinDetails.name}
                                    </li>
                                    <li><span className="font-medium">Relationship:</span> {tenantsNextOfKinDetails.phone}</li>
                                    <li><span className="font-medium">Relationship:</span> {tenantsNextOfKinDetails.relationship}</li>
                                </ul>
                            </div>
                        </>
                    )}


                    {unitsDetails.availability_status !== 'occupied' && (
                        <div className="flex justify-center items-center mb-4 pb-4 border-b">
                            <a href={`https://tm.rentnasi.com/?sessionId=${sessionId}&userId=${userId}`}>
                                <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                    <p>New Tenant</p>
                                    <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                </div>
                            </a>
                        </div>
                    )}


                    <div className="pt-4">
                        <h3 className="font-bold text-gray-700">Tenancy History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100 text-left text-xs">
                                    <tr>
                                        <th className="px-4 py-2">Tenant Name</th>
                                        <th className="px-4 py-2">Phone Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenantsHistory.map((tenant, i) => (
                                        <tr key={i} className="border-b text-sm">
                                            <td className="px-4 py-2">{tenant.tenant_name}</td>
                                            <td className="px-4 py-2">{tenant.tenant_phone_number}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-center pt-2">
                            <Link to={`/property/unit/tenant-history/unit-id=${unitsDetails.unit_id}`} className="mt-4  text-red-600 font-semibold text-xs">View all</Link>

                        </div>
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="bg-white border rounded">
                        <div className="mt-4 w-full px-4">
                            <h3 className="text-red-500 font-semibold text-xs">Quick action</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 ">
                                {quicks.map((quick, index) => (
                                    <QuickLinksCard
                                        key={index}
                                        url={quick.url}
                                        icon={quick.icon}
                                        title={quick.title}
                                        description={quick.description}
                                        bgColor={quick.bgColor}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white mx-4 mt-5">
                            <div className="flex justify-between my-2 px-2">
                                <h4 className="text-md text-gray-600 ">Payment Overview</h4>

                            </div>
                            <div className="w-full">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead className="bg-gray-100 text-left text-xs">
                                            <tr>
                                                <th className="px-4 py-2">Date</th>
                                                <th className="px-4 py-2">Rent</th>
                                                <th className="px-4 py-2">Fines</th>
                                                <th className="px-4 py-2">Balance</th>
                                                <th className="px-4 py-2">Total</th>
                                                <th className="px-4 py-2">Status</th>
                                                <th className="px-4 py-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tenantsPaymentHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center text-sm my-3">No data found.</td>
                                                </tr>
                                            ) : (
                                                tenantsPaymentHistory.map((property, index) => (
                                                    <TableRow
                                                        key={index}
                                                        date={property.date}
                                                        monthly_rent={property.monthly_rent}
                                                        fines={property.fines}
                                                        balance={property.balance}
                                                        total={property.total}
                                                        status={property.status}
                                                        eyeLink={property.eyeLink}
                                                        isShowing={property.isShowing}
                                                    />
                                                ))
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3 mx-4">
                            {Object.values(payment_details)
                                .flatMap(payment => Array.isArray(payment) ? payment : [payment])
                                .filter((payment, index, self) =>
                                    payment.applicable &&
                                    (payment.amount || payment.monthly_rent_amount) &&
                                    self.findIndex(p => p.description === payment.description) === index
                                )
                                .map((payment, index) => (
                                    <label key={index} className="cursor-pointer grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-1 text-sm font-semibold">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={selectedPayments.some(p => p.description === payment.description)}
                                            onChange={() => handleCheckboxChange(payment)}
                                        />
                                        <div>
                                            <h6 className="capitalize">{payment.description}</h6>
                                            <p className="text-lg text-gray-600 capitalize">
                                                {(payment.amount || payment.monthly_rent_amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            <div className="w-36">
                                <button onClick={handleOpen}>
                                    <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                        <p>Receive Payment</p>
                                        <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        {showModal && (
                            <div style={{ zIndex: 1000 }} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 bg-black/50 backdrop-blur-sm">
                                <div className="relative p-4 w-full max-w-lg max-h-full">
                                    <div className="relative bg-white rounded-lg border border-gray-200">

                                        <div className="p-4 md:p-5">
                                            <button type="button" onClick={handleClose} className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                </svg>
                                                <span className="sr-only">Close modal</span>
                                            </button>


                                            <h2 className="text-lg font-semibold">Receive Payment</h2>
                                            <hr />
                                            <p className="text-gray-600 my-4">
                                                You can update payment manually
                                            </p>
                                            <form onSubmit={handleSubmit(onSubmit)}>
                                                <p className="block text-sm font-medium text-gray-500 mb-1">Selected items to be paid</p>
                                                {/* <p>{selectedUnit},{unitTenantDetails.tenant_id}, {selectedPayments.length}</p> */}
                                                <div className="grid grid-cols-3 gap-x-2 mb-3">
                                                    {selectedPayments.length === 0 ? (
                                                        <p className="text-gray-500 text-sm">No items selected.</p>
                                                    ) : (
                                                        selectedPayments.map((payment, index) => (
                                                            <>
                                                                <label key={index} className="flex items-center justify-between bg-white border border-gray-200 hover:bg-gray-100 rounded p-2 text-sm font-semibold">

                                                                    <span className="capitalize">{payment.description} - {(payment.amount || payment.monthly_rent_amount).toLocaleString()}</span>
                                                                    <button
                                                                        className="inline-flex items-center p-1 ml-2 text-sm text-red-400 bg-transparent rounded-sm hover:bg-red-200 hover:text-red-900"
                                                                        onClick={() => handleCheckboxChange(payment)}
                                                                    >
                                                                        <svg className="w-2 h-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                                        </svg>
                                                                    </button>
                                                                </label>
                                                            </>
                                                        ))
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="">
                                                        <p className="block text-sm font-medium text-gray-500 mb-1">Total selected payments</p>
                                                        <p className="bg-white border border-gray-200 hover:bg-gray-100 p-2 rounded text-sm font-semibold">
                                                            KES {getTotalAmount()}
                                                        </p>
                                                    </div>

                                                    <SelectField
                                                        label="Select mode of payment"
                                                        name="payment_method"
                                                        options={[
                                                            { value: "cash", label: "Cash" },
                                                            { value: "mpesa", label: "Mpesa" },
                                                            { value: "mpesa_express", label: "Mpesa Express" },
                                                            { value: "bank", label: "Bank" },
                                                        ]}
                                                        register={register}
                                                        error={errors.payment_method}
                                                    />

                                                    {paymentMethod === "mpesa_express" && (
                                                        <Input
                                                            label="Enter phone number"
                                                            type="tel"
                                                            name="phone"
                                                            register={register}
                                                            error={errors.phone}
                                                            placeholder="Enter phone number"
                                                        />
                                                    )}

                                                    <Input
                                                        label="Enter received amount"
                                                        name="amount"
                                                        placeholder="Enter amount"
                                                        type="number"
                                                        register={register}
                                                        error={errors.amount}
                                                    />

                                                    {["bank", "mpesa"].includes(paymentMethod) && (
                                                        <>
                                                            <Input
                                                                label="Enter reference code (optional)"
                                                                name="reference"
                                                                placeholder="Enter reference code"
                                                                type="text"
                                                                register={register}
                                                                error={errors.reference}
                                                            />

                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-500 " htmlFor="date">Select date received</label>
                                                                <DatePicker
                                                                    selected={selectedDate}
                                                                    onChange={(date) => setSelectedDate(date)}
                                                                    className="mt-2 w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
                                                                    placeholderText="Select a date"
                                                                    name="datetime"
                                                                    dateFormat="dd-MM-yyyy"
                                                                />
                                                            </div>
                                                        </>
                                                    )}

                                                    {paymentMethod === "cash" && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-500" htmlFor="date">Select date received</label>
                                                            <DatePicker
                                                                selected={selectedDate}
                                                                onChange={(date) => setSelectedDate(date)}
                                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
                                                                placeholderText="Select a date"
                                                                name="datetime"
                                                                dateFormat="dd-MM-yyyy"
                                                            />
                                                        </div>
                                                    )}

                                                    <TextArea
                                                        otherStyles="col-span-2"
                                                        label="Enter note (optional)"
                                                        name="notes"
                                                        placeholder="Enter your note"
                                                        register={register}
                                                        error={errors.notes}
                                                        type="text"
                                                    />
                                                </div>

                                                <hr />
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
                                                        className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">
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
                </div>
            </div>
        </>
    )
}

export default Unit