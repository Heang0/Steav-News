import type { Metadata } from 'next';
import '@/app/globals.css';
import { getSiteUrl } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    default: 'STEAV NEWS',
    template: '%s - STEAV NEWS',
  },
  description: 'Read the latest news from STEAV NEWS - Cambodia\'s trusted news source',
  keywords: ['news', 'cambodia', 'entertainment', 'society', 'sports', 'world', 'kpop'],
  authors: [{ name: 'STEAV NEWS' }],
  creator: 'STEAV NEWS',
  publisher: 'STEAV NEWS',
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    type: 'website',
    locale: 'km_KH',
    siteName: 'STEAV NEWS',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/uploads/images/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Noto+Sans+Khmer:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6134759270953813"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
