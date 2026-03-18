export function escapeHtml(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function stripHtml(html: string = ''): string {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function buildImageUrl(imagePath: string): string {
  if (!imagePath) return '/images/default_og_image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `/uploads${imagePath}`;
}

export function getFacebookOptimizedImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto,f_auto/');
  }
  return url;
}

export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    crop?: 'fill' | 'fit' | 'limit';
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const transforms = [
    options.width ? `w_${options.width}` : '',
    options.height ? `h_${options.height}` : '',
    options.crop ? `c_${options.crop}` : '',
    `q_${options.quality || 'auto:good'}`,
    'f_auto',
  ].filter(Boolean);

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}

export const CATEGORIES = ['កម្សាន្ត', 'សង្គម', 'កីឡា', 'ពិភពលោក'];
