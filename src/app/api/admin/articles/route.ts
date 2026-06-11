import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { uploadImageBuffer } from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';
import { buildArticlePublicId, getNextShortId } from '@/lib/articles';

function isAuthenticated(request: NextRequest): boolean {
  const sessionId = request.headers.get('x-session-id');
  return sessionId === process.env.ADMIN_SESSION_ID;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session ID' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const thumbnail = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const content = formData.get('content') as string;
    let trending = formData.get('trending') === 'true';
    let imageUrl = formData.get('imageUrl') as string;
    let facebookVideoUrl = (formData.get('facebookVideoUrl') as string) || '';
    const category = formData.get('category') as string;
    const authorId = formData.get('authorId') as string;

    let imagePath = '/images/default_og_image.jpg';

    if (thumbnail && thumbnail.size > 0) {
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await uploadImageBuffer(buffer, thumbnail.type, 'article-thumbnail');
      imagePath = uploadResult.url;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }


    const db = await getDb();
    const newsCollection = db.collection('articles');

    const newId = new ObjectId();
    const shortId = await getNextShortId(newsCollection);
    const publicId = buildArticlePublicId(newId);

    const newArticle = {
      _id: newId,
      title,
      image: imagePath,
      date,
      content,
      facebookVideoUrl,
      createdAt: new Date().toISOString(),
      trending,
      likes: 0,
      views: 0,
      category: category || 'កម្សាន្ត',
      authorId: authorId || null,
      comments: [] as any[],
      shortId,
      publicId,
    };

    const result = await newsCollection.insertOne(newArticle);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Error inserting article:', err);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
