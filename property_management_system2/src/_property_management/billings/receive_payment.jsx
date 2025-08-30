import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input, SelectField } from "../../shared"
import TextArea from "../../shared/textArea"
import DatePicker from "react-datepicker"
import { DashboardHeader } from "../properties/dashboard/page_components"


const ReceivePayment = () => {
    const [properties, setProperties] = useState([])
    const [selectedProperty, setSelectedProperty] = useState('')
    const [selectedFloor, setSelectedFloor] = useState('')
    const [propertyFloors, setPropertyFloors] = useState([])
    const [selectedUnit, setSelectedUnit] = useState('')
    const [propertyUnits, setPropertyUnits] = useState([])
    const [selectedDate, setSelectedDate] = useState(null);

    const [unitDetails, setUnitDetails] = useState([])
    const [unitTenantDetails, setTenantDetails] = useState([])
    const [propertyDetails, setPropertyDetails] = useState([])
    const [payment_details, setPaymentDetails] = useState([])
    const [selectedPayments, setSelectedPayments] = useState([]);

    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token')
    const [showModal, setShowModal] = useState(false)

    const [isProcessing, setIsProcessing] = useState(false);

    const handleClose = () => {
        reset();
        setSelectedDate(null);
        setShowModal(false)
    }

    const handleOpen = () => {
        setShowModal(true)
    }
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
            // money_to_landlord: z.string().optional(),
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


    useEffect(() => {
        fetchProperties()
    }, [token, baseUrl])

    const fetchProperties = async () => {
        try {
            const propertyResponse = await axios.get(
                `${baseUrl}/payment/data/properties`,
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

    const handlePropertyChange = async (event) => {
        const propertyId = event.target.value
        setSelectedProperty(propertyId)

        setSelectedFloor(null);
        setSelectedUnit(null);
        setPropertyUnits([]);
        setPropertyFloors([]);

        try {
            const floorsResponse = await axios.get(
                `${baseUrl}/payment/data/floors?property_id=${propertyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            if (floorsResponse.data.has_floors) {
                setPropertyFloors(floorsResponse.data.result)
            } else {
                const unitsResponse = await axios.get(
                    `${baseUrl}/payment/data/units?property_id=${propertyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setPropertyUnits(unitsResponse.data.result);
            }

        } catch (error) {
            toast.error("You have no units in the property selected")
            setPropertyFloors([]);
            setPropertyUnits([]);
        }
    }

    const handleFloorChange = async (event) => {
        const floorId = event.target.value
        setSelectedFloor(floorId)

        try {
            const unitsResponse = await axios.get(`${baseUrl}/payment/data/units?floor_id=${floorId}&property_id=${selectedProperty}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            )
            setPropertyUnits(unitsResponse.data.result)
        } catch (error) {
            toast.error("You have no units in the floor selected")
        }

    }

    const handleUnitChange = async (event) => {
        const unitId = event.target.value
        setSelectedUnit(unitId)
        setSelectedPayments([])
        try {
            const unitDetailsResponse = await axios.get(`${baseUrl}/payment/data/unit?unit_id=${unitId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            setUnitDetails(unitDetailsResponse.data.unit_details)
            setTenantDetails(unitDetailsResponse.data.tenant_details)
            setPropertyDetails(unitDetailsResponse.data.property_details)
            setPaymentDetails(unitDetailsResponse.data.payment_details)

        } catch (error) {
            toast.error("No unit details found")
        }
    }

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            payment_method: "cash",
            reference: ""
        },
    });

    const paymentMethod = watch("payment_method");

    const onSubmit = async (data) => {
        console.log(data)

        if (!unitTenantDetails.tenant_id) {
            toast.error("Tenant information is missing");
            return;
        }
        if (!selectedUnit) {
            toast.error("Please select a unit");
            return;
        }

        if (selectedPayments.length === 0) {
            toast.error("Please select at least one payment item");
            return;
        }

        const isMpesaExpress = data.payment_method === "mpesa_express"

        const submissionData = {
            unit_id: selectedUnit,
            tenant_id: unitTenantDetails.tenant_id,
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
            notes: data.notes?.trim() === "" ? null : data.notes?.trim()
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
                    reset();
                    setSelectedDate(null);
                    setSelectedPayments([]);
                    setShowModal(false);
                    setIsProcessing(false);
                    toast.success("M-Pesa payment processed successfully!");
                    await handleUnitChange({ target: { value: selectedUnit } });
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
                    reset();
                    setSelectedDate(null);
                    setSelectedPayments([]);
                    setShowModal(false);
                    setIsProcessing(false);
                    toast.success("Payment processed successfully!");
                    await handleUnitChange({ target: { value: selectedUnit } });
                }
            }
        } catch (error) {
            setSelectedDate(null);
            setSelectedPayments([]);
            setShowModal(false);
            reset();
            setIsProcessing(false);
            toast.error("Payment failed. Please try again later.");
            await handleUnitChange({ target: { value: selectedUnit } });
        }
    };


    return (
        <>
            <DashboardHeader
                title="Receive Tenant Payment"
                description="Receive new payment and link them to a property unit"
                name="New property"
                link="/add-property/general-information"
                hideSelect={false}
                hideLink={true}
            />
            {
                isProcessing && (
                    <div style={{ zIndex: 1000 }} className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center">
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

            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">

                    <h3 className="font-bold text-lg text-gray-800">Tenant Payment</h3>
                    <h3 className="font-bold text-gray-600 mt-2">Select property and unit</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between space-x-4">
                            <div className="w-full ">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Select property
                                </label>
                                <select
                                    value={selectedProperty}
                                    onChange={handlePropertyChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                                    <option defaultValue>Select property</option>
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
                                    Select property floors
                                    {propertyFloors.length === 0 && (
                                        <span className="text-yellow-500 text-xs"> (The selected property has no floors)</span>
                                    )}
                                </label>
                                <select
                                    value={selectedFloor}
                                    onChange={handleFloorChange}
                                    disabled={propertyFloors.length === 0}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5">
                                    <option defaultValue>Select property floor</option>
                                    {
                                        propertyFloors.map((floor) => (
                                            <option key={floor.floor_id} value={floor.floor_id}>{floor.floor_number}</option>
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5">
                                    <option defaultValue>Select property unit</option>
                                    {
                                        propertyUnits.map((unit) => (
                                            <option key={unit.id} value={unit.id}>{unit.unit_number}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                    </div>
                    <h3 className="font-bold text-gray-600 mt-2">Tenant Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3">
                        <div className="flex justify-center items-center">
                            <img
                                className="h-40 object-cover rounded border border-gray-200"
                                src="data:image/jpeg;base64,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"
                                alt=""
                            />
                        </div>
                        <div className="col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="col-span-4">
                                <h6 className="text-sm">Property Details</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 text-sm font-semibold">
                                    <div>
                                        <h6>Name: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{propertyDetails.name}</p>
                                    </div>
                                    <div>
                                        <h6>Location: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{propertyDetails.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <h6 className="text-sm">Tenant Details</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 text-sm font-semibold">
                                    <div>
                                        <h6>Name: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitTenantDetails.name}</p>
                                    </div>
                                    <div>
                                        <h6>Phone: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitTenantDetails.phone}</p>
                                    </div>
                                    <div className="mt-2">
                                        <h6>Email: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitTenantDetails.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <h6 className="text-sm">Tenant Next of Kin Details</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 text-sm font-semibold">
                                    <div>
                                        <h6>Name: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitTenantDetails.next_of_kin?.name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h6>Phone: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitTenantDetails.next_of_kin?.phone || "N/A"}</p>
                                    </div>
                                    <div className="mt-2">
                                        <h6>Relationship: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitTenantDetails.next_of_kin?.relationship || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <h6 className="text-sm">Unit Details</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 text-sm font-semibold">
                                    <div>
                                        <h6>Unit Type: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitDetails?.unit_number || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h6>Unit Type: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitDetails?.unit_type || "N/A"}</p>
                                    </div>
                                    <div className="mt-2">
                                        <h6>Floor Number: </h6>
                                        <p className="text-sm text-gray-600 capitalize">{unitDetails?.floor_number || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-600 mt-2">Select Payments Descriptions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 py-3">
                        {Object?.values(payment_details)
                            .flatMap(payment => Array.isArray(payment) ? payment : [payment])
                            .filter((payment, index, self) =>
                                payment.applicable &&
                                (payment.amount || payment.monthly_rent_amount) &&
                                self.findIndex(p => p.description === payment.description) === index
                            )
                            .map((payment, index) => (
                                <label key={index} className="cursor-pointer grid grid-cols-1 md:grid-cols-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 text-sm font-semibold">
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

                        <button
                            onClick={handleOpen}
                            className="capitalize focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-md p-2.5">
                            Receive Payment
                        </button>
                    </div>

                </div>
            </div>
            {showModal && (
                <div style={{ zIndex: 300 }} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 bg-black/50 backdrop-blur-sm">
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
                                                            className="inline-flex items-center p-1 ml-2 text-sm text-yellow-400 bg-transparent rounded-sm hover:bg-yellow-200 hover:text-yellow-900"
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

                                        {/* <div className="flex space-x-6">
                                            <h6 className="text-sm font-medium text-gray-900">Did you received payment</h6>
                                            <label>
                                                <input
                                                    {...register("payment_method")}
                                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                                    type="radio"
                                                    value="true"
                                                />
                                                Yes
                                            </label>
                                            <label>
                                                <input
                                                    {...register("payment_method")}
                                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                                    type="radio"
                                                    value="false"
                                                />
                                                NO
                                            </label>
                                        </div> */}

                                        {errors.payment_method && (
                                            <p className="text-xs text-red-500">
                                                {errors.payment_method.message}
                                            </p>
                                        )}

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
                                                        className="mt-2 w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
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
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
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
        </>
    )
}



export default ReceivePayment