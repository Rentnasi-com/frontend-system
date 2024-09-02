import axios from "axios";
import { Loader } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ReactImageUploading from "react-images-uploading";
import imageCompression from "browser-image-compression";

const ManageImages = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coverImageUploaded, setCoverImageUploaded] = useState(false);
  const [images, setImages] = useState({});
  const [unitTypes, setUnitTypes] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const navigate = useNavigate();

  const onChange = async (imageList, unitTypeId) => {
    const maxSize = 10 * 1024 * 1024;
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const validImages = await Promise.all(
      imageList.map(async (image) => {
        try {
          const compressedFile = await imageCompression(image.file, options);
          if (compressedFile.size > maxSize) {
            toast.error("Image size should not exceed 10MB even after compression. Try another image.");
            return null;
          }
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          return new Promise((resolve) => {
            reader.onload = () => {
              resolve({
                data_url: reader.result,
                file: compressedFile,
              });
            };
          });
        } catch (error) {
          toast.error("Error compressing image. Try again.");
          return null;
        }
      })
    );

    setImages((prevImages) => ({
      ...prevImages,
      [unitTypeId]: validImages.filter((image) => image !== null),
    }));
  };

  const maxNumber = 30;

  useEffect(() => {
    const fetchUnitTypes = async () => {
      const propertyId = localStorage.getItem("propertyId");
      const token = localStorage.getItem("token");

      if (!propertyId) {
        toast.error("Property ID not found in localStorage!");
        navigate("/add-property/general-information");
        return;
      }
      if (!token) {
        toast.error("Authorization token not found in localStorage!");
        window.location.href = "https://auth.rentnasi.com";
        return;
      }

      try {
        const response = await axios.get(
          `https://pm.api.rentnasi.com/api/v1/manage-property/create-property/get-unit-types?property_id=${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 200) {
          const availableUnitTypes = response.data.result.image_requirements.available_unit_types;
          setUnitTypes(availableUnitTypes);
        } else {
          toast.error("Failed to fetch unit types");
        }
      } catch (error) {
        toast.error("Error fetching unit types!");
        console.error("Error fetching unit types:", error);
      }
    };

    fetchUnitTypes();
  }, [navigate]);

  const handleSubmitCoverImage = async () => {
    const base64Image = images['cover']?.map((image) => image.data_url)[0];
    setIsLoading(true);

    const propertyId = localStorage.getItem("propertyId");
    const token = localStorage.getItem("token");

    if (!propertyId) {
      toast.error("Please enter your property name and location again!");
      navigate("/add-property/general-information");
      return;
    }
    if (!token) {
      toast.error("Authorization token not found in localStorage!");
      window.location.href = "https://auth.rentnasi.com";
      return;
    }

    try {
      const response = await axios.post(
        "https://files.rentnasi.com/upload/create",
        { image: base64Image },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        toast.error("Error uploading image!");
        setIsLoading(false);
        return;
      }

      const cover_image_url = response.data.urls;
      const dataToSend = {
        cover_image_url,
        property_id: propertyId,
      };

      const updateResponse = await axios.post(
        "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/cover-image",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (updateResponse.status !== 200) {
        toast.error("Error updating property with cover image");
        setIsLoading(false);
        return;
      }

      if (updateResponse.data.success && updateResponse.data.result.cover_image_uploaded) {
        toast.success("Cover image uploaded successfully!");
        setCoverImageUploaded(true);
      }
    } catch (error) {
      toast.error("Error uploading cover image!");
      console.error("Error uploading cover image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOtherImages = async (unitTypeId) => {
    const base64Image = images[unitTypeId]?.map((image) => image.data_url) || [];
    setIsLoading(true);

    const propertyId = localStorage.getItem("propertyId");
    const token = localStorage.getItem("token");

    if (!propertyId) {
      toast.error("Please enter your property name and location again!");
      navigate("/add-property/general-information");
      return;
    }
    if (!token) {
      toast.error("Authorization token not found in localStorage!");
      window.location.href = "https://auth.rentnasi.com";
      return;
    }

    try {
      const response = await axios.post(
        "https://files.rentnasi.com/upload/create/multiple",
        { images: base64Image },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        toast.error("Error uploading images!");
        setIsLoading(false);
        return;
      }

      const images = response.data.urls;
      const dataToSend = {
        images,
        property_id: propertyId,
        unit_type_id: unitTypeId,
      };

      const updateResponse = await axios.post(
        "https://pm.api.rentnasi.com/api/v1/manage-property/create-property/other-images",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (updateResponse.status !== 200) {
        toast.error("Error updating property with other images");
        setIsLoading(false);
        return;
      }

      if (updateResponse.data.success) {
        toast.success(`${unitTypes.find((ut) => ut.unit_type_id === unitTypeId).name} images uploaded successfully!`);
        setImages((prevImages) => ({
          ...prevImages,
          [unitTypeId]: [],
        }));
      }
    } catch (error) {
      toast.error("Error uploading images!");
      console.error("Error uploading images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="">
        <div className="p-4 flex justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-700">Add Property</h1>
            <p className="text-sm text-gray-500">Properties / Add property</p>
          </div>
        </div>
        <div className="grid grid-cols-2 mx-4 gap-3">
          <div className="col-span-2">
            <div className="bg-white rounded-xl shadow p-4 h-full">
              <h3 className="font-bold text-xl text-gray-800">Cover Image</h3>
              <ReactImageUploading
                value={images['cover'] || []}
                onChange={(imageList) => onChange(imageList, 'cover')}
                maxNumber={1}
                dataURLKey="data_url"
              >
                {({
                  imageList,
                  onImageUpload,
                  onImageRemoveAll,
                  onImageUpdate,
                  onImageRemove,
                  isDragging,
                  dragProps,
                }) => (
                  <div className="upload__image-wrapper mt-4">
                    <button
                      className="relative border-2 border-gray-300 border-dashed rounded-lg p-6 w-full"
                      style={isDragging ? { color: "red" } : undefined}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
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
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </button>
                    {imageList.length > 0 && (
                      <div className="">
                        <div className="mt-2 border-2 border-gray-300 border-dashed rounded-lg p-6">
                          <div className="grid grid-cols-6 gap-2">
                            {imageList.map((image, index) => (
                              <div key={index} className="image-item">
                                <img
                                  className="h-auto w-auto rounded shadow"
                                  src={image.data_url}
                                  alt={`Uploaded ${index}`}
                                  width="100"
                                />
                                <div className="image-item__btn-wrapper flex justify-between">
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
                      </div>
                    )}
                  </div>
                )}
              </ReactImageUploading>
              <button
                className="mt-2 text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center"
                onClick={handleSubmitCoverImage}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload Cover Image"}
              </button>
            </div>
          </div>
          {coverImageUploaded && unitTypes.map((unitType) => (
            <div key={unitType.unit_type_id}>
              <div className="bg-white rounded-xl shadow p-4 h-full">
                <h3 className="font-bold text-xl text-gray-800">{unitType.name} Images</h3>
                <div className="">
                  <ReactImageUploading
                    multiple
                    value={images[unitType.unit_type_id] || []}
                    onChange={(imageList) => onChange(imageList, unitType.unit_type_id)}
                    maxNumber={maxNumber}
                    dataURLKey="data_url"
                  >
                    {({
                      imageList,
                      onImageUpload,
                      onImageRemoveAll,
                      onImageUpdate,
                      onImageRemove,
                      isDragging,
                      dragProps,
                    }) => (
                      <div className="upload__image-wrapper mt-4">
                        <button
                          className="relative border-2 border-gray-300 border-dashed rounded-lg p-6 w-full"
                          style={isDragging ? { color: "red" } : undefined}
                          onClick={onImageUpload}
                          {...dragProps}
                        >
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
                          <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </button>
                        {imageList.length > 0 && (
                          <div className="">
                            <div className="mt-2 border-2 border-gray-300 border-dashed rounded-lg p-6">
                              <div className="grid grid-cols-6 gap-2">
                                {imageList.map((image, index) => (
                                  <div key={index} className="image-item">
                                    <img
                                      className="h-auto w-auto rounded shadow"
                                      src={image.data_url}
                                      alt={`Uploaded ${index}`}
                                      width="100"
                                    />
                                    <div className="image-item__btn-wrapper flex justify-between">
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
                          </div>
                        )}
                      </div>
                    )}
                  </ReactImageUploading>
                </div>
                <button
                  className="mt-2 text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center"
                  onClick={() => handleSubmitOtherImages(unitType.unit_type_id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {coverImageUploaded && (
          <div className="flex justify-center mt-4">
            <button
              className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded text-sm px-5 py-2.5 text-center"
              onClick={() => navigate("/dashboard")}
            >
              Proceed to Dashboard
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default ManageImages;
