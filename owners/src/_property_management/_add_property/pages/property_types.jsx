import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { z } from "zod";


const Property_types = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://pm.api.rentnasi.com/api/v1/get-property-type", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setPropertyType(response.data.result);
      } catch (error) {
        console.error("Error fetching property types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyTypes();
  }, []);

  const schema = z.object({
    property_type_id: z.string().nonempty("Property type is required"),
  });

  const defaultValues = {
    property_type_id: "1",
  };

  const {
    register,
    handleSubmit,
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
        return;
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
        "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/property-type",
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
        console.log("Property Type:", response)
        if (response.data.result.requires_multiple_floors) {
          navigate("/add-property/multi-unit");
        } else {
          navigate("/add-property/single-unit");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.result?.message || "Error submitting form";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    <div className="text-gray-500 flex justify-center items-center gap-2">
      <Loader className="animate-spin" /> Loading ...
    </div>
  }

  return (
    <section className="">
      <div className="p-4 flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Add Property</h1>
          <p className="text-sm text-gray-500">Properties / Add property</p>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <form
          className="bg-white rounded-xl shadow col-span-3 p-4 mx-4 h-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="font-bold text-xl text-gray-800">Property type</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {propertyType &&
              propertyType.map((type) => (
                <label key={type.id} className="block cursor-pointer">
                  <div className="bg-gray-50 rounded shadow p-4 flex space-x-4">
                    <input
                      className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                      type="radio"
                      value={type.id}
                      {...register("property_type_id")}
                    />
                    <div className="text-gray-700">
                      <p className="font-semibold">{type.name}</p>
                      <p className="text-xs">{type.description}</p>
                    </div>
                    <img className="h-16 w-16" alt={type.name} src={type.image_url} />
                  </div>
                </label>
              ))}
            {errors.property_type_id && (
              <p className="text-xs text-red-500">
                {errors.property_type_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-row-reverse mt-4">
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
    </section>
  );
};

export default Property_types;
