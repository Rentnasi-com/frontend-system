import { useTour } from "./TourContext";

const TourOverlay = () => {
    const { isRunning, currentStep, nextStep, prevStep, steps, endTour } = useTour();

    if (!isRunning || !steps[currentStep]) return null;

    const currentStepData = steps[currentStep];
    const element = currentStepData?.element;

    // Get element position for positioning the tooltip
    const getElementPosition = () => {
        if (!element) return { top: '50%', left: '50%' };

        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        return {
            top: rect.top + scrollTop + rect.height + 10,
            left: rect.left + scrollLeft + rect.width / 2
        };
    };

    const position = getElementPosition();

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[1000] bg-black bg-opacity-50"
                onClick={endTour}
            />

            {/* Highlight the current element */}
            {element && (
                <div
                    className="fixed z-[1001] border-4 border-blue-500 rounded pointer-events-none"
                    style={{
                        top: element.getBoundingClientRect().top + window.scrollY - 4,
                        left: element.getBoundingClientRect().left + window.scrollX - 4,
                        width: element.offsetWidth + 8,
                        height: element.offsetHeight + 8,
                    }}
                />
            )}

            {/* Tour tooltip */}
            <div
                className="fixed z-[1002] p-4 bg-white rounded-lg shadow-xl text-xs"
                style={{
                    top: position.top,
                    left: position.left,
                    transform: 'translateX(-50%)'
                }}
            >
                <h3 className="font-bold text-lg mb-2">{currentStepData.title}</h3>
                <p className="text-gray-600 mb-4">{currentStepData.content}</p>

                <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                </span>

                <div className="flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`px-3 py-1 rounded ${currentStep === 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            }`}
                    >
                        Back
                    </button>



                    <div className="space-x-2">
                        <button
                            onClick={endTour}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Skip
                        </button>
                        <button
                            onClick={nextStep}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TourOverlay