import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button, Input } from "../../../shared";
import { Loader } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";
import RadioGroup from "../../../shared/radioGroup";
import { DashboardHeader } from "./page_components";
import ReactImageUploading from "react-images-uploading";
import { useLocation } from "react-router-dom";

const MarketUnit = () => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(1);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [areas, setAreas] = useState([]);
    const [internalFeatures, setInternalFeatures] = useState([]);
    const [externalFeatures, setExternalFeatures] = useState([]);
    const [nearbyFeatures, setNearbyFeatures] = useState([]);
    const [loadingStates, setLoadingStates] = useState({
        cover: false,
        others: false
    });
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [coverImage, setCoverImage] = useState([]);
    const [otherImages, setOtherImages] = useState([]);
    const [uploadedCoverImage, setUploadedCoverImage] = useState(null);
    const [uploadedOtherImages, setUploadedOtherImages] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const unitId = queryParams.get('unit_id') || '';

    const baseUrl = import.meta.env.VITE_RENTNASI_WEBSITE_URL;
    const pmBaseUrl = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("token");

    const schema = z.object({
        property_name: z.string().min(2, "Enter your property name"),
        property_price: z.string().min(3, "Enter your property price"),
        category_id: z.string().min(3, "Invalid category"),
        sub_category_id: z.string().min(3, "Invalid subcategory"),
        region_id: z.string().min(3, "Invalid region area"),
        area_id: z.string().min(3, "Invalid area"),
        viewing_charges: z.string().min(3, "Enter viewing charges"),
        contact_person_id: z.string().min(3, "Enter viewing charges"),
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            category_id: "1",
        },
    });

    useEffect(() => {
        fetchInitialData();
        if (unitId) {
            fetchPropertyDetails();
        }
    }, [unitId]);

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

    const fetchPropertyDetails = async () => {
        try {
            // 1. Fetch unit details
            const response = await axios.get(
                `${pmBaseUrl}/manage-property/single-unit/details?unit_id=${unitId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch property details");
            }

            const data = response.data;

            // 2. Set basic values
            setValue("property_name", data.property_details?.name || "");
            setValue("property_price", data.unit_details?.rent_amount || "");

            // 3. Only proceed if we have a unit_type
            if (!data.unit_details?.unit_type) {
                console.warn("No unit_type found in response");
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
                console.error("Failed to fetch sub-categories:", error);
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
                console.log(`Matched "${data.unit_details.unit_type}" to sub-category ID: ${matchedSubCategory.id}`);
            } else {
                console.warn(`No sub-category found matching: "${data.unit_details.unit_type}". Available options:`,
                    subCategoriesResponse.data.map(sc => sc.name));
            }

        } catch (error) {
            console.error("Error in fetchPropertyDetails:", error);
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

    const handleImageChange = (imageList, type) => {
        if (type === 'cover') {
            setCoverImage(imageList);
        } else {
            setOtherImages(imageList);
        }
    };

    const uploadImages = async (images, type) => {
        try {
            setLoadingStates(prev => ({ ...prev, [type]: true }));
            const formData = new FormData();

            images.forEach(image => {
                formData.append('images', image.file);
            });

            const response = await axios.post(
                `${baseUrl}/upload-endpoint`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
            );

            return response.data.urls;
        } finally {
            setLoadingStates(prev => ({ ...prev, [type]: false }));
        }
    };

    const onSubmit = async (formData) => {
        try {
            // Upload images first
            let coverImageUrl = uploadedCoverImage;
            let otherImageUrls = uploadedOtherImages;

            if (coverImage.length > 0) {
                const urls = await uploadImages(coverImage, 'cover');
                coverImageUrl = urls[0];
                setUploadedCoverImage(coverImageUrl);
            }

            if (otherImages.length > 0) {
                const urls = await uploadImages(otherImages, 'others');
                otherImageUrls = urls;
                setUploadedOtherImages(otherImageUrls);
            }

            // Submit all data together
            const response = await axios.post(
                `${baseUrl}/manage-property/market-unit/`,
                {
                    ...formData,
                    cover_image: coverImageUrl,
                    other_images: otherImageUrls
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Property marketed successfully!");
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

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <ImageUploadSection
                            title="Cover Image"
                            images={coverImage}
                            uploadedImages={uploadedCoverImage ? [uploadedCoverImage] : []}
                            onChange={(imageList) => handleImageChange(imageList, 'cover')}
                            handleUpload={() => { }}
                            isLoading={loadingStates.cover}
                            maxNumber={1}
                        />

                        <ImageUploadSection
                            title="Other Images"
                            images={otherImages}
                            uploadedImages={uploadedOtherImages}
                            onChange={(imageList) => handleImageChange(imageList, 'others')}
                            handleUpload={() => { }}
                            isLoading={loadingStates.others}
                            maxNumber={30}
                        />
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

const ImageUploadSection = ({
    title,
    images,
    uploadedImages,
    onChange,
    isLoading,
    maxNumber
}) => (
    <div className="bg-white p-4 rounded border border-gray-200">
        <h2 className="font-bold text-lg">{title}</h2>
        <ReactImageUploading
            multiple={maxNumber > 1}
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
        >
            {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
                <div>
                    <button
                        className="border-dashed rounded border-2 p-4 w-full flex flex-col items-center justify-center"
                        onClick={onImageUpload}
                        {...dragProps}
                    >
                        {isLoading ? (
                            <div className="animate-spin border-4 border-red-500 border-t-transparent rounded-full h-6 w-6"></div>
                        ) : imageList.length === 0 ? (
                            <>
                                <img
                                    className="mx-auto h-12 w-12"
                                    src="https://www.svgrepo.com/show/357902/image-upload.svg"
                                    alt="Upload Icon"
                                />
                                <label className="relative cursor-pointer">
                                    <span>Drag and drop</span>
                                    <span className="text-indigo-600"> or browse</span>
                                    <span> to upload</span>
                                </label>
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </>
                        ) : (
                            <p className="text-gray-600 text-xs">
                                {imageList.length} image{imageList.length !== 1 ? 's' : ''} selected
                            </p>
                        )}
                    </button>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {imageList.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image.data_url}
                                    alt=""
                                    className="h-20 w-20 object-cover rounded"
                                />
                                <button
                                    onClick={() => onImageRemove(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ReactImageUploading>

        {uploadedImages && uploadedImages.length > 0 && (
            <div className="mt-4">
                <h3 className="font-semibold text-sm">Uploaded Images</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedImages.map((image, index) => (
                        <div key={index} className="w-16 h-16 border p-0.5 rounded">
                            <img
                                src={image}
                                alt={`Uploaded ${index + 1}`}
                                className="object-cover h-full w-full rounded"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default MarketUnit;