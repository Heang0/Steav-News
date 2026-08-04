import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn('Cloudinary credentials missing - image uploads will fallback to local storage.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const CLOUDINARY_FOLDER = 'steav_news';
const MAX_IMAGE_DIMENSION = 1600;
const TARGET_IMAGE_SIZE_BYTES = 90 * 1024;
const PHOTO_WIDTH_STEPS = [1600, 1440, 1280, 1120, 960, 840, 720];
const PHOTO_QUALITY_STEPS = [82, 76, 70, 64, 58, 54];
const GRAPHIC_WIDTH_STEPS = [1400, 1200, 1080, 960, 840, 720, 640];
const GRAPHIC_QUALITY_STEPS = [84, 78, 72, 66, 60, 54];

export async function optimizeImageBuffer(
  buffer: Buffer,
  mimeType?: string
): Promise<Buffer> {
  try {
    if (mimeType === 'image/gif') {
      return buffer;
    }

    const metadata = await sharp(buffer, { animated: true }).metadata();

    if ((metadata.pages ?? 1) > 1) {
      return buffer;
    }

    // Fast 1-pass optimization: Max 1200px width/height, WebP/JPEG quality 80 (Fast <0.2s processing time)
    const useWebp = mimeType === 'image/png' || Boolean(metadata.hasAlpha) || mimeType === 'image/webp';
    const pipeline = sharp(buffer)
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      });

    const optimized = useWebp
      ? await pipeline
          .webp({ quality: 80, effort: 4 })
          .toBuffer()
      : await pipeline
          .jpeg({ quality: 80, mozjpeg: true, progressive: true })
          .toBuffer();

    return optimized.length < buffer.length ? optimized : buffer;
  } catch (error) {
    console.error('Error optimizing upload image:', error);
    return buffer;
  }
}

function getFileExtension(mimeType?: string): string {
  if (!mimeType) return 'jpg';
  if (mimeType === 'image/gif') return 'gif';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/png') return 'webp';
  if (mimeType === 'image/svg+xml') return 'svg';
  return 'jpg';
}

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9-_\.]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'image';
}

async function uploadToLocalStorage(
  optimizedBuffer: Buffer,
  extension: string,
  fileName: string
): Promise<{ url: string; fileId: string; name: string }> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'images');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fullFileName = `${fileName}.${extension}`;
  const filePath = path.join(uploadsDir, fullFileName);
  await fs.promises.writeFile(filePath, optimizedBuffer);

  const localUrl = `/uploads/images/${fullFileName}`;
  return {
    url: localUrl,
    fileId: fullFileName,
    name: fullFileName,
  };
}

export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType?: string,
  originalName = 'upload'
): Promise<{ url: string; fileId: string; name: string }> {
  const optimizedBuffer = await optimizeImageBuffer(buffer, mimeType);
  const extension = getFileExtension(mimeType);
  const fileName = `${sanitizeFileName(originalName)}-${Date.now()}-${uuidv4()}`;

  // If STORAGE_TYPE is set to 'local' or Cloudinary is not configured, save locally
  if (
    process.env.STORAGE_TYPE === 'local' ||
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return uploadToLocalStorage(optimizedBuffer, extension, fileName);
  }

  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          public_id: fileName,
          resource_type: 'auto',
          format: extension === 'gif' || extension === 'svg' ? undefined : extension,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result?.secure_url || '',
              fileId: result?.public_id || '',
              name: result?.original_filename || '',
            });
          }
        }
      );
      uploadStream.end(optimizedBuffer);
    });
  } catch (err) {
    console.warn('Cloudinary upload failed, falling back to local storage:', err);
    return uploadToLocalStorage(optimizedBuffer, extension, fileName);
  }
}

export default cloudinary;
