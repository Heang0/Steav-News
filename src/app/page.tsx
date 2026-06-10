import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import LatestArticlesSection from '@/components/LatestArticlesSection';
import CategorySpotlights from '@/components/CategorySpotlights';
import ArticleCard from '@/components/ArticleCard';
import { getArticleList } from '@/lib/article-queries';

export const revalidate = 300; // Refresh every 5 minutes

export const metadata: Metadata = {
  title: 'STEAV NEWS - ទំព័រដើម',
  description: 'Read the latest news from STEAV NEWS - Cambodia\'s trusted news source',
  keywords: ['news', 'cambodia', 'kpop', 'entertainment', 'society', 'sports', 'world'],
  openGraph: {
    title: 'STEAV NEWS',
    description: 'Read the latest news from STEAV NEWS',
    type: 'website',
    siteName: 'STEAV NEWS',
    url: 'https://steavnews.site/',
    images: [{ url: '/uploads/images/banner1.jpg', width: 1200, height: 630, alt: 'STEAV NEWS' }],
  },
  twitter: { card: 'summary_large_image', title: 'STEAV NEWS', description: 'Read the latest news from STEAV NEWS' },
  robots: { index: true, follow: true },
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

  // Fetch top headlines for the big hero section
  const { articles: headlineArticles } = await getArticleList({ limit: 5, category: null, search: null, page: 1 });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 max-w-[1300px] py-6 bg-white mt-20 sm:mt-24">
        
        {/* BBC TOP STORIES GRID */}
        {!category && !search && currentPage === 1 && headlineArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-[3px] border-gray-900" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
              <span className="text-primary mr-2">/</span>ព័ត៌មានលេចធ្លោ
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-b border-gray-200 pb-8">
              {/* Main Hero Story */}
              <div className="lg:col-span-8 pr-0 lg:pr-6 lg:border-r border-gray-200">
                {headlineArticles[0] && (
                  <ArticleCard article={headlineArticles[0]} variant="bbc-hero" />
                )}
              </div>
              
              {/* Stacked Side Stories */}
              <div className="lg:col-span-4 flex flex-col">
                {headlineArticles.slice(1).map((article) => (
                  <ArticleCard key={article._id} article={article} variant="bbc-list" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ROW: BBC Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Content Area */}
          <div className="lg:col-span-8 pr-0 lg:pr-6 border-r-0 lg:border-r border-gray-200">
            {(!category && !search && currentPage === 1) ? (
              <CategorySpotlights excludeIds={headlineArticles.map(a => a._id)} />
            ) : (
              <LatestArticlesSection category={category} search={search} page={currentPage} />
            )}
          </div>

          {/* Right: Mostly Viewed */}
          <div className="lg:col-span-4">
            <TrendingArticles />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
