import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getArticleList } from '@/lib/article-queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import Image from 'next/image';
import { getSiteUrl, getOptimizedImageUrl } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = await getDb();
    const staffCollection = db.collection('staff');
    
    const query = {
      $or: [
        { publicId: id },
        { staffId: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };

    const staff = await staffCollection.findOne(query);

    if (!staff) {
      return { title: 'Staff Not Found - STEAV NEWS' };
    }

    return {
      title: `${staff.name} - ${staff.role} | STEAV NEWS`,
      description: `Read articles written by ${staff.name}, ${staff.role} at STEAV NEWS.`,
      openGraph: {
        title: `${staff.name} - STEAV NEWS`,
        description: `Read articles written by ${staff.name}`,
        images: staff.photo ? [{ url: staff.photo }] : [],
      }
    };
  } catch (err) {
    return { title: 'STEAV NEWS' };
  }
}

export default async function StaffProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = Number.parseInt(resolvedSearchParams.page || '1', 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  let staff;
  try {
    const db = await getDb();
    const staffCollection = db.collection('staff');
    
    const query = {
      $or: [
        { publicId: id },
        { staffId: id },
        ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])
      ]
    };

    staff = await staffCollection.findOne(query);
  } catch (error) {
    console.error('Error fetching staff member:', error);
  }

  if (!staff) {
    notFound();
  }

  // Fetch articles by this author
  const { articles, totalPages } = await getArticleList({
    authorId: staff._id.toString(),
    page: currentPage,
    limit: 12
  });

  // Premium stock newsroom background as fallback
  const coverImage = staff.coverImage || staff.background || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow pt-14 sm:pt-16">
        {/* HERO BANNER SECTION */}
        <div className="relative w-full h-[250px] sm:h-[320px] bg-gray-900">
          <Image 
            src={coverImage}
            alt="Newsroom Background"
            fill
            className="object-cover opacity-60"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        {/* PROFILE INFO OVERLAP */}
        <div className="container mx-auto px-4 max-w-[1000px] relative -mt-16 sm:-mt-24 mb-12 z-10">
          <div className="bg-white border-t-4 border-t-primary shadow-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-6 sm:gap-10 items-center md:items-start">
            
            {/* Profile Picture */}
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-none border-4 border-white shadow-lg bg-gray-100 flex-shrink-0 -mt-20 sm:-mt-28 overflow-hidden">
              {staff.photo ? (
                <Image 
                  src={getOptimizedImageUrl(staff.photo, { width: 400, quality: 80 })} 
                  alt={staff.name} 
                  fill 
                  className="object-cover"
                  unoptimized={staff.photo.startsWith('http')}
                  sizes="(max-width: 640px) 128px, 192px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-5xl font-bold">
                  {staff.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Details & Bio */}
            <div className="flex-grow text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
                    {staff.name}
                  </h1>
                  <p className="text-sm sm:text-base text-primary font-bold uppercase tracking-widest mb-1">
                    {staff.role || 'Journalist'} {staff.department && <span className="text-gray-400 font-normal">| {staff.department}</span>}
                  </p>
                  {staff.staffId && (
                    <span className="text-xs text-gray-400 font-mono block">ID: {staff.staffId}</span>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex flex-col items-center md:items-end bg-gray-50 px-6 py-3 rounded-none border border-gray-100">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{articles.length}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Articles</span>
                </div>
              </div>

              {/* Bio Section */}
              {staff.bio && (
                <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                  <p className="text-sm sm:text-[15px] leading-relaxed text-gray-700" style={{ fontFamily: "'Noto Sans Khmer', 'Battambang', sans-serif" }}>
                    {staff.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ARTICLES GRID */}
        <div className="container mx-auto px-4 max-w-[1300px] pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-[3px] border-gray-900" style={{ fontFamily: "'Outfit', 'Battambang', sans-serif" }}>
            <span className="text-primary mr-2">/</span>អត្ថបទដោយអ្នកនិពន្ធរូបនេះ
          </h2>
          
          {articles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {articles.map(article => (
                <ArticleCard key={article._id} article={article} variant="default" />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg font-bold">This author hasn't published any articles yet.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/staff/${id}`}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
