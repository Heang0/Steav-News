import { NextRequest, NextResponse } from 'next/server';
import { uploadImageBuffer } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch Facebook page using Facebook's crawler User-Agent
    const fbRes = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      },
    });

    if (!fbRes.ok) {
      throw new Error(`Facebook responded with status ${fbRes.status}`);
    }

    const html = await fbRes.text();
    const finalUrl = fbRes.url;

    // Try to extract canonical video ID to fix Facebook Share URLs that don't embed
    let videoId = null;
    const reelMatch = finalUrl.match(/\/reel\/(\d+)/);
    const videoMatch = finalUrl.match(/\/videos\/(\d+)/);
    const watchMatch = finalUrl.match(/v=(\d+)/);
    if (reelMatch) videoId = reelMatch[1];
    else if (videoMatch) videoId = videoMatch[1];
    else if (watchMatch) videoId = watchMatch[1];

    let resolvedUrl = url;
    if (videoId) {
      resolvedUrl = `https://www.facebook.com/watch/?v=${videoId}`;
    }

    // 2. Extract og:image
    const match = html.match(/<meta property="og:image" content="([^"]+)"/i);
    let ogImageUrl = match ? match[1] : null;

    if (!ogImageUrl) {
      return NextResponse.json({ error: 'No thumbnail found on this Facebook link.' }, { status: 404 });
    }

    // Replace HTML entities
    ogImageUrl = ogImageUrl.replace(/&amp;/g, '&');

    // 3. Download the image
    const imgRes = await fetch(ogImageUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to download image from Facebook CDN (Status: ${imgRes.status})`);
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

    // 4. Upload to Cloudinary
    const uploadResult = await uploadImageBuffer(buffer, contentType, 'fb-video-thumbnail');

    return NextResponse.json({ 
      success: true, 
      thumbnailUrl: uploadResult.url,
      resolvedUrl
    });

  } catch (error) {
    console.error('FB Scrape Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
