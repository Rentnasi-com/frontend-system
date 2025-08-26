import { useTour } from "./TourContext";


const TourButton = () => {
    const { startTour } = useTour();

    return (
        <button
            onClick={startTour}
            className="fixed bottom-6 right-6 bg-yellow-600 text-white p-3 rounded-full shadow-lg hover:bg-yellow-700 transition-all z-30"
            title="Take a tour"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
    );
};

export default TourButton;