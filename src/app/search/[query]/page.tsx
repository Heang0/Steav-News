import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import LatestArticlesSection from '@/components/LatestArticlesSection';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ query: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);
  return {
    title: `Search: ${decodedQuery} - STEAV NEWS`,
    description: `Search results for ${decodedQuery} on STEAV NEWS`,
  };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);
  const resolvedSearchParams = await searchParams;
  const pageParam = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 max-w-[1300px] py-6 bg-white mt-20 sm:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Search Results */}
          <div className="lg:col-span-8 pr-0 lg:pr-6 border-r-0 lg:border-r border-gray-200">
            <LatestArticlesSection search={decodedQuery} page={currentPage} titleOverride={`លទ្ធផលស្វែងរក: "${decodedQuery}"`} />
          </div>

          {/* Right: Trending */}
          <div className="lg:col-span-4">
            <TrendingArticles />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
