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

const Unit = () => {
    const [propertyDetails, setPropertyDetails] = useState({})
    const [unitsDetails, setUnitsDetails] = useState({})
    const [tenantsDetails, setTenantsDetails] = useState({})
    const [tenantsNextOfKinDetails, setTenantsNetOfKinDetails] = useState({})
    const [tenantsHistory, setTenantsHistory] = useState([])
    const [tenantsPaymentHistory, setTenantsPaymentHistory] = useState([])

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { unit_id } = useParams();
    const extractedUnitId = unit_id.split(':')[1];
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId");
    const userId = localStorage.getItem("userId");
    const [showModal, setShowModal] = useState(false)
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
                } catch (error) {
                    toast.error(error.data.message);
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
                    toast.error(error.data.message);
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

    const schema = z.object({
        name: z.string().min(4, { message: "Name must be at least 4 characters long" }),
        email: z.string().email({ message: "Invalid email" }).min(4, { message: "Email must be at least 4 characters long" }),
        phone: z.string().min(8, { message: "Phone number must be at least 8 characters long" }),
        projectTitle: z.string().nonempty({ message: "Project title is required" })
    });

    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        console.log("Form Data:", data);
        try {
            const response = await toast.promise(
                axios.post(`${baseUrl}/contact/contact-us/`, data),
                {
                    loading: "Sending your message ...",
                    success: "Message sent",
                    error: "Failed to send message. Please try again later.",
                }
            )
            console.log(response)
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 border rounded m-4">
                <div className="p-2 bg-white rounded border-r">

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

                <div className="col-span-2 bg-white">
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
                        <h4 className="text-md text-gray-600 my-4 px-2">Payment Overview</h4>
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
                    <div className="w-36 mx-4 mt-8">
                        <button onClick={handleOpen}>
                            <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-2 py-2.5">
                                <p>Receive Payment</p>
                                <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                            </div>
                        </button>
                    </div>
                    {showModal && (
                        <div style={{ zIndex: 1000, backgroundColor: 'rgba(55, 65, 81, 0.5)' }} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0">
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
                                            <div className="grid grid-cols-2 gap-x-3">
                                                <SelectField
                                                    label="Select item paid for"
                                                    name="itemPaidFor"
                                                    options={["Item 1", "Item 2", "Item 3"]}
                                                    register={register}
                                                />
                                                <Input
                                                    label="Enter amount"
                                                    name="amount"
                                                    placeholder="Enter amount"
                                                    type="number"
                                                    register={register}
                                                />
                                                <SelectField
                                                    label="Select payment date"
                                                    name="itemPaidFor"
                                                    options={["Item 1", "Item 2", "Item 3"]}
                                                    register={register}
                                                />
                                                <CheckboxField
                                                    label="Is item fully paid"
                                                    name="isFullyPaid"
                                                    register={register}
                                                />

                                                <Input
                                                    label="Enter reference code"
                                                    name="amount"
                                                    placeholder="Enter reference code"
                                                    type="number"
                                                    register={register}
                                                />
                                                <TextArea
                                                    otherStyles="col-span-2"
                                                    label="Enter note (optional)"
                                                    name="note"
                                                    placeholder="Enter your note"
                                                    register={register}
                                                />
                                            </div>

                                            <hr />
                                            <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                                <button type="submit" disabled={isSubmitting} className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90">
                                                    Send Message
                                                </button>
                                                <button onClick={handleClose} type="button" className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100">Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Unit