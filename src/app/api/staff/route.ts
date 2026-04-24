import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import cloudinary, { commonCloudinaryParams, optimizeImageBuffer } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const staffCollection = db.collection('staff');
    
    let name = '';
    let role = '';
    let phone = '';
    let photo = '';
    let dob = '';
    let validUntil = '';

    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      name = body.name;
      role = body.role;
      phone = body.phone;
      photo = body.photo;
      dob = body.dob;
      validUntil = body.validUntil;
    } else {
      const formData = await request.formData();
      name = formData.get('name') as string;
      role = formData.get('role') as string;
      phone = (formData.get('phone') as string) || '';
      photo = (formData.get('photo') as string) || '';
      dob = (formData.get('dob') as string) || '';
      validUntil = (formData.get('validUntil') as string) || '';
      const imageFile = formData.get('image') as File | null;

      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const optimizedBuffer = await optimizeImageBuffer(buffer, imageFile.type);

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
        photo = uploadResult.secure_url;
      }
    }

    if (!name || !role) {
      return NextResponse.json(
        { success: false, message: 'Name and Role are required' },
        { status: 400 }
      );
    }

    // Generate a unique short staff ID, e.g., SN-00123
    const count = await staffCollection.countDocuments();
    const staffId = `SN-${(count + 1).toString().padStart(3, '0')}`;
    
    // Fallback public ID in case we want a completely unguessable URL
    const publicId = uuidv4().substring(0, 8);

    const newStaff = {
      staffId,
      publicId,
      name,
      role,
      phone: phone || '',
      photo: photo || '',
      dob: dob || '',
      validUntil: validUntil || '',
      createdAt: new Date().toISOString(),
    };

    const result = await staffCollection.insertOne(newStaff);

    return NextResponse.json({
      success: true,
      data: { ...newStaff, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create staff' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const staffCollection = db.collection('staff');
    
    const staff = await staffCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
