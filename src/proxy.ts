import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// Allow essential bots/crawlers so previews and search indexing still work.
const ALLOWED_BOTS = ['facebookexternalhit', 'facebook', 'telegrambot', 'googlebot', 'bingbot'];

// Suspicious user agents that should be blocked when not a known bot.
const BLOCKED_UA_PATTERNS = ['curl', 'python', 'java/', 'wget', 'bot', 'spider', 'scraper', 'httpclient'];

export function proxy(request: NextRequest) {

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


  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/articles/:path*', '/article/:path*', '/api/:path*'],
};
