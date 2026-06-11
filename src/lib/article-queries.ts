import { getDb } from '@/lib/mongodb';
import { serializeArticle } from '@/lib/articles';
import { CATEGORIES } from '@/lib/utils';
import { Article } from '@/types';

interface ArticleListOptions {
  category?: string | null;
  search?: string | null;
  page?: number;
  limit?: number;
  excludeId?: string;
  authorId?: string;
  hasVideo?: boolean;
}

function buildArticleQuery({ category, search, excludeId, authorId, hasVideo }: Pick<ArticleListOptions, 'category' | 'search' | 'excludeId' | 'authorId' | 'hasVideo'>) {
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

  if (excludeId) {
    const { ObjectId } = require('mongodb');
    query._id = { $ne: ObjectId.isValid(excludeId) ? new ObjectId(excludeId) : excludeId };
  }

  if (authorId) {
    query.authorId = authorId;
  }

  if (hasVideo === true) {
    query.facebookVideoUrl = { $exists: true, $ne: '' };
  } else if (hasVideo === false) {
    query.$or = [
      { facebookVideoUrl: { $exists: false } },
      { facebookVideoUrl: '' }
    ];
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

export async function getCategorySpotlights(excludeIds?: string[]): Promise<Article[]> {
  const db = await getDb();
  const newsCollection = db.collection('articles');
  const categoriesCollection = db.collection('categories');

  const { ObjectId } = require('mongodb');
  const excludeObjectIds = (excludeIds || []).map(id => ObjectId.isValid(id) ? new ObjectId(id) : id);

  const categoriesDb = await categoriesCollection.find({}).sort({ createdAt: -1 }).toArray();
  const categoryNames = categoriesDb.length > 0 ? categoriesDb.map(c => c.name) : CATEGORIES;

  const articles = await Promise.all(
    categoryNames.map((category) =>
      newsCollection.findOne(
        { 
          category,
          ...(excludeObjectIds.length > 0 ? { _id: { $nin: excludeObjectIds } } : {})
        },
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
  excludeId,
  authorId,
  hasVideo,
}: ArticleListOptions = {}) {
  const currentPage = Math.max(1, page);
  const articlesPerPage = Math.max(1, limit);
  const offset = (currentPage - 1) * articlesPerPage;
  const query = buildArticleQuery({ category, search, excludeId, authorId, hasVideo });

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
