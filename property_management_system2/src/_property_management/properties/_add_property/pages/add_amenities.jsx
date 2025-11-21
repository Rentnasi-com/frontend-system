import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect } from "react";
import RadioGroup from "../../../../shared/radioGroup";
import { Button, Input } from "../../../../shared";
import { DashboardHeader } from "../../dashboard/page_components";

const Amenities = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [searchParams] = useSearchParams();
  const propertyIdUrl = searchParams.get("property_id");
  const token = localStorage.getItem("token");
  const propertyId = localStorage.getItem("propertyId");

  const schema = z
    .object({
      rent_deposit: z.string().nonempty("Deposit selection is required"),
      is_water_inclusive_of_rent: z.string().nonempty("Water inclusion selection is required"),
      water_billing_type: z.string().optional(),
      water_cumulative_billing_amount: z.string().optional(),
      water_per_unit_billing_amount: z.string().optional(),
      electricity_deposit: z.string().nonempty("Electricity deposit selection is required"),
      electricity_deposit_amount: z.string().optional(),
      garbage_deposit: z.string().nonempty("Garbage deposit selection is required"),
      garbage_charge_amount: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.is_water_inclusive_of_rent === "0") {
        if (!values.water_billing_type) {
          ctx.addIssue({
            path: ["water_billing_type"],
            message: "Water billing type is required when water is not inclusive",
          });
        }
        if (values.water_billing_type === "cumulative" && !values.water_cumulative_billing_amount) {
          ctx.addIssue({
            path: ["water_cumulative_billing_amount"],
            message: "Cumulative amount is required when billing type is cumulative",
          });
        }
        if (values.water_billing_type === "meter_reading" && !values.water_per_unit_billing_amount) {
          ctx.addIssue({
            path: ["water_per_unit_billing_amount"],
            message: "Amount per unit is required when billing type is meter reading",
          });
        }
      }

      if (values.electricity_deposit === "1" && !values.electricity_deposit_amount) {
        ctx.addIssue({
          path: ["electricity_deposit_amount"],
          message: "Electricity deposit amount is required when deposit is selected",
        });
      }

      if (values.garbage_deposit === "0" && !values.garbage_charge_amount) {
        ctx.addIssue({
          path: ["garbage_charge_amount"],
          message: "Garbage charge amount is required when deposit is not included",
        });
      }
    });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rent_deposit: "0",
      is_water_inclusive_of_rent: "1",
      water_billing_type: "",
      water_cumulative_billing_amount: "",
      water_per_unit_billing_amount: "",
      electricity_deposit: "0",
      electricity_deposit_amount: "",
      garbage_deposit: "1",
      garbage_charge_amount: "",
    },
    shouldUnregister: false,
  });


  // Fetch property details
  useEffect(() => {
    if (!propertyIdUrl) { return; }

    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/manage-property/edit-property/amenities?property_id=${propertyIdUrl}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = response.data;

        if (data) {
          // Prefill mandatory fields (convert to strings for radio buttons)
          setValue("rent_deposit", String(data.rent_deposit)); // "0" or "1"
          setValue("is_water_inclusive_of_rent", String(data.is_water_inclusive_of_rent)); // "0" or "1"
          setValue("electricity_deposit", String(data.electricity_deposit)); // "0" or "1"
          setValue("garbage_deposit", String(data.garbage_deposit)); // "0" or "1"

          // Prefill conditional fields
          if (data.is_water_inclusive_of_rent === 0) {
            setValue("water_billing_type", data.water_billing_type || "");
            setValue("water_cumulative_billing_amount", data.water_cumulative_billing_amount || "");
            setValue("water_per_unit_billing_amount", data.water_per_unit_billing_amount || "");
          }

          if (data.electricity_deposit === 1) {
            setValue("electricity_deposit_amount", data.electricity_deposit_amount || "");
          }

          if (data.garbage_deposit === 0) {
            setValue("garbage_charge_amount", data.garbage_charge_amount || "");
          }
        } else {
          toast.error("No amenities data found.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load property details");
      }
    };

    fetchPropertyDetails();
  }, [propertyIdUrl, baseUrl, setValue, token]);

  // Submit form
  const onSubmit = async (values) => {
    try {
      const dataToSend = {
        ...values,
        rent_deposit: parseInt(values.rent_deposit, 10),
        is_water_inclusive_of_rent: parseInt(values.is_water_inclusive_of_rent, 10),
        electricity_deposit: parseInt(values.electricity_deposit, 10),
        garbage_deposit: parseInt(values.garbage_deposit, 10),
        property_id: propertyId,
      };

      const isEdit = Boolean(propertyIdUrl);
      const url = isEdit
        ? `${baseUrl}/manage-property/edit-property/amenities`
        : `${baseUrl}/manage-property/create-property/amenities`;

      const response = await axios.post(url, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data.status) {
        toast.success(response.data.message);
        navigate("/add-property/property-type");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error submitting form");
    }
  };

  const goToPrevious = () => {
    navigate(`/add-property/general-information?property_id=${propertyId}`);
  };

  const isWaterInclusive = watch("is_water_inclusive_of_rent");
  const waterBillingType = watch("water_billing_type");
  const electricityDeposit = watch("electricity_deposit");
  const garbageDeposit = watch("garbage_deposit");

  return (
    <section >
      <DashboardHeader
        title="Add Amenities"
        description="Amenities are additional services or features provided by a property, such as water, electricity, or garbage disposal."

      />
      <div className="grid grid-cols-3 mt-4 p-4">
        <div className="bg-white rounded border col-span-3 p-4 h-full">
          <h3 className="font-bold text-xl text-gray-800">Amenities</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <h6 className="block my-2 text-sm font-medium text-gray-900">1. DEPOSIT</h6>
            <RadioGroup
              label="Do you charge a deposit for rent?"
              name="rent_deposit"
              options={[
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ]}
              register={register}
              error={errors.rent_deposit}
            />

            <h6 className="block my-2 text-sm font-medium text-gray-900">2. WATER</h6>
            <RadioGroup
              label="Is water inclusive of rent?"
              name="is_water_inclusive_of_rent"
              options={[
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ]}
              register={register}
              error={errors.is_water_inclusive_of_rent}
            />
            {isWaterInclusive === "0" && (
              <>
                <label>Select water billing type</label>
                <select {...register("water_billing_type")} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5 my-2">
                  <option value="" disabled>Select your billing type</option>
                  <option value="cumulative">Cumulative</option>
                  <option value="meter_reading">Meter Reading</option>
                </select>
                {waterBillingType === "cumulative" && (
                  <Input
                    label="Enter cumulative amount"
                    type="text"
                    name="water_cumulative_billing_amount"
                    register={register}
                    error={errors.water_cumulative_billing_amount}
                  />
                )}
                {waterBillingType === "meter_reading" && (
                  <Input
                    label="Enter amount per unit"
                    type="text"
                    name="water_per_unit_billing_amount"
                    register={register}
                    error={errors.water_per_unit_billing_amount}
                  />
                )}
              </>
            )}

            <h6 className="block mt-3 mb-2 text-sm font-medium text-gray-900">3. POWER</h6>
            <RadioGroup
              label="Do you charge a deposit for electricity?"
              name="electricity_deposit"
              options={[
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ]}
              register={register}
              error={errors.electricity_deposit}
            />
            {electricityDeposit === "1" && (
              <Input
                label="How much do you charge?"
                type="text"
                name="electricity_deposit_amount"
                register={register}
                error={errors.electricity_deposit_amount}
              />
            )}

            <h6 className="block mt-3 mb-2 text-sm font-medium text-gray-900">4. GARBAGE</h6>
            <RadioGroup
              label="Is garbage inclusive of rent?"
              name="garbage_deposit"
              options={[
                { value: "1", label: "Yes" },
                { value: "0", label: "No" },
              ]}
              register={register}
              error={errors.garbage_deposit}
            />
            {garbageDeposit === "0" && (
              <Input
                label="How much do you charge for garbage?"
                type="text"
                name="garbage_charge_amount"
                register={register}
                error={errors.garbage_charge_amount}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <Button type="button" onClick={goToPrevious}>Previous</Button>
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>Next</Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Amenities;
