import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import cloudinary, { commonCloudinaryParams, optimizeImageBuffer } from '@/lib/cloudinary';
import { ObjectId } from 'mongodb';
import { CATEGORIES } from '@/lib/utils';

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
    const trending = formData.get('trending') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const category = formData.get('category') as string;

    let imagePath = '/images/default_og_image.jpg';

    if (thumbnail && thumbnail.size > 0) {
      const bytes = await thumbnail.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const optimizedBuffer = await optimizeImageBuffer(buffer, thumbnail.type);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          commonCloudinaryParams,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(optimizedBuffer);
      });

      imagePath = uploadResult.secure_url;
    } else if (imageUrl) {
      imagePath = imageUrl;
    }

    if (category && !CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category provided' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newsCollection = db.collection('articles');

    const articleCount = await newsCollection.countDocuments();
    const shortId = (articleCount + 1).toString().padStart(4, '0');

    const newArticle = {
      title,
      image: imagePath,
      date,
      content,
      createdAt: new Date(),
      trending: trending === 'true',
      likes: 0,
      views: 0,
      category: category || 'កម្សាន្ត',
      comments: [] as any[],
      shortId,
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
