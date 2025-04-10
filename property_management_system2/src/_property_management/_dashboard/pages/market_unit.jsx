import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Input } from "../../../shared";
import { Loader } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";
import RadioGroup from "../../../shared/radioGroup";

const MarketUnit = () => {
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [regions, setRegions] = useState([])
    const [selectedRegion, setSelectedRegion] = useState('')
    const [areas, setAreas] = useState([])

    const [internalFeatures, setInternalFeatures] = useState([])
    const [externalFeatures, setExternalFeatures] = useState([])
    const [nearbyFeatures, setNearbyFeatures] = useState([])

    const baseUrl = import.meta.env.VITE_RENTNASI_WEBSITE_URL
    const schema = z
        .object({
            property_name: z.string().min(2, "Enter your property name"),
            property_price: z.string().min(3, "Enter your property price"),
            category_id: z.string().min(3, "Invalid category"),
            sub_category_id: z.string().min(3, "Invalid subcategory"),
            region_id: z.string().min(3, "Invalid region area"),
            area_id: z.string().min(3, "Invalid area"),
            viewing_charges: z.string().min(3, "Enter viewing charges"),
            contact_person_id: z.string().min(3, "Enter viewing charges"),
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
        const category_id = event.target.value
        setSelectedCategory(category_id)

        try {
            const subCategoriesResponse = await axios.get(`${baseUrl}/property/category/subcategory?category=${category_id}`)
            setSubCategories(subCategoriesResponse.data)
        } catch (error) {
            toast.error("You have no units in the property selected")
        }
    }

    const handleRegionChange = async (event) => {
        const region_id = event.target.value
        setSelectedRegion(region_id)

        try {
            const aresResponse = await axios.get(`${baseUrl}/location/area/?region=${region_id}`)
            setAreas(aresResponse.data)
        } catch (error) {
            toast.error("You have areas in the property selected")
        }
    }

    useEffect(() => {
        fetchInitialData()
    }, [baseUrl])

    const fetchInitialData = async () => {
        try {
            const response = await axios.get(`${baseUrl}/property/data/`)
            setCategories(response.data.categories)
            setRegions(response.data.regions)
            setInternalFeatures(response.data.internal_features)
            setExternalFeatures(response.data.external_features)
            setNearbyFeatures(response.data.nearby_features)
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

            <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                <h3 className="font-bold text-xl text-gray-800 my-2">Enter Property Information</h3>
                <form onSubmit={handleSubmit(onSubmit)}>

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
                                <option defaultValue>Select your property category</option>
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
                                <option defaultValue>Select your property subcategory</option>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Property Region</label>
                            <select {...register("region_id")}
                                value={selectedRegion}
                                onChange={handleRegionChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2">
                                <option defaultValue>Select your property region</option>
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>{region.region_name}</option>
                                ))}
                            </select>
                            {errors.region_id && (
                                <p className="text-xs text-red-500">
                                    {errors.region_id.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Property Area</label>
                            <select
                                {...register("area_id")}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2">
                                <option defaultValue>Select your property area</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>{area.area_name}</option>
                                ))}
                            </select>
                            {errors.area_id && (
                                <p className="text-xs text-red-500">
                                    {errors.area_id.message}
                                </p>
                            )}
                        </div>
                        <Input
                            label="Viewing Charges (Ksh)"
                            type="text"
                            name="viewing_charges"
                            register={register}
                            error={errors.viewing_charges}
                            placeholder="Enter Viewing Charges"
                        />
                    </div>
                    <div className="my-6">
                        <label className="block text-sm font-medium text-gray-500">Select property External Features</label>
                        <div className="grid grid-cols-8 gap-4 mt-2">
                            {externalFeatures.map(feature => (
                                <div key={feature.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={feature.feature_name}
                                        {...register("external_features")}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded-lg"
                                    />
                                    <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-900">
                                        {feature.feature_name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.external_features && (
                            <p className="mt-1 text-sm text-red-600">{errors.external_features.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Select property Internal Features</label>
                        <div className="grid grid-cols-8 gap-4 mt-2">
                            {internalFeatures.map(feature => (
                                <div key={feature.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={feature.feature_name}
                                        {...register("external_features")}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded-lg"
                                    />
                                    <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-900">
                                        {feature.feature_name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.external_features && (
                            <p className="mt-1 text-sm text-red-600">{errors.external_features.message}</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-500">Select property Nearby Features</label>
                        <div className="grid grid-cols-8 gap-4 mt-2">
                            {nearbyFeatures.map(feature => (
                                <div key={feature.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={feature.feature_name}
                                        {...register("external_features")}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded-lg"
                                    />
                                    <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-900">
                                        {feature.feature_name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.external_features && (
                            <p className="mt-1 text-sm text-red-600">{errors.external_features.message}</p>
                        )}
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
            </div>
        </>
    )
}

export default MarketUnit
