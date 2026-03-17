import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import ArticleContent from '@/components/ArticleContent';
import { Article } from '@/types';

type PageProps = {
  params: Promise<{ id: string }>;
};

// Force dynamic rendering - NO CACHING
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Convert MongoDB object to plain object for serialization
function serializeArticle(article: any): Article {
  return {
    _id: article._id.toString(),
    shortId: article.shortId || '',
    title: article.title || '',
    image: article.image || '',
    date: article.date || '',
    content: article.content || '',
    createdAt: article.createdAt instanceof Date ? article.createdAt.toISOString() : article.createdAt,
    trending: article.trending || false,
    likes: article.likes || 0,
    views: article.views || 0,
    category: article.category || '',
    comments: (article.comments || []).map((c: any) => ({
      _id: c._id?.toString() || '',
      author: c.author || '',
      text: c.text || '',
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    })),
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;

  console.log('🔍 Article lookup - ID:', id);

  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');

    let article = null;
    
    // Try to find by shortId first
    article = await newsCollection.findOne({ shortId: id });
    
    if (article) {
      console.log('✅ Found by shortId:', id, '->', article.title.substring(0, 50));
    } else {
      console.log('❌ Not found by shortId, trying ObjectId...');
      // If not found, try ObjectId
      if (ObjectId.isValid(id)) {
        article = await newsCollection.findOne({ _id: new ObjectId(id) });
        if (article) {
          console.log('✅ Found by ObjectId:', id, '->', article.title.substring(0, 50));
        }
      }
    }

    if (!article) {
      console.error('❌ Article not found:', id);
      notFound();
    }

    // Serialize the article to plain object
    const serializedArticle = serializeArticle(article);

    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-[60px] sm:pt-[65px] md:pt-[70px]">
          <div className="article-page container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-[1300px]">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
              {/* Main Article Content */}
              <div className="article-main-content-wrapper flex-1 min-w-0">
                <ArticleContent article={serializedArticle} />
              </div>

              {/* Trending Sidebar */}
              <div className="lg:w-80 xl:w-96 flex-shrink-0">
                <TrendingArticles />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error fetching article:', error);
    notFound();
  }
}
