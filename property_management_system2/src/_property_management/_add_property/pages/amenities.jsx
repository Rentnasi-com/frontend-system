import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const Amenities = () => {
  const navigate = useNavigate();
  const schema = z.object({
    rent_deposit: z.string().nonempty(),
    is_water_inclusive_of_rent: z.string().nonempty(),
    water_billing_type: z.string().optional(),
    water_cumulative_billing_amount: z.string().optional(),
    water_per_unit_billing_amount: z.string().optional(),
    electricity_deposit: z.string().nonempty(),
    garbage_deposit: z.string().nonempty(),
    garbage_charge_amount: z.string().optional(),
    electricity_deposit_amount: z.string().optional(),
    //
  });

  const defaultValues = {
    rent_deposit: "1",
    is_water_inclusive_of_rent: "1",
    electricity_deposit: "1",
    garbage_deposit: "1",
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (values) => {
    try {
      const propertyId = localStorage.getItem("propertyId");

      const token = localStorage.getItem("token");

      if (!propertyId) {
        toast.error("Please enter your property name and location again!");
        navigate("/add-property/general-information");
      }
      if (!token) {
        toast.error("Authorization token not found in localStorage!");
        window.location.href = "https://auth.rentnasi.com";
        return;
      }

      const dataToSend = {
        ...values,
        property_id: propertyId,
      };

      const response = await axios.post(
        "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/amenities",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/add-property/property-type");
        
      } else {
        toast.success(response.data.message);
        navigate("/add-property/amenities");
      }
    } catch (error) {
      toast.success("Error submitting form");
    }
  };

  const is_water_inclusive_of_rent = watch("is_water_inclusive_of_rent");
  const water_billing_type = watch("water_billing_type");
  const garbage_deposit = watch("garbage_deposit");
  const electricity_deposit = watch("electricity_deposit");

  return (
    <>
      <section className="">
        <div className="p-4 flex justify-between mx-4">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Add Property</h1>
            <p className="text-sm text-gray-500">Properties/ Add Property</p>
          </div>
        </div>
        <div className="grid grid-cols-3">
          <div className="bg-white rounded-xl shadow col-span-3 p-4 mx-4 h-full">
            <h3 className="font-bold text-xl text-gray-800">Amenities</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <h6 className="block my-2 text-sm font-medium text-gray-900">
                1. DEPOSIT
              </h6>
              <div className="flex space-x-6">
                <h6 className="ms-2 text-sm font-medium text-gray-900">
                  Do you receive deposit
                </h6>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="1"
                    {...register("rent_deposit")}
                  />
                  Yes
                </label>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="0"
                    {...register("rent_deposit")}
                  />
                  No
                </label>
                {errors.rent_deposit && (
                  <p className="text-xs text-red-500">
                    {errors.rent_deposit.message}
                  </p>
                )}
              </div>
              <h6 className="block my-2 text-sm font-medium text-gray-900">
                2. WATER
              </h6>
              <div className="flex space-x-6">
                <h6 className="ms-2 text-sm font-medium text-gray-900">
                  Is water inclusive of rent
                </h6>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="1"
                    {...register("is_water_inclusive_of_rent")}
                  />
                  Yes
                </label>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="0"
                    {...register("is_water_inclusive_of_rent")}
                  />
                  No
                </label>
                {errors.is_water_inclusive_of_rent && (
                  <p className="text-xs text-red-500">
                    {errors.is_water_inclusive_of_rent.message}
                  </p>
                )}
              </div>
              {is_water_inclusive_of_rent === "0" && (
                <div className="mx-2 space-y-2">
                  <label className="block my-2 text-sm font-medium text-gray-900">
                    Select water billing type
                  </label>

                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5 mb-2"
                    {...register("water_billing_type")}
                  >
                    <option value="">Select your billing type</option>
                    <option value="meter_reading">Meter Reading</option>
                    <option value="cumulative">Cumulative</option>
                  </select>
                  {water_billing_type === "meter_reading" && (
                    <div className="my-2">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Enter amount per unit
                      </label>
                      <input
                        className="bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        type="text"
                        placeholder="Enter amount eg. 500"
                        {...register("water_per_unit_billing_amount")}
                      />
                      {errors.water_per_unit_billing_amount && (
                        <p className="text-xs text-red-500">
                          {errors.water_per_unit_billing_amount.message}
                        </p>
                      )}
                    </div>
                  )}
                  {water_billing_type === "cumulative" && (
                    <div className="my-2">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Enter cumulative amount
                      </label>
                      <input
                        className="bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                        type="text"
                        placeholder="Enter amount eg. 500"
                        {...register("water_cumulative_billing_amount")}
                      />
                      {errors.water_cumulative_billing_amount && (
                        <p className="text-xs text-red-500">
                          {errors.water_cumulative_billing_amount.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <h6 className="block mt-3 mb-2 text-sm font-medium text-gray-900">
                3. POWER
              </h6>
              <div className="flex space-x-6">
                <h6 className="ms-2 text-sm font-medium text-gray-900">
                  Do you change deposit on electricity
                </h6>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="1"
                    {...register("electricity_deposit")}
                  />
                  Yes
                </label>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="0"
                    {...register("electricity_deposit")}
                  />
                  No
                </label>
                {errors.electricity_deposit && (
                  <p className="text-xs text-red-500">
                    {errors.electricity_deposit.message}
                  </p>
                )}
              </div>
              {electricity_deposit === "1" && (
                <div className="mx-2 my-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    How much do you charge
                  </label>
                  <input
                    className="bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    type="text"
                    placeholder="Enter amount eg. 500"
                    {...register("electricity_deposit_amount")}
                  />
                  {errors.electricity_deposit_amount && (
                    <p className="text-xs text-red-500">
                      {errors.electricity_deposit_amount.message}
                    </p>
                  )}
                </div>
              )}
              <h6 className="block mt-3 mb-2 text-sm font-medium text-gray-900">
                4. GARBAGE
              </h6>
              <div className="flex space-x-6">
                <h6 className="ms-2 text-sm font-medium text-gray-900">
                  Is the garbage inclusive of rent
                </h6>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="1"
                    {...register("garbage_deposit")}
                  />
                  Yes
                </label>
                <label>
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value="0"
                    {...register("garbage_deposit")}
                  />
                  No
                </label>
                {errors.garbage_deposit && (
                  <p className="text-xs text-red-500">
                    {errors.garbage_deposit.message}
                  </p>
                )}
              </div>
              {garbage_deposit === "0" && (
                <div className="mx-2 my-2">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    How much do you charge
                  </label>
                  <input
                    className="bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    type="text"
                    placeholder="Enter amount eg. 500"
                    {...register("garbage_charge_amount")}
                  />
                  {errors.garbage_charge_amount && (
                    <p className="text-xs text-red-500">
                      {errors.garbage_charge_amount.message}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-between">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                  {isSubmitting ? (
                    <div className="flex justify-center items-center gap-2">
                      <Loader className="animate-spin" /> Loading ...
                    </div>
                  ) : (
                    <div className="flex justify-center items-center space-x-2">
                       <FaArrowLeft /><p>Prev</p>
                    </div>
                  )}
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
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
      </section>
    </>
  );
};

export default Amenities;
