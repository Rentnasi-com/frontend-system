import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import FormField from './single_unit/FormField';
import UnitTypeSelect from './single_unit/UnitTypeSelect';

const schema = z.object({
    unit_type_id: z.string().nonempty('Unit type is required'),
    rent_amount: z.number().min(1, 'Rent amount must be greater than 0'),
    rent_deposit: z.number().min(1, 'Deposit cannot be negative'),
    water_amount: z.number().min(1, 'Water deposit cannot be negative'),
    electricity_amount: z.number().min(1, 'Electricity deposit cannot be negative'),
    garbage_amount: z.number().min(1, 'Garbage deposit cannot be negative').default(200),
});


const Single_Unit = () => {
    const [unitTypes, setUnitTypes] = useState([]);
    const [rentAmount, setRentAmount] = useState(0);
    const [rentDeposit, setRentDeposit] = useState(0);
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            garbage_amount: 200,
        },
    });

    useEffect(() => {
        axios.get("https://pm.api.rentnasi.com/api/v1/get-unit-type")
            .then((response) => {
                setUnitTypes(response.data.result);
            })
            .catch((error) => {
                console.error('Error fetching unit types:', error);
                toast.error('Failed to fetch unit types');
            });
    }, []);

    useEffect(() => {
        setValue('rent_deposit', rentAmount); // Set rent_deposit when rent_amount changes
        setRentDeposit(rentAmount);
    }, [rentAmount, setValue]);

    const onSubmit = async (data) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authorization token not found!');
                return;
            }

            const response = await axios.post(
                "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/single-unit-details",
                { ...data, property_id: localStorage.getItem('propertyId') },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                navigate("/add-property/manage-images");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error submitting form');
        }
    };

    const handleRentAmountChange = (e) => {
        const value = parseFloat(e.target.value);
        setRentAmount(value);
    };

    const handleRentDepositChange = (e) => {
        const value = parseFloat(e.target.value);
        setRentDeposit(value);
    };

    return (
        <section className="bg-white">
            <div className="p-4 flex justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Add Property</h1>
                    <p className="text-sm text-gray-500">Properties / Add property</p>
                </div>
            </div>
            <div className="my-3 p-4">
                <div className="border rounded p-2">
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
                                <td className="p-1">
                                    <input
                                        type="number"
                                        className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                                        {...register("rent_amount", { valueAsNumber: true })}
                                        value={rentAmount}
                                        onChange={handleRentAmountChange}
                                        placeholder="Rent Amount"
                                        min="0"
                                    />
                                    {errors.rent_amount && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.rent_amount?.message}
                                        </p>
                                    )}
                                </td>
                                <td className="p-1">
                                    <input
                                        type="number"
                                        className="bg-white border border-gray-300 rounded text-gray-900 text-xs focus:ring-red-500 focus:border-red-500 block w-full focus:outline-red-400 p-1.5"
                                        {...register("rent_deposit", { valueAsNumber: true })}
                                        value={rentDeposit}
                                        onChange={handleRentDepositChange}
                                        placeholder="Rent Deposit"
                                        min="0"
                                    />
                                    {errors.rent_deposit && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.rent_deposit?.message}
                                        </p>
                                    )}
                                </td>
                                <FormField name="water_amount" label="Water Amount" register={register} errors={errors} />
                                <FormField name="electricity_amount" label="Electricity Amount" register={register} errors={errors} />
                                <FormField name="garbage_amount" label="Garbage Amount" register={register} errors={errors} defaultValue={200} />
                            </tr>
                        </tbody>
                    </table>
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


export default Single_Unit;
