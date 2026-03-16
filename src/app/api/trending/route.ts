import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');

    const trendingArticles = await newsCollection
      .find({ trending: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json(trendingArticles);
  } catch (err) {
    console.error('Error fetching trending articles:', err);
    return NextResponse.json(
      { error: 'Failed to fetch trending articles' },
      { status: 500 }
    );
  }
}
