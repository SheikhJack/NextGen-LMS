'use client';

import Lottie from 'react-lottie-player';
import lottieJson from '@/components/animations/animation.json';

function Loader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Lottie
                play
                loop
                animationData={lottieJson}
                style={{ height: '150px', width: '150px'}}
            />
        </div >
    );
}
export default Loader;