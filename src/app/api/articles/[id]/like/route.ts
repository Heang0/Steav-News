import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid article ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newsCollection = db.collection('articles');

    const result = await newsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const updatedArticle = await newsCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { likes: 1 } }
    );

    return NextResponse.json({
      message: 'Article liked!',
      likes: updatedArticle?.likes || 0,
    });
  } catch (err) {
    console.error('Error liking article:', err);
    return NextResponse.json(
      { error: 'Failed to like article' },
      { status: 500 }
    );
  }
}
