import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await getDb();
    const newsCollection = db.collection('articles');

    const query: Record<string, unknown> = {};
    const processedSearch = search?.trim() || '';

    if (processedSearch) {
      query.$or = [
        { title: { $regex: processedSearch, $options: 'i' } },
        { content: { $regex: processedSearch, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (tag) query.tags = tag;

    let articlesQuery = newsCollection.find(query).sort({ createdAt: -1 });

    if (limit) articlesQuery = articlesQuery.limit(limit);
    if (offset) articlesQuery = articlesQuery.skip(offset);

    const articles = await articlesQuery.toArray();

    return NextResponse.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
