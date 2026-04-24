import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const staffCollection = db.collection('staff');
    
    const body = await request.json();
    const { name, role, phone, photo } = body;

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
