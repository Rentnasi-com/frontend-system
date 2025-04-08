import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactImageUploading from "react-images-uploading";
import imageCompression from "browser-image-compression";
import { Button } from "../../../shared";

const ManageImages = () => {
    const [coverImage, setCoverImage] = useState([]);
    const [unitImages, setUnitImages] = useState({});
    const [unitTypes, setUnitTypes] = useState([]);
    const [loadingStates, setLoadingStates] = useState({});
    const [uploadedCoverImage, setUploadedCoverImage] = useState("");
    const [uploadedUnitImages, setUploadedUnitImages] = useState({});
    const [isCoverImageUploaded, setIsCoverImageUploaded] = useState(false); // New state
    const [searchParams] = useSearchParams();

    const propertyId = searchParams.get("property_id") || localStorage.getItem("propertyId");
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();

    const maxSize = 10 * 1024 * 1024; // 10MB
    const options = { maxSizeMB: 5, maxWidthOrHeight: 1920, useWebWorker: true };

    const fetchData = useCallback(async () => {
        if (!propertyId) {
            navigate("/add-property/general-information");
            return;
        }
        try {
            // Fetch unit types
            const unitTypesResponse = await axios.get(
                `${baseUrl}/manage-property/create-property/get-unit-types?property_id=${propertyId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const types = unitTypesResponse.data.property_types || [];
            setUnitTypes(types);

            // Fetch uploaded cover image
            const coverImageResponse = await axios.get(
                `${baseUrl}/manage-property/edit-property/cover-image?property_id=${propertyId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUploadedCoverImage(coverImageResponse.data.cover_image_url);
            setIsCoverImageUploaded(!!coverImageResponse.data.cover_image_url); // Set state if cover image exists
        } catch (error) {
            toast.error("Failed to fetch data. Please check your connection.");
        }
    }, [propertyId, token, baseUrl, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const compressImage = async (imageFile) => {
        try {
            const compressedFile = await imageCompression(imageFile, options);
            if (compressedFile.size > maxSize) throw new Error("Image size exceeds 10MB.");
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = () => resolve({ data_url: reader.result, file: compressedFile });
                reader.readAsDataURL(compressedFile);
            });
        } catch (error) {
            toast.error("Error compressing image. Please try again.");
            throw error;
        }
    };

    const onChange = async (imageList, unitTypeId) => {
        setLoadingStates((prev) => ({ ...prev, [unitTypeId]: true }));
        try {
            const validImages = await Promise.all(imageList.map((img) => compressImage(img.file)));
            if (unitTypeId === "cover") setCoverImage(validImages);
            else setUnitImages((prev) => ({ ...prev, [unitTypeId]: validImages }));
        } catch {
            // Error already handled in compressImage
        } finally {
            setLoadingStates((prev) => ({ ...prev, [unitTypeId]: false }));
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // Resolve with base64 string
            reader.onerror = (error) => reject(error); // Reject on error
            reader.readAsDataURL(file); // Read the file as a data URL
        });
    };
    
    const handleUpload = async (unitTypeId, isCover = false) => {
        const imagesToUpload = isCover
            ? coverImage.map((img) => img.file)
            : unitImages[unitTypeId]?.map((img) => img.file) || [];
    
        if (imagesToUpload.length === 0) return toast.error("No images selected.");
    
        setLoadingStates((prev) => ({ ...prev, [unitTypeId]: true }));
    
        try {
            // Step 1: Convert images to base64
            const base64Images = await Promise.all(imagesToUpload.map(fileToBase64));
    
            // Step 2: Send base64 images to the upload API
            const uploadEndpoint = isCover
                ? "https://files.rentnasi.com/upload/create"
                : "https://files.rentnasi.com/upload/create/multiple";
    
            const uploadPayload = isCover
                ? { image: base64Images[0] } // Single image for cover
                : { images: base64Images }; // Multiple images for units
    
            const uploadResponse = await axios.post(uploadEndpoint, uploadPayload, {
                headers: {
                    "Content-Type": "application/json", // Set content type to JSON
                },
            });
    
            // Step 3: Get the URLs from the upload API response
            const uploadedUrls = isCover
                ? [uploadResponse.data.urls] // Single URL for cover image
                : uploadResponse.data.urls; // Array of URLs for unit images
    
            // Step 4: Send the URLs to the backend API
            const apiEndpoint = isCover
                ? uploadedCoverImage?.length > 0
                    ? `${baseUrl}/manage-property/edit-property/cover-image` // Update existing cover image
                    : `${baseUrl}/manage-property/create-property/cover-image` // Create new cover image
                : uploadedUnitImages[unitTypeId]?.length > 0
                    ? `${baseUrl}/manage-property/edit-property/other-images` // Update existing unit images
                    : `${baseUrl}/manage-property/create-property/other-images`; // Create new unit images
    
            const backendPayload = isCover
                ? { cover_image_url: uploadedUrls[0], property_id: propertyId } // Payload for cover image
                : { images: uploadedUrls, unit_type_id: unitTypeId, property_id: propertyId }; // Payload for unit images
    
            console.log("Backend Payload:", backendPayload);
    
            const backendResponse = await axios.post(apiEndpoint, backendPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json", // Set content type to JSON
                },
            });
    
            console.log("Backend Response:", backendResponse.data);
    
            // Success feedback
            toast.success(
                isCover
                    ? uploadedCoverImage?.length > 0
                        ? "Cover image updated!"
                        : "Cover image created!"
                    : uploadedUnitImages[unitTypeId]?.length > 0
                        ? "Unit images updated!"
                        : "Unit images created!"
            );
    
            // Update local states after successful upload
            if (isCover) {
                setUploadedCoverImage(uploadedUrls[0]);
                setCoverImage([]); // Clear uploaded cover image input
            } else {
                setUploadedUnitImages((prev) => ({
                    ...prev,
                    [unitTypeId]: [...(prev[unitTypeId] || []), ...uploadedUrls],
                }));
                setUnitImages((prev) => ({ ...prev, [unitTypeId]: [] })); // Clear uploaded unit image input
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setLoadingStates((prev) => ({ ...prev, [unitTypeId]: false }));
        }
    };

    const goToPrevious = async () => {
        try {
            const getFloorType = await axios.get(
                `${baseUrl}/manage-property/edit-property/property-type?property_id=${propertyId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (getFloorType.data.requires_multiple_floors) {
                navigate(`/add-property/multi-unit?property_id=${propertyId}`);
            } else {
                navigate(`/add-property/single-unit?property_id=${propertyId}`);
            }
        } catch (error) {
            toast.error("Error navigating to the previous page!");
        }
    };

    return (
        <section>
            <div className="p-4">
                <h1 className="text-xl font-bold">Add Property Images</h1>
                <p className="text-sm text-gray-500">Properties / Add Property / Images</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
                <ImageUploadSection
                    title="Cover Image"
                    images={coverImage}
                    uploadedImages={uploadedCoverImage ? [uploadedCoverImage] : []}
                    onChange={(list) => onChange(list, "cover")}
                    handleUpload={() => handleUpload("cover", true)}
                    isLoading={loadingStates["cover"]}
                    maxNumber={1}
                />
                {unitTypes.map((unit) => (
                    <ImageUploadSection
                        key={unit.unit_type_id}
                        title={`${unit.unit_type_name} Images`}
                        images={unitImages[unit.unit_type_id] || []}
                        uploadedImages={uploadedUnitImages[unit.unit_type_id] || []}
                        onChange={(list) => onChange(list, unit.unit_type_id)}
                        handleUpload={() => handleUpload(unit.unit_type_id)}
                        isLoading={loadingStates[unit.unit_type_id]}
                        maxNumber={30}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4 p-4">
                <Button type="button" onClick={goToPrevious}>
                    Previous
                </Button>
                {isCoverImageUploaded && ( // Conditionally render the "Property Summary" button
                    <Button onClick={() => navigate("/add-property/property-summary")}>
                        Property Summary
                    </Button>
                )}
            </div>
        </section>
    );
};
const ImageUploadSection = ({ title, images, uploadedImages, onChange, handleUpload, isLoading, maxNumber }) => (
    <div className="bg-white p-4 rounded border border-gray-200">
        <h2 className="font-bold text-lg">{title}</h2>
        <ReactImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
            {({ imageList, onImageUpload }) => (
                <div>
                    <button className="border-dashed rounded border-2 p-4 w-full flex flex-col items-center justify-center" onClick={onImageUpload}>
                        {isLoading ? (
                            <div className="animate-spin border-4 border-red-500 border-t-transparent rounded-full h-6 w-6"></div>
                        ) : imageList.length === 0 ? (
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
                        ) : (
                            <p className="text-gray-600 text-xs">Images in session.</p>
                        )}
                    </button>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {imageList.map((image, index) => (
                            <div key={index} className="relative">
                                <img src={image.data_url} alt="" className="h-20 w-20 object-cover rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ReactImageUploading>
        <div className="mt-4">
            <h3 className="font-semibold text-sm">Uploaded Images:</h3>
            <div className="flex flex-wrap space-x-3">
                {uploadedImages.map((image, index) => (
                    <div key={index} className="w-16 h-16 m-1 border p-0.5 rounded">
                        <img src={image} alt={`Uploaded ${index + 1}`} className="object-cover h-full w-full rounded" />
                    </div>
                ))}
            </div>
        </div>
        <Button onClick={handleUpload} className="mt-4">
            {isLoading ? "Uploading..." : "Upload Images"}
        </Button>
    </div>
);
export default ManageImages;