import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import LatestArticlesSection from '@/components/LatestArticlesSection';
import CategorySpotlights from '@/components/CategorySpotlights';
import ArticleCard from '@/components/ArticleCard';
import VideoNewsSection from '@/components/VideoNewsSection';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import AdPlaceholder from '@/components/AdPlaceholder';
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

  // Fetch top headlines for the big hero section and ticker
  const { articles: headlineArticles } = await getArticleList({ limit: 5, category: null, search: null, page: 1, hasVideo: false });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow bg-white mt-14 sm:mt-16">
        
        {/* BREAKING NEWS TICKER */}
        {!category && !search && currentPage === 1 && headlineArticles.length > 0 && (
          <BreakingNewsTicker articles={headlineArticles} />
        )}

        {/* TOP STORIES HERO SECTION - Premium Look */}
        {!category && !search && currentPage === 1 && headlineArticles.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-200 w-full pt-8 pb-10">
            <div className="container mx-auto px-4 max-w-[1300px]">
              <div className="flex items-center justify-between mb-6 pb-2 border-b-[3px] border-gray-900">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
                  <span className="text-primary mr-2">/</span>ព័ត៌មានលេចធ្លោប្រចាំថ្ងៃ
                </h2>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Trending Now
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Hero Story (Left, Col 8) */}
                <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 lg:pr-8">
                  {headlineArticles[0] && (
                    <ArticleCard article={headlineArticles[0]} variant="bbc-hero" priority={true} />
                  )}
                </div>
                
                {/* Stacked Side Stories (Right, Col 4) */}
                <div className="lg:col-span-4 flex flex-col bg-white h-full">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 border-b border-gray-100 pb-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
                    <span className="mr-2">/</span>ជម្រើសកំពូល
                  </h3>
                  <div className="flex flex-col gap-5">
                    {headlineArticles.slice(1, 5).map((article) => (
                      <ArticleCard key={article._id} article={article} variant="bbc-list" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP AD LEADERBOARD */}
        {(!category && !search && currentPage === 1) && (
          <div className="w-full bg-white py-6 border-b border-gray-100 flex justify-center">
            <AdPlaceholder width="w-[728px] max-w-[95%]" height="h-[90px]" />
          </div>
        )}

        {/* DEDICATED VIDEO NEWS SECTION */}
        {(!category && !search && currentPage === 1) && (
          <VideoNewsSection />
        )}

        <div className="container mx-auto px-4 max-w-[1300px] py-8">
          {/* BOTTOM ROW: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Content Area */}
          <div className="lg:col-span-8 pr-0 lg:pr-6 border-r-0 lg:border-r border-gray-200">
            {(!category && !search && currentPage === 1) ? (
              <CategorySpotlights excludeIds={headlineArticles.map(a => a._id)} />
            ) : (
              <LatestArticlesSection category={category} search={search} page={currentPage} />
            )}
          </div>

          {/* Right: Mostly Viewed & Ads */}
          <div className="lg:col-span-4 flex flex-col gap-8 sticky top-24 self-start">
            <TrendingArticles />
            
            {/* SIDEBAR AD RECTANGLE */}
            <div className="hidden lg:flex justify-center w-full bg-white p-4 border border-gray-100 shadow-sm">
              <AdPlaceholder width="w-[300px]" height="h-[250px]" />
            </div>
          </div>

        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
