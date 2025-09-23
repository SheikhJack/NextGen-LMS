'use client';

import { CldImage } from 'next-cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function CloudinaryImage({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  sizes,
  priority = false 
}: CloudinaryImageProps) {
  const getPublicId = (url: string) => {
    if (!url) return '';
    
    if (url.includes('cloudinary.com')) {
      const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
      return matches ? matches[1] : '';
    }
    
    return '';
  };

  const publicId = getPublicId(src);

  if (!publicId) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width || 800}
      height={height || 400}
      className={className}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      priority={priority}
      format="webp"
      quality="auto"
      crop="fill"
      gravity="auto"
    />
  );
}