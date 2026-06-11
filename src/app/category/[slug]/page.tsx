import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import LatestArticlesSection from '@/components/LatestArticlesSection';
import { CATEGORY_SLUG_TO_KHMER } from '@/lib/utils';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const khmerCategory = CATEGORY_SLUG_TO_KHMER[slug.toLowerCase()];
  
  if (!khmerCategory) {
    return { title: 'Category Not Found - STEAV NEWS' };
  }

  return {
    title: `${khmerCategory} - STEAV NEWS`,
    description: `Read the latest ${khmerCategory} news from STEAV NEWS`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const khmerCategory = CATEGORY_SLUG_TO_KHMER[slug.toLowerCase()];

  if (!khmerCategory) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 max-w-[1300px] py-6 bg-white mt-14 sm:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Latest Updates */}
          <div className="lg:col-span-8 pr-0 lg:pr-6 border-r-0 lg:border-r border-gray-200">
            <LatestArticlesSection category={khmerCategory} page={currentPage} titleOverride={khmerCategory} />
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
