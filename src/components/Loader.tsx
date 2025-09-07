// components/Loader.tsx
'use client';

import { Spin } from 'antd';
import type { SpinProps } from 'antd';

interface LoaderProps extends SpinProps {
    fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullscreen = false, ...props }) => {
    if (fullscreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                backgroundColor: 'transparent', 
            }}>
                <Spin {...props}  />
            </div>
        );
    }

    return <Spin {...props} />;
};

export default Loader;