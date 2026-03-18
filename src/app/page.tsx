import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import SearchBar from '@/components/SearchBar';
import TrendingArticles from '@/components/TrendingArticles';
import CategorySpotlightsSection from '@/components/CategorySpotlightsSection';
import LatestArticlesSection from '@/components/LatestArticlesSection';

export const metadata: Metadata = {
  title: 'STEAV NEWS - ទំព័រដើម',
  description: 'Read the latest news from STEAV NEWS - Cambodia\'s trusted news source',
  keywords: ['news', 'cambodia', 'kpop', 'entertainment', 'society', 'sports', 'world'],
  openGraph: {
    title: 'STEAV NEWS',
    description: 'Read the latest news from STEAV NEWS',
    type: 'website',
    siteName: 'STEAV NEWS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STEAV NEWS',
    description: 'Read the latest news from STEAV NEWS',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface HomeProps {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category || null;
  const search = resolvedSearchParams.search || null;
  const page = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <Carousel />

        <SearchBar />

        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-8 max-w-[1300px]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 min-w-0">
              {/* Category Spotlights */}
              <CategorySpotlightsSection category={category} search={search} />

              {/* Latest Articles */}
              <LatestArticlesSection category={category} search={search} page={currentPage} />
            </div>

            {/* Trending Sidebar - Right Column */}
            <div className="lg:col-span-1">
              <TrendingArticles />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
