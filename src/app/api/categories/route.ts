import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { CATEGORIES, KHMER_TO_CATEGORY_SLUG } from '@/lib/utils';

export async function GET() {
  try {
    const db = await getDb();
    const categoriesCollection = db.collection('categories');
    
    const categories = await categoriesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (categories.length === 0) {
      // Auto-seed the database if it's completely empty
      const defaultCategories = CATEGORIES.map((name) => ({
        name,
        slug: KHMER_TO_CATEGORY_SLUG[name] || name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        createdAt: new Date().toISOString(),
      }));

      const insertResult = await categoriesCollection.insertMany(defaultCategories);
      
      // Return the newly created categories with their generated _ids
      const seededCategories = await categoriesCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
        
      return NextResponse.json({ success: true, data: seededCategories });
    }

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const categoriesCollection = db.collection('categories');
    
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and Slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await categoriesCollection.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    const newCategory = {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      createdAt: new Date().toISOString(),
    };

    const result = await categoriesCollection.insertOne(newCategory);

    return NextResponse.json({
      success: true,
      data: { ...newCategory, _id: result.insertedId.toString() },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category' },
      { status: 500 }
    );
  }
}
