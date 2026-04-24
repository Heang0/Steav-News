import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { escapeHtml, stripHtml, getFacebookOptimizedImageUrl, getSiteUrl } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingArticles from '@/components/TrendingArticles';
import ArticleContent from '@/components/ArticleContent';
import RelatedArticles from '@/components/RelatedArticles';
import {
  findArticleByIdentifier,
  findAndIncrementArticleByIdentifier,
  getArticlePublicId,
  getRelatedArticles,
  serializeArticle,
} from '@/lib/articles';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');
    const article = await findArticleByIdentifier(newsCollection, id);

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
    const articleUrl = `${getSiteUrl()}/a/${getArticlePublicId(article)}`;

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
            secureUrl: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
          },
        ],
        url: articleUrl,
      },
      facebook: {
        appId: '966242223397117', // Common placeholder or user's app ID if available
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
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

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;

  console.log('Article lookup - ID:', id);

  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');
    const article: any = await findAndIncrementArticleByIdentifier(newsCollection, id);

    if (!article) {
      console.error('Article not found:', id);
      notFound();
    }

    if (article.publicId === id.toLowerCase()) {
      console.log('Found by publicId:', id, '->', article?.title?.substring(0, 50) || 'Unknown Title');
    } else if (article.shortId === id) {
      console.log('Found by shortId:', id, '->', article?.title?.substring(0, 50) || 'Unknown Title');
    } else {
      console.log('Found by ObjectId:', id, '->', article?.title?.substring(0, 50) || 'Unknown Title');
    }

    const serializedArticle = serializeArticle(article);
    const relatedArticles = await getRelatedArticles(newsCollection, article, 6);

    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* JSON-LD Structured Data for NewsArticle */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: serializedArticle.title,
              image: [serializedArticle.image],
              datePublished: (serializedArticle as any).createdAt || (serializedArticle as any).date,
              dateModified: (serializedArticle as any).updatedAt || (serializedArticle as any).createdAt || (serializedArticle as any).date,
              author: [
                {
                  '@type': 'Organization',
                  name: 'STEAV NEWS',
                  url: getSiteUrl(),
                },
              ],
            }),
          }}
        />

        <main className="flex-grow pt-[60px] sm:pt-[65px] md:pt-[70px]">
          <div className="article-page container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-[1300px]">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
              <div className="article-main-content-wrapper flex-1 min-w-0">
                <ArticleContent article={serializedArticle} />
                <RelatedArticles articles={relatedArticles} />
              </div>

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
