import axios from 'axios';
import { useState } from 'react';
import ImageUploading from 'react-images-uploading';

const FileUpload = () => {
    const [images, setImages] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0)

    const maxNumber = 1;

    const onChange = (imageList, addUpdateIndex) => {
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

    const handleSubmitImage = async () => {
        const base64Image = images?.map((image) => image.data_url)[0]
        try {
            const response = await axios.post(
                "https://files.rentnasi.com/upload/create",
                { image: base64Image },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                }
            );
            const cover_image_url = response.data.urls;
            console.log(cover_image_url)

        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <div className="mx-32 mt-4">
                <ImageUploading
                    value={images}
                    onChange={onChange}
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
                        <div className="upload__image-wrapper">
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
                                <div className="mt-2 border-2 border-gray-300 border-dashed rounded-lg p-6">
                                    <div className="grid grid-cols-6 gap-2">
                                        {imageList.map((image, index) => (
                                            <div key={index} className="image-item">
                                                <img className="h-auto w-auto rounded shadow" src={image['data_url']} alt="" width="100" />
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
                            )}
                            {uploadProgress > 0 && (
                                <div className="flex items-center space-x-3 mt-4 w-full">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    >

                                    </div>
                                    <div className="flex items-center justify-center p-2 text-sm font-semibold text-white bg-green-500 rounded-full">
                                        {uploadProgress}%
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <button className="mt-2 text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center" onClick={onImageRemoveAll}>Remove all images</button>
                                <button className="mt-2 text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded text-sm px-5 py-2.5 text-center" onClick={handleSubmitImage}>Send all images</button>
                            </div>
                        </div>
                    )}
                </ImageUploading>
            </div>
        </>
    );
};

export default FileUpload;