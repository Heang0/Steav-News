import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn('Cloudinary credentials missing - image uploads will fail if used.');
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

    if (buffer.length <= TARGET_IMAGE_SIZE_BYTES) {
      return buffer;
    }

    const useWebp = mimeType === 'image/png' || Boolean(metadata.hasAlpha);
    const widths = useWebp ? GRAPHIC_WIDTH_STEPS : PHOTO_WIDTH_STEPS;
    const qualities = useWebp ? GRAPHIC_QUALITY_STEPS : PHOTO_QUALITY_STEPS;

    let bestBuffer = buffer;

    for (const width of widths) {
      const boundedWidth = Math.min(width, MAX_IMAGE_DIMENSION);

      for (const quality of qualities) {
        const pipeline = sharp(buffer)
          .rotate()
          .resize({
            width: boundedWidth,
            height: boundedWidth,
            fit: 'inside',
            withoutEnlargement: true,
          });

        const candidate = useWebp
          ? await pipeline
              .webp({ quality, alphaQuality: quality, effort: 6 })
              .toBuffer()
          : await pipeline
              .jpeg({ quality, mozjpeg: true, progressive: true })
              .toBuffer();

        if (candidate.length < bestBuffer.length) {
          bestBuffer = candidate;
        }

        if (candidate.length <= TARGET_IMAGE_SIZE_BYTES) {
          return candidate;
        }
      }
    }

    return bestBuffer;
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

export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType?: string,
  originalName = 'upload'
): Promise<{ url: string; fileId: string; name: string }> {
  const optimizedBuffer = await optimizeImageBuffer(buffer, mimeType);
  const extension = getFileExtension(mimeType);
  const fileName = `${sanitizeFileName(originalName)}-${Date.now()}-${uuidv4()}`;

  return new Promise((resolve, reject) => {
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
}

export default cloudinary;
