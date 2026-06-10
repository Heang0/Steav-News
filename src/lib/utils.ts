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

  // Optimize for Cloudinary if it's a Cloudinary URL
  if (absoluteUrl.includes('cloudinary.com')) {
    return absoluteUrl.replace('/upload/', '/upload/c_fill,w_1200,h_630,f_auto/q_auto/');
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
    options.crop ? `c_${options.crop}` : 'c_fill',
    options.width ? `w_${options.width}` : '',
    options.height ? `h_${options.height}` : '',
    options.quality ? `q_${options.quality}` : 'q_auto',
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

export const CATEGORY_SLUG_TO_KHMER: Record<string, string> = {
  'entertainment': 'កម្សាន្ត',
  'society': 'សង្គម',
  'love': 'ស្នេហា',
  'world': 'ពិភពលោក',
};

export const KHMER_TO_CATEGORY_SLUG: Record<string, string> = {
  'កម្សាន្ត': 'entertainment',
  'សង្គម': 'society',
  'ស្នេហា': 'love',
  'ពិភពលោក': 'world',
};

export function getCategorySlug(khmerCategory: string): string {
  return KHMER_TO_CATEGORY_SLUG[khmerCategory] || encodeURIComponent(khmerCategory);
}
