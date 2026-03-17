import type { Metadata, ResolvingMetadata } from 'next';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { escapeHtml, stripHtml, formatDate, getFacebookOptimizedImageUrl } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import ArticleContent from '@/components/ArticleContent';
import { Article } from '@/types';

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function generateMetadata(
  { searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await searchParams;

  if (!id) {
    return {
      title: 'Article Not Found - STEAV NEWS',
      description: 'The requested article could not be found.',
    };
  }

  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');

    let article;
    // Try to find by shortId first
    article = await newsCollection.findOne({ shortId: id });

    // If not found, try ObjectId
    if (!article && ObjectId.isValid(id)) {
      article = await newsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!article) {
      return {
        title: 'Article Not Found - STEAV NEWS',
        description: 'The requested article could not be found.',
      };
    }

    const title = escapeHtml(article.title || 'STEAV NEWS');
    const description = escapeHtml(
      stripHtml(article.content || 'Read the latest STEAV NEWS here.').slice(0, 180)
    );
    const imageUrl = getFacebookOptimizedImageUrl(article.image);
    // Always use clean URL for sharing
    const articleUrl = article.shortId
      ? `https://steav-news.onrender.com/a/${article.shortId}`
      : `https://steav-news.onrender.com/a/${article._id}`;

    return {
      title: `${title} - STEAV NEWS`,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        siteName: 'STEAV NEWS',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        url: articleUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'STEAV NEWS',
      description: 'Read the latest news from STEAV NEWS',
    };
  }
}

export default async function ArticlePage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The requested article could not be found.</p>
          <a href="/" className="btn-primary inline-block">
            Go to Home
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');

    let article;
    // Try to find by shortId first
    article = await newsCollection.findOne({ shortId: id });

    // If not found, try ObjectId
    if (!article && ObjectId.isValid(id)) {
      article = await newsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!article) {
      return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The requested article could not be found.</p>
            <a href="/" className="btn-primary inline-block">
              Go to Home
            </a>
          </main>
          <Footer />
        </div>
      );
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
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">Failed to load article.</p>
          <a href="/" className="btn-primary inline-block">
            Go to Home
          </a>
        </main>
        <Footer />
      </div>
    );
  }
}
