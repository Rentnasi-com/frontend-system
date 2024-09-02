import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import ImageUploading from 'react-images-uploading'
import { useState } from "react";

const libraries = ['places']

const Organization = () => {
    const [autocomplete, setAutocomplete] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [images, setImages] = useState([]);
    const maxNumber = 4

    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const handleAutocompleteLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const handlePlaceSelect = () => {
        if (autocomplete) {
            const selectedPlaceFromAutocomplete = autocomplete.getPlace();
            setSelectedPlace({
                lat: selectedPlaceFromAutocomplete.geometry.location.lat(),
                lng: selectedPlaceFromAutocomplete.geometry.location.lng(),
            });
        }
    };
    return (
        <>
            <section className="md:mx-20">
                <div className="mt-6">
                    <div className="flex flex-col justify-center items-center space-y-3">
                        <h1 className="text-4xl text-gray-800">Organization info</h1>
                        <p className="text-sm text-gray-500">Info about you and your preferences across Google services.</p>
                    </div>
                </div>
                <div className="flex justify-center items-center space-x-4 mt-2">
                    <div className="">
                        <h2 className="text-2xl text-gray-800">Your organization info in Rentnasi services</h2>
                        <p className="text-sm text-gray-500 mt-3">
                            Organization info and options to manage it. You can make some of this info, like your contact details, visible to others so they can reach you easily. You can also see a summary of your organization.</p>

                    </div>
                    <div className="">
                        <img className="" src="https://www.gstatic.com/identity/boq/accountsettingsmobile/family_create_scene_948x336_8881092d15aaa37652efb86624ab04ac.png" alt="" />
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <div className="rounded-lg border p-4 text-gray-700 bg-white">
                        <h4 className="text-lg">Organization info</h4>
                        <p className="text-sm">Some info may be visible to other people using Rentnasi services.</p>
                        <form>
                            <div className="grid gap-6 mt-6 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Organization</label>
                                    <input type="text" id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="John" required />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Organization Email</label>
                                    <input type="text" id="company" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Flowbite" required />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone number</label>
                                    <input type="text" id="company" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Flowbite" required />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Whatsapp number</label>
                                    <input type="tel" id="phone" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="123-45-678" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                                    {isLoaded ? (
                                        <Autocomplete
                                            onLoad={handleAutocompleteLoad}
                                            onPlaceChanged={handlePlaceSelect}
                                        >
                                            <input
                                                aria-label="location_name"
                                                type="text"
                                                placeholder="Please type your property location"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                                            />
                                        </Autocomplete>
                                    ) : (
                                        <p className="text-sm">Loading Google Maps API...</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Organization Logo</label>
                                    <ImageUploading
                                        value={images}
                                        onChange={onChange}
                                        maxNumber={maxNumber}
                                        dataURLKey="data_url"
                                    >
                                        {({
                                            imageList,
                                            onImageUpload,
                                            onImageUpdate,
                                            onImageRemove,
                                            isDragging,
                                            dragProps,
                                        }) => (
                                            <div className="upload__image-wrapper mt-4">
                                                <div
                                                    className="relative flex justify-center flex-col items-center bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg p-6 w-full"
                                                    style={isDragging ? { color: "red" } : undefined}
                                                    onClick={onImageUpload}
                                                    {...dragProps}
                                                >

                                                    <label className="relative cursor-pointer">
                                                        <span>Drag and drop</span>
                                                        <span className="text-indigo-600"> or browse</span>
                                                        <span> to upload</span>
                                                    </label>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        PNG, JPG, GIF up to 10MB
                                                    </p>
                                                </div>
                                                {imageList.length > 0 && (
                                                    <div className="">
                                                        <div className="mt-2 border-2 border-gray-300 border-dashed rounded-lg p-6">
                                                            <div className="flex justify-center items-center">
                                                                {imageList.map((image, index) => (
                                                                    <div key={index} className="image-item">
                                                                        <img
                                                                            className="h-64 w-auto rounded shadow"
                                                                            src={image['data_url']}
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
                                    </ImageUploading>
                                </div>

                            </div>

                            <div className="flex items-start my-2">
                                <div className="flex items-center h-5">
                                    <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" required />
                                </div>
                                <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</a>.</label>
                            </div>
                            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center my-2">Submit</button>
                        </form>
                    </div>
                </div>

            </section>
        </>
    )
}

export default Organization