import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import ReactImageUploading from "react-images-uploading";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const AddPersonalInfo = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    const [images, setImages] = useState([]);
    const baseUrl = import.meta.env.VITE_BASE_URL
    const maxNumber = 1
    const [showPassword, setShowPassword] = useState(false);

    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

    const schema = z.object({
        // Required personal information only
        firstname: z.string().min(3, "First name must be at least 3 characters long"),
        lastname: z.string().min(3, "Last name must be at least 3 characters long"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(10, "Phone number must be at least 10 characters."),
        password: z.string().min(4, "Password must be at least 4 characters."),

        // Optional next of kin information
        emergency_contact_name: z.string().trim().optional().refine((val) => !val || val.length >= 3, { message: "Kin name must be at least 3 characters long" }),
        emergency_contact_phone: z.string().trim().optional().refine((val) => !val || val.length >= 10, { message: "Invalid phone number" }),
        emergency_contact_relationship: z.string().trim().optional().refine((val) => !val || val.length >= 2, { message: "Kin relationship must be at least 2 characters long" }),

        // Optional employment information
        role: z.string().trim().optional().refine((val) => !val || val.length >= 2, { message: "Role must be at least 2 characters long", }),
        department: z.string().trim().optional().refine((val) => !val || val.length >= 2, {
            message: "Department must be at least 2 characters long",
        }),

        salary: z
            .union([z.number(), z.string().regex(/^\d+(\.\d+)?$/)]) // allows numeric or numeric string
            .optional().refine((val) => !val || Number(val) >= 0, { message: "Salary must be a positive number", }),

        hire_date: z.string().trim().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: "Hire date must be a valid date", }),
        is_manager: z.number().default(0),
        preferences: z.string().trim().optional().refine((val) => !val || val.length >= 3, { message: "Preferences must be at least 3 characters long", }),
        active: z.number().default(1)
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            is_manager: 0,
            active: 1
        }
    })

    // Watch the current values for the radio buttons
    const isManagerValue = watch("is_manager");
    const activeValue = watch("active");

    const onSubmit = async (values) => {
        try {
            let image = null;
            if (images.length > 0 && images[0].data_url) {
                const base64Image = images[0].data_url;
                const conversionResponse = await axios.post(
                    "https://files.rentalpay.africa/upload/create",
                    { image: base64Image },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!conversionResponse.data.success) {
                    toast.error("Error while uploading your ID or passport!" || conversionResponse.data.message);
                    return; // Exit if image upload fails
                }
                image = conversionResponse.data.urls;
            }
            const dataToSend = {
                ...values,
                image,
            }

            const response = await axios.post(
                `${baseUrl}/manage-org/users`, dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            )

            if (response.data.success) {
                const staff_id = response.data.id
                toast.success(response.data.message)
                navigate(`/staffs/add-properties-and-assign-permissions?staff_id=${staff_id}`)
            } else {
                toast.error("Error sending data")

            }
        } catch (error) {
            toast.error("Error sending data")
            console.error("error", error)
        }
    }

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, error]) => {
                toast.error(`${field}: ${error.message}`);
            });
        }
    }, [errors]);

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Add new staff</h1>
                    <p className="text-sm text-gray-500">Create new staff and link them to a property unit </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Staff details</h3>
                    <h3 className="font-bold text-gray-600 mt-2">(a) Personal information <span className="text-red-500">*</span></h3>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="firstname"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="firstname"
                                    aria-label="firstname"
                                    {...register("firstname", { required: true })}
                                    type="text"
                                    placeholder="Enter staff first name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.firstname && (
                                    <div className="text-sm text-red-500">
                                        {errors.firstname.message}
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="lastname"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="lastname"
                                    aria-label="lastname"
                                    {...register("lastname", { required: true })}
                                    type="text"
                                    placeholder="Enter staff last name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.lastname && (
                                    <div className="text-sm text-red-500">
                                        {errors.lastname.message}
                                    </div>
                                )}
                            </div>

                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="email"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    aria-label="email"
                                    {...register("email", { required: true })}
                                    type="email"
                                    placeholder="Enter staff email address"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.email && (
                                    <div className="text-sm text-red-500">
                                        {errors.email.message}
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="phone"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="phone"
                                    aria-label="phone"
                                    {...register("phone", { required: true })}
                                    type="tel"
                                    placeholder="Enter staff phone number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.phone && (
                                    <div className="text-sm text-red-500">
                                        {errors.phone.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full relative">
                                <label
                                    htmlFor="password"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    aria-label="password"
                                    {...register("password", { required: "Password is required" })}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter staff password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5 pr-12"
                                />

                                {/* Icon toggle */}
                                <button
                                    type="button"
                                    className="absolute top-[60%] right-3 flex items-center text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>

                                {errors.password && (
                                    <div className="text-sm text-red-500 mt-1">
                                        {errors.password.message}
                                    </div>
                                )}
                            </div>

                            <div className="w-full">{/* Second column if needed */}</div>
                        </div>

                        <div className="flex justify-between">
                            <div className="h-full w-full">
                                <h3 className="block my-2 text-sm font-medium text-gray-900">Upload staff photo</h3>
                                <ReactImageUploading
                                    value={images}
                                    onChange={onChange}
                                    maxNumber={maxNumber}
                                    dataURLKey="data_url"
                                >
                                    {({
                                        imageList,
                                        onImageUpload,
                                        onImageUpdate,
                                        onImageRemove,
                                        isDragging,
                                        dragProps,
                                    }) => (
                                        <div className="upload__image-wrapper mt-4">
                                            <div
                                                className="relative flex justify-center flex-col items-center bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg p-6 w-full cursor-pointer"
                                                style={isDragging ? { color: "red" } : undefined}
                                                onClick={onImageUpload}
                                                {...dragProps}
                                            >
                                                <img
                                                    className="mx-auto h-12 w-12"
                                                    src="https://www.svgrepo.com/show/357902/image-upload.svg"
                                                    height={48}
                                                    width={48}
                                                    alt="Upload Icon"
                                                />
                                                <label className="relative cursor-pointer">
                                                    <span>Drag and drop</span>
                                                    <span className="text-indigo-600"> or browse</span>
                                                    <span> to upload</span>
                                                </label>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                            </div>
                                            {imageList.length > 0 && (
                                                <div className="">
                                                    <div className="mt-2 border-2 border-gray-300 border-dashed rounded-lg p-6">
                                                        <div className="flex justify-center items-center">
                                                            {imageList.map((image, index) => (
                                                                <div key={index} className="image-item">
                                                                    <img
                                                                        className="h-64 w-auto rounded shadow"
                                                                        src={image['data_url']}
                                                                        alt={`Uploaded ${index}`}
                                                                        width="100"
                                                                    />
                                                                    <div className="image-item__btn-wrapper flex justify-between mt-2">
                                                                        <button type="button" onClick={() => onImageUpdate(index)}>
                                                                            <svg
                                                                                className="w-6 h-6 text-gray-800 hover:text-red-600"
                                                                                aria-hidden="true"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="24"
                                                                                height="24"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-5.294a.53.53 0 0 1 .53-.53h1.471a.53.53 0 0 1 .53.53V19.882C20.53 21.643 18.955 23 17 23H5c-1.955 0-3.53-1.357-3.53-3.118V8.294C1.47 6.533 3.045 5 5 5h6.32a.53.53 0 0 1 .53.53v.616a.53.53 0 0 1-.53.53Z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                        <button type="button" onClick={() => onImageRemove(index)}>
                                                                            <svg
                                                                                className="w-6 h-6 text-gray-800 hover:text-red-600"
                                                                                aria-hidden="true"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                width="24"
                                                                                height="24"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M19.436 5.742c-.363 0-.66-.3-.66-.67a.664.664 0 0 0-.66-.669H5.883a.664.664 0 0 0-.66.67c0 .37-.296.669-.66.669H3v1.338h1.563l1.065 12.624c.077.911.821 1.616 1.738 1.616h9.368c.917 0 1.661-.705 1.738-1.616l1.065-12.624H21V5.742h-1.564ZM9.893 18.051h-1.32V9.422h1.32v8.629Zm3.961 0h-1.32V9.422h1.32v8.629Zm2.641 0h-1.319V9.422h1.32v8.629Z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ReactImageUploading>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-600">(b) Employment Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Role */}
                            <div className="w-full">
                                <label
                                    htmlFor="role"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Role
                                </label>
                                <input
                                    id="role"
                                    aria-label="role"
                                    {...register("role")}
                                    type="text"
                                    placeholder="Enter employee role"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.role && (
                                    <div className="text-sm text-red-500">{errors.role.message}</div>
                                )}
                            </div>

                            {/* Department */}
                            <div className="w-full">
                                <label
                                    htmlFor="department"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Department
                                </label>
                                <input
                                    id="department"
                                    aria-label="department"
                                    {...register("department")}
                                    type="text"
                                    placeholder="Enter department"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.department && (
                                    <div className="text-sm text-red-500">{errors.department.message}</div>
                                )}
                            </div>

                            {/* Salary */}
                            <div className="w-full">
                                <label
                                    htmlFor="salary"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Salary
                                </label>
                                <input
                                    id="salary"
                                    aria-label="salary"
                                    {...register("salary")}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Enter salary"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.salary && (
                                    <div className="text-sm text-red-500">{errors.salary.message}</div>
                                )}
                            </div>

                            {/* Hire Date */}
                            <div className="w-full">
                                <label
                                    htmlFor="hire_date"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Hire Date
                                </label>
                                <input
                                    id="hire_date"
                                    aria-label="hire_date"
                                    {...register("hire_date")}
                                    type="date"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.hire_date && (
                                    <div className="text-sm text-red-500">{errors.hire_date.message}</div>
                                )}
                            </div>

                            {/* Is Manager */}
                            <div className="w-full">
                                <label className="block my-2 text-sm font-medium text-gray-900">
                                    Is the staff a manager?
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={isManagerValue === 1}
                                            onChange={() => setValue("is_manager", 1)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="0"
                                            checked={isManagerValue === 0}
                                            onChange={() => setValue("is_manager", 0)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">No</span>
                                    </label>
                                </div>
                                {errors.is_manager && (
                                    <div className="text-sm text-red-500">{errors.is_manager.message}</div>
                                )}
                            </div>

                            {/* Active */}
                            <div className="w-full">
                                <label className="block my-2 text-sm font-medium text-gray-900">
                                    Is the staff active?
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={activeValue === 1}
                                            onChange={() => setValue("active", 1)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="0"
                                            checked={activeValue === 0}
                                            onChange={() => setValue("active", 0)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">No</span>
                                    </label>
                                </div>
                                {errors.active && (
                                    <div className="text-sm text-red-500">{errors.active.message}</div>
                                )}
                            </div>

                            {/* Preferences */}
                            <div className="w-full col-span-2">
                                <label
                                    htmlFor="preferences"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Preferences
                                </label>
                                <textarea
                                    id="preferences"
                                    aria-label="preferences"
                                    {...register("preferences")}
                                    placeholder="Enter preferences"
                                    rows="3"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.preferences && (
                                    <div className="text-sm text-red-500">{errors.preferences.message}</div>
                                )}
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-600">(c) Next of Kin Information</h3>

                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="emergency_contact_name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Kin Name
                                </label>
                                <input
                                    id="emergency_contact_name"
                                    aria-label="emergency_contact_name"
                                    {...register("emergency_contact_name")}
                                    type="text"
                                    placeholder="Enter next of kin name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.emergency_contact_name && (
                                    <div className="text-sm text-red-500">
                                        {errors.emergency_contact_name.message}
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="emergency_contact_phone"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Kin Phone Number
                                </label>
                                <input
                                    id="emergency_contact_phone"
                                    aria-label="emergency_contact_phone"
                                    {...register("emergency_contact_phone")}
                                    type="tel"
                                    placeholder="Enter next of kin phone number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.emergency_contact_phone && (
                                    <div className="text-sm text-red-500">
                                        {errors.emergency_contact_phone.message}
                                    </div>
                                )}
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="emergency_contact_relationship"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Kin Relationship
                                </label>
                                <input
                                    id="emergency_contact_relationship"
                                    aria-label="emergency_contact_relationship"
                                    {...register("emergency_contact_relationship")}
                                    type="text"
                                    placeholder="Enter next of kin relationship"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                                {errors.emergency_contact_relationship && (
                                    <div className="text-sm text-red-500">
                                        {errors.emergency_contact_relationship.message}
                                    </div>
                                )}
                            </div>
                        </div>

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
                                        <p>Next</p> <FaArrowRight />
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

export default AddPersonalInfo