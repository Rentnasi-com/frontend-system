import { useRef, useEffect } from 'react';
import { useTour } from './TourContext';

const TourStep = ({ children, index, title, content }) => {
    const { registerStep, isRunning, currentStep } = useTour();
    const ref = useRef(null);
    const registeredRef = useRef(false);

    useEffect(() => {
        if (ref.current && !registeredRef.current) {
            registerStep(ref.current, { title, content }, index);
            registeredRef.current = true;
        }
    }, [index, title, content, registerStep]);

    useEffect(() => {
        if (isRunning && currentStep === index && ref.current) {
            ref.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [isRunning, currentStep, index]);

    return <div ref={ref}>{children}</div>;
};

export default TourStep;