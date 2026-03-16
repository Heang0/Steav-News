import { redirect } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShortArticleRedirect({ params }: PageProps) {
  const { id } = await params;
  
  try {
    const db = await getDb();
    const newsCollection = db.collection('articles');
    
    // Find article by shortId
    const article = await newsCollection.findOne({ shortId: id });
    
    if (article) {
      // Redirect to the actual article page with the real ID
      redirect(`/article?id=${article._id}`);
    }
    
    // If not found, redirect to home
    redirect('/');
  } catch (error) {
    console.error('Error redirecting short URL:', error);
    redirect('/');
  }
}
