import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

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

    const count = await newsCollection.countDocuments(query);
    return NextResponse.json({ count });
  } catch (err) {
    console.error('Error fetching article count:', err);
    return NextResponse.json(
      { error: 'Failed to fetch article count' },
      { status: 500 }
    );
  }
}
