import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { SelectField, Input, Button } from "../../../shared";
import TextArea from "../../../shared/textArea";
import axios from "axios";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MdApartment, MdEmail } from "react-icons/md";
import DatePicker from "react-datepicker"
import { House, HousePlusIcon, LocateIcon, Pencil, Phone, PhoneCallIcon, Save, User, User2, X, } from "lucide-react";
import { DashboardHeader, QuickLinksCard } from "./page_components";
import { useAuth } from "../../../AuthContext";

const Unit = () => {
    const [propertyDetails, setPropertyDetails] = useState({})
    const [unitsDetails, setUnitsDetails] = useState({})
    const [tenantsDetails, setTenantsDetails] = useState({})
    const [tenantsNextOfKinDetails, setTenantsNetOfKinDetails] = useState({})
    const [tenantsHistory, setTenantsHistory] = useState([])
    const [tenantsPaymentHistory, setTenantsPaymentHistory] = useState([])
    const [payment_details, setPaymentDetails] = useState({})
    const [waterBills, setWaterBills] = useState([])

    const [billItems, setBillItems] = useState([])
    const [addBillItems, setAddBillItems] = useState([])

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const { unit_id } = useParams();
    const extractedUnitId = unit_id.split(':')[1];
    const token = localStorage.getItem("token");
    const [showModal, setShowModal] = useState(false)
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [tenantId, setTenantId] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const [showWaterBillModal, setShowWaterBillModal] = useState(false)
    const [showAddBillModal, setShowAddBillModal] = useState(false);

    const [electricityBills, setElectricityBills] = useState([]);
    const [showElectricityBillModal, setShowElectricityBillModal] = useState(false)

    const [showBillItemDeleteModal, setShowBillItemDeleteModal] = useState(false);
    const [billItemToDelete, setBillItemToDelete] = useState(null);

    const [editItemId, setEditItemId] = useState(null);
    const [editedAmount, setEditedAmount] = useState("");

    const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
    const [itemToVacate, setItemToVacate] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);

    const { hasPermission } = useAuth();

    const handleClose = () => {
        setShowModal(false)
    }

    const handleOpen = () => {
        setShowModal(true)
    }

    const quicks = [
        {
            url: "/reports",
            icon: "./../../../../assets/icons/png/reports.png",
            title: "Reports",
            description: "View all your property reports",
            bgColor: "bg-[#BAE5F5]"
        },

        {
            url: "/inquiries",
            icon: "./../../../../assets/icons/png/inquiries-1.png",
            title: "Inquiries & Maintenance",
            description: "View all your tenant inquiries",
            bgColor: "bg-[#E1D3FE]"
        }
    ]

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
        }, 0); // Formats number with commas
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

    const createWaterBillSchema = (previousReading) =>
        z.object({
            meter_reading: z
                .string()
                .min(1, "Current meter reading is required")
                .refine(val => {
                    const current = Number(val);
                    return !isNaN(current) && current >= previousReading;
                }, {
                    message: `Current meter reading must be ≥ ${previousReading}`,
                }),

            unit_price: z
                .string()
                .optional()
                .refine(
                    val => !val || (!isNaN(Number(val)) && Number(val) >= 0),
                    { message: "Water charge must be a valid number" }
                ),
        });


    const previousReading = Number(waterBills[0]?.meter_reading || 0);

    const {
        register: registerWater,
        handleSubmit: handleWaterSubmit,
        watch: watchWater,
        formState: { errors: waterErrors },
    } = useForm({
        resolver: zodResolver(createWaterBillSchema(previousReading)),
        mode: "onChange",
    });

    const currentReading = watchWater("meter_reading");

    const {
        register,
        handleSubmit,
        reset,
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
    const fetchUnitsDetails = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-property/single-unit/details?&unit_id=${extractedUnitId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const tenantDetails = response.data.tenant_details || {};
            setPropertyDetails(response.data.property_details || {})
            setUnitsDetails(response.data.unit_details || {})
            setTenantsDetails(tenantDetails)
            setTenantId(tenantDetails.tenant_id);
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
            console.error("Tenant payment details not found");
        }
    }

    const fetchWaterBill = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-tenant/water-billing?unit_id=${extractedUnitId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setWaterBills(response.data.results || [])

        } catch (error) {
            console.error("Tenant payment details not found");
        }
    }
    const fetchElectricityBill = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-tenant/electricity-billing?unit_id=${extractedUnitId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setElectricityBills(response.data.results || [])
            console.log(response.data.results)

        } catch (error) {
            console.error("Tenant payment details not found");
        }
    }

    const fetchBillItems = async () => {
        try {
            const response = await axios.get(`${baseUrl}/manage-tenant/bills?tenant_id=${tenantId}&unit_id=${extractedUnitId}&active`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setBillItems(response.data.result || [])
            setAddBillItems(response.data.bill_types || [])
        } catch (error) {
            console.error("Tenant payment details not found");
        }
    }

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
            setIsProcessing(true);

            if (submissionData.payment_method === "mpesa_express") {
                const response = await axios.post(
                    `${baseUrl}/mpesa/init`,
                    submissionData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200) {
                    setShowModal(false);
                    fetchUnitsDetails();
                    fetchBillItems()
                    setSelectedPayments([]);
                    reset();
                    setIsProcessing(false);
                    toast.success("M-Pesa payment processed successfully!");
                    fetchTenantsPaymentHistory()
                }
            } else {
                const response = await axios.post(
                    `${baseUrl}/payment`,
                    submissionData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200) {
                    setShowModal(false);
                    fetchUnitsDetails();
                    fetchBillItems()
                    setSelectedPayments([]);
                    reset();
                    setIsProcessing(false);
                    toast.success("Payment processed successfully!");
                    fetchTenantsPaymentHistory()
                }
            }
        } catch (error) {
            toast.error("Failed to send payment. Please try again later.");
            setSelectedPayments([]);
            reset();
            setShowModal(false);
            setIsProcessing(false);
            fetchUnitsDetails();
            fetchBillItems()
            fetchTenantsPaymentHistory()
        }

    };

    const onWaterBillSubmit = async (data) => {
        try {
            const payload = {
                meter_reading: Number(data.meter_reading),
                unit_price: data.unit_price ? Number(data.unit_price) : null,
                tenant_id: tenantsDetails.tenant_id,
                unit_id: extractedUnitId,
            };

            const response = await toast.promise(
                axios.post(`${baseUrl}/manage-tenant/water-billing`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                {
                    loading: "Submitting meter reading...",
                    success: "Meter reading submitted successfully",
                    error: "Failed to submit meter reading",
                }
            );

            if (response.status === 200) {
                setShowWaterBillModal(false);
                fetchWaterBill()
            }
        } catch (error) {
            console.error("Water bill submit error:", error);
            toast.error("Something went wrong while submitting water bill.");
        }
    };

    useEffect(() => {
        fetchUnitsDetails()
        fetchTenantsPaymentHistory()
        fetchWaterBill()
        fetchElectricityBill()
        if (tenantId) {
            fetchBillItems();
        }
    }, [token, extractedUnitId, baseUrl, tenantId])

    const toggleDropdown = (id) => {
        setOpenDropdownId(prev => (prev === id ? null : id));
    };

    const openWaterBillModal = () => {
        setShowWaterBillModal(true);
    };
    const openElectricityBillModal = () => {
        setShowElectricityBillModal(true);
    };

    const openAddBillModal = () => {
        setShowAddBillModal(true);
    }

    const billSchema = z.object({
        bill_type: z.string().min(1, "Bill type is required"),
        amount: z
            .string()
            .min(1, "Amount is required")
            .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
                message: "Amount must be a valid number ≥ 0",
            }),
    });


    const {
        register: registerBill,
        handleSubmit: handleBillSubmit,
        formState: { errors: billErrors },
    } = useForm({
        resolver: zodResolver(billSchema),
        mode: "onTouched",
    });


    const onBillSubmit = async (data) => {
        try {
            const payload = {
                unit_id: extractedUnitId,
                tenant_id: tenantsDetails.tenant_id,
                bill_type: data.bill_type,
                amount: Number(data.amount),
            };

            const response = await toast.promise(
                axios.post(`${baseUrl}/manage-tenant/bills`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                {
                    loading: "Submitting bill...",
                    success: "Bill submitted successfully",
                    error: "Failed to submit bill",
                }
            );

            if (response.status === 200) {
                setShowAddBillModal(false);
                fetchBillItems();
            }
        } catch (error) {
            console.error("Bill submit error:", error);
            toast.error("Something went wrong while submitting bill.");
        }
    };

    const handleBillItemDelete = async () => {
        toast.promise(
            axios.delete(`${baseUrl}/manage-tenant/bills`, {
                data: billItemToDelete,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(() => {
                    setShowBillItemDeleteModal(false);
                    fetchBillItems();
                })
                .catch((error) => {
                    console.error("Error deleting bill item:", error);
                    throw error; // rethrow to trigger toast error
                }),
            {
                loading: 'Deleting bill item...',
                success: 'Bill item deleted successfully.',
                error: 'Failed to delete bill item.',
            }
        );
    };

    const handleBillItemPatch = async (billItem) => {
        const payload = {
            unit_id: extractedUnitId,
            tenant_id: tenantId,
            bill_item_id: billItem.bill_item_id,
            bill_type: billItem.bill_type,
            amount: Number(editedAmount),
        };

        toast.promise(
            axios.patch(`${baseUrl}/manage-tenant/bills`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            }),
            {
                loading: "Updating bill item...",
                success: () => {
                    fetchBillItems(); // refresh data
                    setEditItemId(null);
                    setOpenDropdownId(false)
                    return "Bill item updated successfully.";
                },
                error: "Failed to update bill item.",
            }
        );
    };

    const handleVacate = async (tenantId, unitId) => {
        try {
            await axios.post(`${baseUrl}/manage-tenant/vacate-tenant`, {
                tenant_id: tenantId,
                unit_id: unitId
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success("Tenant vacated successfully!");
            setIsVacateModalOpen(false)
        } catch (error) {
            console.error("Vacate error:", error);
            toast.error("Failed to vacate tenant.");
        }
    };

    const handleVacateModalOpen = (item) => {
        setItemToVacate(item);
        setIsVacateModalOpen(true);
    };

    const onElectricityBillSubmit = async (data) => {
        try {
            const payload = {
                meter_reading: Number(data.meter_reading),
                unit_price: data.unit_price ? Number(data.unit_price) : null,
                tenant_id: tenantsDetails.tenant_id,
                unit_id: extractedUnitId,
            };

            const response = await toast.promise(
                axios.post(`${baseUrl}/manage-tenant/electricity-billing`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                {
                    loading: "Submitting meter reading...",
                    success: "Meter reading submitted successfully",
                    error: "Failed to submit meter reading",
                }
            );

            if (response.status === 200) {
                setShowElectricityBillModal(false);
                fetchElectricityBill()
            }
        } catch (error) {
            setShowElectricityBillModal(false);
            fetchElectricityBill()
            toast.error("Something went wrong while submitting electricity bill.");
        }
    };

    const createElectricityBillSchema = (previousElectricityReading) =>
        z.object({
            meter_reading: z
                .string()
                .min(1, "Current meter reading is required")
                .refine(val => {
                    const current = Number(val);
                    return !isNaN(current) && current >= previousElectricityReading;
                }, {
                    message: `Current meter reading must be ≥ ${previousElectricityReading}`,
                }),

            unit_price: z
                .string()
                .optional()
                .refine(
                    val => !val || (!isNaN(Number(val)) && Number(val) >= 0),
                    { message: "Electricity charge must be a valid number" }
                ),
        });


    const previousElectricityReading = Number(electricityBills[0]?.meter_reading || 0);

    const {
        register: registerElectricity,
        handleSubmit: handleElectricitySubmit,
        watch: watchElectricity,
        formState: { errors: electricityErrors },
    } = useForm({
        resolver: zodResolver(createElectricityBillSchema(previousElectricityReading)),
        mode: "onChange",
    });

    const currentElectricityReading = watchElectricity("meter_reading");

    return (
        <>
            <DashboardHeader
                title="Unit details"
                description="View unit information and associated tenants."
                link="/tenants/add-personal-details"
                name="Add tenant"
                hideSelect={false}
                hideLink={false}
            />

            {
                isProcessing && (
                    <div style={{ zIndex: 1100 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-lg max-w-md">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                <p className="text-lg font-semibold">Processing payment...</p>
                                <p className="text-sm text-gray-600">Please wait while we complete your transaction</p>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Tenant Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-4">
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-gray-200 rounded mb-8 p-3 ">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 mb-3">Unit Details</h3>
                            <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                    ${unitsDetails.availability_status === "Vacant"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {unitsDetails.availability_status}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <House className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="text-gray-900 text-xs">{unitsDetails.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <LocateIcon className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="text-gray-900 text-xs">{unitsDetails.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MdApartment className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Property Type</p>
                                <p className="text-gray-900 text-xs">{propertyDetails.property_type}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <HousePlusIcon className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">Unit Type</p>
                                <p className="text-gray-900 text-xs">{unitsDetails.unit_type}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-6">Tenant Details</h3>
                        <div className="flex items-center space-x-3">
                            <User2 className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-gray-900 text-xs">{tenantsDetails.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <PhoneCallIcon className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-gray-900 text-xs">{tenantsDetails.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MdEmail className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-gray-900 text-xs">{tenantsDetails.email}</p>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-6">Next of Kin Details</h3>
                        {tenantsDetails.next_of_kin?.name == "" ? (
                            <p className="italic text-xs text-red-600">None</p>
                        ) : (
                            <>
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-gray-900 text-xs">{tenantsDetails.next_of_kin?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-gray-900 text-xs">{tenantsDetails.next_of_kin?.phone}</p>
                                    </div>
                                </div>
                            </>
                        )
                        }
                    </div>
                </div>
                <div>
                    <div className="space-y-3 bg-white border border-gray-200 rounded mb-2 p-3">
                        <h3 className="text-red-500 font-semibold text-xs">Quick action</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ">
                            {quicks.map((quick, index) => (
                                <QuickLinksCard
                                    key={index}
                                    url={quick.url}
                                    icon={quick.icon}
                                    title={quick.title}
                                    // description={quick.description}
                                    bgColor={quick.bgColor}
                                />
                            ))}

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 ">
                            {hasPermission("tenants", "edit") &&
                                <Link
                                    to={`/tenants/edit-personal-details?tenant_id=${tenantId}`}
                                    className="rounded w-full px-4 py-2 text-xs text-center text-white bg-green-700 hover:bg-green-800"
                                >
                                    Edit Profile
                                </Link>
                            }

                            {hasPermission("tenants", "edit") &&
                                <Link
                                    to={`/tenants/edit-tenant-unit?tenant_id=${tenantId}&unit_id=${unitsDetails.unit_id}`}
                                    className="rounded text-white w-full px-4 py-2 text-xs text-center bg-purple-700 hover:bg-purple-800 whitespace-nowrap"
                                >
                                    Edit Unit
                                </Link>
                            }

                            {hasPermission("tenants", "delete") &&
                                <button
                                    onClick={() =>
                                        handleVacateModalOpen({
                                            id: tenantId,
                                            unit_id: unitsDetails.unit_id,
                                            name: unitsDetails.unit_number
                                        })
                                    }
                                    className="rounded w-full px-4 py-2 text-xs text-center text-white bg-yellow-700 hover:bg-yellow-800"
                                >
                                    Vacate tenant
                                </button>
                            }
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded mb-2">
                        <h4 className="text-red-500 font-semibold text-xs p-2">Pay Now</h4>

                        <table className="min-w-full divide-y divide-gray-200 text-sm mt-2">
                            <thead className="bg-gray-100 text-left text-xs">
                                <tr>
                                    <th className="px-4 py-2 text-left">Select</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {Object.values(payment_details)
                                    .flatMap(payment => Array.isArray(payment) ? payment : [payment])
                                    .filter((payment, index, self) =>
                                        payment.applicable &&
                                        (payment.amount || payment.monthly_rent_amount) &&
                                        self.findIndex(p => p.description === payment.description) === index
                                    )
                                    .map((payment, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4"
                                                    checked={selectedPayments.some(p => p.description === payment.description)}
                                                    onChange={() => handleCheckboxChange(payment)}
                                                />
                                            </td>
                                            <td className="px-4 py-2 capitalize">{payment.description}</td>
                                            <td className="px-4 py-2 font-semibold text-gray-800 font-mono">
                                                {(payment.amount || payment.monthly_rent_amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        <div className="w-36 m-2">
                            {hasPermission("payments", "add") &&
                                <button onClick={handleOpen}>
                                    <div className="flex space-x-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-xl text-xs px-2 py-1">
                                        <p>Receive Payment</p>
                                        <img width={15} height={15} src="../../../assets/icons/png/plus.png" alt="" />
                                    </div>
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
            {/* Active Bills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-4 mt-5 ">
                <div className="col-span-3 rounded-lg border border-gray-200 bg-white">
                    <div className="flex justify-between my-2 px-2">
                        <h4 className="text-md text-gray-600 ">Active Bills</h4>
                        <div className="space-x-2">
                            <Link to={`/property/payment-history?unit_id=${extractedUnitId}`} className="text-xs bg-green-700 text-white py-1.5 px-2 rounded">View all</Link>

                            {hasPermission("payments", "add") &&
                                <button onClick={openAddBillModal} className="text-xs bg-red-700 text-white py-1.5 px-2 rounded">Add bill item</button>
                            }
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-100 text-left text-xs">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Tenant</th>
                                        <th className="px-4 py-2">Amounts</th>
                                        <th className="px-4 py-2">Bill Items</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-sm my-3">No data found.</td>
                                        </tr>
                                    ) : (
                                        billItems.map((item, index) => (
                                            <tr key={index} className="border-b text-xs odd:bg-gray-50">
                                                <td className="px-4 py-2">{item.date}</td>
                                                <td className="px-4 py-2">{(item.tenant_name)}</td>
                                                <td className="px-4 py-2 text-sm text-gray-700 space-y-1 font-mono">
                                                    <div>Arrears - {Number(item.arrears).toLocaleString()}</div>
                                                    <div>Rent - {Number(item.rent).toLocaleString()}</div>
                                                    <div>Paid - {Number(item.paid).toLocaleString()}</div>
                                                    <div>Fines - {Number(item.fines).toLocaleString()}</div>
                                                    <div className="font-semibold text-blue-800">
                                                        Total - {Number(item.total_balance).toLocaleString()}
                                                    </div>
                                                </td>

                                                {item.bill_items.length > 0 ? (
                                                    <td className="px-4 py-2 ">
                                                        <table className="w-full text-xs border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="px-2 py-1 text-left">Type</th>
                                                                    <th className="px-2 py-1 text-left">Expected</th>
                                                                    <th className="px-2 py-1 text-left">Paid</th>
                                                                    <th className="px-2 py-1 text-left">Balance</th>
                                                                    <th className="px-2 py-1 text-left">Status</th>
                                                                    <th className="px-2 py-1 text-left">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.bill_items.map((billItem, index) => (
                                                                    <tr key={index} className="border-t border-gray-200 odd:bg-gray-50">
                                                                        <td className="px-2 py-1 capitalize">{billItem.bill_type}</td>
                                                                        <td className="px-2 py-1 font-mono">
                                                                            {editItemId === billItem.bill_item_id ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={editedAmount}
                                                                                    onChange={(e) => setEditedAmount(e.target.value)}
                                                                                    className="border px-1 py-0.5 rounded w-24 text-xs"
                                                                                />
                                                                            ) : (
                                                                                (billItem.amount_expected).toLocaleString()
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-1 font-mono">{(billItem.amount_paid).toLocaleString()}</td>
                                                                        <td className="px-2 py-1 font-mono">{(billItem.amount_due).toLocaleString()}</td>
                                                                        <td className="px-2 py-1">
                                                                            <span
                                                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                                ${billItem.status === "Unpaid"
                                                                                        ? "bg-red-100 text-red-800"
                                                                                        : billItem.status === "Partial"
                                                                                            ? "bg-blue-100 text-blue-800"
                                                                                            : "bg-green-100 text-green-800"
                                                                                    }`}
                                                                            >
                                                                                {billItem.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="relative px-2 py-1 text-xs">
                                                                            <button
                                                                                onClick={() => toggleDropdown(billItem.bill_item_id)}
                                                                                className="inline-flex justify-center w-full px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none"
                                                                            >
                                                                                Actions
                                                                                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                                        clipRule="evenodd"
                                                                                    />
                                                                                </svg>
                                                                            </button>

                                                                            {openDropdownId === billItem.bill_item_id && (
                                                                                <div className="absolute right-0 z-50 w-36 mt-1 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                                                    <div className="py-1">
                                                                                        {hasPermission("payments", "edit") && (
                                                                                            editItemId === billItem.bill_item_id ? (
                                                                                                <>
                                                                                                    <button
                                                                                                        onClick={() => handleBillItemPatch(billItem)}
                                                                                                        className="flex items-center w-full px-3 py-1 text-xs text-green-600 hover:bg-green-100"
                                                                                                    >
                                                                                                        <Save className="w-4 h-4 mr-1" /> Save
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => setEditItemId(null)}
                                                                                                        className="flex items-center w-full px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                                                                                    >
                                                                                                        <X className="w-4 h-4 mr-1" /> Cancel
                                                                                                    </button>
                                                                                                </>
                                                                                            ) : (
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        setEditItemId(billItem.bill_item_id);
                                                                                                        setEditedAmount(billItem.amount_expected);
                                                                                                    }}
                                                                                                    className="flex items-center w-full px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                                                                                                >
                                                                                                    <Pencil className="w-4 h-4 mr-1" /> Edit
                                                                                                </button>
                                                                                            )
                                                                                        )}

                                                                                        {hasPermission("payments", "delete") &&
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setBillItemToDelete({
                                                                                                        unit_id: extractedUnitId,
                                                                                                        tenant_id: tenantId,
                                                                                                        bill_item_id: billItem.bill_item_id
                                                                                                    });
                                                                                                    setShowBillItemDeleteModal(true);
                                                                                                }}
                                                                                                className="block w-full px-3 py-1 text-xs text-left text-red-600 hover:bg-red-100"
                                                                                            >
                                                                                                Delete
                                                                                            </button>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>

                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                ) : (
                                                    <td className="px-4 py-2">No data found.</td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-4 mt-5">
                <div className="col-span-2 rounded-lg border border-gray-200 bg-white">
                    <div className="flex justify-between my-2 px-2">
                        <h4 className="text-md text-gray-600 ">Bill Overview</h4>

                    </div>
                    <div className="w-full overflow-auto">
                        <div className="">
                            <table className="min-w-full ">
                                <thead className="bg-gray-100 text-left text-xs">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Arrears</th>
                                        <th className="px-4 py-2">Expected </th>
                                        <th className="px-4 py-2">Paid</th>
                                        <th className="px-4 py-2">Balance</th>

                                        <th className="px-4 py-2">Fines</th>


                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenantsPaymentHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center text-sm my-3">No data found.</td>
                                        </tr>
                                    ) : (
                                        tenantsPaymentHistory.map((paymentHistory, index) => (
                                            <tr key={index} className="border-b text-xs odd:bg-gray-50 ">
                                                <td className="px-4 py-2">{paymentHistory.date}</td>
                                                <td className="px-4 py-2">{paymentHistory.tenant_name}</td>
                                                <td className="px-4 py-2 font-mono">{(paymentHistory.arrears).toLocaleString()}</td>
                                                <td className="px-4 py-2 font-mono">{(paymentHistory.rent).toLocaleString()}</td>
                                                <td className="px-4 py-2 font-mono">{(paymentHistory.paid).toLocaleString()}</td>

                                                <td className="px-4 py-2 font-mono">{(paymentHistory.total_balance).toLocaleString()}</td>
                                                <td className="px-4 py-2 font-mono">{(paymentHistory.fines).toLocaleString()}</td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${paymentHistory.status === "Unpaid"
                                                                ? "bg-red-100 text-red-800"
                                                                : paymentHistory.status === "Partial"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-green-100 text-green-800"
                                                            }`}
                                                    >
                                                        {paymentHistory.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="flex justify-between my-2 px-2">
                            <h4 className="text-md text-gray-600 ">Tenant History</h4>
                            <Link to={`/property/unit/tenant-history/unit-id=${unitsDetails.unit_id}`} className="text-red-600 font-semibold text-xs">View all</Link>
                        </div>
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
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mx-4 mt-5">
                {waterBills.length === 0 ? (
                    <></>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="flex justify-between my-2 px-2">
                            <h4 className="text-md text-gray-600 ">Water Meter History</h4>
                            <button onClick={openWaterBillModal} className="text-xs bg-red-700 text-white py-.5 px-2 rounded-xl">Record water bill</button>
                        </div>
                        <div className="w-full">
                            <div className="">
                                <table className="min-w-full overflow-auto">
                                    <thead className="bg-gray-100 text-left text-xs">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Tenant</th>
                                            <th className="px-4 py-2">Previous Reading</th>
                                            <th className="px-4 py-2">Units Consumed</th>
                                            <th className="px-4 py-2">Bill</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waterBills.map((item, index) => (
                                            <tr key={index} className="border-b text-xs">
                                                <td className="px-4 py-2">
                                                    {new Date(item.date_recorded).toLocaleString('en-US', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="px-4 py-2">{(item.tenant_name)}</td>
                                                <td className="px-4 py-2">{(item.meter_reading)}</td>
                                                <td className="px-4 py-2">{(item.meter_units)}</td>
                                                <td className="px-4 py-2">{(item.amount_due).toLocaleString()}</td>

                                                <td className="relative px-4 py-2 text-sm">
                                                    <button
                                                        onClick={() => toggleDropdown(index)}
                                                        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                    >
                                                        Actions
                                                        <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {openDropdownId === index && (
                                                        <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1">
                                                                <Link
                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    View Tenant
                                                                </Link>
                                                                <button

                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Vacate Tenant
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
                    </div>
                )}

                {electricityBills.length === 0 ? (
                    <></>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white">
                        <div className="flex justify-between my-2 px-2">
                            <h4 className="text-md text-gray-600 ">Electricity Meter History</h4>
                            <button onClick={openElectricityBillModal} className="text-xs bg-red-700 text-white py-.5 px-2 rounded-xl">Record electricity bill</button>
                        </div>
                        <div className="w-full">
                            <div className="">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-100 text-left text-xs">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Tenant</th>
                                            <th className="px-4 py-2">Previous Reading</th>
                                            <th className="px-4 py-2">Units Consumed</th>
                                            <th className="px-4 py-2">Bill</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {electricityBills.map((item, index) => (
                                            <tr key={index} className="border-b text-xs">
                                                <td className="px-4 py-2">
                                                    {new Date(item.date_recorded).toLocaleString('en-US', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="px-4 py-2">{(item.tenant_name)}</td>
                                                <td className="px-4 py-2">{(item.meter_reading)}</td>
                                                <td className="px-4 py-2">{(item.meter_units)}</td>
                                                <td className="px-4 py-2">{(item.amount_due).toLocaleString()}</td>

                                                <td className="relative px-4 py-2 text-sm">
                                                    <button
                                                        onClick={() => toggleDropdown(index)}
                                                        className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                    >
                                                        Actions
                                                        <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {openDropdownId === index && (
                                                        <div className="absolute right-0 z-50 w-40 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1">
                                                                <Link
                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    View Tenant
                                                                </Link>
                                                                <button

                                                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Vacate Tenant
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
                    </div>
                )}
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

                                                        <span className="capitalize">{payment.description} - {(payment.amount || payment.monthly_rent_amount)}</span>
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

            {showWaterBillModal && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">

                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Water Meter Reading
                        </h2>
                        {waterBills.length > 0 && (
                            <div>
                                <p className="py-2 text-sm text-gray-600">
                                    Previous Reading: <span className="font-medium">{waterBills[0].meter_reading}</span>
                                </p>
                            </div>
                        )}
                        <form onSubmit={handleWaterSubmit(onWaterBillSubmit)}>
                            <Input
                                label="Enter current meter reading"
                                name="meter_reading"
                                placeholder="Enter reading"
                                type="string"
                                register={registerWater}
                                error={waterErrors.meter_reading}
                            />
                            <p className="py-2"></p>

                            <Input
                                label="Enter water charge per unit (optional)"
                                name="unit_price"
                                placeholder="Enter charge"
                                type="string"
                                register={registerWater}
                                error={waterErrors.unit_price}
                            />

                            <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                <button
                                    type="submit"
                                    className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowWaterBillModal(false)}
                                    className="text-white bg-red-700 hover:bg-red-700 p-2.5 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                    </div>
                </div >
            )}

            {showElectricityBillModal && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">

                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Electricity Meter Reading
                        </h2>
                        {electricityBills.length > 0 && (
                            <div>
                                <p className="py-2 text-sm text-gray-600">
                                    Previous Reading: <span className="font-medium">{electricityBills[0].meter_reading}</span>
                                </p>
                            </div>
                        )}
                        <form onSubmit={handleElectricitySubmit(onElectricityBillSubmit)}>
                            <Input
                                label="Enter current meter reading"
                                name="meter_reading"
                                placeholder="Enter reading"
                                type="string"
                                register={registerElectricity}
                                error={electricityErrors.meter_reading}
                            />
                            <p className="py-2"></p>

                            <Input
                                label="Enter electricity charge per unit (optional)"
                                name="unit_price"
                                placeholder="Enter charge"
                                type="string"
                                register={registerElectricity}
                                error={electricityErrors.unit_price}
                            />

                            <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                <button
                                    type="submit"
                                    className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowElectricityBillModal(false)}
                                    className="text-white bg-red-700 hover:bg-red-700 p-2.5 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                    </div>
                </div >
            )}

            {showAddBillModal && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">

                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Add Bill Item
                        </h2>
                        <form onSubmit={handleBillSubmit(onBillSubmit)}>
                            {addBillItems.length > 0 && (
                                <>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Select a bill item
                                    </label>
                                    <select
                                        {...registerBill("bill_type")}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    >
                                        <option value="">Select a bill type</option>
                                        {addBillItems.map((item) => (
                                            <option key={item} value={item}>
                                                {item
                                                    .split("_")
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(" ")}
                                            </option>
                                        ))}
                                    </select>
                                    {billErrors.bill_type && (
                                        <p className="text-red-500 text-sm mt-1">{billErrors.bill_type.message}</p>
                                    )}
                                </>
                            )}
                            <p className="py-2"></p>
                            <Input
                                label="Enter amount"
                                name="amount"
                                placeholder="Enter charge"
                                type="text"
                                register={registerBill}
                                error={billErrors.amount}
                            />
                            <div className="flex items-center mt-6 space-x-4 rtl:space-x-reverse">
                                <button
                                    type="submit"
                                    className="w-full rounded border border-green-700 bg-green-700 p-2.5 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddBillModal(false)}
                                    className="text-white bg-red-700 hover:bg-red-700 p-2.5 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

            {showBillItemDeleteModal && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Deletion
                        </h2>
                        <h2 className="text-gray-600 mt-2 text-center">Are you sure you want to delete this bill item?</h2>
                        <div className="mt-4 flex justify-center gap-2">
                            <button
                                onClick={() => setShowBillItemDeleteModal(false)}
                                className="px-3 py-2 text-xs rounded bg-gray-100 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBillItemDelete}
                                className="px-3 py-2 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isVacateModalOpen && (
                <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-1/3">
                        <h2 className="text-xl text-center font-semibold text-gray-800">
                            Confirm Vacation
                        </h2>
                        <p className="text-gray-600 mt-2 text-center">
                            Are you sure you want to vacate {tenantsDetails.name} from{" "}
                            <span className="font-bold">{itemToVacate?.name}</span> permanently? This action
                            cannot be undone.
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setIsVacateModalOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() =>
                                    handleVacate(itemToVacate?.id, itemToVacate?.unit_id)
                                }
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Vacate
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </>
    )
}

export default Unit