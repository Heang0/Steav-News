import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteUrl } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 86400; // Cache for 24 hours

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Staff Verification - STEAV NEWS`,
    description: `Verify official staff credentials for STEAV NEWS.`,
  };
}

async function getStaffMember(id: string) {
  try {
    const res = await fetch(`${getSiteUrl()}/api/staff/${id}`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return null;
  }
}

export default async function StaffVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaffMember(id);

  if (!staff) {
    notFound();
  }

  const dateIssued = new Date(staff.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow pt-[80px] sm:pt-[100px] pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Status Header */}
            <div className="bg-green-500 py-4 px-6 flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-white font-black text-xl tracking-wide uppercase">Verified Staff</h1>
            </div>

            <div className="p-8 flex flex-col items-center">
              {/* Profile Photo */}
              <div className="relative w-32 h-32 rounded-full shadow-lg border-4 border-gray-50 overflow-hidden mb-6 bg-gray-100">
                {staff.photo ? (
                  <Image 
                    src={staff.photo} 
                    alt={staff.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <h2 className="text-3xl font-black text-gray-900 mb-1 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
                {staff.name}
              </h2>
              <p className="text-primary font-bold text-lg uppercase tracking-wider mb-6 text-center">
                {staff.role}
              </p>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold text-sm">Staff ID</span>
                  <span className="font-bold text-gray-900">{staff.staffId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold text-sm">Phone</span>
                  <span className="font-bold text-gray-900">{staff.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold text-sm">Date Issued</span>
                  <span className="font-bold text-gray-900">{dateIssued}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold text-sm">Status</span>
                  <span className="font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Active
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                  This page confirms that the individual above is an officially recognized staff member of STEAV NEWS. If you have any concerns, please contact us immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
