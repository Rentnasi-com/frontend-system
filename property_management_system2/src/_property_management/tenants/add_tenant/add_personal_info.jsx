import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import ImageUploading from 'react-images-uploading';
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod"

const Add_Personal_Info = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([]);
  const maxNumber = 1
  const token = localStorage.getItem("token")
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [showAssignUnit, setShowAssignUnit] = useState(false);
  const [tenantId, setTenantId] = useState('');

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  const schema = z.object({
    name: z.coerce.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(10, "Invalid phone number"),
    id_or_passport_number: z.string().min(4, "Invalid ID or passport number"),
    next_of_kin_name: z.coerce.string().min(3, "Kin name must be at least 3 characters long").optional().or(z.literal("")),
    next_of_kin_relationship: z.coerce.string().min(2, "Kin relationship must be at least 2 characters long").optional().or(z.literal("")),
    next_of_kin_phone: z.coerce.string().min(5, "Invalid phone number").optional().or(z.literal("")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },

  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      let document_url = null;
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
          toast.error(conversionResponse.data.message || "Error while uploading your ID or passport!");
          return; // Exit if image upload fails
        }
        document_url = conversionResponse.data.urls;
      }
      const dataToSend = {
        ...values,
        document_url,

      }

      const response = await axios.post(
        `${baseUrl}/manage-tenant/create-tenant/basic-info`, dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          }
        }
      )
      if (response.data.success) {
        setTenantId(response.data.tenant_id)
        const id = response.data.tenant_id
        toast.success(response.data.message)
        navigate(`/tenants/view-tenant-units?tenant_id=${id}`)
        setShowAssignUnit(true)
      } else {
        toast.error(response.data.error.email || response.data.error.passport || response.data.error.phone)
        // console.log("Step 1 error", response.data)
      }
    } catch (error) {
      console.error("Error from catch", error)
      // toast.error(error.response.data.error.email || error.response.data.error.passport || error.response.data.error.phone)
    }
  }

  return (
    <>
      <div className="p-4 flex justify-between mx-4">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Add new tenant</h1>
          <p className="text-sm text-gray-500">Create new tenant and link them to a property unit </p>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
          <h3 className="font-bold text-xl text-gray-800">Tenant details</h3>
          <h3 className="font-bold text-gray-600 mt-2">(a) Personal information</h3>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between space-x-4">
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Full Name
                </label>
                <input
                  aria-label="name"
                  {...register("name", { required: true })}
                  type="text"
                  placeholder="Enter tenant full name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.name && (
                  <div className="text-sm text-red-500">
                    {errors.name.message}
                  </div>
                )}
              </div>
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Email Address
                </label>
                <input
                  aria-label="email"
                  {...register("email", { required: true })}
                  type="text"
                  placeholder="Enter tenant email address"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.email && (
                  <div className="text-sm text-red-500">
                    {errors.email.message}
                  </div>
                )}
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
                  aria-label="phone"
                  {...register("phone", { required: true })}
                  type="text"
                  placeholder="Enter tenant phone number"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.phone && (
                  <div className="text-sm text-red-500">
                    {errors.phone.message}
                  </div>
                )}
              </div>
              <div className="w-full">
                <label

                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  ID/Passport Number
                </label>
                <input
                  aria-label="id_or_passport_number"
                  {...register("id_or_passport_number", { required: true })}
                  type="text"
                  placeholder="Enter tenant ID/passport"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.id_or_passport_number && (
                  <div className="text-sm text-red-500">
                    {errors.id_or_passport_number.message}
                  </div>
                )}
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
                      <div
                        className="relative flex justify-center flex-col items-center bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg p-6 w-full"
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
                  aria-label="next_of_kin_name"
                  {...register("next_of_kin_name")}
                  type="text"
                  placeholder="Enter kin full name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.next_of_kin_name && (
                  <div className="text-sm text-red-500">
                    {errors.next_of_kin_name.message}
                  </div>
                )}
              </div>
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Relationship
                </label>
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  {...register("next_of_kin_relationship")}
                >
                  <option disabled>Select relationship</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="daughter">Daughter</option>
                  <option value="son">Son</option>
                  <option value="spouse">Spouse</option>
                  <option value="relative">Relative</option>
                </select>
                {errors.next_of_kin_relationship && (
                  <div className="text-sm text-red-500">
                    {errors.next_of_kin_relationship.message}
                  </div>
                )}
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
                  aria-label="next_of_kin_phone"
                  {...register("next_of_kin_phone")}
                  type="text"
                  placeholder="Enter phone number"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.next_of_kin_phone && (
                  <div className="text-sm text-red-500">
                    {errors.next_of_kin_phone.message}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row-reverse mt-4">
              {showAssignUnit && (
                <Link
                  to={`/tenants/add-tenant-unit?tenant_id=${tenantId}`}
                  className="ml-3 flex focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded text-sm px-5 py-2.5"
                >
                  Assign Unit
                </Link>
              )}
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
                    <p>Save</p>
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

export default Add_Personal_Info