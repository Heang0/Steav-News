import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const settingsCollection = db.collection('settings');
    
    // We only need one global settings document
    const settings = await settingsCollection.findOne({ _id: 'global' });

    return NextResponse.json({ 
      success: true, 
      data: settings || { 
        siteTitle: 'STEAV NEWS', 
        defaultSeoDescription: 'Read the latest news from STEAV NEWS - Cambodia\'s trusted news source' 
      } 
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const settingsCollection = db.collection('settings');
    
    const body = await request.json();
    const { siteTitle, defaultSeoDescription } = body;

    if (!siteTitle || !defaultSeoDescription) {
      return NextResponse.json(
        { success: false, message: 'Site Title and SEO Description are required' },
        { status: 400 }
      );
    }

    // Upsert the global settings document
    await settingsCollection.updateOne(
      { _id: 'global' },
      { 
        $set: { 
          siteTitle, 
          defaultSeoDescription,
          updatedAt: new Date().toISOString()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
