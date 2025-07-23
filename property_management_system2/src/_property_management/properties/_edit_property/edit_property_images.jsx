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
    const [searchParams] = useSearchParams();
    const [selectedImage, setSelectedImage] = useState(null); // State for selected image
    const [showModal, setShowModal] = useState(false); // Modal visibility state

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
            setUploadedCoverImage([{ id: null, url: coverImageResponse.data.cover_image_url }]);

            // Fetch uploaded unit images
            const unitImagesResponses = await Promise.all(
                types.map((unit) =>
                    axios.get(
                        `${baseUrl}/manage-property/edit-property/other-images?property_id=${propertyId}&unit_type_id=${unit.unit_type_id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );

            const images = {};
            unitImagesResponses.forEach((response) => {
                const results = response.data.results || [];
                results.forEach((result) => {
                    const unitTypeId = result.unit_type_id; // Unit Type ID
                    const unitImages = result.images || []; // Images for this unit type

                    // Map the image data to include both id and url
                    images[unitTypeId] = unitImages.map((img) => ({
                        id: img.image_id,
                        url: img.image_url,
                    }));
                });
            });
            setUploadedUnitImages(images);

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

    const handleUpload = async (unitTypeId, isCover = false) => {
        // Determine which images to upload
        const imagesToUpload = isCover
            ? coverImage.map((img) => img.data_url)
            : unitImages[unitTypeId]?.map((img) => img.data_url) || [];

        if (imagesToUpload.length === 0) {
            return toast.error("No images selected.");
        }

        setLoadingStates((prev) => ({ ...prev, [unitTypeId]: true }));

        try {
            // URL for converting images
            const conversionUrl = isCover
                ? "https://files.rentalpay.africa/upload/create" // URL for single cover image
                : "https://files.rentalpay.africa/upload/create/multiple"; // URL for multiple unit images

            // Prepare payload for image conversion
            const data = isCover
                ? { image: imagesToUpload[0] } // Send single cover image data
                : { images: imagesToUpload }; // Send multiple images data

            // Send conversion request
            const response = await axios.post(conversionUrl, data, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.data.success) {
                // API URL for uploading images
                const apiEndpoint = isCover
                    ? `${baseUrl}/manage-property/edit-property/cover-image`
                    : `${baseUrl}/manage-property/edit-property/other-images`;

                // Prepare the upload payload
                const uploadData = isCover
                    ? { cover_image_url: response.data.urls, property_id: propertyId }
                    : { images: response.data.urls, unit_type_id: unitTypeId, property_id: propertyId };

                // Send upload request
                const uploadResponse = await axios.post(apiEndpoint, uploadData, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Provide feedback based on the success of the operation
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
                    setUploadedCoverImage(response.data.urls);
                    setCoverImage([]); // Clear uploaded cover image input
                } else {
                    setUploadedUnitImages((prev) => ({
                        ...prev,
                        [unitTypeId]: [...(prev[unitTypeId] || []), ...response.data.urls],
                    }));
                    setUnitImages((prev) => ({ ...prev, [unitTypeId]: [] })); // Clear uploaded unit image input
                }
            } else {
                toast.error("Image conversion failed.");
            }
        } catch (error) {
            console.error("Upload failed:", error);
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

    const confirmDeleteImage = async () => {
        const { unitTypeId, imageId } = selectedImage;
        setLoadingStates((prev) => ({ ...prev, [unitTypeId]: true }));

        try {
            await axios.delete(
                `${baseUrl}/manage-property/edit-property/other-images?property_id=${propertyId}&image_id=${imageId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Image deleted successfully!");

            setUploadedUnitImages((prev) => {
                // Ensure prev exists and log its structure for debugging
                if (!prev || !prev[unitTypeId]) {
                    console.error(`No images found for unitTypeId: ${unitTypeId}`);
                    return prev;
                }

                // Filter out the image with the matching id
                return {
                    ...prev,
                    [unitTypeId]: prev[unitTypeId].filter((img) => img.id !== imageId),
                };
            });
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Failed to delete image.");
        } finally {
            setLoadingStates((prev) => ({ ...prev, [unitTypeId]: false }));
            setShowModal(false);
        }
    };


    const openModal = (image) => {
        setSelectedImage(image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    return (
        <section>
            <div className="p-4">
                <h1 className="text-xl font-bold">Edit Property Images</h1>
                <p className="text-sm text-gray-500">Properties / Edit Property / Images</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
                <ImageUploadSection
                    title="Cover Image *Upload only 1 image"
                    images={coverImage}
                    uploadedImages={uploadedCoverImage || []}
                    onChange={(list) => onChange(list, "cover")}
                    handleUpload={() => handleUpload("cover", true)}
                    isLoading={loadingStates["cover"]}
                    maxNumber={1}
                    openModal={openModal}
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
                        maxNumber={10}
                        multiple
                        openModal={openModal}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4 p-4">
                <Button type="button" onClick={goToPrevious}>
                    Previous
                </Button>
                <Button onClick={() => navigate("/add-property/property-summary")}>
                    Property Summary
                </Button>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow-lg p-2 w-80 text-center">
                        <h2 className="text-sm font-bold mb-4">Delete Image</h2>
                        <p className="text-gray-700 mb-4 text-sm">Are you sure you want to delete this image?</p>
                        <div className="flex justify-between space-x-2">
                            <Button onClick={closeModal}>Cancel</Button>
                            <Button onClick={confirmDeleteImage} isLoading={loadingStates[selectedImage?.unitTypeId]}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};


const ImageUploadSection = ({ title, images, uploadedImages, onChange, handleUpload, isLoading, maxNumber, openModal }) => (
    <div className="bg-white p-4 rounded border border-gray-200">
        <h2 className="font-bold text-lg">{title}</h2>
        <ReactImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber}
            dataURLKey="data_url">
            {({ imageList,
                onImageUpload,
                onImageRemove,
                onImageUpdate
            }) => (
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
                            <p className="text-gray-600 text-xs">Images in session. Click to upload more.</p>
                        )}
                    </button>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {imageList.map((image, index) => (
                            <div key={index} className="relative">
                                <img src={image.data_url} alt="" className="h-20 w-20 object-cover rounded" />
                                <div className="image-item__btn-wrapper flex space-x-8">
                                    <button onClick={() => onImageUpdate(index)}>
                                        <svg
                                            className="w-6 h-6 text-gray-800 hover:text-red-600"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-5.294a.53.53 0 0 1 .53-.53h1.471a.53.53 0 0 1 .53.53V19.882C20.53 21.643 18.955 23 17 23H5c-1.955 0-3.53-1.357-3.53-3.118V8.294C1.47 6.533 3.045 5 5 5h6.32a.53.53 0 0 1 .53.53v.616a.53.53 0 0 1-.53.53Z"
                                                clipRule="evenodd"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                    <button onClick={() => onImageRemove(index)}>
                                        <svg
                                            className="w-6 h-6 text-gray-800 hover:text-red-600"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M19.436 5.742c-.363 0-.66-.3-.66-.67a.664.664 0 0 0-.66-.669H5.883a.664.664 0 0 0-.66.67c0 .37-.296.669-.66.669H3v1.338h1.563l1.065 12.624c.077.911.821 1.616 1.738 1.616h9.368c.917 0 1.661-.705 1.738-1.616l1.065-12.624H21V5.742h-1.564ZM9.893 18.051h-1.32V9.422h1.32v8.629Zm3.961 0h-1.32V9.422h1.32v8.629Zm2.641 0h-1.319V9.422h1.32v8.629Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ReactImageUploading>
        <div className="mt-4 mb-6">
            <h3 className="font-semibold text-sm">Uploaded Images:</h3>
            <div className="flex flex-wrap space-x-3">
                {
                    uploadedImages.map((img, index) => (
                        <div key={index} className="w-16 h-16 m-1 border p-0.5 rounded">
                            <img
                                onClick={() => openModal({ imageId: img.id })} // If no `unitTypeId`, just pass `imageId`
                                src={img.url} // For the cover image, img should be the URL string
                                alt={`Uploaded ${index + 1}`}
                                className="object-cover h-full w-full rounded hover:cursor-pointer"
                            />
                        </div>
                    ))
                }

            </div>
        </div>
        <Button onClick={handleUpload} className="mt-4">
            {isLoading ? "Uploading..." : "Upload Images"}
        </Button>
    </div>
);

export default ManageImages;