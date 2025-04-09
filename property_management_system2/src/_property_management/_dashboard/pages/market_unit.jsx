import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Input } from "../../../shared";
import { Loader } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";

const MarketUnit = () => {
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const baseUrl = import.meta.env.VITE_RENTNASI_WEBSITE_URL
    const schema = z
        .object({
            property_name: z.string().min(2, "Invalid property name").optional(),
            property_price: z.string().min(3, "Invalid property price").optional(),

        })
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const handleCategoryChange = async (event) => {
        const category_id=event.target.value
        setSelectedCategory(category_id)

        try {
            const subCategoriesResponse = await axios.get(`${baseUrl}/property/category/subcategory?category=${category_id}`)
            setSubCategories(subCategoriesResponse.data)
        } catch (error) {
            toast.error("You have no units in the property selected")
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [baseUrl])

    const fetchInitialData = async () => {
        try {
            const response = await axios.get(`${baseUrl}/property/data/`)
            setCategories(response.data.categories)
        } catch (error) {
            console.error(error);
        }
    }

    const onSubmit = async (data) => {
        try {
            const response = await toast.promise(
                axios.post(`${baseUrl}/manage-property/market-unit/`, data),
                {
                    loading: "Sending your message ...",
                    success: "Message sent",
                    error: "Failed to send message. Please try again later.",
                }
            )
            console.log(response)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <div className="p-4 flex justify-between mx-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-700">Market Unit</h1>
                    <p className="text-sm text-gray-500">Market unit to a rentnasi.com</p>
                </div>
            </div>

            <form className="p-4 mx-4" onSubmit={handleSubmit(onSubmit)}>
                <h6 className="block my-2 text-md font-medium text-gray-900">Enter Property Information</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <Input
                        label="Property Name"
                        type="text"
                        name="property_name"
                        register={register}
                        error={errors.property_name}
                        placeholder="Enter property name"
                    />
                    <Input
                        label="Property Price"
                        type="text"
                        name="property_price"
                        register={register}
                        error={errors.property_price}
                        placeholder="Enter property price"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Property Category</label>
                        <select {...register("category_id")}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="" disabled>Select your property category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.category_name}</option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="text-xs text-red-500">
                                {errors.category_id.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Property Sub Category</label>
                        <select {...register("sub_category_id")} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2">
                            <option value="" disabled>Select your property subcategory</option>
                            {subCategories.map((subcategory) => (
                                <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                            ))}
                        </select>
                        {errors.sub_category_id && (
                            <p className="text-xs text-red-500">
                                {errors.sub_category_id.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
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
                                <p>Finish</p> <FaArrowRight />
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </>
    )
}

export default MarketUnit
