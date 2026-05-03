import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed countries (KH = Cambodia, TH = Thailand, KR = Korea, JP = Japan, US = USA)
const ALLOWED_COUNTRIES = ['KH', 'TH', 'KR', 'JP', 'US'];

// List of allowed bots/social crawlers (so FB sharing still works)
const ALLOWED_BOTS = ['facebookexternalhit', 'facebook', 'telegrambot', 'googlebot', 'bingbot'];

export function middleware(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // 1. ALWAYS Allow Localhost (for your development)
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // 2. ALWAYS Allow Social Media Crawlers & Search Engines
  const isBot = ALLOWED_BOTS.some(bot => userAgent.includes(bot));
  if (isBot) {
    return NextResponse.next();
  }

  // 3. ALLOW Specific Countries
  if (ALLOWED_COUNTRIES.includes(country)) {
    return NextResponse.next();
  }

  // 4. BLOCK everyone else (Redirect to a simple "Not Available" or just block)
  // For now, let's just let them in if we aren't sure (to avoid blocking legit users), 
  // but you can change this to block if the CPU stays high.
  
  // If you want to BE STRICT and block everything else, uncomment the lines below:
  /*
  if (country !== 'unknown' && !ALLOWED_COUNTRIES.includes(country)) {
     return new NextResponse('Access restricted to your region.', { status: 403 });
  }
  */

  return NextResponse.next();
}

// Only run middleware on article pages and home page (where traffic is high)
export const config = {
  matcher: [
    '/',
    '/a/:path*',
    '/article/:path*',
    '/api/:path*',
  ],
};
