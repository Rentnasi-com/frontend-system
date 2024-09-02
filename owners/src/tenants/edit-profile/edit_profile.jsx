import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { FaArrowRight } from 'react-icons/fa'
import { z } from 'zod'

const EditProfile = () => {
  const schema = z.object({
    name: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(5, "Invalid phone number"),
    id_or_passport_number: z.string().min(4, "Invalid Id or passport number"),
    next_of_kin_name: z.string().min(3, "Kin name must be at least 3 characters long"),
    next_of_kin_relationship: z.string().min(2, "Kin relationship must be at least 3 characters long"),
    next_of_kin_phone: z.string().min(5, "Invalid phone number")
  })

  const {
    register,
    handleSubmit,
    formState: {
      errors, isSubmitting
    }
  } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (values) => {
    try {
      const response = await axios.post(
        "", values,
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      )
      if (response.result) {
        console.log(response)
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="mx-4 mt-4 grid grid-cols-3 gap-4">
      <div className="bg-white col-span-2 rounded shadow p-2">
        <h4 className="font-semibold text-lg">My Details</h4>
        <hr className="h-px mb-2 bg-gray-200 border-0" />
        <div className="flex justify-center items-center">
          <img

            className="w-32 h-32 rounded-full"
            src="https://www.decorpot.com/images/1276663270drawing-room-design-for-your-modern-home.jpg"
          />

        </div>
        <>
          <form className="mt-7 px-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                  Address
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
            
            <div className="flex justify-between space-x-4">
              <div className="w-full">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  City
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
                  Zip Code
                </label>
                <input
                  aria-label="next_of_kin_relationship"
                  {...register("next_of_kin_relationship")}
                  type="text"
                  placeholder="Select relationship"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
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
                  Country
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
              <div className="w-1/2">
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Password
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
        </>
      </div>
    </div>
  )
}

export default EditProfile