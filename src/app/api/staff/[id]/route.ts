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

import { uploadImageBuffer } from '@/lib/cloudinary';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const staffCollection = db.collection('staff');

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    let name = '';
    let role = '';
    let phone = '';
    let photo = '';
    let dob = '';
    let validUntil = '';
    let department = '';
    let bio = '';

    const contentType = request.headers.get('content-type') || '';
    let updateData: any = {};

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.name) updateData.name = body.name;
      if (body.role) updateData.role = body.role;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.photo !== undefined) updateData.photo = body.photo;
      if (body.dob !== undefined) updateData.dob = body.dob;
      if (body.validUntil !== undefined) updateData.validUntil = body.validUntil;
      if (body.department !== undefined) updateData.department = body.department;
      if (body.bio !== undefined) updateData.bio = body.bio;
    } else {
      const formData = await request.formData();
      name = formData.get('name') as string;
      role = formData.get('role') as string;
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      
      const formPhone = formData.get('phone');
      if (formPhone !== null) updateData.phone = formPhone as string;
      
      const formDob = formData.get('dob');
      if (formDob !== null) updateData.dob = formDob as string;

      const formDept = formData.get('department');
      if (formDept !== null) updateData.department = formDept as string;

      const formBio = formData.get('bio');
      if (formBio !== null) updateData.bio = formBio as string;

      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadResult = await uploadImageBuffer(buffer, imageFile.type, 'staff-photo');
        updateData.photo = uploadResult.url;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No data to update' }, { status: 400 });
    }

    await staffCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const staffCollection = db.collection('staff');

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    await staffCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}
