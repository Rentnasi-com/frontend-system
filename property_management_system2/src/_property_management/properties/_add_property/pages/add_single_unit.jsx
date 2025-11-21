import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import FormField from "./single_unit/FormField";
import UnitTypeSelect from "./single_unit/UnitTypeSelect";
import { Button } from "../../../../shared";
import { DashboardHeader } from "../../dashboard/page_components";

const schema = z.object({
    unit_type_id: z.string().nonempty("Unit type is required"),
    rent_amount: z.coerce.number().min(0, "Rent amount must be greater than 0"),
    rent_deposit: z.coerce.number().min(0, "Deposit cannot be negative"),
    water_amount: z.coerce.number().min(0, "Water deposit cannot be negative"),
    electricity_amount: z.coerce.number().min(0, "Electricity deposit cannot be negative"),
    garbage_amount: z.coerce.number().min(0, "Garbage deposit cannot be negative"),
});

const Single_Unit = () => {
    const [unitTypes, setUnitTypes] = useState([]);
    const [unitId, setUnitId] = useState(null);
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const propertyId = localStorage.getItem("propertyId");
    const [searchParams] = useSearchParams();
    const propertyIdUrl = searchParams.get("property_id");
    const [rentAmount, setRentAmount] = useState(0);
    const [rentDeposit, setRentDeposit] = useState(0);

    const { register, handleSubmit, setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const handleRentAmountChange = (e) => {
        const value = e.target.value;
        setRentAmount(value);
        setRentDeposit(value);
    };

    const handleRentDepositChange = (e) => {
        const value = e.target.value;
        setRentDeposit(value);
    };

    useEffect(() => {
        const fetchUnitTypes = async () => {
            try {
                const response = await axios.get(`${baseUrl}/get-unit-type`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                setUnitTypes(response.data.result);
            } catch (error) {
                toast.error(error.message || "Failed to fetch unit types");
            }
        };

        fetchUnitTypes();
    }, [baseUrl, token]);

    useEffect(() => {
        const fetchUnitDetails = async () => {
            if (!propertyIdUrl) return;

            try {
                const response = await axios.get(
                    `${baseUrl}/manage-property/edit-property/single-unit-details?property_id=${propertyIdUrl}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const unitDetails = response.data;

                if (unitDetails && unitDetails.unit_id) {
                    setUnitId(unitDetails.unit_id);
                }

                Object.keys(unitDetails).forEach((key) => {
                    if (key in schema.shape) {
                        if (key === "unit_type_id") {
                            setValue(key, String(unitDetails[key]));
                        } else {
                            setValue(key, unitDetails[key]);
                        }
                    }
                });
            } catch (error) {
                toast.error(error.message || "Failed to fetch unit details");
            }
        };

        fetchUnitDetails();
    }, [propertyIdUrl, baseUrl, token, setValue]);


    const onSubmit = async (data) => {
        try {
            const isEdit = Boolean(propertyIdUrl);
            const url = isEdit
                ? `${baseUrl}/manage-property/edit-property/single-unit-details`
                : `${baseUrl}/manage-property/create-property/single-unit-details`;

            const response = await axios.post(url, {
                ...data, property_id: propertyId, ...(isEdit && { unit_id: unitId }),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (response.data.status) {
                toast.success(response.data.message);
                navigate("/add-property/manage-images");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message || "Error submitting form");
        }
    };

    const goToPrevious = () => {
        navigate(`/add-property/property-type?property_id=${propertyId}`);
    };

    return (
        <section>
            <DashboardHeader
                title="Add Single Unit"
                description="Add a single unit to the property"
            />
            <div className="px-4">
                <div className="mt-4 border rounded bg-white px-2 py-4">
                    <div className=" p-2">
                        <p className="mt-1 text-sm font-normal text-gray-500">
                            You can now manage each unit on this floor! 🏢 Just enter the unit
                            number 📋, type 🏠, rent 💰, deposits for water 🚰, electricity ⚡,
                            and garbage 🗑️.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <table id="unitTable" className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-white uppercase bg-red-700 py-4">
                                <tr>
                                    <th scope="col" className="px-5 py-3">Unit Type</th>
                                    <th scope="col" className="px-5 py-3">Rent Amount</th>
                                    <th scope="col" className="px-5 py-3">Deposit</th>
                                    <th scope="col" className="px-5 py-3">Water</th>
                                    <th scope="col" className="px-5 py-3">Electricity</th>
                                    <th scope="col" className="px-5 py-3">Garbage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <UnitTypeSelect unitTypes={unitTypes} register={register} errors={errors} />
                                    <FormField
                                        name="rent_amount"
                                        label="Rent Amount"
                                        register={register}
                                        errors={errors}
                                        type="number"
                                        placeholder="Rent Amount"
                                        defaultValue={0}
                                        onChange={handleRentAmountChange}
                                        value={rentAmount}
                                    />
                                    <FormField
                                        name="rent_deposit"
                                        label="Rent Deposit"
                                        register={register}
                                        errors={errors}
                                        type="number"
                                        placeholder="Rent Deposit"
                                        defaultValue={0}
                                        onChange={handleRentDepositChange}
                                        value={rentDeposit}
                                    />
                                    <FormField
                                        name="water_amount"
                                        label="Water Amount"
                                        register={register}
                                        errors={errors}
                                        type="number"
                                        placeholder="Water Deposit"
                                        defaultValue={0}
                                    />
                                    <FormField
                                        name="electricity_amount"
                                        label="Electricity Amount"
                                        register={register}
                                        errors={errors}
                                        type="number"
                                        placeholder="Electricity Deposit"
                                        defaultValue={0}
                                    />
                                    <FormField
                                        name="garbage_amount"
                                        label="Garbage Amount"
                                        register={register}
                                        errors={errors}
                                        type="number"
                                        placeholder="Garbage Deposit"
                                        defaultValue={0}
                                    />
                                </tr>
                            </tbody>
                        </table>
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

export default Single_Unit;
