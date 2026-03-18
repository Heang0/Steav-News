import { Article } from '@/types';
import { ObjectId } from 'mongodb';

const PUBLIC_ID_LENGTH = 8;

export function buildArticlePublicId(value: string | ObjectId): string {
  const normalized = value instanceof ObjectId ? value.toString() : String(value);
  return normalized.slice(-PUBLIC_ID_LENGTH).toLowerCase();
}

export function getArticlePublicId(article: any): string {
  if (article?.publicId) {
    return String(article.publicId).toLowerCase();
  }

  if (!article?._id) {
    return '';
  }

  return buildArticlePublicId(article._id);
}

export function serializeArticle(article: any): Article {
  return {
    _id: article._id ? article._id.toString() : '',
    shortId: article.shortId || '',
    publicId: getArticlePublicId(article),
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

export async function getNextShortId(newsCollection: any): Promise<string> {
  const latestArticle = await newsCollection.findOne(
    { shortId: { $regex: '^[0-9]+$' } },
    {
      sort: { shortId: -1 },
      projection: { shortId: 1 },
    }
  );

  let nextNumber = latestArticle?.shortId
    ? Number.parseInt(latestArticle.shortId, 10) + 1
    : 1;

  let shortId = String(nextNumber).padStart(4, '0');

  // Guard against collisions from existing bad data.
  while (await newsCollection.findOne({ shortId }, { projection: { _id: 1 } })) {
    nextNumber += 1;
    shortId = String(nextNumber).padStart(4, '0');
  }

  return shortId;
}

export async function findArticleByIdentifier(newsCollection: any, id: string) {
  const normalizedId = id.trim().toLowerCase();

  let article = await newsCollection.findOne({ publicId: normalizedId });
  if (article) {
    return article;
  }

  article = await newsCollection.findOne(
    { shortId: id },
    { sort: { createdAt: -1, _id: -1 } }
  );
  if (article) {
    return article;
  }

  if (/^[a-f0-9]{8}$/i.test(normalizedId)) {
    article = await newsCollection.findOne({
      $expr: {
        $eq: [
          { $substrBytes: [{ $toString: '$_id' }, 24 - PUBLIC_ID_LENGTH, PUBLIC_ID_LENGTH] },
          normalizedId,
        ],
      },
    });
    if (article) {
      return article;
    }
  }

  if (ObjectId.isValid(id)) {
    return newsCollection.findOne({ _id: new ObjectId(id) });
  }

  return null;
}

export async function findAndIncrementArticleByIdentifier(newsCollection: any, id: string) {
  const article = await findArticleByIdentifier(newsCollection, id);

  if (!article?._id) {
    return null;
  }

  const objectId =
    article._id instanceof ObjectId
      ? article._id
      : new ObjectId(article._id);

  const result = await newsCollection.findOneAndUpdate(
    { _id: objectId },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  );

  return result?.value !== undefined ? result.value : result;
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
