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

  if (absoluteUrl.includes('imagekit.io')) {
    const [base, query] = absoluteUrl.split('?');
    const queryString = query ? `${query}&` : '';
    return `${base}?${queryString}tr=w-1200,h-630,fo-auto`;
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
  if (!url || !url.includes('imagekit.io')) {
    return url;
  }

  const transforms = [
    options.width ? `w-${options.width}` : '',
    options.height ? `h-${options.height}` : '',
    options.crop ? `c-${options.crop}` : '',
    options.quality ? `q-${options.quality}` : 'q-70',
    'fo-auto',
  ].filter(Boolean);

  const [base, query] = url.split('?');
  const queryString = query ? `${query}&` : '';
  return `${base}?${queryString}tr=${transforms.join(',')}`;
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
