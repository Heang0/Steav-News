import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('Please add your Cloudinary credentials to .env.local');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const commonCloudinaryParams = {
  folder: 'steav_news',
  upload_preset: 'steav_news',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  quality: 'auto:good',
  fetch_format: 'auto' as const,
};
