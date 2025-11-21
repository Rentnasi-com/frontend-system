import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { Button, Input } from "../../../../shared";
import { DashboardHeader } from "../../dashboard/page_components";

const libraries = ["places"]; // Google Maps API Places Library

const GeneralInformation = () => {
  const navigate = useNavigate();
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [searchParams] = useSearchParams();
  const propertyIdUrl = searchParams.get("property_id")
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem("token");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      setSelectedPlace({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const schema = z.object({
    property_name: z
      .string()
      .min(4, { message: "Property name must be at least 4 characters long" }),
    location_name: z
      .string()
      .min(4, { message: "Location must be at least 4 characters long" }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!propertyIdUrl) {
      return;
    }
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/manage-property/edit-property/general-information?property_id=${propertyIdUrl}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = response.data;
        setInitialData(data);
        setValue("property_name", data.property_name);
        setValue("location_name", data.location_name);
        if (data.latitude && data.longitude) {
          setSelectedPlace({
            lat: data.latitude,
            lng: data.longitude,
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load property details")
      }
    };

    fetchPropertyDetails();
  }, [propertyIdUrl, baseUrl, setValue, token])

  const onSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");

      let dataToSend = { ...values };
      if (selectedPlace) {
        dataToSend = {
          ...dataToSend,
          latitude: selectedPlace.lat,
          longitude: selectedPlace.lng,
        };
      }

      const isEdit = Boolean(propertyIdUrl);
      const url = isEdit
        ? `${baseUrl}/manage-property/edit-property/general-information`
        : `${baseUrl}/manage-property/create-property/general-information`;

      if (isEdit) {
        dataToSend.property_id = propertyIdUrl;
      }

      const response = await axios.post(url, dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.status) {
        const propertyId = response.data.data.id;
        localStorage.setItem("propertyId", propertyId);
        toast.success(response.data.message);
        navigate(`/add-property/amenities`);
      } else {
        toast.error(response.data.message || "An error occurred");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during submission");
    }
  };

  return (
    <section>
      <DashboardHeader
        title="Add Property"
        description="Fill in the details below to add a new property."

      />
      <div className="grid grid-cols-2 mt-4 ">
        <div className="bg-white rounded border col-span-2 p-4 mx-4 h-full">
          <h3 className="font-bold text-xl text-gray-800 mb-4">General Information</h3>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Property Name Input */}
            <Input
              label="Property Name"
              name="property_name"
              placeholder="Enter property name e.g., Serenity"
              register={register}
              error={errors.property_name}
            />

            {/* Location Input with Autocomplete */}
            <div>
              {isLoaded ? (
                <Autocomplete
                  onLoad={handleAutocompleteLoad}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <Input
                    label="Location"
                    name="location_name"
                    placeholder="Enter property location e.g., Nairobi"
                    register={register}
                    error={errors.location_name}
                  />
                </Autocomplete>
              ) : (
                <p className="text-sm">Loading Google Maps API...</p>
              )}
            </div>

            {/* Navigation Button */}
            <div className="flex flex-row-reverse mt-4">
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Next</Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GeneralInformation;
