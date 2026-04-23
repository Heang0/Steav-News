import { MetadataRoute } from 'next';
import { getDb } from '@/lib/mongodb';
import { getSiteUrl } from '@/lib/utils';
import { getArticlePublicId } from '@/lib/articles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const db = await getDb();
  const articles = await db.collection('articles')
    .find({}, { projection: { _id: 1, publicId: 1, shortId: 1, updatedAt: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .toArray();

  const articleEntries = articles.map((article) => ({
    url: `${baseUrl}/a/${getArticlePublicId(article as any)}`,
    lastModified: article.updatedAt || article.createdAt || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    ...articleEntries,
  ];
}
