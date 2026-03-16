import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { CATEGORIES } from '@/lib/utils';

export async function GET() {
  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');

    const categoryArticles = [];
    for (const category of CATEGORIES) {
      const article = await newsCollection.findOne(
        { category },
        { sort: { createdAt: -1 } }
      );
      if (article) categoryArticles.push(article);
    }

    return NextResponse.json(categoryArticles);
  } catch (err) {
    console.error('Error fetching category homepage previews:', err);
    return NextResponse.json(
      { error: 'Failed to fetch category previews' },
      { status: 500 }
    );
  }
}
