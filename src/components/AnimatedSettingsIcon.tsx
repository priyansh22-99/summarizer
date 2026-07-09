import Lottie from 'lottie-react';
import { useRef, useState, useEffect } from 'react';

interface AnimatedSettingsIconProps {
    className?: string;
    isActive?: boolean;
}

export function AnimatedSettingsIcon({ className = '', isActive = false }: AnimatedSettingsIconProps) {
    const lottieRef = useRef<any>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [animationData, setAnimationData] = useState<any>(null);

    // Load animation data from public folder
    useEffect(() => {
        fetch('/animations/settings.json')
            .then(response => response.json())
            .then(data => setAnimationData(data))
            .catch(error => console.error('Error loading animation:', error));
    }, []);

    // Play animation on hover or when active
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (lottieRef.current) {
            lottieRef.current.setDirection(1);
            lottieRef.current.play();
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    if (!animationData) {
        // Show a simple loading placeholder
        return <div className={className} style={{ width: '100%', height: '100%' }} />;
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
                loop={isActive || isHovered}
                autoplay={isActive}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
