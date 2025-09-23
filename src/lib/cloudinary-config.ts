import { Cloudinary } from '@cloudinary/url-gen';

// Client-side configuration
export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

// You might want to add this to your .env.local as well:
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name