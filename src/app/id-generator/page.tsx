'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function IdGeneratorPage() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    photo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedStaff, setGeneratedStaff] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      alert('Name and Role are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setGeneratedStaff(data.data);
      } else {
        alert('Failed to generate card: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // The URL encoded in the QR code
  const verificationUrl = generatedStaff 
    ? `https://steavnews.site/staff/${generatedStaff.publicId}`
    : 'https://steavnews.site';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow pt-[80px] sm:pt-[100px] pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">STEAV NEWS</h1>
            <p className="text-gray-500 font-medium">Official Staff ID Card Generator</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Form Section */}
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 no-print">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Staff Details</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role/Position *</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="e.g. Senior Editor"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="e.g. +855 12 345 678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Photo URL</label>
                  <input
                    type="text"
                    name="photo"
                    value={formData.photo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-xs text-gray-400 mt-1">Paste a direct link to an image.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate Official ID'
                    )}
                  </button>
                </div>
              </form>

              {generatedStaff && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handlePrint}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print ID Card
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Tip: Save as PDF and print on CR80 PVC card.
                  </p>
                </div>
              )}
            </div>

            {/* ID Card Preview Section */}
            <div className="w-full lg:w-2/3 flex flex-col items-center gap-8 print-section">
              <div className="text-center no-print w-full">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">Live Preview</span>
              </div>

              {/* CARD FRONT */}
              <div 
                className="id-card-front relative bg-white rounded-[15px] shadow-2xl overflow-hidden border border-gray-200"
                style={{ width: '3.375in', height: '5.375in' }} // Standard CR80 ID card size (portrait)
              >
                {/* Header Graphic */}
                <div className="absolute top-0 left-0 w-full h-32 bg-primary flex flex-col items-center justify-center pt-2">
                  <div className="text-white font-black text-3xl tracking-tight">STEAV NEWS</div>
                  <div className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Official Press Pass</div>
                </div>

                {/* Photo */}
                <div className="absolute top-[80px] left-1/2 -translate-x-1/2">
                  <div className="w-[140px] h-[140px] rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {(formData.photo || generatedStaff?.photo) ? (
                      <Image 
                        src={generatedStaff?.photo || formData.photo} 
                        alt="Staff Photo" 
                        width={140} 
                        height={140} 
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="absolute top-[240px] w-full text-center px-6">
                  <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {generatedStaff?.name || formData.name || 'STAFF NAME'}
                  </h3>
                  <p className="text-[15px] font-bold text-primary mt-1 uppercase tracking-wide">
                    {generatedStaff?.role || formData.role || 'POSITION'}
                  </p>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-[30px] w-full px-8">
                  <div className="w-full h-[1px] bg-gray-200 mb-4"></div>
                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">ID Number</p>
                      <p className="text-sm font-black text-gray-800">{generatedStaff?.staffId || 'SN-XXXXX'}</p>
                    </div>
                    {/* Placeholder Barcode or Signature */}
                    <div className="text-right">
                      <div className="w-20 h-6 border-b-2 border-black/80 flex items-end justify-center mb-1 pb-1">
                        <span className="font-[signature] text-lg text-black/80 rotate-[-5deg] inline-block" style={{ fontFamily: 'cursive' }}>
                          {generatedStaff?.name || formData.name ? (generatedStaff?.name || formData.name).split(' ')[0] : 'Sign'}
                        </span>
                      </div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Authorized Sign</p>
                    </div>
                  </div>
                </div>
                
                {/* Bottom colored bar */}
                <div className="absolute bottom-0 left-0 w-full h-3 bg-primary"></div>
              </div>

              {/* CARD BACK */}
              <div 
                className="id-card-back relative bg-white rounded-[15px] shadow-2xl overflow-hidden border border-gray-200 flex flex-col items-center justify-between py-8 px-6"
                style={{ width: '3.375in', height: '5.375in' }}
              >
                <div className="text-center w-full">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 border-b pb-2">Terms & Conditions</h4>
                  <ul className="text-[9px] text-gray-600 text-left list-disc pl-4 space-y-1.5 leading-tight">
                    <li>This card is the property of STEAV NEWS and must be surrendered upon request or termination of employment.</li>
                    <li>This card is non-transferable and must be worn visibly at all times while on duty or covering events.</li>
                    <li>If found, please return to the STEAV NEWS main office or contact us immediately.</li>
                  </ul>
                </div>

                <div className="flex flex-col items-center my-4">
                  <div className="p-2 bg-white border-2 border-gray-100 rounded-xl shadow-sm mb-2">
                    <QRCodeSVG 
                      value={verificationUrl} 
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Scan to Verify</p>
                </div>

                <div className="w-full text-center">
                  <div className="w-full h-[1px] bg-gray-200 mb-3"></div>
                  <p className="text-[9px] font-bold text-gray-800 mb-1">STEAV NEWS HEADQUARTERS</p>
                  <p className="text-[8px] text-gray-500">Phnom Penh, Cambodia</p>
                  <p className="text-[8px] text-gray-500 font-mono mt-1">{generatedStaff?.phone || formData.phone || '+855 XX XXX XXX'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-direction: row !important;
            justify-content: space-around !important;
            align-items: center !important;
            gap: 20px !important;
          }
          .id-card-front, .id-card-back {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
}
