import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed countries that can access your site.
// Set ALLOWED_COUNTRIES in Vercel environment variables as a comma-separated list if you want to change this without code deploy.
const ALLOWED_COUNTRIES = process.env.ALLOWED_COUNTRIES
  ? process.env.ALLOWED_COUNTRIES.split(',').map(code => code.trim().toUpperCase()).filter(Boolean)
  : ['KH', 'TH', 'KR', 'JP', 'US'];

// Allow essential bots/crawlers so previews and search indexing still work.
const ALLOWED_BOTS = ['facebookexternalhit', 'facebook', 'telegrambot', 'googlebot', 'bingbot'];

// Suspicious user agents that should be blocked when not a known bot.
const BLOCKED_UA_PATTERNS = ['curl', 'python', 'java/', 'wget', 'bot', 'spider', 'scraper', 'httpclient'];

export function middleware(request: NextRequest) {
  const country = (
    request.headers.get('x-vercel-ip-country') || 
    request.headers.get('x-country') || 
    request.headers.get('x-nf-country') || 
    'UNKNOWN'
  ).toUpperCase();
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const isAllowedBot = ALLOWED_BOTS.some(bot => userAgent.includes(bot));
  if (isAllowedBot) {
    return NextResponse.next();
  }

  const isSuspiciousUa = BLOCKED_UA_PATTERNS.some(pattern => userAgent.includes(pattern));
  if (isSuspiciousUa) {
    return new NextResponse('Request blocked.', { status: 403 });
  }

  if (!ALLOWED_COUNTRIES.includes(country)) {
    return new NextResponse(
      'Access restricted. Steav News is currently optimized for selected regions.',
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/a/:path*', '/article/:path*', '/api/:path*'],
};
