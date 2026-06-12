import type { Metadata } from 'next';
import Script from 'next/script';
import '@/app/globals.css';
import { getSiteUrl } from '@/lib/utils';

import { getDb } from '@/lib/mongodb';

export async function generateMetadata(): Promise<Metadata> {
  let siteTitle = 'STEAV NEWS';
  let defaultSeoDescription = 'Read the latest news from STEAV NEWS - Cambodia\'s trusted news source';
  
  try {
    const db = await getDb();
    const settings = await db.collection('settings').findOne({ _id: 'global' as any });
    if (settings) {
      siteTitle = settings.siteTitle || siteTitle;
      defaultSeoDescription = settings.defaultSeoDescription || defaultSeoDescription;
    }
  } catch (err) {
    console.error('Failed to fetch global settings for metadata:', err);
  }

  return {
    title: {
      default: siteTitle,
      template: `%s - ${siteTitle}`,
    },
    description: defaultSeoDescription,
    keywords: ['news', 'cambodia', 'entertainment', 'society', 'sports', 'world', 'kpop'],
    authors: [{ name: siteTitle }],
    creator: siteTitle,
    publisher: siteTitle,
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'km_KH',
      siteName: siteTitle,
      url: getSiteUrl(),
      images: [
        {
          url: '/uploads/images/banner1.jpg',
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    facebook: {
      appId: '966242223397117',
    },
    twitter: {
      card: 'summary_large_image',
    },
    icons: {
      icon: '/uploads/images/LOGO.jpg',
    },
    verification: {
      google: 'your-google-verification-id',
      other: {
        'msvalidate.01': '63DE1EBAADD223E17DB668D905F5AE56',
        'google-adsense-account': 'ca-pub-6134759270953813',
      },
    },
  };
}

import ScrollToTop from '@/components/ScrollToTop';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Noto+Sans+Khmer:wght@400;700&family=Moul&family=Koulen&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6134759270953813"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Facebook Page Link for News Integrity */}
        <meta property="article:publisher" content="https://www.facebook.com/steavnews" />
        <meta property="fb:pages" content="111592210211644" />
        {/* Global Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'STEAV NEWS',
              url: 'https://steavnews.site/',
              publisher: {
                '@type': 'Organization',
                name: 'STEAV NEWS',
                sameAs: ['https://www.facebook.com/steavnews']
              }
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
