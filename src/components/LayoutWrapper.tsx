// components/LayoutWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import Loader from "@/components/Loader";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 6000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {loading && <Loader
                fullscreen
                size="large"
                tip="Loading..."
            />}
            {!loading && children}
        </>
    );
}