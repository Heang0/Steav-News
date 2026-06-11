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
    timeZone: 'Asia/Phnom_Penh'
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

export function getFacebookOptimizedImageUrl(url: string, applyWatermark?: boolean): string {
  if (!url) return buildImageUrl('');
  
  let absoluteUrl = url;
  if (!url.startsWith('http')) {
    absoluteUrl = buildImageUrl(url);
  }

  // Optimize for Cloudinary if it's a Cloudinary URL
  if (absoluteUrl.includes('cloudinary.com')) {
    const watermarkTransform = applyWatermark ? '/l_steav_news_watermark,w_1.0,h_1.0,c_scale,fl_relative/fl_layer_apply' : '';
    // Use q_auto:best for maximum clarity on Facebook shares
    return absoluteUrl.replace('/upload/', `/upload/c_fill,w_1200,h_630${watermarkTransform}/f_auto,q_auto:best/`);
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
    applyWatermark?: boolean;
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    if (url === '/images/default_og_image.jpg') {
      return '/uploads/images/LOGO.jpg';
    }
    return url;
  }

  // Step 1: Standardize base canvas to 1200x630 for consistent templating
  const baseScale = 'c_fill,w_1200,h_630';

  // Step 2: Inject the transparent watermark/template
  const watermarkTransform = options.applyWatermark ? '/l_steav_news_watermark,w_1.0,h_1.0,c_scale,fl_relative/fl_layer_apply' : '';

  // Step 4: Scale down to the actually requested device size
  let finalScale = '';
  if (options.width || options.height) {
    const scaleParams = [
      options.crop ? `c_${options.crop}` : 'c_scale',
      options.width ? `w_${options.width}` : '',
      options.height ? `h_${options.height}` : '',
    ].filter(Boolean);
    finalScale = `/${scaleParams.join(',')}`;
  }

  // Step 5: Format and Quality
  const formatTransform = `/q_${options.quality || 'auto'},f_auto`;

  if (options.applyWatermark) {
    return url.replace('/upload/', `/upload/${baseScale}${watermarkTransform}${finalScale}${formatTransform}/`);
  } else {
    // If no watermark is applied, just do standard scaling without forcing 1200x630 base canvas
    return url.replace('/upload/', `/upload${finalScale}${formatTransform}/`);
  }
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

export const CATEGORIES = ['កម្សាន្ត', 'សង្គម', 'ស្នេហា', 'ពិភពលោក', 'វីដេអូ'];

export const CATEGORY_SLUG_TO_KHMER: Record<string, string> = {
  'entertainment': 'កម្សាន្ត',
  'society': 'សង្គម',
  'love': 'ស្នេហា',
  'world': 'ពិភពលោក',
  'videos': 'វីដេអូ',
};

export const KHMER_TO_CATEGORY_SLUG: Record<string, string> = {
  'កម្សាន្ត': 'entertainment',
  'សង្គម': 'society',
  'ស្នេហា': 'love',
  'ពិភពលោក': 'world',
  'វីដេអូ': 'videos',
};

export function getCategorySlug(khmerCategory: string): string {
  return KHMER_TO_CATEGORY_SLUG[khmerCategory] || encodeURIComponent(khmerCategory);
}
