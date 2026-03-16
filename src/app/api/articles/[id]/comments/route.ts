import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
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

    const article = await newsCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { comments: 1 } }
    );

    if (!article) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    const comments = article.comments
      ? article.comments.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      : [];

    return NextResponse.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { author, text } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: 'Comment text cannot be empty' },
        { status: 400 }
      );
    }

    if (author && author.length > 50) {
      return NextResponse.json(
        { error: 'Author name too long' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newsCollection = db.collection('articles');

    const newComment = {
      _id: new ObjectId(),
      author: author && author.trim() !== '' ? author.trim() : 'Anonymous',
      text: text.trim(),
      createdAt: new Date(),
    };

    const result = await newsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: newComment } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    console.error('Error adding comment:', err);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
