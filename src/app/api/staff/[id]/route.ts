import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const staffCollection = db.collection('staff');
    
    // Try to find by publicId first, then by staffId, then by ObjectId
    let staff = await staffCollection.findOne({ publicId: id });
    
    if (!staff) {
      staff = await staffCollection.findOne({ staffId: id });
    }

    if (!staff && ObjectId.isValid(id)) {
      staff = await staffCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
