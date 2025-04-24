import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Loader } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";
import { DashboardHeader } from "./page_components";
import ReactImageUploading from "react-images-uploading";
import { useLocation } from "react-router-dom";
import imageCompression from 'browser-image-compression';
import { Input } from "../../../shared";
import RichTextEditor from "../../../shared/RichTextEditor";

const MarketUnit = () => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [internalFeatures, setInternalFeatures] = useState([]);
    const [externalFeatures, setExternalFeatures] = useState([]);
    const [nearbyFeatures, setNearbyFeatures] = useState([]);
    const [locationCoords, setLocationCoords] = useState({
        latitude: "",
        longitude: ""
    });
    const [coverImage, setCoverImage] = useState([]);
    const [otherImages, setOtherImages] = useState([]);

    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [areas, setAreas] = useState([]);

    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [userIdToken, setUserIdToken] = useState('');
    const [userIdFromRentnasi, setUserIdFromRentnasi] = useState('');

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const unitId = queryParams.get('unit_id') || '';

    const baseUrl = import.meta.env.VITE_RENTNASI_WEBSITE_URL;
    const pmBaseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem('userId');

    const schema = z.object({
        property_name: z.string().min(2, "Enter your property name"),
        property_price: z.coerce.number().min(3, "Enter your property price"),
        category_id: z.coerce.number().min(1, "Choose a category"),
        sub_category_id: z.coerce.number().min(1, "Choose a subcategory"),
        region_id: z.coerce.string().min(1, "Choose region area"),
        area_id: z.coerce.string().min(1, "Choose area"),
        cover_image: z.string().optional(),
        other_images: z.array(z.string()).optional(),
        internal_features: z.array(z.string()).optional(),
        external_features: z.array(z.string()).optional(),
        nearby_features: z.array(z.string()).optional(),
        description: z.string()
            .min(1, "Description is required")
            .refine(val => {
                const textContent = val.replace(/<[^>]*>/g, '').trim();
                return textContent.length >= 10;
            }, {
                message: "Must contain at least 10 characters of actual text"
            })
    });

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            category_id: "1",
        }
    });

    useEffect(() => {
        fetchInitialData();
        if (unitId) {
            fetchPropertyDetails();
        }
    }, [unitId, baseUrl, pmBaseUrl, token]);

    const fetchInitialData = async () => {
        try {
            const response = await axios.get(`${baseUrl}/property/data/`)
            setCategories(response.data.categories)
            setInternalFeatures(response.data.internal_features)
            setExternalFeatures(response.data.external_features)
            setNearbyFeatures(response.data.nearby_features)
            setRegions(response.data.regions)
        } catch (error) {
            console.error(error);
        }
    }

    const fetchPropertyDetails = async () => {
        try {
            // 1. Fetch unit details
            const response = await axios.get(
                `${pmBaseUrl}/payment/data/unit?unit_id=${unitId}`,
                {
                    headers:
                    {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch property details");
            }

            const data = response.data;

            setLocationCoords({
                latitude: data.property_details.latitude,
                longitude: data.property_details.longitude
            });

            // 2. Set basic values
            setValue("property_name", data.property_details?.name || "");
            setValue("property_price", data.unit_details?.rent_amount || "");

            // 3. Only proceed if we have a unit_type
            if (!data.unit_details?.unit_type) {
                toast.warn("No unit_type found in response");
                return;
            }

            // 4. Fetch sub-categories for FOR RENT (category_id = 1)
            let subCategoriesResponse;
            try {
                subCategoriesResponse = await axios.get(
                    `${baseUrl}/property/category/subcategory?category=1`
                );
                setSubCategories(subCategoriesResponse.data);
            } catch (error) {
                toast.error("Failed to fetch sub-categories:");
                return;
            }

            // 5. Normalize strings for comparison
            const unitType = data.unit_details.unit_type.trim().toLowerCase();

            // 6. Find matching sub-category (case-insensitive)
            const matchedSubCategory = subCategoriesResponse.data.find(subCat =>
                subCat.name.trim().toLowerCase() === unitType
            );

            if (matchedSubCategory) {
                setValue("sub_category_id", matchedSubCategory.id);
                setSelectedSubCategory(matchedSubCategory.id);
            } else {
                console.warn(`No sub-category found matching: "${data.unit_details.unit_type}". Available options:`,
                    subCategoriesResponse.data.map(sc => sc.name));
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load property details");
        }
    };

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

    const fetchUserToken = async () => {
        if (!userId) {
            toast.error("User ID not found in localStorage");
            return;
        }
        try {
            const response = await axios.post(`${baseUrl}/user/external-user-tokens/`, {
                user_id: userId
            });
            if (response.status === 200) {
                setUserIdToken(response.data.tokens.access);
                setUserIdFromRentnasi(response.data.contact_person.id);
            }
        } catch (error) {
            toast.error("Invalid user ID")
        }
    }

    const onSubmit = async (formData) => {
        await fetchUserToken();
        
        const preparedData = {
            ...formData,
            viewing_charges: "0",
            contact_person_id: userIdFromRentnasi,
            location_coords: {
                latitude: locationCoords.latitude,
                longitude: locationCoords.longitude
            },
            cover_image: coverImage[0]?.data_url || '',
            other_images: otherImages.map(img => img.data_url),
            external_features: formData.external_features || [],
            internal_features: formData.internal_features || [],
            nearby_features: formData.nearby_features || [],
        };

        try {
            const response = await toast.promise(
                axios.post(`${baseUrl}/property/`, preparedData, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userIdToken}`,
                    }
                }),
                {
                    loading: 'Marketing your property...',
                    success: (response) => response.data.message || 'Property marketed successfully!',
                    error: (err) => err.response?.data?.message || 'Failed to market property'
                }
            );

            if (response.status === 201) {
                toast.success("Property marketed successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to market property");
        }
    };
    return (
        <>
            <DashboardHeader
                title="Market Unit"
                description="Market unit to a rentnasi.com"
                name="New property"
                link="/add-property/general-information"
                hideSelect={false}
                hideLink={true}
            />

            <div className="bg-white rounded-xl shadow col-span-2 p-4 mx-4 h-full">
                <h3 className="font-bold text-xl text-gray-800 my-2">Enter Property Information</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        <Input
                            label="Property Name"
                            type="text"
                            name="property_name"
                            register={register}
                            error={errors.property_name}
                            placeholder="Enter property name"
                        />
                        <Input
                            label="Unit Price"
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
                            <select
                                {...register("sub_category_id")}
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2"
                            >
                                <option value="">Select your property subcategory</option>
                                {subCategories.map((subcategory) => (
                                    <option key={subcategory.id} value={subcategory.id}>
                                        {subcategory.name}
                                    </option>
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
                    </div>

                    <div className="my-6">
                        <label className="block text-sm font-medium text-gray-500">Select property External Features</label>
                        <div className="grid grid-cols-8 gap-4 mt-2">
                            {externalFeatures.map(feature => (
                                <div key={feature.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`external-${feature.id}`}
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
                                        id={`external-${feature.id}`}
                                        value={feature.feature_name}
                                        {...register("internal_features")}
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
                                        id={`external-${feature.id}`}
                                        value={feature.feature_name}
                                        {...register("nearby_features")}
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

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-500">
                            Property Description
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <RichTextEditor
                                    value={field.value}
                                    onChange={(content) => {
                                        field.onChange(content);
                                    }}
                                    onBlur={() => trigger('description')} // Validate only after leaving the editor
                                    error={errors.description}
                                />
                            )}
                        />

                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <ImageUploadSection
                            title="Cover Image"
                            images={coverImage}
                            onChange={setCoverImage}
                            maxNumber={1} // Restrict to a single cover image
                        />

                        <div>
                            <ImageUploadSection
                                title="Other Images"
                                images={otherImages}
                                onChange={setOtherImages}
                                maxNumber={20}
                            />
                        </div>
                    </div>

                    <div className="flex flex-row-reverse mt-4">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="flex focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 me-2 mb-2"
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
    );
};

const ImageUploadSection = ({ title, onChange, maxNumber, images = [] }) => {
    // Function to compress images before passing them to state
    const handleImageUpload = async (imageList) => {
        const compressedImages = await Promise.all(
            imageList.map(async (image) => {
                try {
                    const options = {
                        maxSizeMB: 2, // Max size in MB
                        maxWidthOrHeight: 1920, // Resize if needed
                        useWebWorker: true // Faster compression
                    };
                    const compressedFile = await imageCompression(image.file, options);
                    return {
                        ...image,
                        data_url: await imageCompression.getDataUrlFromFile(compressedFile)
                    };
                } catch (error) {
                    console.error("Image compression failed:", error);
                    return image; // Use original if compression fails
                }
            })
        );

        onChange(compressedImages);
    };

    return (
        <div className="bg-white p-4 rounded border border-gray-200">
            <h2 className="font-bold text-lg">{title}</h2>
            <ReactImageUploading
                multiple={maxNumber > 1}
                value={images}
                onChange={handleImageUpload} // Call compression before setting state
                maxNumber={maxNumber}
                dataURLKey="data_url"
                acceptType={['jpg', 'png', 'jpeg']}
            >
                {({
                    imageList,
                    onImageUpload,
                    onImageRemoveAll,
                    onImageUpdate,
                    onImageRemove,
                    isDragging,
                    dragProps
                }) => (
                    <div className="upload__image-wrapper">
                        <button
                            className="border-dashed rounded border-2 p-4 w-full flex flex-col items-center justify-center"
                            style={isDragging ? { color: 'red' } : undefined}
                            onClick={onImageUpload}
                            {...dragProps}
                            type="button"
                        >
                            <>
                                <img
                                    className="mx-auto h-12 w-12"
                                    src="https://www.svgrepo.com/show/357902/image-upload.svg"
                                    height={48}
                                    width={48}
                                    alt="Upload Icon"
                                />
                                <label className="relative cursor-pointer">
                                    <span>Drag and drop</span>
                                    <span className="text-indigo-600"> or browse</span>
                                    <span> to upload</span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </>
                        </button>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {imageList.map((image, index) => (
                                <div key={index}>
                                    <img src={image.data_url} alt="" className="h-auto object-cover" />
                                    <div className="flex justify-between items-center mt-2">
                                        <button type="button" onClick={() => onImageUpdate(index)} className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                            ✎
                                        </button>
                                        <button type="button" onClick={() => onImageRemove(index)} className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="mt-2 w-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-1"
                            onClick={onImageRemoveAll}
                            type="button"
                        >
                            Remove All
                        </button>
                    </div>
                )}
            </ReactImageUploading>
        </div>
    );
};



export default MarketUnit;