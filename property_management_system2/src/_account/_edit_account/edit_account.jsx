import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"
import ImageUploading from 'react-images-uploading';
import { useState } from "react";

const EditAccount = () => {
    const [images, setImages] = useState([]);
    const maxNumber = 4

    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };
    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Edit account</h1>
                    <p className="text-sm text-gray-500">Edit your account to your preference </p>
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                    <h3 className="font-bold text-xl text-gray-800">Landlord details</h3>
                    <h3 className="font-bold text-gray-600 mt-2">(a) Personal information</h3>

                    <form className="space-y-4">
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter landlord full name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter landlord email address"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter landlord phone number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    ID/Passport Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter landlord ID/passport"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="h-full w-full">
                                <h3 className="block my-2 text-sm font-medium text-gray-900">Upload tenant ID/passpost photo</h3>
                                <ImageUploading
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
                                            <button
                                                className="relative bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg p-6 w-full"
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
                                            </button>
                                            {imageList.length > 0 && (
                                                <div className="">
                                                    <div className="mt-2 border-2 border-gray-300 border-dashed rounded-lg p-6">
                                                        <div className="flex justify-center items-center">
                                                            {imageList.map((image, index) => (
                                                                <div key={index} className="image-item">
                                                                    <img
                                                                        className="h-96 w-auto rounded shadow"
                                                                        src={image.data_url}
                                                                        alt={`Uploaded ${index}`}
                                                                        width="100"
                                                                    />
                                                                    <div className="image-item__btn-wrapper flex justify-between">
                                                                        <button onClick={() => onImageUpdate(index)}>
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
                                                                        <button onClick={() => onImageRemove(index)}>
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
                                </ImageUploading>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-600 mt-2">(b) Next of Kin details</h3>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter kin full name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    placeholder="Select relationship"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between space-x-4">

                            <div className="w-1/2">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Phone number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter phone number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-600 mt-2">(c) Payment details</h3>
                        <div className="flex space-x-6">
                            <h6 className="text-sm font-medium text-gray-900">What is your preferred method of payment</h6>
                            <label>
                                <input
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="1"
                                />
                                Mpesa
                            </label>
                            <label>
                                <input
                                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                                    type="radio"
                                    value="0"
                                />
                                Bank
                            </label>

                        </div>
                        <div className="w-full">
                            <label
                                htmlFor="property-name"
                                className="block my-2 text-sm font-medium text-gray-900"
                            >
                                Select mode for late payment fine
                            </label>
                            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5">
                                <option selected>Select model for late payment</option>
                                <option value="US">Phone number</option>
                                <option value="CA">Buy goods</option>
                                <option value="FR">Paybil</option>
                            </select>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Account name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g Penda Agency"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Paybill number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter paybill number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Account number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Select account number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Account name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g Penda Agency"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Till number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter till number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Account name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g John Doe"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Phone number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter phone number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Account name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g Penda Agency"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Account number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter account number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
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
                                    type="text"
                                    placeholder="Enter bank name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Bank branch
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter bank branch"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="property-name"
                                    className="block my-2 text-sm font-medium text-gray-900"
                                >
                                    Bank code
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter bank code"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                        <div className="flex flex-row-reverse mt-4">
                            <Link to="/tenants/add-tenant-unit "
                                className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                            >
                                <div className="flex justify-center items-center space-x-2">
                                    <p>Next</p> <FaArrowRight />
                                </div>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditAccount