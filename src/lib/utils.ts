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
  if (!imagePath) return `${getSiteUrl()}/uploads/images/favicon.jpg`;
  if (imagePath.startsWith('http')) return imagePath;
  const siteUrl = getSiteUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  if (cleanPath.startsWith('/uploads')) {
    return `${siteUrl}${cleanPath}`;
  }
  return `${siteUrl}/uploads${cleanPath}`;
}

export function getFacebookOptimizedImageUrl(url: string): string {
  if (!url) return buildImageUrl('');
  
  let absoluteUrl = url;
  if (!url.startsWith('http')) {
    absoluteUrl = buildImageUrl(url);
  }

  // Cloudinary optimization for Facebook (1200x630 is the standard)
  if (absoluteUrl.includes('cloudinary.com')) {
    // Ensure we use a compatible format (jpg) and extension for better scraper support
    return absoluteUrl
      .replace('/upload/', '/upload/w_1200,h_630,c_fill,q_auto:best,f_jpg/')
      .replace(/\.[^/.]+$/, '.jpg');
  }
  return absoluteUrl;
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
    `q_${options.quality || 'auto:best'}`, // Upgraded from auto:good to auto:best for maximum quality
    'f_auto',
  ].filter(Boolean);

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}

export function shouldBypassNextImageOptimization(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  // Always fallback to the custom domain as the primary choice
  return 'https://steavnews.site';
}

export const CATEGORIES = ['កម្សាន្ត', 'សង្គម', 'ស្នេហា', 'ពិភពលោក'];
