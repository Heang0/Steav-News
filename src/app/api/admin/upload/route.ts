import { NextRequest, NextResponse } from 'next/server';
import { uploadImageBuffer } from '@/lib/cloudinary';

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
    const image = formData.get('image') as File | null;

    if (!image || image.size === 0) {
      return NextResponse.json(
        { message: 'No image file provided' },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await uploadImageBuffer(buffer, image.type, 'admin-upload');

    return NextResponse.json({
      url: uploadResult.url,
      message: 'Image uploaded successfully! This URL is permanent.',
    });
  } catch (err) {
    console.error('Error processing inline image upload:', err);
    return NextResponse.json(
      { message: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
