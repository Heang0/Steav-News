import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

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
  resource_type: 'image' as const,
};

const MAX_IMAGE_DIMENSION = 1600;
const TARGET_IMAGE_SIZE_BYTES = 70 * 1024;
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

    // Keep animated images untouched so uploads do not lose frames.
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
              .webp({
                quality,
                alphaQuality: quality,
                effort: 6,
              })
              .toBuffer()
          : await pipeline
              .jpeg({
                quality,
                mozjpeg: true,
                progressive: true,
              })
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
