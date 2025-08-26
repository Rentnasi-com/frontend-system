import { createContext, useContext, useRef, useState, useCallback } from 'react';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const stepsRef = useRef([]);

    // Use useCallback to prevent registerStep from changing on every render
    const registerStep = useCallback((element, stepData, index) => {
        // Only update if the step data has actually changed
        const existingStep = stepsRef.current[index];
        if (!existingStep ||
            existingStep.element !== element ||
            existingStep.title !== stepData.title ||
            existingStep.content !== stepData.content) {

            stepsRef.current[index] = { element, ...stepData };
        }
    }, []);

    const startTour = () => {
        // Filter out undefined slots and get actual steps
        const actualSteps = stepsRef.current.filter(step => step !== undefined);
        if (actualSteps.length === 0) {
            console.warn("No tour steps registered");
            return;
        }
        setIsRunning(true);
        setCurrentStep(0);
    };

    const nextStep = () => {
        const totalSteps = stepsRef.current.filter(step => step !== undefined).length;
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const endTour = () => {
        setIsRunning(false);
        setCurrentStep(0);
    };

    const value = {
        isRunning,
        currentStep,
        steps: stepsRef.current,
        registerStep,
        startTour,
        nextStep,
        prevStep,
        endTour,
        currentStepData: stepsRef.current[currentStep]
    };

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};