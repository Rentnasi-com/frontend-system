import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";import { Button } from "../../shared";

const EditPropertyTypes = () => {
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null); 
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");
  const propertyId = localStorage.getItem("propertyId");
  const [searchParams] = useSearchParams();
  const propertyIdUrl = searchParams.get("property_id");

  useEffect(() => {
   
    const fetchPropertyData = async () => {
      try {
        const propertyTypesResponse = await axios.get(`${baseUrl}/get-property-type`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        setPropertyTypes(propertyTypesResponse.data.result);

        if (!propertyIdUrl) {return; }

        const selectedTypeResponse = await axios.get(
          `${baseUrl}/manage-property/edit-property/property-type?property_id=${propertyIdUrl}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        setSelectedType(selectedTypeResponse.data.property_type_id);
      } catch (error) {
        toast.error("Error fetching property data");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [baseUrl, propertyIdUrl, token]);

  const schema = z.object({
    property_type_id: z.string().nonempty("Property type is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      property_type_id: selectedType || "", // Dynamically set the default value
    },
  });

  const onSubmit = async (values) => {
    try {
      const dataToSend = {
        ...values,
        property_id: propertyId,
      };
      const isEdit = Boolean(propertyIdUrl);
      const url = isEdit
        ? `${baseUrl}/manage-property/edit-property/property-type`
        : `${baseUrl}/manage-property/create-property/property-type`;

      const response = await axios.post(url,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.data.status) {
        toast.success(response.data.message);
        if (response.data.data.requires_multiple_floors) {
          navigate(`/edit-property/multi-unit?property_id=${propertyIdUrl}`);
        } else {
          navigate(`/edit-property/single-unit?property_id=${propertyIdUrl}`);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error submitting form";
      toast.error(errorMessage);
    }
  };

  const goToPrevious = () => {
    navigate(`/edit-property/amenities?property_id=${propertyIdUrl}`);
  };

  if (loading) {
    return (
      <section className="p-4 mx-4">
        <div className="flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Edit Property</h1>
            <p className="text-sm text-gray-500">Properties / Edit property</p>
          </div>
        </div>

        <div className="grid grid-cols-3 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 col-span-3 p-4 h-full">
            <h3 className="font-bold text-xl text-gray-800">Property type</h3>
            <div className="gap-4 mt-4">
              <div className="text-gray-500 flex justify-center items-center gap-2 mt-6">
                <Loader className="animate-spin" /> <span>Loading ...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 mx-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Edit Property</h1>
          <p className="text-sm text-gray-500">Properties / Edit property</p>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-4">
        <form className="bg-white rounded-xl border border-gray-200 col-span-3 p-4 h-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="font-bold text-xl text-gray-800">Property type</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {propertyTypes.map((type) => (
              <label key={type.id} className="block cursor-pointer">
                <div className="bg-gray-50 rounded border border-gray-200 p-4 flex space-x-4">
                  <input
                    className="w-4 h-4 mx-1 text-red-600 bg-gray-100 border-gray-300 focus:ring-2"
                    type="radio"
                    value={type.id}
                    {...register("property_type_id")}
                    defaultChecked={type.id === selectedType}
                  />
                  <div className="text-gray-700">
                    <p className="font-semibold">{type.name}</p>
                    <p className="text-xs">{type.description}</p>
                  </div>
                  <img
                    className="h-16 w-16"
                    alt={type.name}
                    src={type.image_url}
                  />
                </div>
              </label>
            ))}
            {errors.property_type_id && (
              <p className="text-xs text-red-500">
                {errors.property_type_id.message}
              </p>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <Button type="button" onClick={goToPrevious} className="space-x-2 mb-2">
              Previous
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="me-2 mb-2">
              {isSubmitting ? (
                <span>Loading...</span>
              ) : (
                <div className="flex justify-center items-center space-x-2">
                  <p>Next</p>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditPropertyTypes;
