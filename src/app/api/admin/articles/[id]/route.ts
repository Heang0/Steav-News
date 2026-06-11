import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { uploadImageBuffer } from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';

function isAuthenticated(request: NextRequest): boolean {
  const sessionId = request.headers.get('x-session-id');
  return sessionId === process.env.ADMIN_SESSION_ID;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session ID' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid article ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const thumbnail = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const content = formData.get('content') as string;
    let trending = formData.get('trending') === 'true';
    let applyWatermark = formData.get('applyWatermark') === 'true';
    let imageUrl = formData.get('imageUrl') as string;
    const facebookVideoUrl = formData.get('facebookVideoUrl');
    const category = formData.get('category') as string;
    const authorId = formData.get('authorId') as string;

    const updateDoc: Record<string, any> = {
      title,
      date,
      content,
      trending,
      applyWatermark,
      category: category || 'កម្សាន្ត',
      ...(authorId !== undefined && { authorId }),
      updatedAt: new Date().toISOString(),
    };

    if (thumbnail && thumbnail.size > 0) {
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await uploadImageBuffer(buffer, thumbnail.type, 'article-thumbnail');
      updateDoc.image = uploadResult.url;
    } else if (imageUrl !== null) {
      updateDoc.image = imageUrl as string;
    }

    if (facebookVideoUrl !== null) {
      updateDoc.facebookVideoUrl = facebookVideoUrl as string;
    }

    const db = await getDb();
    const newsCollection = db.collection('articles');

    const result = await newsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Article updated successfully!' });
  } catch (err) {
    console.error('Error updating article:', err);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session ID' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid article ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newsCollection = db.collection('articles');

    const result = await newsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Article deleted successfully!' });
  } catch (err) {
    console.error('Error deleting article:', err);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
