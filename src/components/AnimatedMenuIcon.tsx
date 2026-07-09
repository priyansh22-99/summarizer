import Lottie from 'lottie-react';
import { useRef, useState, useEffect } from 'react';

interface AnimatedMenuIconProps {
    animationPath: string;
    isActive: boolean;
    className?: string;
}

export function AnimatedMenuIcon({ animationPath, isActive, className = '' }: AnimatedMenuIconProps) {
    const lottieRef = useRef<any>(null);
    const [animationData, setAnimationData] = useState<any>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Load animation data
    useEffect(() => {
        fetch(animationPath)
            .then(response => response.json())
            .then(data => setAnimationData(data))
            .catch(error => console.error('Error loading animation:', error));
    }, [animationPath]);

    // Control animation based on active state and hover
    useEffect(() => {
        if (lottieRef.current && animationData) {
            if (isActive) {
                lottieRef.current.setDirection(1);
                lottieRef.current.play();
            } else if (isHovered) {
                lottieRef.current.setDirection(1);
                lottieRef.current.play();
            }
        }
    }, [isActive, isHovered, animationData]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    if (!animationData) {
        return <div className={className} style={{ width: '20px', height: '20px' }} />;
    }

    return (
        <div
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={isActive}
                autoplay={false}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
