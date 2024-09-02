import { useForm } from "react-hook-form";
import { Loader } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const libraries = ['places']

const GeneralInformation = () => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const selectedPlaceFromAutocomplete = autocomplete.getPlace();
      setSelectedPlace({
        lat: selectedPlaceFromAutocomplete.geometry.location.lat(),
        lng: selectedPlaceFromAutocomplete.geometry.location.lng(),
      });
    }
  };

  const schema = z.object({
    property_name: z
      .string()
      .min(4, { message: "Must be 4 or more characters long" }),
    location_name: z
      .string()
      .min(4, { message: "Must be 4 or more characters long" }),
  });


  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      let dataToSend = { ...values };

      if (selectedPlace) {
        dataToSend = {
          ...dataToSend,
          latitude: selectedPlace.lat,
          longitude: selectedPlace.lng,
        };
      }
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/general-information",
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
        const propertyId = response.data.result.id;
        localStorage.setItem('propertyId', propertyId);
        navigate('/add-property/amenities');
      } else {
        setError("root", {
          message: response.data.message,
        });
      }
    } catch (error) {
      setError("root", {
        message: error.response?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <>
      <section>
        <div className="p-4 flex justify-between mx-4">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Add Property</h1>
            <p className="text-sm text-gray-500">
              Properties / Add Property /{" "}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
            <h3 className="font-bold text-xl text-gray-800">
              General Information
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="property-name"
                  className="block my-2 text-sm font-medium text-gray-900"
                >
                  Property name
                </label>
                <input
                  aria-label="property_name"
                  {...register("property_name")}
                  type="text"
                  placeholder="Enter property name eg. Serenity"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                />
                {errors.property_name && (
                  <div className="text-sm text-red-500">
                    {errors.property_name.message}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Property location
                </label>
                {isLoaded ? (
                  <Autocomplete
                    onLoad={handleAutocompleteLoad}
                    onPlaceChanged={handlePlaceSelect}
                  >
                    <input
                      aria-label="location_name"
                      {...register("location_name")}
                      type="text"
                      placeholder="Please type your property location"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                    />
                  </Autocomplete>
                ) : (
                  <p className="text-sm">Loading Google Maps API...</p>
                )}

                {errors.location_name && (
                  <div className="text-sm text-red-500">
                    {errors.location_name.message}
                  </div>
                )}
              </div>
              <div className="flex flex-row-reverse">
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
            {errors.root && (
              <div className="text-sm text-red-500">{errors.root.message}</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default GeneralInformation;
