import { getDb } from '@/lib/mongodb';
import { serializeArticle } from '@/lib/articles';
import { CATEGORIES } from '@/lib/utils';
import { Article } from '@/types';

interface ArticleListOptions {
  category?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
}

function buildArticleQuery({ category, search }: Pick<ArticleListOptions, 'category' | 'search'>) {
  const query: Record<string, unknown> = {};
  const processedSearch = search?.trim() || '';

  if (processedSearch) {
    query.$or = [
      { title: { $regex: processedSearch, $options: 'i' } },
      { content: { $regex: processedSearch, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  return query;
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  const db = await getDb();
  const newsCollection = db.collection('articles');

  const articles = await newsCollection
    .find({ trending: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return articles.map(serializeArticle);
}

export async function getCategorySpotlights(): Promise<Article[]> {
  const db = await getDb();
  const newsCollection = db.collection('articles');

  const articles = await Promise.all(
    CATEGORIES.map((category) =>
      newsCollection.findOne(
        { category },
        { sort: { createdAt: -1 } }
      )
    )
  );

  return articles.filter(Boolean).map(serializeArticle);
}

export async function getArticleList({
  category,
  search,
  page = 1,
  limit = 6,
}: ArticleListOptions = {}) {
  const currentPage = Math.max(1, page);
  const articlesPerPage = Math.max(1, limit);
  const offset = (currentPage - 1) * articlesPerPage;
  const query = buildArticleQuery({ category, search });

  const db = await getDb();
  const newsCollection = db.collection('articles');

  const [articles, totalArticles] = await Promise.all([
    newsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(articlesPerPage)
      .toArray(),
    newsCollection.countDocuments(query),
  ]);

  return {
    articles: articles.map(serializeArticle),
    totalArticles,
    totalPages: Math.max(1, Math.ceil(totalArticles / articlesPerPage)),
    currentPage,
  };
}
