import { Article } from '@/types';
import { ObjectId } from 'mongodb';

export function serializeArticle(article: any): Article {
  return {
    _id: article._id ? article._id.toString() : '',
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
    comments: (article.comments || []).map((comment: any) => ({
      _id: comment._id?.toString() || '',
      author: comment.author || '',
      text: comment.text || '',
      createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
    })),
  };
}

export async function getRelatedArticles(
  newsCollection: any,
  currentArticle: any,
  limit = 3
): Promise<Article[]> {
  if (!currentArticle?._id || limit <= 0) {
    return [];
  }

  const currentId =
    currentArticle._id instanceof ObjectId
      ? currentArticle._id
      : ObjectId.isValid(currentArticle._id)
        ? new ObjectId(currentArticle._id)
        : currentArticle._id;

  const relatedArticles = await newsCollection
    .find({
      _id: { $ne: currentId },
      ...(currentArticle.category ? { category: currentArticle.category } : {}),
    })
    .sort({ trending: -1, views: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  if (relatedArticles.length >= limit) {
    return relatedArticles.map(serializeArticle);
  }

  const excludedIds = [currentId, ...relatedArticles.map((article: any) => article._id)].filter(Boolean);
  const fallbackArticles = await newsCollection
    .find({
      _id: { $nin: excludedIds },
    })
    .sort({ createdAt: -1 })
    .limit(limit - relatedArticles.length)
    .toArray();

  return [...relatedArticles, ...fallbackArticles].map(serializeArticle);
}
